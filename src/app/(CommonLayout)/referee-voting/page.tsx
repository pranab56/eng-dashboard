import { Suspense } from "react";
import RefereeVotingManagement from "./RefereeVotingManagement";

const RefereeVotingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-10 text-gray-500 font-medium">
          Loading referee voting...
        </div>
      }
    >
      <RefereeVotingManagement />
    </Suspense>
  );
};

export default RefereeVotingPage;
