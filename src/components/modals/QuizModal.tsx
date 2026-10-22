/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatImagePath } from "@/utils/formatImagePath";

interface QuestionItem {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  points: number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem?: any;
  isLoading?: boolean;
}

const CATEGORIES = [
  "General Sports",
  "Football Trivia",
  "Rules & Fair Play",
  "Tournament Special",
  "Academy & Tactics",
  "Matchday Quiz",
];

export default function QuizModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: QuizModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General Sports");
  const [description, setDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState<number>(50);
  const [passingPercentage, setPassingPercentage] = useState<number>(70);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(120);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "completed">("active");

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
      points: 10,
    },
  ]);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "");
      setCategory(editingItem.category || "General Sports");
      setDescription(editingItem.description || "");
      setRewardPoints(editingItem.rewardPoints ?? 50);
      setPassingPercentage(editingItem.passingPercentage ?? 70);
      setTimeLimitSeconds(editingItem.timeLimitSeconds ?? 120);
      setStartDate(
        editingItem.startDate ? editingItem.startDate.split("T")[0] : ""
      );
      setEndDate(editingItem.endDate ? editingItem.endDate.split("T")[0] : "");
      setStatus(editingItem.status || "active");

      if (Array.isArray(editingItem.questions) && editingItem.questions.length > 0) {
        setQuestions(
          editingItem.questions.map((q: any) => ({
            question: q.question || "",
            options: Array.isArray(q.options) && q.options.length >= 2
              ? q.options
              : ["", "", "", ""],
            correctOptionIndex: Number(q.correctOptionIndex) || 0,
            explanation: q.explanation || "",
            points: Number(q.points) || 10,
          }))
        );
      } else {
        setQuestions([
          {
            question: "",
            options: ["", "", "", ""],
            correctOptionIndex: 0,
            explanation: "",
            points: 10,
          },
        ]);
      }

      setBannerPreview(formatImagePath(editingItem.banner));
      setBannerFile(null);
    } else {
      // Reset
      setTitle("");
      setCategory("General Sports");
      setDescription("");
      setRewardPoints(50);
      setPassingPercentage(70);
      setTimeLimitSeconds(120);
      setStartDate("");
      setEndDate("");
      setStatus("active");
      setQuestions([
        {
          question: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          explanation: "",
          points: 10,
        },
      ]);
      setBannerFile(null);
      setBannerPreview(null);
    }
    setErrorMsg("");
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  // Handle Question Changes
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: "",
        points: 10,
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionFieldChange = (
    qIndex: number,
    field: keyof QuestionItem,
    val: any
  ) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], [field]: val };
    setQuestions(updated);
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    val: string
  ) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[optIndex] = val;
    updated[qIndex] = { ...updated[qIndex], options: newOptions };
    setQuestions(updated);
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a quiz title.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg("End date cannot be earlier than start date.");
      return;
    }

    // Validate Questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`Question ${i + 1} is missing its question text.`);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim() !== "");
      if (validOptions.length < 2) {
        setErrorMsg(`Question ${i + 1} must have at least 2 non-empty options.`);
        return;
      }
      if (
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= q.options.length ||
        !q.options[q.correctOptionIndex]?.trim()
      ) {
        setErrorMsg(`Question ${i + 1} has an invalid or empty correct option.`);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("rewardPoints", String(rewardPoints));
    formData.append("passingPercentage", String(passingPercentage));
    formData.append("timeLimitSeconds", String(timeLimitSeconds));
    formData.append("startDate", new Date(startDate).toISOString());
    formData.append("endDate", new Date(endDate).toISOString());
    formData.append("status", status);
    if (description.trim()) formData.append("description", description.trim());

    // Clean questions
    const cleanQuestions = questions.map((q) => ({
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation.trim(),
      points: Number(q.points) || 10,
    }));
    formData.append("questions", JSON.stringify(cleanQuestions));

    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to save quiz.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <div>
            <span className="text-sm font-semibold text-slate-900 block">
              {editingItem ? "Edit Quiz Campaign" : "Create Interactive Quiz"}
            </span>
            <span className="text-xs text-slate-500">
              Set up questions, rewards, and play-to-win parameters for fans & players.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Football Rules & Fair Play Trivia #1"
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val)}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white shadow-2xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white shadow-2xs">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="active" className="text-xs">Active (Available for Playing)</SelectItem>
                  <SelectItem value="draft" className="text-xs">Draft (Hidden)</SelectItem>
                  <SelectItem value="completed" className="text-xs">Completed / Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reward & Timing Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-md">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Reward Points</span>
              </label>
              <input
                type="number"
                min={0}
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Bonus coins credited upon passing
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Passing % Required</span>
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Minimum score to earn reward (e.g. 70%)
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Time Limit (Seconds)</span>
              </label>
              <input
                type="number"
                min={15}
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Total quiz time (120s = 2 mins)
              </span>
            </div>
          </div>

          {/* Schedule Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quiz Banner Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerSelect}
                  className="hidden"
                />
              </label>
              {bannerPreview && (
                <div className="relative inline-block border border-slate-200 rounded overflow-hidden h-9 w-20 bg-slate-100">
                  <img
                    src={bannerPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="absolute top-0.5 right-0.5 bg-slate-900/70 text-white rounded p-0.5 hover:bg-rose-600 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Questions Section */}
          <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  Quiz Questions ({questions.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Select the radio button next to an option to mark it as the correct answer.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-3 bg-white border border-slate-200 rounded-md shadow-xs space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                      Question #{qIdx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <span>Pts:</span>
                        <input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) =>
                            handleQuestionFieldChange(
                              qIdx,
                              "points",
                              Number(e.target.value) || 10
                            )
                          }
                          className="w-12 h-6 px-1 border border-slate-200 rounded text-center font-mono text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        disabled={questions.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Remove Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter question text..."
                    value={q.question}
                    onChange={(e) =>
                      handleQuestionFieldChange(qIdx, "question", e.target.value)
                    }
                    className="w-full h-7 px-2 border border-slate-200 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-1.5 p-1 rounded border transition-colors ${
                          q.correctOptionIndex === optIdx
                            ? "border-emerald-400 bg-emerald-50/50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-opt-${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() =>
                            handleQuestionFieldChange(
                              qIdx,
                              "correctOptionIndex",
                              optIdx
                            )
                          }
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-0 cursor-pointer ml-1"
                          title="Mark as correct answer"
                        />
                        <span className="text-[10px] font-mono text-slate-400 w-3.5 text-center">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <input
                          type="text"
                          required={optIdx < 2}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(qIdx, optIdx, e.target.value)
                          }
                          className="flex-1 h-6 px-1.5 text-xs text-slate-900 bg-transparent border-0 focus:outline-none placeholder:text-slate-300"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explanation / Hint */}
                  <input
                    type="text"
                    placeholder="Optional explanation / answer context..."
                    value={q.explanation}
                    onChange={(e) =>
                      handleQuestionFieldChange(qIdx, "explanation", e.target.value)
                    }
                    className="w-full h-6 px-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {isLoading ? "Saving..." : editingItem ? "Update Quiz" : "Publish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
