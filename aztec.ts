import {
  AccountWalletWithPrivateKey,
  Contract,
  DeployMethod,
  Fr,
  PXE,
  createPXEClient,
  getSandboxAccountsWallets,
} from "@aztec/aztec.js";
import { ContractArtifact } from "@aztec/foundation/dest/abi";
import { AztecAddress } from "@aztec/foundation/dest/aztec-address";

const PXE_URL: string = process.env.PXE_URL || "http://localhost:8080";
export const pxe: PXE = createPXEClient(PXE_URL);

export type WalletName = "voter" | "voter2" | "organizer";

export const getWallet = async (name: WalletName) => {
  const wallets = await getSandboxAccountsWallets(pxe);
  switch (name) {
    case "voter":
      return wallets[0].getCompleteAddress();
    case "voter2":
      return wallets[1].getCompleteAddress();
    case "organizer":
      return wallets[2].getCompleteAddress();
  }
};

export const deployContract = async (
  wallet: AccountWalletWithPrivateKey,
  contract: Contract
) => {
  try {
    const tx = new DeployMethod(
      wallet.getCompleteAddress().publicKey,
      pxe,
      contract,
      []
    ).send({
      contractAddressSalt: Fr.random(),
    });
    await tx.wait();
    const receipt = await tx.getReceipt();
    if (receipt.contractAddress) {
      return receipt.contractAddress;
    }
  } catch (e) {
    console.log(e);
  }
};

export const callContract = async (
  method: string,
  typedArgs: any[],
  contractArtifact: ContractArtifact,
  contractAddress: AztecAddress,
  wallet: AccountWalletWithPrivateKey
) => {
  try {
    const contract = await Contract.at(
      contractAddress,
      contractArtifact,
      wallet
    );
    return contract.methods[method](...typedArgs)
      .send()
      .wait();
  } catch (e) {
    console.log(e);
  }
};
