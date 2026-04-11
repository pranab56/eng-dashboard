import CancelButton from '@/components/buttons/CancelButton';
import CustomButton from '@/components/buttons/CustomButton';
import { closeCustomModal } from '@/components/modals/CustomModal';
import React from 'react';
import { toast } from 'sonner';

interface UserDetailProps {
  fullName: string;
  role: string;
  email: string;
  joinDate: string;
  lastLogin: string;
}

const UserDetails = () => {

  const userData: UserDetailProps = {
    fullName: "Jane Doe",
    role: "Manager",
    email: "jane.doe@example.com",
    joinDate: "October 14, 2022",
    lastLogin: "2 hours ago (14:32 GMT)",
  };

  const handleSuspendAccount = () => {
    // Handle cancel logic here
    toast.success("Account suspended successfully");
    closeCustomModal();
  };
  const handleActivateAccount = () => {
    // Handle cancel logic here
    toast.success("Account activated successfully");
    closeCustomModal();
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Full Name</label>
          <div className="w-full p-3 bg-gray-50 border border-transparent rounded-lg text-gray-700">
            {userData?.fullName}
          </div>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Role</label>
          <div className="w-full p-3 bg-gray-50 border border-transparent rounded-lg text-gray-700">
            {userData?.role}
          </div>
        </div>

        {/* Email Address - Full Width */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900">Email Address</label>
          <div className="w-full p-3 bg-gray-50 border border-transparent rounded-lg text-gray-700">
            {userData?.email}
          </div>
        </div>

        {/* Join Date */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Join Date</label>
          <div className="w-full p-3 bg-gray-50 border border-transparent rounded-lg text-gray-700">
            {userData?.joinDate}
          </div>
        </div>

        {/* Last Login */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Last Login</label>
          <div className="w-full p-3 bg-gray-50 border border-transparent rounded-lg text-gray-700">
            {userData?.lastLogin}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <CancelButton onClick={handleSuspendAccount} title="Suspend Account" />
        <CustomButton onClick={handleActivateAccount} title="Activate Profile" />
      </div>
    </div>
  );
};

export default UserDetails;