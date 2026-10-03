"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Trophy,
  Activity,
  CalendarCheck2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { logo } from "@/assets/assets";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/features/auth/authApi";
import { setAuthenticated } from "@/features/auth/authSlice";
import { setAuthCookie } from "../../../actions/auth";
import { decodeRoleFromToken } from "@/components/layout/AdminGuard";
import { getFirstPermittedRoute } from "@/constants/permissions";

// Validation Schema
const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const defaultValues: Partial<LoginFormValues> = {
  email: "",
  password: "",
};

/**
 * ⚽ 3D Realistic Football Soccer Ball Component
 */
function Football3D() {
  return (
    <svg viewBox="0 0 140 140" className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-2xl">
      <defs>
        {/* Sphere 3D lighting */}
        <radialGradient id="ballShading" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e2e8f0" />
          <stop offset="85%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>

        <linearGradient id="pentagonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Drop Shadow on Turf */}
      <ellipse cx="70" cy="126" rx="42" ry="12" fill="rgba(0, 0, 0, 0.45)" filter="blur(3px)" />

      {/* Base 3D Sphere */}
      <circle cx="70" cy="65" r="54" fill="url(#ballShading)" stroke="#cbd5e1" strokeWidth="1" />

      {/* Authentic Soccer Ball Pentagon Patterns */}
      {/* Center Pentagon */}
      <polygon
        points="70,48 83,57 78,72 62,72 57,57"
        fill="url(#pentagonGrad)"
        stroke="#475569"
        strokeWidth="1.2"
      />

      {/* Surrounding Seams & Partial Pentagons */}
      {/* Top Seam & Top Pentagon */}
      <line x1="70" y1="48" x2="70" y2="34" stroke="#475569" strokeWidth="1.4" />
      <polygon points="62,24 78,24 70,34" fill="url(#pentagonGrad)" stroke="#475569" strokeWidth="1.2" />

      {/* Top-Right Seam & Pentagon */}
      <line x1="83" y1="57" x2="96" y2="52" stroke="#475569" strokeWidth="1.4" />
      <polygon points="96,52 108,60 102,74 92,68" fill="url(#pentagonGrad)" stroke="#475569" strokeWidth="1.2" />

      {/* Bottom-Right Seam & Pentagon */}
      <line x1="78" y1="72" x2="88" y2="84" stroke="#475569" strokeWidth="1.4" />
      <polygon points="88,84 82,98 68,98 72,86" fill="url(#pentagonGrad)" stroke="#475569" strokeWidth="1.2" />

      {/* Bottom-Left Seam & Pentagon */}
      <line x1="62" y1="72" x2="52" y2="84" stroke="#475569" strokeWidth="1.4" />
      <polygon points="52,84 38,80 42,66 52,70" fill="url(#pentagonGrad)" stroke="#475569" strokeWidth="1.2" />

      {/* Top-Left Seam & Pentagon */}
      <line x1="57" y1="57" x2="44" y2="52" stroke="#475569" strokeWidth="1.4" />
      <polygon points="44,52 48,36 60,36 54,48" fill="url(#pentagonGrad)" stroke="#475569" strokeWidth="1.2" />

      {/* Specular curved highlight */}
      <path
        d="M 40 38 Q 65 24 95 38"
        fill="none"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


/**
 * 🐼 Fully Animated Interactive Panda Mascot
 * - 100% covers both eyes when password input is focused
 * - Peeks with left eye when showPassword is clicked
 * - Pupils follow downwards when typing email
 */
function InteractivePanda({
  isPasswordFocused,
  showPassword,
  isEmailFocused,
}: {
  isPasswordFocused: boolean;
  showPassword: boolean;
  isEmailFocused: boolean;
}) {
  const isCoveringEyes = isPasswordFocused && !showPassword;
  const isPeeking = isPasswordFocused && showPassword;

  return (
    <div className="relative w-32 h-26 -mt-2 mb-1 mx-auto flex items-center justify-center select-none pointer-events-none">
      <svg
        viewBox="0 0 160 140"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="pandaHeadShadow" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </radialGradient>
        </defs>

        {/* 1. Shoulders & Upper Body */}
        <path d="M 28 140 C 28 102 132 102 132 140 Z" fill="#0f172a" />
        {/* White chest bib */}
        <ellipse cx="80" cy="140" rx="26" ry="19" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />

        {/* 2. Round Black Ears */}
        <circle cx="38" cy="34" r="17" fill="#0f172a" />
        <circle cx="38" cy="34" r="8" fill="#1e293b" opacity="0.6" />
        <circle cx="122" cy="34" r="17" fill="#0f172a" />
        <circle cx="122" cy="34" r="8" fill="#1e293b" opacity="0.6" />

        {/* 3. Full Round Panda Head */}
        <ellipse
          cx="80"
          cy="70"
          rx="48"
          ry="42"
          fill="url(#pandaHeadShadow)"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        {/* 4. Rosy Blush Cheeks */}
        <ellipse cx="45" cy="80" rx="6" ry="3.5" fill="#f43f5e" opacity="0.25" />
        <ellipse cx="115" cy="80" rx="6" ry="3.5" fill="#f43f5e" opacity="0.25" />

        {/* 5. Classic Black Panda Eye Patches */}
        <ellipse
          cx="58"
          cy="65"
          rx="13"
          ry="16"
          fill="#0f172a"
          transform="rotate(-14 58 65)"
        />
        <ellipse
          cx="102"
          cy="65"
          rx="13"
          ry="16"
          fill="#0f172a"
          transform="rotate(14 102 65)"
        />

        {/* 6. Eyes (Inside Patches) - Fade out when covered */}
        <g
          className="transition-opacity duration-200"
          style={{ opacity: isCoveringEyes ? 0 : 1 }}
        >
          <ellipse cx="58" cy="65" rx="6.5" ry="8" fill="#ffffff" />
          <ellipse cx="102" cy="65" rx="6.5" ry="8" fill="#ffffff" />

          {/* Animated Pupils */}
          <g
            className="transition-transform duration-200 ease-out"
            style={{
              transform: isEmailFocused
                ? "translate(0px, 4.5px)"
                : isPeeking
                ? "translate(2.5px, 0px)"
                : "translate(0px, 0px)",
            }}
          >
            <circle cx="58" cy="65" r="4.2" fill="#0f172a" />
            <circle cx="59.5" cy="62.5" r="1.5" fill="#ffffff" />
            <circle cx="56.5" cy="66.5" r="0.8" fill="#ffffff" opacity="0.8" />

            <circle cx="102" cy="65" r="4.2" fill="#0f172a" />
            <circle cx="103.5" cy="62.5" r="1.5" fill="#ffffff" />
            <circle cx="100.5" cy="66.5" r="0.8" fill="#ffffff" opacity="0.8" />
          </g>
        </g>

        {/* 7. Cute Panda Nose & Smile */}
        <ellipse cx="80" cy="77" rx="5.5" ry="3.8" fill="#0f172a" />
        <ellipse cx="78.5" cy="75.8" rx="1.2" ry="0.8" fill="#ffffff" opacity="0.6" />
        <path
          d="M 74 81 Q 80 85 86 81"
          fill="none"
          stroke="#0f172a"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 8. Paws & Arms - 100% Cover Eyes when isCoveringEyes */}
        {/* Left Paw & Arm */}
        <g
          className="transition-transform duration-300 ease-out"
          style={{
            transform: isCoveringEyes
              ? "translate(22px, -37px)"
              : isPeeking
              ? "translate(10px, -14px)"
              : "translate(0px, 0px)",
          }}
        >
          <path d="M 20 135 C 16 112 28 102 36 96 C 44 102 52 115 52 135 Z" fill="#0f172a" />
          <ellipse
            cx="36"
            cy="102"
            rx="20"
            ry="17"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <ellipse cx="36" cy="103" rx="8" ry="6" fill="#334155" />
          <circle cx="29" cy="94" r="2.8" fill="#334155" />
          <circle cx="36" cy="91" r="2.8" fill="#334155" />
          <circle cx="43" cy="94" r="2.8" fill="#334155" />
        </g>

        {/* Right Paw & Arm */}
        <g
          className="transition-transform duration-300 ease-out"
          style={{
            transform: isCoveringEyes
              ? "translate(-22px, -37px)"
              : isPeeking
              ? "translate(-22px, -37px)"
              : "translate(0px, 0px)",
          }}
        >
          <path d="M 140 135 C 144 112 132 102 124 96 C 116 102 108 115 108 135 Z" fill="#0f172a" />
          <ellipse
            cx="124"
            cy="102"
            rx="20"
            ry="17"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <ellipse cx="124" cy="103" rx="8" ry="6" fill="#334155" />
          <circle cx="117" cy="94" r="2.8" fill="#334155" />
          <circle cx="124" cy="91" r="2.8" fill="#334155" />
          <circle cx="131" cy="94" r="2.8" fill="#334155" />
        </g>
      </svg>
    </div>
  );
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  // 🌊 Autonomous Physics-Based 3D Engine: Continuous Cinematic Sway + Interactive Mouse Parallax
  const [parallax, setParallax] = useState({ x: 0, y: 0, time: 0 });
  const targetParallax = React.useRef({ x: 0, y: 0 });
  const currentParallax = React.useRef({ x: 0, y: 0 });
  const rafRef = React.useRef<number | null>(null);

  useEffect(() => {
    let startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // 🌊 Continuous organic stadium camera sway (composite harmonic wave)
      // Generates vibrant, natural autonomous movement across all axes
      const autoDriftX = Math.sin(elapsed * 0.95) * 0.7 + Math.sin(elapsed * 0.42) * 0.25;
      const autoDriftY = Math.cos(elapsed * 0.75) * 0.6 + Math.sin(elapsed * 0.31) * 0.25;

      // Seamlessly combine autonomous movement with mouse interaction
      const targetX = targetParallax.current.x * 0.65 + autoDriftX * 0.65;
      const targetY = targetParallax.current.y * 0.55 + autoDriftY * 0.55;

      // Silky-smooth LERP (Linear Interpolation)
      currentParallax.current.x += (targetX - currentParallax.current.x) * 0.055;
      currentParallax.current.y += (targetY - currentParallax.current.y) * 0.055;

      setParallax({
        x: Number(currentParallax.current.x.toFixed(4)),
        y: Number(currentParallax.current.y.toFixed(4)),
        time: elapsed,
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    targetParallax.current = { x, y };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetParallax.current = { x: 0, y: 0 };
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: LoginFormValues) {
    const payload = {
      email: data.email,
      password: data.password,
    };

    try {
      const res = await login(payload).unwrap();
      const accessToken =
        res?.data?.accessToken ||
        res?.data?.token ||
        res?.accessToken ||
        res?.token;
      const refreshToken =
        res?.data?.refreshToken ||
        res?.refreshToken;

      if (!accessToken) {
        toast.error(res?.message || "Login failed: Token not received from server");
        return;
      }

      // 🛑 Role check: strictly allow ADMIN & SUPER_ADMIN only
      const userRole =
        decodeRoleFromToken(accessToken) ||
        (res?.data?.role || res?.role || "").toUpperCase();
      if (userRole && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        toast.error("Access Denied: Only Administrator and Super Admin accounts can access the dashboard.");
        return;
      }

      toast.success(res?.message || "Login successful");
      dispatch(setAuthenticated({ accessToken, refreshToken }));
      if (typeof window !== "undefined") {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      }
      await setAuthCookie(accessToken, refreshToken);

      // Smart landing redirect based on permissions
      const permissions = res?.data?.permissions || [];
      if (
        userRole === "ADMIN" &&
        Array.isArray(permissions) &&
        permissions.length > 0 &&
        !permissions.includes("OVERVIEW")
      ) {
        const targetRoute = getFirstPermittedRoute(permissions, userRole);
        window.location.replace(targetRoute);
      } else {
        window.location.replace("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-slate-950">
      {/* ========================================================= */}
      {/* 🏟️ LEFT PANEL: 3D Sports Stadium & Environment (~55%)    */}
      {/* ========================================================= */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full lg:w-[55%] min-h-[460px] lg:min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#030712] flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white border-b lg:border-b-0 lg:border-r border-slate-800/80"
      >
        {/* Soft Volumetric Stadium Floodlights (Dynamic Pulsing Aura) */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"
          style={{
            transform: `translate(${parallax.x * -18}px, ${parallax.y * -18}px)`,
            opacity: 0.65 + Math.sin(parallax.time * 1.2) * 0.25,
          }}
        />
        <div
          className="absolute top-1/4 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none"
          style={{
            transform: `translate(${parallax.x * 22}px, ${parallax.y * 22}px)`,
            opacity: 0.65 + Math.cos(parallax.time * 1.1) * 0.25,
          }}
        />

        {/* TOP BRAND HEADER */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo ? (
              <Image
                src={logo}
                width={150}
                height={38}
                alt="ENG Sports"
                className="h-8 w-auto object-contain drop-shadow"
                priority
              />
            ) : (
              <span className="font-extrabold tracking-wider text-base text-white">ENG SPORTS</span>
            )}
            <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/60 border border-slate-700/60">
              Enterprise Suite
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Telemetry Active</span>
            <span className="sm:hidden">Active</span>
          </div>
        </div>

        {/* CENTER 3D FOOTBALL PITCH & SCENIC COMPOSITION */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
          {/* 3D Perspective Pitch Container */}
          <div
            className="relative w-full max-w-[480px] h-[240px] sm:h-[280px] flex items-center justify-center pointer-events-none"
            style={{ perspective: "1000px" }}
          >
            {/* The 3D Tilted Football Pitch (Autonomous & Interactive Tilt) */}
            <div
              className="relative w-[360px] sm:w-[420px] h-[190px] sm:h-[220px] rounded-xl overflow-hidden border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              style={{
                transform: `rotateX(${50 - parallax.y * 10}deg) rotateZ(${-14 + parallax.x * 9}deg) translateZ(0px)`,
                transformStyle: "preserve-3d",
                background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
              }}
            >
              {/* Alternate Turf Grass Cuts (Stripe Pattern) */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(0,0,0,0.2) 35px, rgba(0,0,0,0.2) 70px)",
                }}
              />

              {/* Pitch Markings (SVG overlay with authentic lines) */}
              <svg
                viewBox="0 0 420 220"
                className="absolute inset-0 w-full h-full opacity-70"
                preserveAspectRatio="none"
              >
                {/* Touchline & Goal-line perimeter */}
                <rect x="15" y="15" width="390" height="190" fill="none" stroke="#ffffff" strokeWidth="2" />

                {/* Halfway Line & Center Circle */}
                <line x1="210" y1="15" x2="210" y2="205" stroke="#ffffff" strokeWidth="2" />
                <circle cx="210" cy="110" r="38" fill="none" stroke="#ffffff" strokeWidth="2" />
                <circle cx="210" cy="110" r="3" fill="#ffffff" />

                {/* Left Penalty Area (18-yard box) */}
                <rect x="15" y="55" width="65" height="110" fill="none" stroke="#ffffff" strokeWidth="2" />
                <rect x="15" y="80" width="25" height="60" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="60" cy="110" r="2.5" fill="#ffffff" />
                <path d="M 80 88 A 30 30 0 0 1 80 132" fill="none" stroke="#ffffff" strokeWidth="1.5" />

                {/* Right Penalty Area (18-yard box) */}
                <rect x="340" y="55" width="65" height="110" fill="none" stroke="#ffffff" strokeWidth="2" />
                <rect x="380" y="80" width="25" height="60" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="360" cy="110" r="2.5" fill="#ffffff" />
                <path d="M 340 88 A 30 30 0 0 0 340 132" fill="none" stroke="#ffffff" strokeWidth="1.5" />

                {/* Corner Arcs */}
                <path d="M 15 25 A 10 10 0 0 0 25 15" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 15 195 A 10 10 0 0 1 25 205" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 405 25 A 10 10 0 0 1 395 15" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M 405 195 A 10 10 0 0 0 395 205" fill="none" stroke="#ffffff" strokeWidth="1.5" />
              </svg>

              {/* Pitch Gloss Lighting */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* ⚽ 3D Football Hovering on Pitch (Autonomous Floating Levitation) */}
            <div
              className="absolute z-20"
              style={{
                transform: `translate(${38 + parallax.x * 16}px, ${16 + parallax.y * 12 + Math.sin(parallax.time * 2.2) * 7}px)`,
              }}
            >
              <Football3D />
            </div>

            {/* Floating Metric Badge 1: Tournament Operations (Autonomous Drift) */}
            <div
              className="absolute -top-4 -right-2 sm:right-2 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl"
              style={{
                transform: `translate(${parallax.x * -22 + Math.sin(parallax.time * 1.5) * 7}px, ${parallax.y * -16 + Math.cos(parallax.time * 1.2) * 6}px)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Tournaments Managed
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    450+ Active Leagues & Cups
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Metric Badge 2: Real-Time Engine (Autonomous Drift) */}
            <div
              className="absolute -bottom-6 -left-2 sm:left-4 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl"
              style={{
                transform: `translate(${parallax.x * 20 + Math.cos(parallax.time * 1.6) * 6}px, ${parallax.y * 16 + Math.sin(parallax.time * 1.4) * 6}px)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Live Match Engine
                  </div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    Automated Tables & Sync
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BRAND VALUE PROPOSITION */}
        <div className="relative z-20 space-y-3 pt-4">
          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Manage Every Match. <br />
              <span className="text-slate-400 font-medium">Build Every Victory.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              The high-performance operating system for professional football tournament fixtures, referee assignments, squad telemetry, and official league operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Certified SLA 99.9%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🔐 RIGHT PANEL: Clean Enterprise Authentication Form (45%) */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[45%] min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Top Operational Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Console v2.4 &bull; Production</span>
          </div>
        </div>

        {/* Center Main Form */}
        <div className="max-w-[390px] w-full mx-auto my-auto py-8">
          <div className="mb-6 text-center">
            {/* 🐼 Interactive Panda (Centered directly over Administrator Portal) */}
            <div className="flex justify-center mb-1">
              <InteractivePanda
                isPasswordFocused={isPasswordFocused}
                showPassword={showPassword}
                isEmailFocused={isEmailFocused}
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Administrator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Enter your administrator credentials to access the ENG Sports management console.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 text-left">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="admin@engsports.com"
                          className="h-11 text-sm pl-10 pr-3 rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors placeholder:text-slate-400"
                          {...field}
                          onFocus={() => {
                            setIsEmailFocused(true);
                            setIsPasswordFocused(false);
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            setIsEmailFocused(false);
                          }}
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px] text-red-600 font-medium mt-1" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Password
                      </FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        tabIndex={-1}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="h-11 text-sm pl-10 pr-10 rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors placeholder:text-slate-400"
                          {...field}
                          onFocus={() => {
                            setIsPasswordFocused(true);
                            setIsEmailFocused(false);
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            setIsPasswordFocused(false);
                          }}
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            // Keep password field focused
                            e.preventDefault();
                          }}
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px] text-red-600 font-medium mt-1" />
                  </FormItem>
                )}
              />

              {/* Primary Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </Form>

          {/* Compliance & Security */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Authorized access only &bull; Sessions are monitored</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-100 gap-2">
          <span>&copy; {new Date().getFullYear()} ENG Sports Events. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500 font-medium">Competition Operating System</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
