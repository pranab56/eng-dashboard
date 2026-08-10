/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { TUserManagement } from '@/types/columnTypes';
import { formatImagePath } from '@/utils/formatImagePath';
import { Camera, Loader2, X, Save, User as UserIcon } from 'lucide-react';
import { useUpdateUserProfileByAdminMutation } from '@/features/userManagement/userApi';
import toast from 'react-hot-toast';

interface UserEditProfileModalProps {
  user: TUserManagement | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserEditProfileModal: React.FC<UserEditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [updateProfile, { isLoading }] = useUpdateUserProfileByAdminMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.userName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [user]);

  if (!user) return null;

  const currentProfileUrl = previewUrl || formatImagePath(user.profile || user.profilePic);
  const initials = (firstName || 'P').charAt(0).toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      if (firstName) formData.append('firstName', firstName);
      if (lastName) formData.append('lastName', lastName);
      if (phone) formData.append('phone', phone);
      if (selectedFile) formData.append('profile', selectedFile);

      await updateProfile({ id: user._id, data: formData }).unwrap();
      toast.success("Player profile & picture updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update player profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border-none shadow-2xl z-50">
        <DialogHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" /> Change Player Profile Picture & Details
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Profile Image Avatar Upload */}
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-indigo-100 overflow-hidden flex items-center justify-center shadow-inner group">
              {currentProfileUrl ? (
                <Image
                  src={currentProfileUrl}
                  alt="Player Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-indigo-600">{initials}</span>
              )}

              <label
                htmlFor="profile-upload"
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-semibold mt-1">Change</span>
              </label>

              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <label
              htmlFor="profile-upload"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" /> Upload New Photo
            </label>
          </div>

          {/* First Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter last name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter phone number"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditProfileModal;
