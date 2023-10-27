import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { CastVote } from "~~/components/voter/CastVote";
import { RegisterParticipation } from "~~/components/voter/RegisterParticipation";

const TokenUI: NextPage = () => {
  return (
    <>
      <MetaHeader title="Token UI"></MetaHeader>
      <div className="bg-base-300 w-full px-8 py-12 space-y-8">
        <RegisterParticipation />
        <CastVote />
      </div>
    </>
  );
};

export default TokenUI;
