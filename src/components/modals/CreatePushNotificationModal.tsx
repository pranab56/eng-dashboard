/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useCreatePushNotificationMutation } from "@/features/pushNotification/pushNotificationApi";
import { useGetUserQuery } from "@/features/userManagement/userApi";
import { CustomModal } from "@/components/modals/CustomModal";
import SubmitButton from "@/components/buttons/SubmitButton";
import { Bell, Send, User, Check, ChevronsUpDown, Search, X } from "lucide-react";
import toast from "react-hot-toast";

interface CreatePushNotificationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreatePushNotificationModal({
  isOpen,
  setIsOpen,
}: CreatePushNotificationModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email?: string } | null>(null);
  
  // User combobox states
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const [createPushNotification, { isLoading: isSubmitting }] = useCreatePushNotificationMutation();
  const { data: userData, isLoading: isUsersLoading } = useGetUserQuery({ pageNumber: 1, limit: 100 });

  const rawUsersList = useMemo(() => {
    return userData?.data || [];
  }, [userData]);

  // Filtered users by search input
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm.trim()) return rawUsersList;
    const term = userSearchTerm.toLowerCase().trim();
    return rawUsersList.filter((u: any) => {
      const name = (u.userName || `${u.firstName || ""} ${u.lastName || ""}`).toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [rawUsersList, userSearchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const payload: { title: string; message: string; user?: string } = {
      title: title.trim(),
      message: message.trim(),
    };

    if (selectedUser?.id) {
      payload.user = selectedUser.id;
    }

    try {
      const res = await createPushNotification(payload).unwrap();
      if (res.success || res.status === 200 || res.status === 201) {
        toast.success(res.message || "Push Notification sent successfully!");
        // Reset form
        setTitle("");
        setMessage("");
        setSelectedUser(null);
        setIsOpen(false);
      } else {
        toast.success("Push Notification sent successfully!");
        setTitle("");
        setMessage("");
        setSelectedUser(null);
        setIsOpen(false);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send push notification");
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Send Push Notification"
      className="max-w-lg p-6 bg-white rounded-2xl shadow-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Target Audience / User Selection Combobox */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Target User (Optional)</span>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:outline-none focus:border-gray-300 transition-all cursor-pointer select-none"
            >
              <span className="truncate font-medium">
                {selectedUser ? (
                  <span className="flex items-center gap-2 text-slate-900">
                    <span className="font-semibold">{selectedUser.name}</span>
                    {selectedUser.email && (
                      <span className="text-xs text-gray-400">({selectedUser.email})</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-500 font-normal">
                    📢 All Users (Broadcast Notification)
                  </span>
                )}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </button>

            {/* Dropdown Content */}
            {isUserDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Search Bar */}
                <div className="p-2 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search user by name or email..."
                    className="w-full bg-transparent text-xs py-1.5 text-gray-900 placeholder:text-gray-400 outline-none"
                    autoFocus
                  />
                  {userSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setUserSearchTerm("")}
                      className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* User Options List */}
                <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                  {/* Broadcast All Users Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                      selectedUser === null
                        ? "bg-slate-900 text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">📢 All Users (Broadcast)</span>
                      <span className={selectedUser === null ? "text-slate-300 text-[10px]" : "text-gray-400 text-[10px]"}>
                        Send push notification to everyone in system
                      </span>
                    </div>
                    {selectedUser === null && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>

                  {/* List of Users */}
                  {isUsersLoading ? (
                    <div className="py-4 text-center text-xs text-gray-400">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">No users found</div>
                  ) : (
                    filteredUsers.map((u: any) => {
                      const name = u.userName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
                      const isSelected = selectedUser?.id === u._id;

                      return (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            setSelectedUser({
                              id: u._id,
                              name,
                              email: u.email,
                            });
                            setIsUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                            isSelected
                              ? "bg-slate-900 text-white font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-medium truncate">{name}</span>
                            {u.email && (
                              <span className={isSelected ? "text-slate-300 text-[10px]" : "text-gray-400 text-[10px]"}>
                                {u.email} • {u.role || "USER"}
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-500 pt-0.5">
            Leave blank to broadcast to all registered users, or select a specific user.
          </p>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Notification Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. System Alert 🚨 or Tournament Update!"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:border-gray-300 transition-all"
            required
          />
        </div>

        {/* Message Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Message Body <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your notification message content here..."
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:border-gray-300 transition-all resize-none"
            required
          />
        </div>

        {/* Footer Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <SubmitButton
            isSubmitting={isSubmitting}
            title="Send Push Notification"
            className="rounded-xl px-5 py-2.5 text-xs font-bold shadow-md"
          />
        </div>
      </form>
    </CustomModal>
  );
}
