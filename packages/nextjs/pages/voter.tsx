import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { CastVote } from "~~/components/voter/CastVote";
import { VoterContract } from "~~/components/voter/VoterContract";

const TokenUI: NextPage = () => {
  return (
    <>
      <MetaHeader title="Token UI"></MetaHeader>
      <div className="bg-base-300 w-full h-full px-8 py-12 space-y-8">
        <div className="flex row">
          <VoterContract />
          <CastVote />
        </div>
      </div>
    </>
  );
};

export default TokenUI;
