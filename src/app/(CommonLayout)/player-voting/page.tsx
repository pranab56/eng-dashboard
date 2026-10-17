import { Suspense } from "react";
import PlayerVotingManagement from "./PlayerVotingManagement";

const PlayerVotingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-10 text-gray-500 font-medium">
          Loading player voting...
        </div>
      }
    >
      <PlayerVotingManagement />
    </Suspense>
  );
};

export default PlayerVotingPage;
