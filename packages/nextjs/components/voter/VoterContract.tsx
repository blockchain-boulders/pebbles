import { useAztecContract } from "~~/hooks/aztec/useAztecContract";
import { useAztecSandbox } from "~~/hooks/aztec/useAztecSandbox";

export const VoterContract = () => {
  const { pxe, voterWallet } = useAztecSandbox();

  const { callContract, isReady } = useAztecContract({ pxe, wallet: voterWallet, contractType: "VOTER" });

  return (
    <div className="flex flex-col bg-base-100 p-10 space-y-4 rounded-3xl">
      <p className="text-center">Here you can register participation to a voting.</p>
      {isReady && <button onClick={() => callContract("register", [])}>Call contract</button>}
      {!isReady && <p>Contract not ready</p>}
    </div>
  );
};
