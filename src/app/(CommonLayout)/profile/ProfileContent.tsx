"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePasswordMutation, useGetProfileQuery, useUpdateProfileMutation } from "@/features/profile/profileApi";
import { cn } from "@/lib/utils";
import { baseURL } from "@/utils/BaseURL";
import dayjs from 'dayjs';
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface ProfileData {
  userName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ValidationErrors {
  userName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(undefined);
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();

  const [formData, setFormData] = useState<ProfileData>({
    userName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  console.log(imgPreview)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = (path: string) => {
    if (!path) return "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg";
    if (path.startsWith("http")) return path;
    return `${baseURL}${path}`;
  };

  useEffect(() => {
    if (profileData?.data) {
      const { userName, email, profile } = profileData.data;
      setFormData((prev) => ({
        ...prev,
        userName: userName || "",
        email: email || "",
      }));
      if (profile) {
        setImgPreview(imageUrl(profile));
      }
    }
  }, [profileData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "User name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) newErrors.currentPassword = "Current password is required to change password";
      if ((formData.newPassword?.length || 0) < 8) newErrors.newPassword = "Password must be at least 8 characters";
      if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const toastId = toast.loading("Processing your request...");
    try {
      const isPasswordChanging = !!(formData.currentPassword && formData.newPassword);
      const isProfileChanging =
        formData.userName !== profileData?.data?.userName || !!imageFile;

      let profileResult;
      let passwordResult;

      // 1. Handle Profile Update
      if (isProfileChanging) {
        const updateData = { userName: formData.userName };
        const profileFormData = new FormData();
        profileFormData.append("data", JSON.stringify(updateData));
        if (imageFile) {
          profileFormData.append("image", imageFile);
        }
        profileResult = await updateProfile(profileFormData).unwrap();
      }

      // 2. Handle Password Change
      if (isPasswordChanging) {
        passwordResult = await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }).unwrap();
      }

      // 3. Determine Toast Message
      if (isProfileChanging && isPasswordChanging) {
        toast.success("Profile and password updated successfully!", { id: toastId });
      } else if (isPasswordChanging) {
        toast.success(passwordResult?.message || "Password changed successfully!", { id: toastId });
      } else if (isProfileChanging) {
        toast.success(profileResult?.message || "Profile information updated!", { id: toastId });
      } else {
        toast.success("No changes detected.", { id: toastId });
      }

      // Reset password fields after success
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setImageFile(null);

    } catch (error: unknown) {
      console.error(error);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Operation failed. Please try again.", { id: toastId });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1D68D5] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 p-5 ">
      {/* Profile Photo Card */}
      <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 shadow-sm">
            <Image
              src={imgPreview || imageUrl("")}
              fill
              alt="Profile Preview"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="space-y-4 text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-medium text-gray-900">Profile Photo</h2>
              <p className="text-sm text-gray-500 mt-1">Update your professional identity. Recommended: Square JPG or PNG, max 2MB.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#1D68D5] hover:bg-[#1A5BBF] text-white rounded-xl px-8 h-11 font-semibold transition-all shadow-md shadow-blue-200"
              >
                Change Avatar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[13px] font-medium text-gray-400 uppercase tracking-wider ml-1">Full Name</Label>
                  <Input
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className={cn(
                      "h-12 bg-white border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#1D68D5]/20 focus-visible:border-[#1D68D5] px-5 transition-all text-gray-900 font-medium",
                      errors.userName && "border-red-500 bg-red-50/10 focus-visible:ring-red-100 focus-visible:border-red-500"
                    )}
                  />
                  {errors.userName && <p className="text-xs font-medium text-red-500 mt-1 ml-1">{errors.userName}</p>}
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[13px] font-medium text-gray-400 uppercase tracking-wider ml-1">Registered Email</Label>
                  <Input
                    name="email"
                    readOnly
                    value={formData.email}
                    className="h-12 bg-gray-50 border border-gray-100 rounded-xl px-5 text-gray-400 font-medium cursor-not-allowed italic"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-lg font-medium text-gray-900">Security & Password</h2>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2.5">
                <Label className="text-[13px] font-medium text-gray-400 ml-1">Current Password</Label>
                <Input
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={cn(
                    "h-12 bg-white border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#1D68D5]/20 focus-visible:border-[#1D68D5] px-5 transition-all",
                    errors.currentPassword && "border-red-500 focus-visible:border-red-500"
                  )}
                />
                {errors.currentPassword && <p className="text-xs font-medium text-red-500 mt-1 ml-1">{errors.currentPassword}</p>}
                <p className="text-[11px] text-gray-400 ml-1 italic font-medium">Verify your current identity to authorize a password change.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-2.5">
                  <Label className="text-[13px] font-medium text-gray-400 ml-1">New Password</Label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Create new password"
                    className={cn(
                      "h-12 bg-white border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#1D68D5]/20 focus-visible:border-[#1D68D5] px-5 transition-all",
                      errors.newPassword && "border-red-500 focus-visible:border-red-500"
                    )}
                  />
                  {errors.newPassword && <p className="text-xs font-medium text-red-500 mt-1 ml-1">{errors.newPassword}</p>}
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[13px] font-medium text-gray-400 ml-1">Confirm New Password</Label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repeat new password"
                    className={cn(
                      "h-12 bg-white border border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-[#1D68D5]/20 focus-visible:border-[#1D68D5] px-5 transition-all",
                      errors.confirmPassword && "border-red-500 focus-visible:border-red-500"
                    )}
                  />
                  {errors.confirmPassword && <p className="text-xs font-medium text-red-500 mt-1 ml-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="border border-indigo-100 bg-gradient-to-br from-[#1D68D5] to-[#1A5BBF] rounded-2xl overflow-hidden text-white shadow-lg shadow-blue-100">
            <CardContent className="p-8 space-y-6">
              <div className="inline-flex p-3 bg-white/10 rounded-2xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3 className="text-xl font-medium leading-tight">Secure your account</h3>
              <p className="text-blue-100 text-sm leading-relaxed">Ensure you have a strong, unique password to keep your administrative privileges protected.</p>
              <div className="pt-2">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-white text-[#1D68D5] cursor-pointer hover:bg-white/90 rounded-xl h-11 font-medium transition-all shadow-sm"
                >
                  Save All Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-gray-50 rounded-2xl p-8">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Account Metadata</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Role</span>
                <span className="bg-white px-2 py-1 rounded text-[#1D68D5] font-black border border-gray-100 uppercase tracking-tighter">
                  {profileData?.data?.role?.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="flex items-center gap-1.5 text-green-600 font-black uppercase">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Member Since</span>
                <span className="text-gray-900 font-medium">{dayjs(profileData?.data?.createdAt).format("MMM YYYY")}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
