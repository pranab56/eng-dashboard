"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Check,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useHeaders } from "@/hooks/useHeaders";
import { cn } from "@/lib/utils";
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} from "@/features/admin/adminApi";
import {
  AVAILABLE_PERMISSIONS,
  PERMISSION_CATEGORIES,
} from "@/constants/permissions";

// ============================================================================
// 1. REUSABLE ADMIN FORM MODAL (CREATE & EDIT)
// ============================================================================
interface IAdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  permissions: string[];
}

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  title: string;
  description: string;
  submitText: string;
  formData: IAdminFormData;
  setFormData: React.Dispatch<React.SetStateAction<IAdminFormData>>;
  isEditMode?: boolean;
}

function AdminFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  title,
  description,
  submitText,
  formData,
  setFormData,
  isEditMode = false,
}: AdminFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  // Auto-generate strong random password
  const handleAutoGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let res = "";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = "Eng@" + res;
    setFormData((prev) => ({ ...prev, password: newPass }));
    setShowPassword(true);
    toast.info("Secure password generated!");
  };

  // Toggle single permission
  const handleTogglePermission = (key: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(key);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== key)
          : [...prev.permissions, key],
      };
    });
  };

  // Toggle all permissions in a specific category
  const handleToggleCategory = (category: string) => {
    const catKeys = AVAILABLE_PERMISSIONS.filter((p) => p.category === category).map(
      (p) => p.key
    );
    const allSelected = catKeys.every((k) => formData.permissions.includes(k));

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((k) => !catKeys.includes(k))
        : Array.from(new Set([...prev.permissions, ...catKeys])),
    }));
  };

  // Toggle all permissions across system
  const handleToggleAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions:
        prev.permissions.length === AVAILABLE_PERMISSIONS.length
          ? []
          : AVAILABLE_PERMISSIONS.map((p) => p.key),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Account Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
              <User className="w-3.5 h-3.5 text-slate-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Account Credentials
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rashford"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@engsports.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            {/* Password input with generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEditMode ? "Reset Password" : "Password"}
                  {isEditMode ? (
                    <span className="text-slate-400 font-normal ml-1">
                      (Leave blank to keep current)
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal ml-1">
                      (Optional - auto-generated if left blank)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={handleAutoGeneratePassword}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-slate-600" />
                  <span>Generate Password</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEditMode ? "••••••••" : "Leave blank to auto-generate password"}
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 pl-3 pr-10 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors placeholder:text-slate-400 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {!isEditMode && (
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Login credentials will be automatically sent to the administrator's email.</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Page Permissions Matrix */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Page Permissions
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  <strong className="text-slate-900 font-semibold">{formData.permissions.length}</strong> of{" "}
                  {AVAILABLE_PERMISSIONS.length} pages granted
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleAllPermissions}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                {formData.permissions.length === AVAILABLE_PERMISSIONS.length
                  ? "Deselect All"
                  : "Select All (" + AVAILABLE_PERMISSIONS.length + ")"}
              </button>
            </div>

            <div className="space-y-3.5">
              {PERMISSION_CATEGORIES.map((cat) => {
                const catItems = AVAILABLE_PERMISSIONS.filter((p) => p.category === cat);
                const allCatChecked = catItems.every((p) => formData.permissions.includes(p.key));
                const selectedCatCount = catItems.filter((p) =>
                  formData.permissions.includes(p.key)
                ).length;

                return (
                  <div
                    key={cat}
                    className="border border-slate-200 rounded-lg p-3 sm:p-3.5 bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            selectedCatCount > 0 ? "bg-emerald-500" : "bg-slate-300"
                          )}
                        />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {cat}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.2 rounded border border-slate-200 shadow-2xs">
                          {selectedCatCount} / {catItems.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCategory(cat)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                      >
                        {allCatChecked ? "Deselect Group" : "Select Group"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catItems.map((perm) => {
                        const isChecked = formData.permissions.includes(perm.key);

                        return (
                          <div
                            key={perm.key}
                            onClick={() => handleTogglePermission(perm.key)}
                            className={cn(
                              "flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-all select-none",
                              isChecked
                                ? "bg-white border-slate-900 ring-1 ring-slate-900/10 shadow-2xs text-slate-900"
                                : "bg-white/80 border-slate-200/90 text-slate-600 hover:border-slate-300 hover:bg-white"
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                isChecked
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "border-slate-300 bg-white"
                              )}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs leading-tight text-slate-900">
                                  {perm.label}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 py-0.2 rounded">
                                  {perm.route}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. VIEW ADMIN MODAL
// ============================================================================
function AdminViewModal({
  isOpen,
  onClose,
  admin,
  onEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  admin: any;
  onEdit: (admin: any) => void;
}) {
  if (!isOpen || !admin) return null;

  const fullName =
    (admin.firstName || "") + " " + (admin.lastName || "") || admin.name || "Administrator";
  const initials =
    fullName
      .split(" ")
      .map((n: string) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A";
  const perms = Array.isArray(admin.permissions) ? admin.permissions : [];
  const isFullAccess = perms.length === 0 || perms.length === AVAILABLE_PERMISSIONS.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Administrator Details</h3>
            <p className="text-xs text-slate-500">Overview of account profile and granted permissions</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Strip */}
          <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900">{fullName}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 text-slate-700 border border-slate-300">
                  {admin.role || "ADMIN"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {admin.email}
                </span>
                {admin.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {admin.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Granted Page Access
                </h5>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {isFullAccess
                  ? "All " + AVAILABLE_PERMISSIONS.length + " Pages (Full System Access)"
                  : perms.length + " of " + AVAILABLE_PERMISSIONS.length + " Pages"}
              </span>
            </div>

            {isFullAccess ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Unrestricted Full System Access</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    This administrator has full access to all sections and pages across the entire ENG Dashboard.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {PERMISSION_CATEGORIES.map((cat) => {
                  const catPerms = perms.filter((pk: string) => {
                    const pObj = AVAILABLE_PERMISSIONS.find((p) => p.key === pk);
                    return pObj?.category === cat;
                  });

                  if (catPerms.length === 0) return null;

                  return (
                    <div key={cat} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        {cat} ({catPerms.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catPerms.map((pk: string) => {
                          const pObj = AVAILABLE_PERMISSIONS.find((p) => p.key === pk);
                          return (
                            <div
                              key={pk}
                              className="flex items-center justify-between gap-2 p-2 rounded bg-white border border-slate-200 shadow-2xs"
                            >
                              <span className="text-xs font-medium text-slate-800 truncate">
                                {pObj?.label || pk}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                {pObj?.route}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(admin);
            }}
            className="h-9 px-3.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-2xs flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Permissions</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. DELETE ADMIN MODAL
// ============================================================================
function AdminDeleteModal({
  isOpen,
  onClose,
  admin,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  admin: any;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  if (!isOpen || !admin) return null;

  const fullName =
    (admin.firstName || "") + " " + (admin.lastName || "") || admin.name || "Administrator";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-150">
        <div className="px-6 pt-6 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Administrator</h3>
              <p className="text-xs text-slate-500">This action cannot be undone.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-y border-slate-100 space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently revoke all access privileges for this administrator?
          </p>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Name:</span> {fullName}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Email:</span> {admin.email}
            </p>
            <p className="text-slate-700">
              <span className="font-semibold text-slate-900">Role:</span> {admin.role || "ADMIN"}
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 flex items-center justify-end gap-2.5 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. MAIN ADMIN MANAGEMENT PAGE COMPONENT
// ============================================================================
export default function AdminManagementPage() {
  const { setHeaders } = useHeaders();

  useEffect(() => {
    setHeaders({
      title: "Admin Management",
      des: "Create and manage system administrators with tailored page-level permissions.",
    });
  }, [setHeaders]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "FULL" | "CUSTOM">("ALL");
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Queries & Mutations
  const { data: adminData, isLoading, refetch } = useGetAdminsQuery({});
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const admins: any[] = adminData?.data || [];

  // Filter admins by search and tab
  const filteredAdmins = useMemo(() => {
    return admins.filter((adm) => {
      const q = searchTerm.toLowerCase().trim();
      const fullName = ((adm.firstName || "") + " " + (adm.lastName || "") + " " + (adm.name || "")).toLowerCase();
      const email = (adm.email || "").toLowerCase();
      const phone = (adm.phone || "").toLowerCase();
      const matchesSearch =
        !q || fullName.includes(q) || email.includes(q) || phone.includes(q);

      if (!matchesSearch) return false;

      const perms = Array.isArray(adm.permissions) ? adm.permissions : [];
      const isFull = perms.length === 0 || perms.length === AVAILABLE_PERMISSIONS.length;

      if (filterType === "FULL") return isFull;
      if (filterType === "CUSTOM") return !isFull;
      return true;
    });
  }, [admins, searchTerm, filterType]);

  // Counts for tabs and summary strip
  const fullAccessCount = useMemo(() => {
    return admins.filter((a) => {
      const perms = Array.isArray(a.permissions) ? a.permissions : [];
      return perms.length === 0 || perms.length === AVAILABLE_PERMISSIONS.length;
    }).length;
  }, [admins]);

  const customAccessCount = useMemo(() => {
    return admins.filter((a) => {
      const perms = Array.isArray(a.permissions) ? a.permissions : [];
      return perms.length > 0 && perms.length < AVAILABLE_PERMISSIONS.length;
    }).length;
  }, [admins]);

  // Form states for Create / Edit
  const [formData, setFormData] = useState<IAdminFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    permissions: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      permissions: [],
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (adm: any) => {
    setSelectedAdmin(adm);
    setFormData({
      firstName: adm.firstName || adm.name?.split(" ")[0] || "",
      lastName: adm.lastName || adm.name?.split(" ").slice(1).join(" ") || "",
      email: adm.email || "",
      phone: adm.phone || "",
      password: "",
      permissions: Array.isArray(adm.permissions) ? adm.permissions : [],
    });
    setIsEditOpen(true);
  };

  const openViewModal = (adm: any) => {
    setSelectedAdmin(adm);
    setIsViewOpen(true);
  };

  const openDeleteModal = (adm: any) => {
    setSelectedAdmin(adm);
    setIsDeleteOpen(true);
  };

  // Create submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters if specified");
      return;
    }

    try {
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name:
          (formData.firstName.trim() + " " + formData.lastName.trim()).trim() ||
          formData.email.split("@")[0],
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        permissions: formData.permissions,
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await createAdmin(payload).unwrap();
      toast.success(res?.message || "Admin created and credentials sent to their email!");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to create admin");
    }
  };

  // Edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin?._id) return;

    try {
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name:
          (formData.firstName.trim() + " " + formData.lastName.trim()).trim() ||
          formData.email.split("@")[0],
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        permissions: formData.permissions,
      };
      if (formData.password && formData.password.trim()) {
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        payload.password = formData.password;
      }

      const res = await updateAdmin({ id: selectedAdmin._id, data: payload }).unwrap();
      toast.success(res?.message || "Admin updated successfully");
      setIsEditOpen(false);
      setSelectedAdmin(null);
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update admin");
    }
  };

  // Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedAdmin?._id) return;
    try {
      const res = await deleteAdmin(selectedAdmin._id).unwrap();
      toast.success(res?.message || "Admin account deleted successfully");
      setIsDeleteOpen(false);
      setSelectedAdmin(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete admin");
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* KPI Overview Cards - Matching Standard Dashboard Card Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Administrators */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Administrators
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {admins.length}
            </span>
            <span className="text-xs text-slate-500">accounts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active console management accounts
          </p>
        </div>

        {/* Full System Access */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Full System Access
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {fullAccessCount}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              {admins.length > 0 ? Math.round((fullAccessCount / admins.length) * 100) + "%" : "0%"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Unrestricted access across all 25 modules
          </p>
        </div>

        {/* Granular / Custom Permitted */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Custom Permitted
            </span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {customAccessCount}
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              {admins.length > 0 ? Math.round((customAccessCount / admins.length) * 100) + "%" : "0%"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Restricted to designated pages only
          </p>
        </div>
      </div>

      {/* 2. Toolbar: Segmented Filter Tabs + Search + Create Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Filter Control */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
              filterType === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-700">
              {admins.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("FULL")}
            className={cn(
              "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
              filterType === "FULL"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Full Access</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              {fullAccessCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("CUSTOM")}
            className={cn(
              "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
              filterType === "CUSTOM"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Custom Permitted</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
              {customAccessCount}
            </span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 select-none"
          >
            <Plus className="w-3.5 h-3.5 text-slate-300" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2.5">
              <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
              <span className="text-xs font-medium">Loading administrative accounts...</span>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 border border-slate-200/80">
                <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No administrators found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                {searchTerm
                  ? 'No accounts match "' + searchTerm + '". Try a different keyword or clear the search filter.'
                  : "No administrative accounts exist under this filter category."}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-xs font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Administrator</th>
                  <th className="py-3 px-4 font-semibold">Contact Phone</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Page Access</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAdmins.map((adm) => {
                  const fullName =
                    ((adm.firstName || "") + " " + (adm.lastName || "")).trim() ||
                    adm.name ||
                    "Administrator";
                  const initials =
                    fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "A";
                  const perms = Array.isArray(adm.permissions) ? adm.permissions : [];
                  const isFullAccess =
                    perms.length === 0 || perms.length === AVAILABLE_PERMISSIONS.length;

                  return (
                    <tr
                      key={adm._id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 select-none">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate">
                              {fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{adm.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                        {adm.phone || "—"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {adm.role || "ADMIN"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isFullAccess ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>Full Access ({AVAILABLE_PERMISSIONS.length} Pages)</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1 max-w-sm">
                            {perms.slice(0, 2).map((pk: string) => {
                              const pObj = AVAILABLE_PERMISSIONS.find((p) => p.key === pk);
                              return (
                                <span
                                  key={pk}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[130px]"
                                  title={pObj?.label || pk}
                                >
                                  {pObj?.label || pk}
                                </span>
                              );
                            })}
                            {perms.length > 2 && (
                              <button
                                type="button"
                                onClick={() => openViewModal(adm)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                                title="Click to view all granted permissions"
                              >
                                +{perms.length - 2} more
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {adm.createdAt ? dayjs(adm.createdAt).format("DD MMM YYYY") : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openViewModal(adm)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(adm)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Permissions"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(adm)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer Summary */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <span>
            Showing <strong className="font-semibold text-slate-700">{filteredAdmins.length}</strong> of{" "}
            <strong className="font-semibold text-slate-700">{admins.length}</strong> administrators
          </span>
          <span className="text-slate-400">Strict Role-Based Access Control (RBAC)</span>
        </div>
      </div>

      {/* 4. Modals */}
      <AdminFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreating}
        title="Create New Administrator"
        description="Provide account credentials and select allowed dashboard pages."
        submitText="Save Administrator & Send Email"
        formData={formData}
        setFormData={setFormData}
        isEditMode={false}
      />

      <AdminFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        isSubmitting={isUpdating}
        title="Edit Administrator Permissions"
        description="Update account details and customize permitted dashboard pages."
        submitText="Save Changes"
        formData={formData}
        setFormData={setFormData}
        isEditMode={true}
      />

      <AdminViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        admin={selectedAdmin}
        onEdit={(adm) => openEditModal(adm)}
      />

      <AdminDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        admin={selectedAdmin}
        onConfirm={handleDeleteSubmit}
        isDeleting={isDeleting}
      />
    </div>
  );
}
