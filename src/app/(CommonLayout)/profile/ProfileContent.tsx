"use client";

import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/features/profile/profileApi";
import { cn } from "@/lib/utils";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";
import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Camera,
  User,
  Mail,
  Lock,
  ShieldCheck,
  BadgeCheck,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";

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
  // Use {} to share the exact same cached query entry as Header and Sidebar
  const { data: profileData, isLoading: isProfileLoading, refetch } =
    useGetProfileQuery({});
  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();

  const user = useMemo(() => {
    return profileData?.data?.data || profileData?.data || profileData;
  }, [profileData]);

  const [formData, setFormData] = useState<ProfileData>({
    userName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form data whenever user object becomes available
  useEffect(() => {
    if (user && typeof user === "object") {
      const resolvedName =
        user.userName ||
        user.name ||
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName) ||
        "";
      const resolvedEmail = user.email || "";
      const resolvedProfile = user.profile || user.avatar || user.image || "";

      setFormData((prev) => ({
        ...prev,
        userName: resolvedName,
        email: resolvedEmail,
      }));

      if (resolvedProfile && typeof resolvedProfile === "string") {
        setImgPreview(formatImagePath(resolvedProfile));
      }
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (user && typeof user === "object") {
      const resolvedName =
        user.userName ||
        user.name ||
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName) ||
        "";
      const resolvedEmail = user.email || "";
      const resolvedProfile = user.profile || user.avatar || user.image || "";

      setFormData({
        userName: resolvedName,
        email: resolvedEmail,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setImgPreview(resolvedProfile ? formatImagePath(resolvedProfile) : null);
    } else {
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
    setImageFile(null);
    setErrors({});
  };

  const validate = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword)
        newErrors.currentPassword =
          "Current password is required to change password";
      if ((formData.newPassword?.length || 0) < 8)
        newErrors.newPassword = "Password must be at least 8 characters";
      if (formData.newPassword !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");
    try {
      const isPasswordChanging = !!(
        formData.currentPassword && formData.newPassword
      );
      const isProfileChanging =
        formData.userName !== (user?.userName || user?.firstName) || !!imageFile;

      let profileResult;
      let passwordResult;

      if (isProfileChanging) {
        const updateData = { userName: formData.userName };
        const profileFormData = new FormData();
        profileFormData.append("data", JSON.stringify(updateData));
        if (imageFile) {
          profileFormData.append("image", imageFile);
        }
        profileResult = await updateProfile(profileFormData).unwrap();
      }

      if (isPasswordChanging) {
        passwordResult = await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }).unwrap();
      }

      if (isProfileChanging && isPasswordChanging) {
        toast.success("Profile and password updated successfully!", { id: toastId });
      } else if (isPasswordChanging) {
        toast.success(passwordResult?.message || "Password changed successfully!", { id: toastId });
      } else if (isProfileChanging) {
        toast.success(profileResult?.message || "Profile updated!", { id: toastId });
      } else {
        toast.success("No changes detected.", { id: toastId });
      }

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setImageFile(null);
      refetch?.();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { data?: { message?: string } };
      toast.error(err.data?.message || "Operation failed. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isProfileLoading && !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  const role = user?.role?.replace(/_/g, " ") || "Admin";
  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format("MMM YYYY")
    : "Recently";

  const displayName =
    formData.userName ||
    user?.userName ||
    user?.name ||
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName) ||
    "Admin User";

  const displayEmail = formData.email || user?.email || "admin@example.com";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";

  const avatarSrc = imgPreview || (user?.profile ? formatImagePath(user.profile) : null);

  const passwordLengthMet = (formData.newPassword?.length || 0) >= 8;
  const passwordsMatch =
    Boolean(formData.newPassword) &&
    formData.newPassword === formData.confirmPassword;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      {/* Page Title & Breadcrumb */}
      <div className="pb-5 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
          <span>Settings</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Profile Settings</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Profile Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your administrator identity, credentials, and account security.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Verified Account
            </span>
          </div>
        </div>
      </div>

      {/* Profile Header / Identity Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xs w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    fill
                    alt="Profile avatar"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-lg sm:text-xl font-semibold text-slate-700 select-none">
                    {initials}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium gap-1 cursor-pointer"
                  title="Upload photo"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Change</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Identity details */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
                  {displayName}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                  {role}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{displayEmail}</span>
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              Change Photo
            </button>
            <span className="text-[11px] text-slate-400 hidden sm:inline">JPG, PNG or WEBP up to 5MB</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {/* Left Column (2 Cols): Form Sections */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start gap-3 pb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your personal details and account display name.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="userName"
                    className="text-xs font-medium text-slate-700 flex items-center gap-1"
                  >
                    Full Name
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Publicly visible</span>
                </div>
                <input
                  id="userName"
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={cn(
                    "w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800",
                    errors.userName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200"
                  )}
                />
                {errors.userName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.userName}
                  </p>
                )}
              </div>

              {/* Email Address (Read-only) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-slate-700 flex items-center gap-1.5"
                  >
                    Registered Email Address
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                      Read-Only
                    </span>
                  </label>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email || displayEmail}
                  readOnly
                  disabled
                  className="w-full h-10 px-3.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed select-none"
                />
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  Email is locked to your organization account.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Security & Password */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xs">
            <div className="flex items-start gap-3 pb-5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Security & Password
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your account password to ensure your admin credentials stay protected.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Password Inputs (3 columns on desktop, 1 on mobile) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="text-xs font-medium text-slate-700 block mb-1.5"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Current password"
                      className={cn(
                        "w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800",
                        errors.currentPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="text-xs font-medium text-slate-700 block mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Min 8 characters"
                      className={cn(
                        "w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800",
                        errors.newPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-medium text-slate-700 block mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={cn(
                        "w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800",
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Compact Security Guidance Component */}
              <div className="rounded-lg border border-slate-200/90 bg-slate-50/70 p-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span>Password Requirements</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                        passwordLengthMet ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    />
                    <span className={cn(passwordLengthMet && "text-slate-700 font-medium")}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                        passwordsMatch ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    />
                    <span className={cn(passwordsMatch && "text-slate-700 font-medium")}>
                      Passwords match
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>Include letters & numbers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>Do not reuse old passwords</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Save Action Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Make sure to save your changes before leaving this page.
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Secondary Account Information */}
        <div className="xl:col-span-1 space-y-6">
          {/* Account Details Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Account Details
                </h3>
                <p className="text-xs text-slate-500">
                  Administrative metadata
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 capitalize">
                  {role}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Account Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Member Since</span>
                <span className="font-medium text-slate-800">
                  {memberSince}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Access Level</span>
                <span className="font-medium text-slate-800">
                  Full System Access
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Session Security</span>
                <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Profile & Security Guidelines (Subtle, Not an alert) */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Profile Guidelines
                </h3>
                <p className="text-xs text-slate-500">
                  Best practices for admin accounts
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 font-medium">Avatar Visibility:</strong> Your profile photo is visible in league audit logs and match modification records.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 font-medium">Password Rotation:</strong> Periodically rotate your password to safeguard sensitive league financial and scoring data.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 font-medium">Email Modifications:</strong> Registered email addresses can only be changed by super-administrators for security compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
