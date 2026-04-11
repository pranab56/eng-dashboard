import React from 'react';

interface PlayerDetailsProps {
  fullName: string;
  position: string;
  jerseyNumber: number | string;
  birthDate: string;
  contactStatus: string;
}

const PlayerDetails = () => {

  const playerInfo: PlayerDetailsProps = {
    fullName: "Julian Alvarez",
    position: "Forward",
    jerseyNumber: 9,
    birthDate: "01/31/2000",
    contactStatus: "Amateur",
  };

  return (
    <div className=" bg-white rounded-lg">
      <p className="text-sm font-semibold text-gray-500 pb-8">Complete the details below to register a new athlete to the Apex Vanguard squad.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">

        {/* Full Name - Spans both columns */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900">Full Name</label>
          <div className="w-full p-4 bg-gray-100 rounded-lg text-gray-700 font-medium">
            {playerInfo?.fullName}
          </div>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Position</label>
          <div className="w-full p-4 bg-gray-100 rounded-lg text-gray-700 font-medium">
            {playerInfo?.position}
          </div>
        </div>

        {/* Jersey Number */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Jersey Number</label>
          <div className="w-full p-4 bg-gray-100 rounded-lg text-gray-700 font-medium">
            {playerInfo?.jerseyNumber}
          </div>
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Birth Date</label>
          <div className="w-full p-4 bg-gray-100 rounded-lg text-gray-700 font-medium">
            {playerInfo?.birthDate}
          </div>
        </div>

        {/* Contact Status */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Contact Status</label>
          <div className="w-full p-4 bg-gray-100 rounded-lg text-gray-700 font-medium">
            {playerInfo?.contactStatus}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerDetails;