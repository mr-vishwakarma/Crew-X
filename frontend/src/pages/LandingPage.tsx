import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import {
  Layers,
  Activity,
  Compass,
  Settings,
  Shield,
  HelpCircle,
  LogIn,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Bell,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  Star,
  HardHat,
  Building2,
  Factory,
  Zap,
  Smartphone,
  WifiOff,
  FileCheck,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

type TabKey = 'dashboard' | 'progress' | 'timeline' | 'workareas';

interface MetricGaugeProps {
  label: string;
  value: number;
  delta: string;
  isPositive: boolean;
  color: string;
  detailText?: string;
  onClick?: () => void;
}

const MetricGauge: React.FC<MetricGaugeProps> = ({
  label,
  value,
  delta,
  isPositive,
  color,
  detailText = 'Details',
  onClick,
}) => {
  // Arc calculation for semi-circle (180 degrees)
  const radius = 34;
  const strokeWidth = 7;
  const circumference = Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div
      onClick={onClick}
      className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {detailText}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold mb-0.5">
            <span className={isPositive ? 'text-emerald-600' : 'text-rose-500'}>
              {delta}
            </span>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-rose-500" />
            )}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {value}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{label}</div>
        </div>

        {/* Semi-circular gauge */}
        <div className="relative w-20 h-12 flex items-center justify-center overflow-hidden">
          <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
            {/* Background Arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="#f1f3f5"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            {/* Colored Progress Arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('progress');
  const [rangeStart] = useState<number>(30);
  const [rangeEnd] = useState<number>(65);
  const [activeIndustry, setActiveIndustry] = useState<number>(0);
  const [selectedDockItem, setSelectedDockItem] = useState<string>('layers');

  // Simulated chart elevation bar heights (34 bars)
  const chartBars = [
    24, 28, 35, 30, 42, 38, 48, 55, 62, 58, 68, 75, 72, 85, 80, 88, 76, 82, 70,
    65, 58, 52, 45, 38, 42, 35, 30, 28, 22, 25, 20, 18, 22, 16,
  ];

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'SUPERVISOR') return '/supervisor/dashboard';
    return '/inspector/dashboard';
  };

  const industries = [
    {
      id: 'construction',
      name: 'Heavy Civil & Megaprojects',
      icon: Building2,
      tag: 'EPC & Infrastructure',
      title: 'Built for Highway Corridors, Metro Viaducts, and Superstructures',
      description:
        'Coordinate thousands of structural checkpoints across multiple chainages. Enforce polygon geofences so concrete pours, reinforcement rebar tests, and soil compaction logs cannot be signed off remotely.',
      metrics: [
        { label: 'Rework Delays', value: '-42%' },
        { label: 'Geofenced Accuracy', value: '100%' },
        { label: 'Safety Punchlists', value: '3.8x Faster' },
      ],
      checkpoints: [
        'Automated chainage & station-wise inspection tracking',
        'Direct 2D CAD & BIM elevation overlay',
        'Sub-millimeter rebar cover and slump test logging',
        'Contractor Non-Conformance Report (NCR) lifecycle tracking',
      ],
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing & Plants',
      icon: Factory,
      tag: 'Shop Floor & Assembly',
      title: 'Zero-Defect Quality Control for Industrial Facilities & OEMs',
      description:
        'Standardize line clearance, machinery pre-dispatch inspections, and ISO 9001 audits. Ensure equipment maintenance schedules and hazardous lockout-tagout (LOTO) protocols are strictly adhered to.',
      metrics: [
        { label: 'PPM Defect Rate', value: '-65%' },
        { label: 'Audit Compliance', value: '99.8%' },
        { label: 'Shift Handover', value: '15 Mins' },
      ],
      checkpoints: [
        '5S workplace organization digital scoring',
        'Machinery vibration & tolerance check verification',
        'Real-time scrap & defect tagging with photo annotation',
        'Instant CAPA (Corrective and Preventive Action) triggers',
      ],
    },
    {
      id: 'renewable',
      name: 'Renewable Energy & Utilities',
      icon: Zap,
      tag: 'Solar, Wind & Grid',
      title: 'Precision Remote Audits for Distributed Generation Assets',
      description:
        'Inspect hundreds of megawatts of solar PV arrays, wind turbine nacelles, and transmission substations across vast rural terrains where cellular connectivity is non-existent.',
      metrics: [
        { label: 'Offline Sync Rate', value: '100%' },
        { label: 'O&M Punch Closure', value: '+54%' },
        { label: 'Asset Uptime', value: '99.9%' },
      ],
      checkpoints: [
        'Zero-network offline Dexie.js mobile field execution',
        'Inverter and transformer thermal anomaly records',
        'Torque mark validation on tracker structures',
        'High-voltage safety permit cross-verification',
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#eceeed] font-sans antialiased text-slate-800 m-0 p-0 overflow-x-hidden selection:bg-orange-500 selection:text-white flex flex-col">
      {/* ========================================================= */}
      {/* 1. TOP EDGE-TO-EDGE CAPSULE NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="w-full px-4 sm:px-8 lg:px-12 py-3 bg-[#eceeed]/90 backdrop-blur-md border-b border-black/5 sticky top-0 z-50 flex items-center justify-between transition-all">
        {/* Brand Logo & Title */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-black shadow-md ring-1 ring-amber-500/30 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/logo.jpg"
              alt="Nirikshan Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
              NIRIKSHAN
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700 uppercase tracking-widest">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
              Inspect Smarter. Operate Better.
            </span>
          </div>
        </div>

        {/* Center Capsule Tabs (Structo Aesthetic) */}
        <nav className="hidden md:flex items-center bg-white/80 backdrop-blur-md p-1 rounded-full border border-white/90 shadow-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'progress'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3 w-3" />
            Progress
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('workareas')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'workareas'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work areas
          </button>
        </nav>

        {/* Quick Nav Anchors */}
        <div className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">
            Capabilities
          </a>
          <a href="#industries" className="hover:text-slate-900 transition-colors">
            Industries
          </a>
          <a href="#roles" className="hover:text-slate-900 transition-colors">
            Role Portals
          </a>
          <a href="#reviews" className="hover:text-slate-900 transition-colors">
            Reviews
          </a>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          <button
            aria-label="System Notifications"
            title="System Status: All Services Operational"
            className="h-9 w-9 rounded-full bg-white/80 border border-white/90 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-2xs relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {isAuthenticated && user ? (
            <button
              onClick={() => navigate(getDashboardPath())}
              className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all text-xs font-semibold shadow-xs"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-[11px] font-bold text-white shadow-2xs">
                {user.fullName.charAt(0)}
              </div>
              <span>Open Console</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO COCKPIT: FULL-BLEED STRUCTO-THEMED BIM WORKSPACE */}
      {/* ========================================================= */}
      <section className="w-full relative px-4 sm:px-6 lg:px-10 py-4 lg:py-6 flex flex-col justify-between">
        <div className="w-full rounded-3xl bg-[#f2f4f3]/70 border border-white/80 shadow-xl overflow-hidden flex flex-col relative backdrop-blur-xs">
          {/* Main Cockpit Flex Body */}
          <div className="w-full flex flex-col lg:flex-row min-h-[720px] relative">
            {/* Left Vertical Action Dock */}
            <aside className="w-full lg:w-16 py-3 lg:py-6 px-4 lg:px-0 flex lg:flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-black/5 bg-[#eceeed]/60 z-20 shrink-0">
              {/* Top dock icon stack */}
              <div className="flex lg:flex-col items-center gap-3">
                <button
                  onClick={() => setSelectedDockItem('layers')}
                  title="BIM Layer Control"
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                    selectedDockItem === 'layers'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-white/80'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                </button>

                <div className="h-9 px-2.5 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  28
                </div>

                <button
                  onClick={() => setSelectedDockItem('compass')}
                  title="Geofence GPS Coordinates"
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                    selectedDockItem === 'compass'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-white/80'
                  }`}
                >
                  <Compass className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSelectedDockItem('settings')}
                  title="Inspection Standards & ISO"
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                    selectedDockItem === 'settings'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-white/80'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSelectedDockItem('shield')}
                  title="Compliance & Verification"
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                    selectedDockItem === 'shield'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-white/80'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom dock icon stack */}
              <div className="flex lg:flex-col items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  title="Role Access Portal"
                  className="h-9 w-9 rounded-full bg-white/80 text-slate-600 hover:bg-white border border-white/80 flex items-center justify-center transition-all"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  title="Launch Console"
                  className="h-9 w-9 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition-all shadow-xs"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </aside>

            {/* Central 3D Canvas & Elevation Telemetry Area */}
            <main className="flex-1 flex flex-col justify-between p-6 lg:p-8 relative overflow-hidden">
              {/* Top Hero Text */}
              <div className="max-w-xl z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white/90 text-[11px] font-bold text-slate-700 mb-3 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-time Telemetry • Komatsu Metro 07 Line</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                  Smart Construction
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg">
                  Next-generation offline-first field inspections, 3D BIM telemetry, and
                  tamper-proof IoT geofencing to improve quality, safety, and compliance across
                  civil infrastructure and industrial operations.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-slate-800 text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Launch Field Cockpit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href="#features"
                    className="px-5 py-2.5 rounded-full bg-white/80 border border-white/90 hover:bg-white text-slate-700 text-xs font-semibold shadow-2xs transition-all"
                  >
                    Explore Architecture
                  </a>
                </div>
              </div>

              {/* 3D BIM Wireframe Model & Floating Badge */}
              <div className="relative my-4 flex-1 flex items-center justify-center min-h-[360px]">
                {/* 3D Transparent Building PNG */}
                <div className="relative z-10 w-full max-w-2xl flex items-center justify-center group">
                  <img
                    src="/images/bim-building.png"
                    alt="3D BIM Structural Model"
                    className="w-full max-h-[460px] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
                  />

                  {/* Floating Frosted Glass Card: Komastu / Metro 07 */}
                  <div className="absolute top-2 right-4 sm:top-6 sm:right-12 bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl p-4 shadow-xl z-20 w-56 sm:w-64 transition-all hover:bg-white/95">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                          Komatsu / Metro 07
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Done: 25 Nov, 2026 10:46 AM
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(getDashboardPath())}
                        className="h-6 w-6 rounded-full bg-slate-100 hover:bg-black hover:text-white flex items-center justify-center transition-all text-slate-600"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                        27%
                      </div>

                      {/* Overlapping User Avatars */}
                      <div className="flex items-center -space-x-1.5">
                        <div className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                          RV
                        </div>
                        <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                          PN
                        </div>
                        <div className="h-6 w-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                          AM
                        </div>
                        <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] text-slate-600 font-bold">
                          +3
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom 2D Cross Section Telemetry Chart */}
              <div className="w-full bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-5 shadow-sm z-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span>2D Cross Section Z (ft)</span>
                      <ArrowUpRight className="h-3 w-3 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        96.5%
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                        +2.4%
                        <TrendingUp className="h-3 w-3" />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <span className="h-2 w-4 rounded-full bg-orange-500" />
                      <span>Z (ft) Range Active</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Station: {rangeStart}m – {rangeEnd}m
                    </span>
                  </div>
                </div>

                {/* Histogram Bar Chart */}
                <div className="relative pt-2 pb-6">
                  <div className="h-20 w-full flex items-end justify-between gap-1">
                    {chartBars.map((height, idx) => {
                      const isHighlighted = idx >= 10 && idx <= 20;
                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center group relative cursor-pointer"
                        >
                          <div
                            style={{ height: `${height}%` }}
                            className={`w-full rounded-t-xs transition-all duration-300 ${
                              isHighlighted
                                ? 'bg-orange-500 shadow-xs'
                                : 'bg-slate-300/70 hover:bg-slate-400'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Horizontal Range Slider Control */}
                  <div className="relative w-full mt-2">
                    <div className="h-4 w-full bg-slate-200/80 rounded-full relative overflow-hidden flex items-center">
                      <div
                        className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-inner opacity-90 transition-all"
                        style={{
                          left: `${rangeStart}%`,
                          width: `${rangeEnd - rangeStart}%`,
                        }}
                      />
                    </div>
                    {/* Scale ticks */}
                    <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                      <span>0</span>
                      <span>10</span>
                      <span>20</span>
                      <span>60</span>
                      <span>70</span>
                      <span>80</span>
                      <span>90</span>
                      <span>100</span>
                      <span>30</span>
                      <span>40</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Telemetry Column (Structo Gauges & Cut/Fill) */}
            <aside className="w-full lg:w-80 p-5 lg:p-6 border-t lg:border-t-0 lg:border-l border-black/5 bg-[#eceeed]/40 flex flex-col justify-between gap-4 z-20 shrink-0">
              {/* Header Filter Pill */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setActiveIndustry((prev) => (prev + 1) % industries.length)
                  }
                  className="px-3 py-1 rounded-full bg-white/80 border border-white/90 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  <span>Overall Scope</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Gauge Cards Stack */}
              <div className="space-y-3">
                {/* Metric 1 */}
                <MetricGauge
                  label="Quality & Safety Compliance"
                  value={96.5}
                  delta="+2.4%"
                  isPositive={true}
                  color="#3b82f6"
                  detailText="Inspection Pass Rate"
                  onClick={() => navigate(getDashboardPath())}
                />

                {/* Metric 2 */}
                <MetricGauge
                  label="Defect Rectification Rate"
                  value={63}
                  delta="-19%"
                  isPositive={false}
                  color="#f43f5e"
                  detailText="Open Punch Items"
                  onClick={() => navigate(getDashboardPath())}
                />

                {/* Metric 3 */}
                <MetricGauge
                  label="Offline Logs Synced"
                  value={27}
                  delta="+7.5%"
                  isPositive={true}
                  color="#10b981"
                  detailText="Dexie.js Queue"
                  onClick={() => navigate(getDashboardPath())}
                />
              </div>

              {/* Cut and Fill Elevation Matrix */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <h4 className="font-bold text-slate-900 text-xs">Cut and Fill</h4>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mb-3">
                  Done: 25 Nov, 2026 10:46 AM
                </p>

                {/* Grid matrix of elevation numbers */}
                <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-20ft</span>
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-15ft</span>
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-9.75ft</span>
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-4.87ft</span>
                  <span className="text-slate-600 font-bold py-1 bg-slate-100 rounded">
                    0.00ft
                  </span>

                  <span className="text-slate-600 font-bold py-1 bg-slate-100 rounded">
                    0.00ft
                  </span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">
                    14ft
                  </span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">
                    28ft
                  </span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">
                    41ft
                  </span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">
                    55ft
                  </span>
                </div>
              </div>

              {/* Action Link to Nirikshan Portal */}
              <div className="pt-1">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>
                    {isAuthenticated ? 'Open Operations Console' : 'Access Inspection Portal'}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. ENTERPRISE RATINGS & LIVE SAAS METRICS STRIP */}
      {/* ========================================================= */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-white/40 border-y border-black/5">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Rating Badge */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Star className="h-6 w-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-base">
                <span>4.9 / 5.0 Rating</span>
                <span className="text-amber-500">★★★★★</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Voted #1 Field Quality & Safety Platform by 45+ Enterprise EPC Contractors
              </p>
            </div>
          </div>

          {/* 4 Big Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 w-full lg:w-auto">
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                500K+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Checkpoints Verified
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                99.9%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Dexie.js Sync Reliability
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                42%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Faster Rework Resolution
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                0%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Audit Trail Data Loss
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CORE SAAS CAPABILITIES / ARCHITECTURE MATRIX */}
      {/* ========================================================= */}
      <section id="features" className="w-full px-4 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white/90 text-[11px] font-bold text-orange-600 mb-3 shadow-2xs">
            <HardHat className="h-3.5 w-3.5" />
            <span>ENGINEERED FOR EXTREME FIELD CONDITIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            High-Precision Audits. Seamless Offline Execution.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            From deep subterranean tunnels to remote solar installations, Nirikshan eliminates
            paper checklists, disputes, and delayed approvals.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="h-11 w-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <WifiOff className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Offline-First Dexie.js Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Conduct complete audits inside basements, tunnels, or remote corridors with zero
              cellular network. All data queues safely in client-side IndexedDB and auto-syncs
              the instant connectivity resumes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              2D/3D BIM Elevation Overlay
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pin inspection non-conformances directly onto structural coordinates, CAD
              cross-sections, and elevation profiles for unambiguous contractor rectification.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              GPS Polygon Geofencing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Prevent ghost audits. Checklists cannot be unlocked unless the inspector's device
              is mathematically verified inside the site's approved GPS boundary coordinates.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              ISO 9001 & 45001 Compliance
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pre-configured digital checklists for occupational health, safety, environmental
              audits, and QA/QC compliance. One-click instant audit report compilation.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Automated NCR & CAPA Tracking
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Turn non-compliant checkpoints into tracked Corrective and Preventive Action
              tickets. Enforce contractor re-inspection with required timestamped photographic
              proof.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Role-Based Multi-Tenant Governance
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dedicated interfaces and permission tiers for Administrators, Supervisors, and
              Field Inspectors with cryptographically signed tokens and complete audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. INDUSTRY SPECIFIC SOLUTIONS & BENEFITS */}
      {/* ========================================================= */}
      <section id="industries" className="w-full px-4 sm:px-8 lg:px-12 py-16 bg-white/50 border-y border-black/5">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 mb-2 shadow-2xs">
            <span>SECTOR EXPERTISE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tailored for High-Stakes Operations
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Explore how Nirikshan transforms safety and quality benchmarks across specialized
            industries.
          </p>

          {/* Industry Selector Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustry(i)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeIndustry === i
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{ind.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Industry Detail Card */}
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md border border-white rounded-3xl p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">
                {industries[activeIndustry].tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {industries[activeIndustry].title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {industries[activeIndustry].description}
              </p>

              {/* Checkpoints */}
              <div className="space-y-2 pt-2">
                {industries[activeIndustry].checkpoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Metrics Cards */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-[#f5f6f7] border border-black/5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Measurable Field Outcomes
                </div>
                <div className="space-y-3">
                  {industries[activeIndustry].metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                    >
                      <span className="text-xs font-medium text-slate-600">{m.label}</span>
                      <span className="text-base font-extrabold text-slate-900">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Deploy for {industries[activeIndustry].name}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. ROLE-BASED ACCESS & DEDICATED WORKFLOWS */}
      {/* ========================================================= */}
      <section id="roles" className="w-full px-4 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white/90 text-[11px] font-bold text-slate-700 mb-2 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-blue-600" />
            <span>ROLE-BASED GOVERNANCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Strict permissions, distinct operational cockpits, and shared single-source-of-truth.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Admin Role */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 uppercase tracking-wider">
                  ADMINISTRATOR
                </span>
                <Settings className="h-5 w-5 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Enterprise Governance Hub
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Full lifecycle governance over organizations, multi-site projects, geofence
                boundaries, ISO templates, and company-wide audit trails.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Organization & Site Geofences</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Project & Package Allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>RBAC & Cryptographic Token Auth</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Admin Access</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Supervisor Role */}
          <div className="bg-white/80 backdrop-blur-md border-2 border-orange-400/30 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative">
            <div className="absolute -top-3 right-6 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
              Field Command
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-700 uppercase tracking-wider">
                  SUPERVISOR
                </span>
                <ShieldCheck className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Site Verification Cockpit
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Real-time review queue for submitted inspections, defect verification, contractor
                NCR approvals, and task assignment to field engineers.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Task Dispatch & Work Packages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Approve or Reject Field Audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Live Safety & Defect Analytics</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Supervisor Access</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Inspector Role */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                  FIELD INSPECTOR
                </span>
                <Smartphone className="h-5 w-5 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Mobile Offline Terminal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Ultra-fast mobile UI built for boots-on-the-ground execution. Zero load times,
                instant photo attachments, and automatic background Dexie.js sync.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% Offline Checklist Execution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Camera Photo & Mark-up Proof</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Instant Dexie.js Queue Sync</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Inspector Access</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. CUSTOMER TESTIMONIALS & TRUSTED PARTNERS */}
      {/* ========================================================= */}
      <section id="reviews" className="w-full px-4 sm:px-8 lg:px-12 py-16 bg-white/40 border-t border-black/5">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 mb-2 shadow-2xs">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>INDUSTRY BENCHMARK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Leaders in Heavy Infrastructure
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            Hear from engineering directors and safety heads managing multi-crore project
            deliveries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Review 1 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center text-amber-500 text-xs">★★★★★</div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "The offline Dexie.js capability saved our team hundreds of hours inside the metro
              underground tunnels. Inspectors record rebar checks without worrying about cell
              reception, and everything syncs flawlessly when they hit the surface."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                RK
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Rajesh Kulkarni</div>
                <div className="text-[10px] text-slate-500">Chief Project Director, Metro Line 7</div>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center text-amber-500 text-xs">★★★★★</div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "GPS polygon geofencing eliminated proxy audits entirely. Our contractor rework rate
              dropped by 42% in the first quarter because supervisors have real-time visibility
              over non-conformances with mandatory photo evidence."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                AM
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Ananya Mukherjee</div>
                <div className="text-[10px] text-slate-500">Head of QA/QC, Shapoorji Heavy Civil</div>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center text-amber-500 text-xs">★★★★★</div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "Nirikshan gives us the exact telemetry and BIM elevation mapping that modern
              infrastructure projects require. It has set a new gold standard for field inspection
              management."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                SV
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Suresh Venkat</div>
                <div className="text-[10px] text-slate-500">VP Operations, GreenGrid Solar EPC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. HIGH-CONVERTING CTA BANNER */}
      {/* ========================================================= */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          {/* Glowing background circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-orange-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Enterprise Ready • ISO & OSHA Compliant</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Field Inspection Operations?
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Experience the offline-first revolution. Connect your sites, automate punch-lists,
              and guarantee audit compliance today.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Launch Nirikshan Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
              >
                Sign In with Credentials
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. ARCHITECTURAL THEMED FOOTER */}
      {/* ========================================================= */}
      <footer className="w-full bg-[#181b1e] text-slate-400 text-xs border-t border-black/20 mt-auto">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Col 1: Brand & Logo */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-black shadow-md ring-1 ring-amber-500/40 flex items-center justify-center p-0.5">
                  <img
                    src="/logo.jpg"
                    alt="Nirikshan Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-white font-extrabold text-base tracking-tight leading-none">
                    NIRIKSHAN
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                    Inspect Smarter. Operate Better.
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Nirikshan is an enterprise offline-first field inspection, quality assurance, and
                safety compliance platform purpose-built for civil construction, heavy engineering,
                and industrial operations.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational • Dexie.js v4.0 Active</span>
              </div>
            </div>

            {/* Col 2: Platform Capabilities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Offline IndexedDB Engine
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    2D/3D BIM Elevation
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    GPS Polygon Geofences
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Cut & Fill Telemetry
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Automated NCR / CAPA
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Sector Solutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Solutions
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#industries" className="hover:text-white transition-colors">
                    Heavy Civil & Infrastructure
                  </a>
                </li>
                <li>
                  <a href="#industries" className="hover:text-white transition-colors">
                    Industrial Manufacturing
                  </a>
                </li>
                <li>
                  <a href="#industries" className="hover:text-white transition-colors">
                    Commercial Superstructures
                  </a>
                </li>
                <li>
                  <a href="#industries" className="hover:text-white transition-colors">
                    Renewable Solar & Wind
                  </a>
                </li>
                <li>
                  <a href="#industries" className="hover:text-white transition-colors">
                    High-Voltage Power Grids
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Roles & Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Role Portals
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Administrator Hub
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Supervisor Cockpit
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Field Inspector Mobile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Compliance Auditor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Client Representative
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal & Certification Strip */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-4 flex-wrap">
              <span>© {new Date().getFullYear()} Nirikshan Inc. All rights reserved.</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">ISO 9001:2015 & ISO 45001 Certified</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">SOC 2 Type II Audited</span>
            </div>

            <div className="flex items-center gap-4">
              <a href="#features" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
