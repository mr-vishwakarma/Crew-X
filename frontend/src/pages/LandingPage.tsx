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
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('progress');

  // Simulated bar heights for the 2D cross section graph
  const barHeights = [
    24, 28, 35, 30, 42, 38, 48, 55, 62, 58, 68, 75, 72, 85, 80, 88, 76, 82, 70,
    65, 58, 52, 45, 38, 42, 35, 30, 28, 22, 25, 20, 18, 22, 16,
  ];

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'SUPERVISOR') return '/supervisor/dashboard';
    return '/inspector/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#d8dade] sm:p-4 md:p-6 lg:p-8 flex items-center justify-center font-sans antialiased text-slate-800">
      {/* Outer Main Container with Soft Cream / Off-White Canvas */}
      <div className="w-full max-w-7xl bg-[#eceeed] rounded-3xl shadow-2xl border border-white/60 overflow-hidden flex flex-col min-h-[92vh] relative">
        {/* Top Capsule Navigation Bar */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-black/5 bg-[#eceeed]/90 backdrop-blur-md sticky top-0 z-30">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xs">
              {/* Stacked geometric logo icon matching Structo style */}
              <div className="space-y-0.5">
                <div className="w-4 h-1 bg-white rounded-full" />
                <div className="w-3 h-1 bg-white/80 rounded-full" />
                <div className="w-2 h-1 bg-white/60 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                Nirikshan
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Smart Construction
              </span>
            </div>
          </div>

          {/* Center Capsule Tabs */}
          <nav className="hidden md:flex items-center bg-white/70 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-xs">
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

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="h-8 w-8 rounded-full bg-white/80 border border-white/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-2xs"
            >
              <Bell className="h-3.5 w-3.5" />
            </button>

            {isAuthenticated && user ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-black text-white hover:bg-slate-800 transition-all text-xs font-semibold shadow-xs"
              >
                <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-[11px] font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white hover:bg-slate-800 transition-all text-xs font-semibold shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Workspace Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Vertical Icon Dock */}
          <aside className="w-14 sm:w-16 py-6 flex flex-col items-center justify-between border-r border-black/5 bg-[#eceeed]/60 z-20 shrink-0">
            {/* Top icon stack */}
            <div className="flex flex-col items-center gap-3.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                title="Overview"
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white/80 text-slate-600 hover:bg-white border border-white/80'
                }`}
              >
                <Layers className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTab('progress')}
                title="Active Progress"
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  activeTab === 'progress'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white/80 text-slate-600 hover:bg-white border border-white/80'
                }`}
              >
                <span className="font-extrabold text-[11px]">28</span>
              </button>

              <button
                onClick={() => setActiveTab('workareas')}
                title="Work Areas & Sites"
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  activeTab === 'workareas'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white/80 text-slate-600 hover:bg-white border border-white/80'
                }`}
              >
                <Compass className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                title="Settings"
                className="h-9 w-9 rounded-full bg-white/80 text-slate-600 hover:bg-white border border-white/80 flex items-center justify-center transition-all"
              >
                <Settings className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                title="Timeline & Milestones"
                className="h-9 w-9 rounded-full bg-white/80 text-slate-600 hover:bg-white border border-white/80 flex items-center justify-center transition-all"
              >
                <Shield className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom icon stack */}
            <div className="flex flex-col items-center gap-3">
              <button
                title="Documentation & Help"
                onClick={() => alert('Nirikshan Offline-First Field Inspection & Compliance')}
                className="h-8 w-8 rounded-full bg-white/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              <button
                title={isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                onClick={() => navigate(getDashboardPath())}
                className="h-8 w-8 rounded-full bg-white/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
              >
                <LogIn className="h-4 w-4" />
              </button>
            </div>
          </aside>

          {/* Central Canvas + 3D Building + Right Panel */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
            {/* Center Area: Hero Title, 3D Architectural Model & Telemetry Charts */}
            <main className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[580px]">
              {/* Background 3D BIM Architectural Model Image (from media_1795295982946_86995e73.png) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90 select-none z-0">
                <img
                  src="/images/bim-building.png"
                  alt="3D BIM Structural Cross Section"
                  className="max-h-[82%] max-w-[85%] object-contain object-center transform translate-y-2 lg:translate-x-10 filter drop-shadow-2xl"
                />
              </div>

              {/* Headline Top Left */}
              <div className="relative z-10 max-w-md">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {activeTab === 'dashboard'
                    ? 'Smart Overview'
                    : activeTab === 'timeline'
                    ? 'Audit Schedule'
                    : activeTab === 'workareas'
                    ? 'Geofenced Sites'
                    : 'Smart Construction'}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {activeTab === 'dashboard'
                    ? 'Executive compliance dashboards, quality assurance milestones, and automated defect resolution workflows.'
                    : activeTab === 'timeline'
                    ? 'Critical path Gantt milestones, recurrent maintenance cycles, and verified field audit timestamps.'
                    : activeTab === 'workareas'
                    ? 'Multi-zone GPS coordinates, boundary polygon geofencing, and sub-site environmental risk factors.'
                    : 'Smart construction uses AI, offline telemetry, and IoT geofencing to improve efficiency, safety, and sustainability.'}
                </p>
              </div>

              {/* Floating Frosted Glass Card Over Building */}
              <div className="relative z-10 self-center lg:self-end my-4 lg:my-0 lg:mr-16">
                <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-xl w-64 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {activeTab === 'workareas' ? 'Viaduct Block K4' : 'Komastu / Metro 07'}
                      </h4>
                      <p className="text-[10px] text-slate-400">Done: 25 Nov, 2026 10:46 AM</p>
                    </div>
                    <button
                      onClick={() => navigate(getDashboardPath())}
                      className="h-7 w-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-700 shadow-2xs"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {activeTab === 'timeline' ? '74%' : activeTab === 'workareas' ? '88%' : '27%'}
                    </span>

                    {/* Avatar Stack */}
                    <div className="flex -space-x-1.5 overflow-hidden items-center">
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                        RV
                      </div>
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                        PN
                      </div>
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                        VM
                      </div>
                      <div className="h-5 px-1.5 rounded-full ring-2 ring-white bg-slate-200 text-slate-700 text-[9px] font-extrabold flex items-center justify-center">
                        +3
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card: 2D Cross Section Bar Chart & Range Slider */}
              <div className="relative z-10 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 shadow-xl mt-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        2D Cross Section Z (ft)
                      </h3>
                      <button
                        onClick={() => navigate(getDashboardPath())}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-extrabold text-slate-900">96.5%</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                        +2.4% <TrendingUp className="h-3 w-3 inline" />
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="h-2.5 w-6 rounded-full bg-orange-500 inline-block" />
                    <span>Z (ft) Range Active</span>
                  </div>
                </div>

                {/* Bar Graph Simulation */}
                <div className="h-20 flex items-end gap-1.5 sm:gap-2 px-1">
                  {barHeights.map((h, i) => {
                    const isOrange = i >= 8 && i <= 18;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end h-full group"
                      >
                        <div
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isOrange
                              ? 'bg-orange-500 group-hover:bg-orange-600'
                              : 'bg-slate-300/80 group-hover:bg-slate-400'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Timeline Range Track with Orange Capsule Range Overlay */}
                <div className="mt-3 relative pt-1">
                  {/* Ticks */}
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
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

                  {/* Pill slider background */}
                  <div className="w-full bg-slate-200/90 h-6 rounded-full mt-1.5 relative flex items-center px-2 overflow-hidden">
                    {/* Orange highlight range overlay matching image */}
                    <div
                      className="absolute h-full bg-orange-500/80 rounded-full shadow-inner flex items-center justify-between px-2 cursor-pointer transition-all hover:bg-orange-500"
                      style={{ left: '26%', width: '38%' }}
                    >
                      <div className="w-0.5 h-3 bg-white/70 rounded-full" />
                      <div className="w-0.5 h-3 bg-white/70 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Sidebar Panel: Overall Metrics, Progress Gauges & Cut/Fill */}
            <aside className="w-full lg:w-80 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-black/5 bg-[#eceeed]/90 backdrop-blur-md flex flex-col justify-between space-y-4 shrink-0">
              {/* Header drop */}
              <div className="flex items-center justify-between pb-2">
                <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-white/80 text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition-all">
                  <span>Overall</span>
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
                  detailText="Details"
                  onClick={() => navigate(getDashboardPath())}
                />

                {/* Metric 2 */}
                <MetricGauge
                  label="Defect Rectification Rate"
                  value={63}
                  delta="-19%"
                  isPositive={false}
                  color="#f43f5e"
                  detailText="Details"
                  onClick={() => navigate(getDashboardPath())}
                />

                {/* Metric 3 */}
                <MetricGauge
                  label="Offline Logs Synced"
                  value={27}
                  delta="+7.5%"
                  isPositive={true}
                  color="#10b981"
                  detailText="Details"
                  onClick={() => navigate(getDashboardPath())}
                />
              </div>

              {/* Bottom Cut and Fill / Material Volume Table */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <h4 className="font-bold text-slate-900 text-xs">Cut and Fill</h4>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mb-3">Done: 25 Nov, 2026 10:46 AM</p>

                {/* Grid matrix of elevation numbers */}
                <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-20ft</span>
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-15ft</span>
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-9.75ft</span>
                  <span className="text-slate-400 py-1 bg-slate-50 rounded">-4.87ft</span>
                  <span className="text-slate-600 font-bold py-1 bg-slate-100 rounded">0.00ft</span>

                  <span className="text-slate-600 font-bold py-1 bg-slate-100 rounded">0.00ft</span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">14ft</span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">28ft</span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">41ft</span>
                  <span className="text-orange-600 font-bold py-1 bg-orange-50 rounded">55ft</span>
                </div>
              </div>

              {/* Action Link to Nirikshan Portal */}
              <div className="pt-2">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <span>{isAuthenticated ? 'Open Operations Console' : 'Access Inspection Portal'}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
