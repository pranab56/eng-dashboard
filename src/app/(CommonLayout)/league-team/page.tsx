import React, { Suspense } from 'react';
import LeagueTeamManagement from './LeagueTeamManagement';

export const dynamic = 'force-dynamic';

const LeagueTeamPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading teams...</div>}>
      <LeagueTeamManagement />
    </Suspense>
  );
};

export default LeagueTeamPage;
