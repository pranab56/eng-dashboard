"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TTournament, TPositionReward } from "@/types/columnTypes";
import dayjs from "dayjs";
import { Trophy, Plus, Trash2, Loader2, Sparkles, Check, ChevronsUpDown } from "lucide-react";
import React, { useEffect, useState } from "react";
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
  const [positionRewards, setPositionRewards] = useState<TPositionReward[]>(DEFAULT_REWARDS);
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
      setPositionRewards(
        editingTournament.positionRewards && editingTournament.positionRewards.length > 0
          ? editingTournament.positionRewards
          : DEFAULT_REWARDS
      );
    } else {
      setTitle("");
      setDescription("");
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(14, "day").format("YYYY-MM-DD"));
      setStatus("upcoming");
      setPositionRewards(DEFAULT_REWARDS);
    }
    setErrorMsg("");
  }, [editingTournament, isOpen]);

  const handleAddRewardRow = () => {
    const nextPos = positionRewards.length + 1;
    let defaultTitle = `Position ${nextPos}`;
    if (nextPos === 1) defaultTitle = "Champion";
    else if (nextPos === 2) defaultTitle = "Runner Up";
    else if (nextPos === 3) defaultTitle = "Third Place";

    setPositionRewards([
      ...positionRewards,
      {
        position: nextPos,
        positionName: defaultTitle,
        points: nextPos === 1 ? 1000 : nextPos === 2 ? 500 : nextPos === 3 ? 250 : 100,
      },
    ]);
  };

  const handleRemoveRewardRow = (index: number) => {
    const updated = positionRewards.filter((_, idx) => idx !== index);
    const reindexed = updated.map((r, i) => ({ ...r, position: i + 1 }));
    setPositionRewards(reindexed);
  };

  const handleRewardChange = (
    index: number,
    field: keyof TPositionReward,
    value: any
  ) => {
    const updated = [...positionRewards];
    if (field === "position") {
      updated[index].position = value === "" ? ("" as any) : Math.max(1, parseInt(value, 10) || 1);
    } else if (field === "points") {
      updated[index].points = value === "" ? ("" as any) : Number(value);
    } else {
      updated[index].positionName = value;
    }
    setPositionRewards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Tournament title is required");
      return;
    }

    if (!startDate) {
      setErrorMsg("Start date is required");
      return;
    }

    if (!endDate) {
      setErrorMsg("End date is required");
      return;
    }

    // Convert dates to ISO timestamp strings
    const startIso = `${startDate}T00:00:00.000Z`;
    const endIso = `${endDate}T23:59:59.000Z`;

    const formattedRewards = positionRewards
      .map((r, idx) => ({
        position: Number(r.position) || idx + 1,
        positionName: (r.positionName || "").trim() || `Position ${idx + 1}`,
        points: Number(r.points) || 0,
      }))
      .sort((a, b) => a.position - b.position);

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      startDate: startIso,
      endDate: endIso,
      status: status,
      positionRewards: formattedRewards,
      id: editingTournament?._id || (editingTournament as any)?.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-medium text-gray-900 text-lg">
                {editingTournament ? "Edit Tournament" : "Create New Tournament"}
              </DialogTitle>
              <p className="text-xs text-gray-500">
                {editingTournament
                  ? "Update tournament schedule and position rewards"
                  : "Set up a new tournament with positions and points rewards"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Tournament Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ENG Summer Cup 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors font-medium text-gray-800"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Description
            </label>
            <textarea
              placeholder="Brief details about this tournament..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors font-medium text-gray-800 resize-none"
            />
          </div>

          {/* Dates & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomDatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />

            <CustomDatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Status
              </label>
              <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between font-medium text-gray-800 hover:bg-gray-100/70 focus:outline-none focus:border-black transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="capitalize">{status}</span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 bg-white border border-gray-200 shadow-xl rounded-xl z-[60]">
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
                      className={`w-full px-3.5 py-2.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${status === opt.value
                        ? "bg-black text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100"
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
          </div>

          {/* Position Rewards Fieldset */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Position Rewards</span>
                </h4>
                <p className="text-xs text-gray-400">
                  Specify placement ranks, titles, and rewarded points
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRewardRow}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rank</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {positionRewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <div className="w-16">
                    <label className="block text-[10px] font-medium text-gray-400 . mb-0.5">
                      Pos
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={reward.position}
                      onChange={(e) =>
                        handleRewardChange(index, "position", e.target.value)
                      }
                      className="w-full h-9 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium text-center"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-gray-400 . mb-0.5">
                      Position Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Champion"
                      value={reward.positionName}
                      onChange={(e) =>
                        handleRewardChange(index, "positionName", e.target.value)
                      }
                      className="w-full h-9 px-3 bg-white border border-gray-200 rounded-md text-xs font-medium"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] font-medium text-gray-400 . mb-0.5">
                      Points
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={reward.points}
                      onChange={(e) =>
                        handleRewardChange(index, "points", e.target.value)
                      }
                      className="w-full h-9 px-2 bg-white border border-gray-200 rounded-md text-xs font-medium text-blue-600"
                    />
                  </div>

                  {positionRewards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRewardRow(index)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer self-end mb-0.5"
                      title="Remove reward rank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              {errorMsg}
            </p>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 text-sm font-semibold transition-all shadow-md shadow-gray-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
