import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { createClass, createTypeUnsafe, Option, Raw } from '@polkadot/types';
import { Codec, Registry, TypeDef, TypeDefInfo } from '@polkadot/types/types';

interface TxStatus {
  account: string;
  txHash?: string;
  blockHash?: string;
  message?: string;
  data?: any;
  status: 'error' | 'event' | 'queued' | 'success';
  result: SubmittableResult;
}

export const extrinsicHelper = (
  extrinsic: SubmittableExtrinsic<'promise'>,
  signer: KeyringPair,
  api?: ApiPromise,
): Promise<TxStatus> => {
  return new Promise((resolve, reject) => {
    const actionStatus = {
      txHash: extrinsic.toHex(),
    } as Partial<TxStatus>;

    extrinsic
      .signAndSend(signer, (result: SubmittableResult) => {
        actionStatus.result = result;

        if (result.status.isInBlock) {
          actionStatus.blockHash = result.status.asInBlock.toHex();
        }

        if (result.status.isFinalized || result.status.isInBlock) {
          actionStatus.data = result;
          actionStatus.account = extrinsic.signer.toString();

          result.events
            .filter(({ event: { section } }: any): boolean => section === 'system')
            .forEach((event: any): void => {
              const {
                event: { data, method },
              } = event;

              if (method === 'ExtrinsicFailed') {
                const [dispatchError] = data;
                let message = dispatchError.type;

                if (dispatchError.isModule && api) {
                  try {
                    const mod = dispatchError.asModule;
                    const error = api.registry.findMetaError(
                      new Uint8Array([mod.index.toNumber(), mod.error.toNumber()]),
                    );
                    message = `${error.section}.${error.name}`;
                  } catch (error) {
                    // swallow
                  }
                }

                actionStatus.message = message;
                actionStatus.status = 'error';
                reject(actionStatus);
              } else if (method === 'ExtrinsicSuccess') {
                actionStatus.status = 'success';
                resolve(actionStatus as TxStatus);
              }
            });
        } else if (result.isError) {
          actionStatus.account = extrinsic.signer.toString();
          actionStatus.status = 'error';
          actionStatus.data = result;

          reject(actionStatus);
        }
      })
      .catch((error: any) => {
        actionStatus.message = error.message;
        actionStatus.data = error;
        actionStatus.status = 'error';
        actionStatus.account = extrinsic.signer.toString();

        reject(actionStatus);
      });
  });
};

export function formatData(registry: Registry, data: Raw, { info, type }: TypeDef): Codec {
  if (info === TypeDefInfo.Option) {
    return new Option(registry, createClass(registry, type), createTypeUnsafe(registry, type, [data], true));
  }

  return createTypeUnsafe(registry, type, [data], true);
}
