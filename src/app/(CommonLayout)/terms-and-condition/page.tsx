/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCreateTermsMutation, useGetTermsQuery } from "@/features/terms/termsApi";
import { useHeaders } from "@/hooks/useHeaders";
import { Loader2, FileText, CheckCircle2, RotateCcw, Save } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const joditConfig = {
  height: 580,
  readonly: false,
  placeholder: "Draft official terms and conditions, tournament liability disclaimers, player registration agreements, and refund policies...",
  toolbarSticky: false,
  buttons: [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "ul",
    "ol",
    "outdent",
    "indent",
    "|",
    "font",
    "fontsize",
    "paragraph",
    "|",
    "align",
    "|",
    "link",
    "table",
    "|",
    "hr",
    "source",
    "|",
    "undo",
    "redo",
  ],
  showCharsCounter: true,
  showWordsCounter: true,
  theme: "default",
};

const TermsCondition = () => {
  const { setHeaders } = useHeaders();
  const { data: termsData, isLoading: isFetching } = useGetTermsQuery({});
  const [createTerms, { isLoading: isSaving }] = useCreateTermsMutation();
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");

  useEffect(() => {
    setHeaders({
      title: "Terms & Conditions",
      des: "Manage the official legal framework and user agreements for the enterprise platform.",
    });
  }, [setHeaders]);

  useEffect(() => {
    if (termsData?.data?.content !== undefined) {
      const serverContent = termsData.data.content || "";
      setContent(serverContent);
      setInitialContent(serverContent);
    }
  }, [termsData]);

  const hasUnsavedChanges = useMemo(() => {
    return content !== initialContent;
  }, [content, initialContent]);

  const lastUpdated = termsData?.data?.updatedAt || termsData?.data?.createdAt;

  const handleReset = () => {
    setContent(initialContent);
    toast.info("Reverted to previously saved content");
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      const res = await createTerms({ content }).unwrap();
      if (res.success || res.statusCode === 200) {
        toast.success(res.message || "Terms & conditions published successfully");
        setInitialContent(content);
      } else {
        toast.error(res.message || "Failed to update terms");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update terms");
    }
  };

  if (isFetching) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          <span>Loading terms & conditions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* 1. Header Toolbar Card */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60 mt-0.5">
            <FileText className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Terms & Conditions
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agreement
              </span>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                  Unsaved Changes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lastUpdated ? (
                <>Last published: <strong className="text-slate-700 font-medium">{dayjs(lastUpdated).format("MMM DD, YYYY · hh:mm A")}</strong></>
              ) : (
                "Define club rules, tournament participation terms, payment regulations, and user code of conduct."
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* 2. Rich Text Editor Workspace */}
      <div className="bg-white border border-slate-200/80 rounded-lg shadow-2xs overflow-hidden flex flex-col">
        {/* Editor Sub-header info bar */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-700">Legal Document Editor</span>
          <span className="text-[11px] text-slate-400">
            Rich-text formatting automatically syncs to client mobile apps and web pages.
          </span>
        </div>

        <div className="p-3 sm:p-4 bg-white">
          <div className="border border-slate-200/80 rounded-md overflow-hidden">
            <JoditEditor
              value={content}
              config={joditConfig}
              onBlur={(newContent) => setContent(newContent)}
            />
          </div>
        </div>

        {/* Editor Footer Help Bar */}
        <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ensure all refund, subscription, and liability terms are properly numbered.</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Changes take effect immediately upon saving.
          </span>
        </div>
      </div>
    </div>
  );
};

export default TermsCondition;
