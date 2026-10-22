/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { X, Trophy, Coins, CheckCircle, Clock } from "lucide-react";
import { useGetPredictionLeaderboardQuery } from "@/features/scorePrediction/scorePredictionApi";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

interface ScorePredictionLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundItem: any;
}

export default function ScorePredictionLeaderboardModal({
  isOpen,
  onClose,
  roundItem,
}: ScorePredictionLeaderboardModalProps) {
  const roundId = roundItem?._id || "";
  const { data: lbRes, isLoading } = useGetPredictionLeaderboardQuery(
    { id: roundId, limit: 50 },
    { skip: !isOpen || !roundId }
  );

  if (!isOpen || !roundItem) return null;

  const predictions = Array.isArray(lbRes?.data) ? lbRes.data : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-900">
                Prediction Standings & Results
              </span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5">
              {roundItem.title}
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

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-center shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Participants</span>
            <span className="text-xs font-semibold text-slate-900 font-mono">
              {roundItem.totalParticipants || 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Total Coins Paid</span>
            <span className="text-xs font-semibold text-amber-700 font-mono">
              +{roundItem.totalCoinsDistributed || 0} coins
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Status</span>
            <span className="text-xs font-semibold text-emerald-700 font-mono">
              {roundItem.isSettled ? "Settled & Awarded" : "Active / Live"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading prediction records...
            </div>
          ) : predictions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No predictions have been submitted for this round yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
              {predictions.map((pred: any, idx: number) => {
                const user = pred.user || {};
                const name =
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  user.userName ||
                  "Predictor";
                const profileImg = formatImagePath(user.profile);

                return (
                  <div
                    key={pred._id || idx}
                    className="p-3 hover:bg-slate-50/70 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono ${
                            idx === 0
                              ? "bg-amber-100 text-amber-800"
                              : idx === 1
                              ? "bg-slate-200 text-slate-700"
                              : idx === 2
                              ? "bg-amber-50 text-amber-900 border border-amber-200"
                              : "text-slate-400"
                          }`}
                        >
                          #{idx + 1}
                        </span>

                        <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                          {profileImg ? (
                            <img src={profileImg} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            name.slice(0, 2).toUpperCase()
                          )}
                        </div>

                        <div>
                          <span className="font-semibold text-xs text-slate-900 block leading-tight">
                            {name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Submitted {dayjs(pred.submittedAt).format("DD MMM, HH:mm")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 font-medium">
                          {pred.totalExactMatches || 0} exact ? {pred.totalOutcomeMatches || 0} outcome
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded font-mono">
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          +{pred.totalCoinsEarned || 0}
                        </span>
                      </div>
                    </div>

                    {/* Predictions list */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {(pred.predictions || []).map((pItem: any, pIdx: number) => {
                        const isExact = pItem.isExactMatch || pItem.status === "exact";
                        const isOutcome = pItem.isOutcomeMatch || pItem.status === "outcome";

                        return (
                          <div
                            key={pIdx}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono ${
                              isExact
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                                : isOutcome
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            <span>Match {pIdx + 1}:</span>
                            <span>{pItem.predictedHomeScore}-{pItem.predictedAwayScore}</span>
                            {pItem.actualHomeScore !== null && pItem.actualHomeScore !== undefined && (
                              <span className="text-[9px] text-slate-400">
                                (Act: {pItem.actualHomeScore}-{pItem.actualAwayScore})
                              </span>
                            )}
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

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
