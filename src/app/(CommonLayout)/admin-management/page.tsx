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
} from "lucide-react";
import { FiEye, FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useHeaders } from "@/hooks/useHeaders";
import GeneralStateCard from "@/components/cui/GeneralStateCard";
import TableHeader from "@/components/cui/TableHeader";
import CreateButton from "@/components/buttons/CreateButton";
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
      const fullName = `${adm.firstName || ""} ${adm.lastName || ""} ${adm.name || ""}`.toLowerCase();
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

  // Counts for tabs and cards
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

  const statsItems = [
    {
      title: "Total Administrators",
      value: admins.length,
      description: "Active administrator accounts",
      id: "stat-total",
    },
    {
      title: "Full Access Admins",
      value: fullAccessCount,
      description: "Access to all 24 dashboard pages",
      id: "stat-full",
    },
    {
      title: "Custom Permitted",
      value: customAccessCount,
      description: "Restricted to specific pages",
      id: "stat-custom",
    },
  ];

  // Form states for Create / Edit
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    permissions: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      permissions: [],
    });
    setShowPassword(false);
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
    setShowPassword(false);
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

  // Auto-generate strong random password
  const handleAutoGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let res = "";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = `Eng@${res}`;
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

    setFormData((prev) => {
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((k) => !catKeys.includes(k)),
        };
      } else {
        const newSet = new Set([...prev.permissions, ...catKeys]);
        return {
          ...prev,
          permissions: Array.from(newSet),
        };
      }
    });
  };

  // Toggle all permissions across system
  const handleToggleAllPermissions = () => {
    setFormData((prev) => {
      if (prev.permissions.length === AVAILABLE_PERMISSIONS.length) {
        return { ...prev, permissions: [] };
      } else {
        return {
          ...prev,
          permissions: AVAILABLE_PERMISSIONS.map((p) => p.key),
        };
      }
    });
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
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim() || formData.email.split("@")[0],
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
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim() || formData.email.split("@")[0],
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
    <div className="py-8 px-6 space-y-6 pb-16">
      {/* Metric Cards - Official Dashboard Component */}
      <GeneralStateCard items={statsItems} className="grid-cols-1 sm:grid-cols-3" />

      {/* Main Table Container */}
      <div className="bg-white rounded-lg py-4 flex flex-col space-y-4 shadow-xs border border-gray-200/80">
        {/* Table Header and Toolbar */}
        <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TableHeader
            payload={{
              title: "System Administrators",
              des: "Manage administrative access, account details, and page permissions.",
              url: "#",
            }}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-slate-800 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Add New Admin Button */}
            <CreateButton
              text="Add New Admin"
              onClick={openCreateModal}
              className="w-auto shrink-0"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filterType === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60"
              }`}
            >
              All Administrators ({admins.length})
            </button>
            <button
              onClick={() => setFilterType("FULL")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filterType === "FULL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200"
              }`}
            >
              Full Access ({fullAccessCount})
            </button>
            <button
              onClick={() => setFilterType("CUSTOM")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                filterType === "CUSTOM"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-amber-50/70 text-amber-800 hover:bg-amber-100/70 border border-amber-200"
              }`}
            >
              Custom Permitted ({customAccessCount})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="px-6 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
              <span className="text-xs font-medium">Loading administrators...</span>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">No administrators found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchTerm
                  ? "Try searching with a different name, email or phone number."
                  : "Click 'Add New Admin' to create a new administrative account."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Permitted Pages</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredAdmins.map((adm) => {
                  const fullName =
                    `${adm.firstName || ""} ${adm.lastName || ""}`.trim() ||
                    adm.name ||
                    "Admin";
                  const initials = fullName.charAt(0).toUpperCase();
                  const perms = Array.isArray(adm.permissions) ? adm.permissions : [];
                  const isFullAccess =
                    perms.length === 0 || perms.length === AVAILABLE_PERMISSIONS.length;

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{fullName}</p>
                            <p className="text-[11px] text-slate-500">{adm.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {adm.phone || "—"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          {adm.role || "ADMIN"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isFullAccess ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>Full Access (All Pages)</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                            {perms.slice(0, 3).map((pk: string) => {
                              const pObj = AVAILABLE_PERMISSIONS.find((p) => p.key === pk);
                              return (
                                <span
                                  key={pk}
                                  className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {pObj?.label || pk}
                                </span>
                              );
                            })}
                            {perms.length > 3 && (
                              <button
                                onClick={() => openViewModal(adm)}
                                className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                +{perms.length - 3} more
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {adm.createdAt ? dayjs(adm.createdAt).format("DD MMM YYYY") : "—"}
                      </td>

                      {/* Official Dashboard Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openViewModal(adm)}
                            className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200 cursor-pointer"
                            title="View Details"
                          >
                            <FiEye className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(adm)}
                            className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors duration-200 cursor-pointer"
                            title="Edit Permissions"
                          >
                            <FiEdit className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(adm)}
                            className="flex items-center justify-center h-8 w-8 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200 cursor-pointer"
                            title="Delete Admin"
                          >
                            <HiOutlineTrash className="size-5" />
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
      </div>

      {/* ================= CREATE ADMIN MODAL ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Administrator</h3>
                  <p className="text-xs text-slate-500">Provide account credentials and select allowed dashboard pages</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Personal Details */}
              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-200 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-700" />
                  Account Credentials
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@eng.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+44 7123 456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Password Input with Auto-Generate Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password{" "}
                      <span className="text-slate-400 font-normal">
                        (Optional — auto-generated & emailed if empty)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGeneratePassword}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      title="Click to generate a strong random password"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to auto-generate or enter custom password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Credentials (login email & password) will be automatically emailed to this admin upon creation.</span>
                  </p>
                </div>
              </div>

              {/* Permissions Checkboxes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-700" />
                      Page Permissions
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Selected: <strong className="text-slate-900">{formData.permissions.length}</strong> of {AVAILABLE_PERMISSIONS.length} pages
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAllPermissions}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer"
                  >
                    {formData.permissions.length === AVAILABLE_PERMISSIONS.length
                      ? "Deselect All"
                      : "Select All 24 Pages"}
                  </button>
                </div>

                <div className="space-y-4">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const catItems = AVAILABLE_PERMISSIONS.filter((p) => p.category === cat);
                    const allCatChecked = catItems.every((p) => formData.permissions.includes(p.key));
                    const selectedCatCount = catItems.filter((p) => formData.permissions.includes(p.key)).length;

                    return (
                      <div key={cat} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedCatCount > 0 ? "bg-emerald-600" : "bg-slate-300"}`} />
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              {cat}
                            </p>
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                              {selectedCatCount} / {catItems.length}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {allCatChecked ? "Deselect Category" : "Select Category"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {catItems.map((perm) => {
                            const isChecked = formData.permissions.includes(perm.key);

                            return (
                              <label
                                key={perm.key}
                                onClick={() => handleTogglePermission(perm.key)}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all select-none ${
                                  isChecked
                                    ? "bg-white border-slate-900 ring-1 ring-slate-900/10 shadow-xs text-slate-900"
                                    : "bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                    isChecked
                                      ? "bg-slate-900 border-slate-900 text-white"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-xs leading-tight text-slate-900">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                                      {perm.route}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-tight mt-1 line-clamp-1">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Administrator & Send Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT ADMIN MODAL ================= */}
      {isEditOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                  <FiEdit className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Administrator & Permissions</h3>
                  <p className="text-xs text-slate-500">Update account credentials and manage page access</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-50/70 p-4.5 rounded-xl border border-slate-200 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-700" />
                  Account Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@eng.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+44 7123 456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Password field with Auto Generate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      New Password{" "}
                      <span className="text-slate-400 font-normal">(Leave blank to keep current password)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGeneratePassword}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      title="Click to generate a strong random password"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions Checkboxes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-700" />
                      Page Permissions
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Selected: <strong className="text-slate-900">{formData.permissions.length}</strong> of {AVAILABLE_PERMISSIONS.length} pages
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAllPermissions}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer"
                  >
                    {formData.permissions.length === AVAILABLE_PERMISSIONS.length
                      ? "Deselect All"
                      : "Select All 24 Pages"}
                  </button>
                </div>

                <div className="space-y-4">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const catItems = AVAILABLE_PERMISSIONS.filter((p) => p.category === cat);
                    const allCatChecked = catItems.every((p) => formData.permissions.includes(p.key));
                    const selectedCatCount = catItems.filter((p) => formData.permissions.includes(p.key)).length;

                    return (
                      <div key={cat} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedCatCount > 0 ? "bg-emerald-600" : "bg-slate-300"}`} />
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              {cat}
                            </p>
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                              {selectedCatCount} / {catItems.length}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {allCatChecked ? "Deselect Category" : "Select Category"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {catItems.map((perm) => {
                            const isChecked = formData.permissions.includes(perm.key);

                            return (
                              <label
                                key={perm.key}
                                onClick={() => handleTogglePermission(perm.key)}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all select-none ${
                                  isChecked
                                    ? "bg-white border-slate-900 ring-1 ring-slate-900/10 shadow-xs text-slate-900"
                                    : "bg-white/70 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                    isChecked
                                      ? "bg-slate-900 border-slate-900 text-white"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-xs leading-tight text-slate-900">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                                      {perm.route}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-tight mt-1 line-clamp-1">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW ADMIN MODAL ================= */}
      {isViewOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <FiEye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Administrator Profile</h3>
                  <p className="text-xs text-slate-500">Overview of account credentials and assigned privileges</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card */}
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-slate-200 border border-slate-300 font-bold text-base text-slate-700 flex items-center justify-center shrink-0">
                    {(selectedAdmin.firstName || selectedAdmin.name || "A")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {`${selectedAdmin.firstName || ""} ${selectedAdmin.lastName || ""}`.trim() || selectedAdmin.name || "Admin"}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{selectedAdmin.email}</p>
                    {selectedAdmin.phone && (
                      <p className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{selectedAdmin.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedAdmin.role || "ADMIN"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Joined {selectedAdmin.createdAt ? dayjs(selectedAdmin.createdAt).format("DD MMM YYYY") : "Recently"}
                  </span>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                    Permitted Dashboard Pages
                  </h4>
                  <span className="text-xs font-semibold text-slate-600">
                    {Array.isArray(selectedAdmin.permissions) && selectedAdmin.permissions.length > 0 && selectedAdmin.permissions.length < AVAILABLE_PERMISSIONS.length
                      ? `${selectedAdmin.permissions.length} of ${AVAILABLE_PERMISSIONS.length} Pages`
                      : "All 24 Pages (Full Access)"}
                  </span>
                </div>

                {(!selectedAdmin.permissions || selectedAdmin.permissions.length === 0 || selectedAdmin.permissions.length === AVAILABLE_PERMISSIONS.length) ? (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
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
                      const catPerms = (selectedAdmin.permissions || []).filter((pk: string) => {
                        const pObj = AVAILABLE_PERMISSIONS.find((p) => p.key === pk);
                        return pObj?.category === cat;
                      });

                      if (catPerms.length === 0) return null;

                      return (
                        <div key={cat} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                            {cat} ({catPerms.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {catPerms.map((pk: string) => {
                              const pObj = AVAILABLE_PERMISSIONS.find((p) => p.key === pk);

                              return (
                                <div
                                  key={pk}
                                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs"
                                >
                                  <span className="text-xs font-semibold text-slate-800 truncate">
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
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  openEditModal(selectedAdmin);
                }}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-200 flex items-center gap-1.5"
              >
                <FiEdit className="w-3.5 h-3.5" />
                <span>Edit Permissions</span>
              </button>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE ADMIN MODAL ================= */}
      {isDeleteOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Administrator</h3>
                  <p className="text-xs font-medium text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-4 bg-slate-50/50 border-y border-slate-100 space-y-2">
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently delete this administrator account? All access privileges will be revoked immediately.
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Name:</span>{" "}
                  {`${selectedAdmin.firstName || ""} ${selectedAdmin.lastName || ""}`.trim() || selectedAdmin.name || "Admin"}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Email:</span> {selectedAdmin.email}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Role:</span> {selectedAdmin.role || "ADMIN"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
