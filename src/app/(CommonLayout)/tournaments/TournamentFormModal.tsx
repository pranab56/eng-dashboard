/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TTournament, TPositionReward } from "@/types/columnTypes";
import dayjs from "dayjs";
import {
  Trophy,
  Plus,
  Trash2,
  Loader2,
  Check,
  ChevronsUpDown,
  Coins,
  X,
  Award,
} from "lucide-react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    prizeCoins?: number;
    positionRewards: TPositionReward[];
    id?: string;
  }) => Promise<void>;
  editingTournament?: TTournament | null;
  isLoading: boolean;
}

const DEFAULT_REWARDS: TPositionReward[] = [
  { position: 1, positionName: "Champion", points: 1000 },
  { position: 2, positionName: "Runner Up", points: 500 },
  { position: 3, positionName: "Third Place", points: 250 },
];

export default function TournamentFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingTournament,
  isLoading,
}: TournamentFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [prizeCoins, setPrizeCoins] = useState<number | undefined>(undefined);
  const [positionRewards, setPositionRewards] =
    useState<TPositionReward[]>(DEFAULT_REWARDS);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingTournament) {
      setTitle(editingTournament.title || "");
      setDescription(editingTournament.description || "");
      setStartDate(
        editingTournament.startDate
          ? dayjs(editingTournament.startDate).format("YYYY-MM-DD")
          : ""
      );
      setEndDate(
        editingTournament.endDate
          ? dayjs(editingTournament.endDate).format("YYYY-MM-DD")
          : ""
      );
      setStatus(editingTournament.status || "upcoming");
      setPrizeCoins(editingTournament.prizeCoins);
      setPositionRewards(
        editingTournament.positionRewards &&
          editingTournament.positionRewards.length > 0
          ? editingTournament.positionRewards
          : DEFAULT_REWARDS
      );
    } else {
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setStatus("upcoming");
      setPrizeCoins(undefined);
      setPositionRewards(DEFAULT_REWARDS);
    }
    setErrorMsg("");
  }, [editingTournament, isOpen]);

  const handleAddRewardRow = () => {
    const nextPos = positionRewards.length + 1;
    setPositionRewards([
      ...positionRewards,
      { position: nextPos, positionName: `Rank #${nextPos}`, points: 100 },
    ]);
  };

  const handleRemoveRewardRow = (index: number) => {
    const updated = positionRewards.filter((_, idx) => idx !== index);
    setPositionRewards(updated);
  };

  const handleRewardChange = (
    index: number,
    field: keyof TPositionReward,
    value: string | number
  ) => {
    const updated = [...positionRewards];
    if (field === "position" || field === "points") {
      updated[index] = { ...updated[index], [field]: Number(value) || 0 };
    } else if (field === "positionName") {
      updated[index] = { ...updated[index], positionName: String(value) };
    } else {
      (updated[index] as any)[field] = value;
    }
    setPositionRewards(updated);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Tournament title is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Tournament description is required.");
      return;
    }
    if (!startDate) {
      setErrorMsg("Start date is required.");
      return;
    }
    if (!endDate) {
      setErrorMsg("End date is required.");
      return;
    }
    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      setErrorMsg("End date cannot be earlier than start date.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      status,
      prizeCoins: prizeCoins !== undefined ? Number(prizeCoins) : undefined,
      positionRewards: positionRewards.map((r) => ({
        position: Number(r.position),
        positionName: r.positionName.trim(),
        points: Number(r.points),
      })),
      id: editingTournament?._id || (editingTournament as any)?.id,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Enterprise Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 text-left relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                {editingTournament ? "Update Tournament Event" : "Create Tournament Event"}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure competition timeline, schedule dates, and placement reward branches.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmitForm}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-slate-800"
        >
          {/* Tournament Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Tournament Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ENG National Summer Championship 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Description & Regulations <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Brief details about the competition format, rules, and participant categories..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="w-full p-3 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors resize-none"
            />
          </div>

          {/* Dates Grid (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomDatePicker
              label="Tournament Start Date"
              value={startDate}
              onChange={setStartDate}
            />

            <CustomDatePicker
              label="Tournament End Date"
              value={endDate}
              onChange={setEndDate}
              align="right"
            />
          </div>

          {/* Status & Prize Coins Grid (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Combobox */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Tournament Status
              </label>
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm flex items-center justify-between font-normal text-slate-900 hover:bg-slate-50 focus:outline-none focus:border-slate-500 transition-colors cursor-pointer select-none"
                  >
                    <span className="capitalize">{status}</span>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 bg-white border border-slate-200 shadow-xl rounded-md z-[60]">
                  {[
                    { label: "Upcoming", value: "upcoming" },
                    { label: "Ongoing", value: "ongoing" },
                    { label: "Completed", value: "completed" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatus(opt.value);
                        setStatusPopoverOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs rounded flex items-center justify-between transition-colors cursor-pointer text-left ${
                        status === opt.value
                          ? "bg-slate-900 text-white font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {status === opt.value && (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Total Prize Pool Coins */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Prize Pool Coins (QR Redeem)</span>
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 1750"
                value={prizeCoins !== undefined ? prizeCoins : ""}
                onChange={(e) =>
                  setPrizeCoins(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                disabled={isLoading}
                className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Position Rewards Fieldset */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  <span>Placement Reward Branches</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Configure placement ranks, official titles, and awarded coin amounts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRewardRow}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Add Rank</span>
              </button>
            </div>

            <div className="space-y-2">
              {positionRewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md"
                >
                  <div className="w-16">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      Rank #
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={reward.position}
                      onChange={(e) =>
                        handleRewardChange(index, "position", e.target.value)
                      }
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs font-semibold text-center text-slate-900"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      Position Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Champion, Runner Up..."
                      value={reward.positionName}
                      onChange={(e) =>
                        handleRewardChange(
                          index,
                          "positionName",
                          e.target.value
                        )
                      }
                      className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      Coins Reward
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={reward.points}
                      onChange={(e) =>
                        handleRewardChange(index, "points", e.target.value)
                      }
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900"
                    />
                  </div>

                  {positionRewards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRewardRow(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer self-end mb-0.5"
                      title="Remove reward rank"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-md border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {editingTournament ? "Update Tournament" : "Create Tournament"}
              </span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
