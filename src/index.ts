import {
  AptosWalletErrorResult,
  NetworkName,
  PluginProvider,
} from "@aptos-labs/wallet-adapter-core";
import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletName,
} from "@aptos-labs/wallet-adapter-core";
import { TxnBuilderTypes, Types } from "aptos";

interface EvoWindow extends Window {
  evo?: PluginProvider;
}

declare const window: EvoWindow;

export const EvoWalletName = "EVO" as WalletName<"EVO">;

export class EvoWallet implements AdapterPlugin {
  readonly name = EvoWalletName;
  readonly url =
    "https://chrome.google.com/webstore/detail/evo-wallet/dcbjpgbkjoomeenajdabiicabjljlnfp";
  readonly icon =
    "data:image/png;base64,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";

  // An optional property for wallets which may have different wallet name with window property name.
  // such as window.aptosWallet and wallet name is Aptos.
  // If your wallet name prop is different than the window property name use the window property name here and comment out line 37

  // readonly providerName = "aptosWallet";

  /**
   * An optional property for wallets that supports mobile app.
   * By providing the `deeplinkProvider` prop, the adapter will redirect the user
   * from a mobile web browser to the wallet's mobile app on `connect`.
   *
   * `url` param is given by the provider and represents the current website url the user is on.
   */

  // deeplinkProvider(data: { url: string }): string {
  //   return `aptos://explore?url=${data.url}`;
  // }

  provider: PluginProvider | undefined =
    typeof window !== "undefined" ? window.evo : undefined;

  async connect(): Promise<AccountInfo> {
    try {
      const accountInfo = await this.provider?.connect();
      if (!accountInfo) throw `${EvoWalletName} Address Info Error`;
      return accountInfo;
    } catch (error: any) {
      throw error;
    }
  }

  async account(): Promise<AccountInfo> {
    const response = await this.provider?.account();
    if (!response) throw `${EvoWalletName} Account Error`;
    return response;
  }

  async disconnect(): Promise<void> {
    try {
      await this.provider?.disconnect();
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const response = await this.provider?.signAndSubmitTransaction(
        transaction,
        options
      );
      if ((response as AptosWalletErrorResult).code) {
        throw new Error((response as AptosWalletErrorResult).message);
      }
      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async signAndSubmitBCSTransaction(
    transaction: TxnBuilderTypes.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const response = await this.provider?.signAndSubmitTransaction(
        transaction,
        options
      );
      if ((response as AptosWalletErrorResult).code) {
        throw new Error((response as AptosWalletErrorResult).message);
      }
      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      if (typeof message !== "object" || !message.nonce) {
        `${EvoWalletName} Invalid signMessage Payload`;
      }
      const response = await this.provider?.signMessage(message);
      if (response) {
        return response;
      } else {
        throw `${EvoWalletName} Sign Message failed`;
      }
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async network(): Promise<NetworkInfo> {
    try {
      const response = await this.provider?.network();
      if (!response) throw `${EvoWalletName} Network Error`;
      return {
        name: response as NetworkName,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    try {
      const handleNetworkChange = async (newNetwork: {
        networkName: NetworkInfo;
      }): Promise<void> => {
        callback({
          name: newNetwork.networkName,
          chainId: undefined,
          api: undefined,
        });
      };
      await this.provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async onAccountChange(callback: any): Promise<void> {
    try {
      const handleAccountChange = async (
        newAccount: AccountInfo
      ): Promise<void> => {
        if (newAccount?.publicKey) {
          callback({
            publicKey: newAccount.publicKey,
            address: newAccount.address,
          });
        } else {
          const response = await this.connect();
          callback({
            address: response?.address,
            publicKey: response?.publicKey,
          });
        }
      };
      await this.provider?.onAccountChange(handleAccountChange);
    } catch (error: any) {
      console.log(error);
      const errMsg = error.message;
      throw errMsg;
    }
  }
}
