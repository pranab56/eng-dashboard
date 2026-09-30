/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Plus,
  Search,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useDeleteeventMutation,
  useGetEventQuery,
  useRearrangeEventsMutation,
  useGetEventAnalyticsQuery,
} from "@/features/eventManagement/eventApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getEventColumns } from "@/tableColumns/eventColumns";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import EventViewModal from "./EventViewModal";

type FilterTab = "all" | "publish" | "draft" | "upcoming";

const EventManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("eventPage") || "1";

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { data: eventData, isLoading } = useGetEventQuery(page);
  const { data: analyticsData } = useGetEventAnalyticsQuery(undefined);
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteeventMutation();
  const [rearrangeEvents] = useRearrangeEventsMutation();

  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Event Management",
      des: "Organize, schedule, and verify club events and matchdays across the digital network.",
    });
  }, [setHeaders]);

  useEffect(() => {
    if (eventData?.data) {
      setLocalEvents(eventData.data);
    }
  }, [eventData]);

  // Compute statistics directly from backend DB aggregation
  const eventAnalytics = analyticsData?.data;
  const totalCount = eventAnalytics?.total ?? (eventData?.pagination?.total || localEvents.length);
  const publishedCount = eventAnalytics?.published ?? 0;
  const upcomingCount = eventAnalytics?.upcoming ?? 0;
  const draftCount = eventAnalytics?.drafts ?? 0;

  // Filtered list based on search and tab
  const displayedEvents = useMemo(() => {
    const now = new Date();
    return localEvents.filter((event: any) => {
      // Tab filter
      if (activeTab === "publish" && event.status?.toLowerCase() !== "publish") {
        return false;
      }
      if (activeTab === "draft" && event.status?.toLowerCase() !== "draft") {
        return false;
      }
      if (activeTab === "upcoming") {
        if (!event.eventDate || new Date(event.eventDate) < now) {
          return false;
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(q);
        const locMatch = event.location?.toLowerCase().includes(q);
        const descMatch = event.description?.toLowerCase().includes(q);
        return titleMatch || locMatch || descMatch;
      }

      return true;
    });
  }, [localEvents, activeTab, searchTerm]);

  const handleDragEnd = async (startIndex: number, endIndex: number) => {
    const updatedEvents = [...localEvents];
    const [removed] = updatedEvents.splice(startIndex, 1);
    updatedEvents.splice(endIndex, 0, removed);

    setLocalEvents(updatedEvents);

    const limit = eventData?.pagination?.limit || 10;
    const pageNum = Number(page) || 1;
    const offset = (pageNum - 1) * limit;

    const reorderedPayload = updatedEvents.map((ev: any, index: number) => ({
      id: ev._id,
      order: offset + index + 1,
    }));

    try {
      await rearrangeEvents({ events: reorderedPayload }).unwrap();
      toast.success("Event order updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reorder events");
      if (eventData?.data) {
        setLocalEvents(eventData.data);
      }
    }
  };

  const handleView = (event: any) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteEvent(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Event deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete event");
    }
  };

  const columns = getEventColumns(handleView, handleDelete);

  return (
    <div className="pt-6 px-6 sm:px-8 space-y-6 max-w-[1600px] mx-auto">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Events
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-2">
            {totalCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Club calendar records
          </span>
        </div>

        {/* Published */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Published
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            {publishedCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Live on official schedule
          </span>
        </div>

        {/* Upcoming */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Upcoming Matchdays
            </span>
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-2">
            {upcomingCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Future scheduled dates
          </span>
        </div>

        {/* Drafts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mt-2">
            {draftCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Unpublished / In review
          </span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event title or location..."
              className="w-full h-9 pl-9 pr-8 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("publish")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "publish"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "upcoming"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("draft")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "draft"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Right: Add Action */}
        <Link href="/event-management/create-event">
          <button
            type="button"
            className="h-9 px-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </button>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col">
        {/* Table Subheader */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Event Registry ({displayedEvents.length} shown)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <GripVertical className="w-3.5 h-3.5 text-slate-400" />
            Drag rows to reorder event hierarchy
          </span>
        </div>

        <div className="p-4 flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 text-xs text-slate-500">
              Loading club events...
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No events found
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try adjusting your search terms or filter selection.
              </p>
            </div>
          ) : (
            <CustomTable<any>
              columns={columns}
              data={displayedEvents}
              isSortable={true}
              onDragEnd={handleDragEnd}
            />
          )}
        </div>

        {/* Pagination Container */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <CustomPagination
            TOTAL_PAGES={eventData?.pagination?.totalPage || 1}
            qryName="eventPage"
          />
        </div>
      </div>

      {/* View Modal */}
      <EventViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        event={selectedEvent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Event Deletion"
        description="Are you sure you want to delete this event? This action cannot be reversed."
      />
    </div>
  );
};

export default EventManagement;
