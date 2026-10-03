/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Clock,
  CheckCircle2,
  RefreshCw,
  Send,
  Users,
  Shield,
  Calendar,
  MapPin,
  Settings2,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetMatchReminderSettingsQuery,
  useUpdateMatchReminderSettingsMutation,
  useGetUpcomingMatchesPreviewQuery,
  useTriggerMatchRemindersNowMutation,
  useSendSingleMatchReminderNowMutation,
} from "@/features/pushNotification/pushNotificationApi";
import { formatImagePath } from "@/utils/formatImagePath";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);


function getPaginationPages(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function MatchRemindersSection() {
  // Settings Query & Mutation
  const {
    data: settingsRes,
    refetch: refetchSettings,
  } = useGetMatchReminderSettingsQuery(undefined);
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateMatchReminderSettingsMutation();

  // Upcoming Matches Query & Mutations
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "SENT">("ALL");

  const {
    data: previewRes,
    isLoading: isLoadingMatches,
    isFetching: isFetchingMatches,
    refetch: refetchMatches,
  } = useGetUpcomingMatchesPreviewQuery({
    page,
    limit: 15,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const [triggerRemindersNow, { isLoading: isTriggeringNow }] = useTriggerMatchRemindersNowMutation();
  const [sendSingleReminder, { isLoading: isSendingSingle }] = useSendSingleMatchReminderNowMutation();

  // Local Form State for Settings
  const [isEnabled, setIsEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState(24);
  const [audience, setAudience] = useState<"STAKEHOLDERS" | "ALL">("STAKEHOLDERS");
  const [customTitle, setCustomTitle] = useState("Match Reminder: {homeTeam} vs {awayTeam}");
  const [customMessage, setCustomMessage] = useState(
    "Upcoming match: {homeTeam} vs {awayTeam} kicks off tomorrow ({date}) at {time}{venue}. Don't miss it!"
  );
  const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);
  const [sendingMatchId, setSendingMatchId] = useState<string | null>(null);

  // Sync settings when loaded
  useEffect(() => {
    if (settingsRes?.data) {
      const s = settingsRes.data;
      setIsEnabled(s.isMatchReminderEnabled ?? true);
      setReminderHours(s.matchReminderHours ?? 24);
      setAudience(s.matchReminderAudience ?? "STAKEHOLDERS");
      if (s.customReminderTitle) setCustomTitle(s.customReminderTitle);
      if (s.customReminderMessage) setCustomMessage(s.customReminderMessage);
    }
  }, [settingsRes]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        isMatchReminderEnabled: isEnabled,
        matchReminderHours: Number(reminderHours) || 24,
        matchReminderAudience: audience,
        customReminderTitle: customTitle.trim(),
        customReminderMessage: customMessage.trim(),
      }).unwrap();
      toast.success("Match reminder settings saved successfully!");
      refetchSettings();
      refetchMatches();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update match reminder settings");
    }
  };

  const handleTriggerAllNow = async () => {
    try {
      const res = await triggerRemindersNow(undefined).unwrap();
      toast.success(res?.message || "Match reminders check dispatched successfully!");
      refetchMatches();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to dispatch match reminders");
    }
  };

  const handleSendSingleMatch = async (matchId: string) => {
    try {
      setSendingMatchId(matchId);
      const res = await sendSingleReminder(matchId).unwrap();
      toast.success(res?.message || "Match reminder sent successfully!");
      refetchMatches();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send match reminder");
    } finally {
      setSendingMatchId(null);
    }
  };

  const matches = previewRes?.data?.matches || [];
  const pagination = previewRes?.data?.pagination || { total: 0, totalPage: 1 };

  return (
    <div className="space-y-6">
      {/* Configuration & Control Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Automated Match Reminder Rules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure when and to whom push notifications are automatically dispatched before kickoff.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleTriggerAllNow}
              disabled={isTriggeringNow || !isEnabled}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
              title="Immediately check upcoming matches and send reminders right now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringNow ? "animate-spin" : ""}`} />
              <span>{isTriggeringNow ? "Dispatching..." : "Dispatch Reminders Now"}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isUpdatingSettings}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isUpdatingSettings ? "Saving..." : "Save Rules"}</span>
            </button>
          </div>
        </div>

        {/* Setting Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Master Toggle */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Automated Reminders
                </span>
                <button
                  type="button"
                  onClick={() => setIsEnabled(!isEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isEnabled ? "bg-amber-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                When enabled, BullMQ periodically checks upcoming fixtures and sends push notifications at the configured advance time.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${isEnabled ? "bg-emerald-500" : "bg-slate-400"}`} />
              <span className={isEnabled ? "text-emerald-700" : "text-slate-500"}>
                {isEnabled ? "Active (Running automatically)" : "Paused (No auto reminders)"}
              </span>
            </div>
          </div>

          {/* 2. Advance Timing Selector */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Advance Notice Time
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { hours: 6, label: "6 Hours" },
                { hours: 12, label: "12 Hours" },
                { hours: 24, label: "24 Hours (1 Day)" },
                { hours: 48, label: "48 Hours (2 Days)" },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setReminderHours(opt.hours)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer text-center ${
                    reminderHours === opt.hours
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Custom Hours:</span>
              <input
                type="number"
                min={1}
                max={168}
                value={reminderHours}
                onChange={(e) => setReminderHours(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-500">hours before kickoff</span>
            </div>
          </div>

          {/* 3. Target Audience Selection */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Recipient Target Audience
            </span>
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="STAKEHOLDERS"
                  checked={audience === "STAKEHOLDERS"}
                  onChange={() => setAudience("STAKEHOLDERS")}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Match Stakeholders Only</span>
                  <span className="text-[11px] text-slate-500 block">
                    Players, parents, team managers, team bell subscribers & referee of both participating teams.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="ALL"
                  checked={audience === "ALL"}
                  onChange={() => setAudience("ALL")}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">All App Users (Broadcast)</span>
                  <span className="text-[11px] text-slate-500 block">
                    Broadcast push notification to all verified users registered in the mobile app.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Collapsible Template Customizer */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsTemplateExpanded(!isTemplateExpanded)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Customize Notification Message Template</span>
            <span className="text-[10px] text-slate-400">({isTemplateExpanded ? "Hide" : "Edit template"})</span>
          </button>

          {isTemplateExpanded && (
            <div className="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Notification Title:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="Match Reminder: {homeTeam} vs {awayTeam}"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Notification Message Body:</label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  placeholder="Upcoming match: {homeTeam} vs {awayTeam} kicks off tomorrow ({date}) at {time}{venue}. Don't miss it!"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-600">Dynamic placeholders:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{"{homeTeam}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{"{awayTeam}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{"{date}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{"{time}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">{"{venue}"}</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Matches & Reminder Queue Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Upcoming Fixtures & Reminder Queue
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {pagination.total} Matches Found
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live schedule of upcoming fixtures showing reminder dispatch statuses and target recipient counts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
              {[
                { id: "ALL", label: "All Upcoming" },
                { id: "PENDING", label: "Pending Reminder" },
                { id: "SENT", label: "Reminder Sent" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id as any);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => refetchMatches()}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingMatches ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Matches Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="py-3 px-4">Fixture / Teams</th>
                <th className="py-3 px-4">Competition</th>
                <th className="py-3 px-4">Kickoff Schedule (UK)</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Reminder Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoadingMatches ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin text-amber-600 mb-2" />
                    <span>Loading upcoming fixtures and reminder states...</span>
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700">No upcoming fixtures found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Matches scheduled in the future will appear here automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                matches.map((m: any) => {
                  const matchTime = dayjs(m.scheduledAt || m.matchDate).tz("Europe/London");
                  const isSent = Boolean(m.oneDayReminderSent);
                  const isSending = sendingMatchId === m._id;

                  // Remaining time calculation for pending matches
                  const now = dayjs();
                  const diffMs = matchTime.diff(now);
                  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const totalDays = Math.floor(totalHours / 24);
                  const leftHours = totalHours % 24;

                  let remainingDaysText = "";
                  if (diffMs < 0) {
                    remainingDaysText = "Kickoff passed";
                  } else if (totalDays >= 2) {
                    remainingDaysText = `${totalDays} days remaining`;
                  } else if (totalDays === 1) {
                    remainingDaysText = leftHours > 0 ? `1 day, ${leftHours}h remaining` : "1 day remaining";
                  } else if (totalHours >= 2) {
                    remainingDaysText = `${totalHours} hours remaining`;
                  } else if (totalHours === 1) {
                    remainingDaysText = "1 hour remaining";
                  } else {
                    remainingDaysText = "Less than 1h remaining";
                  };

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Teams */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            {m.homeTeam?.logo ? (
                              <Image
                                src={formatImagePath(m.homeTeam.logo)}
                                width={20}
                                height={20}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="font-semibold text-slate-900 truncate">
                              {m.homeTeam?.teamName || "Home Team"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {m.awayTeam?.logo ? (
                              <Image
                                src={formatImagePath(m.awayTeam.logo)}
                                width={20}
                                height={20}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="font-semibold text-slate-900 truncate">
                              {m.awayTeam?.teamName || "Away Team"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Competition */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block truncate max-w-[130px]">
                          {m.league?.leagueName || m.matchType?.toUpperCase() || "League Match"}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {m.formation || "Official Fixture"}
                        </span>
                      </td>

                      {/* Kickoff */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">
                          {matchTime.format("ddd, DD MMM YYYY")}
                        </span>
                        <span className="text-[11px] text-amber-700 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {matchTime.format("hh:mm A")} ({matchTime.fromNow()})
                        </span>
                      </td>

                      {/* Venue */}
                      <td className="py-3 px-4 max-w-[170px]">
                        {(() => {
                          const raw = (m.venueName || m.venueCategory?.name || m.venue || "").trim();
                          const isHexId = /^[0-9a-fA-F]{24}$/.test(raw);
                          const safeVenue = isHexId ? (m.venueCategory?.name || "") : raw;
                          return safeVenue ? (
                            <div className="flex items-start gap-1 truncate text-slate-700" title={safeVenue}>
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate">{safeVenue}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">TBD</span>
                          );
                        })()}
                      </td>

                      {/* Audience */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-900">
                            {m.recipientCount || 0}
                          </span>
                          <span className="text-[10px] text-slate-400">recipients</span>
                        </div>
                      </td>

                      {/* Reminder Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSent ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Reminder Sent</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{remainingDaysText}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Pending &bull; Auto-send at {reminderHours}h mark
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSendSingleMatch(m._id)}
                          disabled={isSending || isSendingSingle}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                          title="Manually trigger reminder push notification for this match immediately"
                        >
                          <Send className={`w-3 h-3 ${isSending ? "animate-spin" : ""}`} />
                          <span>{isSending ? "Sending..." : isSent ? "Resend Reminder" : "Send Now"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPage > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Page {page} of {pagination.totalPage} ({pagination.total} total matches)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
