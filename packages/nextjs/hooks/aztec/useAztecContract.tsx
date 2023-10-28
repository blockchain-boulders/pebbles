import { useEffect, useState } from "react";
import { TallierContractArtifact } from "../../../voting/src/artifacts/Tallier.js";
import { VoterContractArtifact } from "../../../voting/src/artifacts/Voter.js";
import { AccountWalletWithPrivateKey, DeployMethod, Fr, PXE } from "@aztec/aztec.js";

const contracts = {
  VOTER: VoterContractArtifact,
  TALLIER: TallierContractArtifact,
};

export const useAztecContract = ({
  wallet,
  pxe,
  contractType,
}: {
  wallet: AccountWalletWithPrivateKey;
  pxe: PXE;
  contractType: keyof typeof contracts;
}) => {
  if (!wallet) {
    throw new Error("No wallet provided");
  }
  if (!pxe) {
    throw new Error("No pxe provided");
  }
  if (!contractType) {
    throw new Error("No contractType provided");
  }
  const [isReady, setIsReady] = useState<boolean>(false);
  const [instansiatedContractType, setInstansiatedContractType] = useState<keyof typeof contracts | undefined>(
    undefined,
  );
  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);
  const [contract, setContract] = useState<any | undefined>(undefined);

  if (contractType !== instansiatedContractType) {
    throw new Error("Contract type mismatch");
  }

  setInstansiatedContractType(contractType);
  setContract(contracts[contractType as keyof typeof contracts]);
  setIsReady(true);

  useEffect(() => {
    const deployContract = async () => {
      const tx = new DeployMethod(
        wallet.getCompleteAddress().publicKey,
        pxe,
        contracts[contractType as keyof typeof contracts],
        [],
      ).send({
        contractAddressSalt: Fr.random(),
      });
      await tx.wait();
      const receipt = await tx.getReceipt();
      if (receipt.contractAddress) {
        setContractAddress(receipt.contractAddress);
      } else {
        throw new Error(`Contract not deployed (${receipt.toJSON()})`);
      }
    };
    deployContract();
  }, [contract, contractType, pxe, wallet]);

  return {
    isReady,
    contractAddress,
    contract,
    contractType,
  };
};
