import { ApiPromise } from '@polkadot/api';
import { Abi } from '@redspot/api-contract';
import { extrinsicHelper } from 'redspot';
import prettyjson from 'prettyjson';
import chalk from 'chalk';
import { config } from 'yargs';

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
      gasLimit: '50000000000',
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
            console.log('');
            console.log(chalk.magenta(`===== Call ${messageName} =====`));
            console.log(
              prettyjson.render({
                dest: `${this.options.address}`,
                gasLimit: `${this.options.gasLimit}`,
                inputData: `0x${Buffer.from(inputData).toString('hex')}`,
              }),
            );
            const result = await this.api.rpc.contracts.call({
              dest: this.options.address,
              gasLimit: this.options.gasLimit,
              inputData: inputData,
              ...options,
            });
            console.log(`➤ ${messageName} completed`);
            console.log(JSON.stringify(result.toJSON(), null, 2));
            if (result.isError) {
              return Promise.reject(result);
            } else if (result.isSuccess) {
              return this.abi.createType(this.abi.messages[messageName].type, result.asSuccess.data);
            }
          },
          send: async (options: any) => {
            console.log('');
            console.log(chalk.magenta(`===== Send ${messageName} =====`));
            console.log(
              prettyjson.render({
                dest: `${this.options.address}`,
                value: `${options.value || '0'}`,
                gasLimit: `${options.gasLimit || this.options.gasLimit}`,
                inputData: `0x${Buffer.from(inputData).toString('hex')}`,
              }),
            );
            const tx = this.api.tx.contracts.call(
              this.options.address,
              options.value || '0',
              options.gasLimit || this.options.gasLimit,
              inputData,
            );

            const result = await extrinsicHelper(tx, options.from, this.api);
            console.log(`➤ ${messageName} completed`);
            if (result?.events) {
              result.events.map((event) => {
                if (event.method === 'ContractExecution') {
                  event.args[1] = this.abi.createEventData(event.args[1]).toJSON();
                }
                return event;
              });
            }

            console.log(
              JSON.stringify(
                {
                  account: result.account,
                  txHash: result.txHash,
                  blockHash: result.blockHash,
                  data: result.data,
                  message: result.message,
                  status: result.status,
                  events: result.events,
                },
                null,
                2,
              ),
            );

            return result;
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
