import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { CreateVoting } from "~~/components/voting-organizer/CreateVoting";

const TokenUI: NextPage = () => {
  return (
    <>
      <MetaHeader title="Token UI"></MetaHeader>
      <div className="bg-base-300 w-full px-8 py-12 space-y-8">
        <CreateVoting />
      </div>
    </>
  );
};

export default TokenUI;
