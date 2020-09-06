import { ApiPromise } from '@polkadot/api';
import { Abi } from '@redspot/api-contract';
import { extrinsicHelper } from 'redspot';

class ContractApi {
  public abi: Abi;
  public api: ApiPromise;
  public address: string;
  public messages: Record<string, any>;

  #options?: Record<string, any>;

  constructor(api: ApiPromise, abi: Abi, address: string, options?: any) {
    this.api = api;
    this.abi = abi;
    this.address = address;
    this.#options = options;
    this.messages = this.decorateMessages();
  }

  get options() {
    return {
      address: this.address,
      gasLimit: '100000000000',
      ...this.#options,
    };
  }

  decorateMessages() {
    const result: Record<string, any> = {};
    for (const messageName of Object.keys(this.abi.messages)) {
      const fn = (...args: any) => {
        const inputData = this.abi.messages[messageName](...args);

        return {
          data: inputData,
          call: async (options: any) => {
            const result = await this.api.rpc.contracts.call({
              dest: this.options.address,
              gasLimit: this.options.gasLimit,
              inputData: inputData,
              ...options,
            });
            if (result.isError) {
              return Promise.reject(result);
            } else if (result.isSuccess) {
              return this.abi.createType(this.abi.messages[messageName].type, result.asSuccess.data);
            }
          },
          send: async (options: any) => {
            const tx = this.api.tx.contracts.call(
              this.options.address,
              options.value || '0',
              options.gasLimit || this.options.gasLimit,
              inputData,
            );

            return extrinsicHelper(tx, options.from);
          },
          sign: (options: any) => {
            const tx = this.api.tx.contracts.call(
              this.options.address,
              options.value || '0',
              options.gasLimit || this.options.gasLimit,
              inputData,
            );

            return tx.sign(options.from);
          },
        };
      };

      result[messageName] = fn;
    }

    return result;
  }
}

export { ContractApi };
