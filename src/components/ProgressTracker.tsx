import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Plus, Droplets, CheckCircle2, TrendingUp, AlertCircle, ShoppingBag, Sparkles, Sliders } from "lucide-react";

interface SeedProgressLog {
  date: string;
  hydrationPercent: number;
  oilPercent: number;
  waterCups: number;
  stressLevel: number; // 1 to 5
  morningRoutineCompleted: boolean;
  nightRoutineCompleted: boolean;
}

const DEFAULT_HISTORY: SeedProgressLog[] = [
  { date: "June 05", hydrationPercent: 32, oilPercent: 55, waterCups: 4, stressLevel: 4, morningRoutineCompleted: true, nightRoutineCompleted: false },
  { date: "June 06", hydrationPercent: 35, oilPercent: 48, waterCups: 5, stressLevel: 3, morningRoutineCompleted: true, nightRoutineCompleted: true },
  { date: "June 07", hydrationPercent: 40, oilPercent: 42, waterCups: 6, stressLevel: 3, morningRoutineCompleted: true, nightRoutineCompleted: true },
  { date: "June 08", hydrationPercent: 48, oilPercent: 35, waterCups: 8, stressLevel: 2, morningRoutineCompleted: true, nightRoutineCompleted: true },
  { date: "June 09", hydrationPercent: 55, oilPercent: 33, waterCups: 7, stressLevel: 1, morningRoutineCompleted: true, nightRoutineCompleted: true },
  { date: "June 10", hydrationPercent: 62, oilPercent: 30, waterCups: 9, stressLevel: 2, morningRoutineCompleted: true, nightRoutineCompleted: true },
  { date: "June 11", hydrationPercent: 68, oilPercent: 28, waterCups: 8, stressLevel: 1, morningRoutineCompleted: true, nightRoutineCompleted: true }
];

interface ProgressTrackerProps {
  showToast?: (message: string, type?: "success" | "info" | "error") => void;
}

export default function ProgressTracker({ showToast = () => {} }: ProgressTrackerProps) {
  const [logs, setLogs] = useState<SeedProgressLog[]>([]);
  const [hydrationInput, setHydrationInput] = useState(65);
  const [oilInput, setOilInput] = useState(30);
  const [waterCupsInput, setWaterCupsInput] = useState(8);
  const [stressInput, setStressInput] = useState(2);
  const [morningDone, setMorningDone] = useState(true);
  const [nightDone, setNightDone] = useState(true);

  // Load from localstorage to persist
  useEffect(() => {
    const saved = localStorage.getItem("luxecare_progress_tracker_logs");
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        setLogs(DEFAULT_HISTORY);
      }
    } else {
      setLogs(DEFAULT_HISTORY);
      localStorage.setItem("luxecare_progress_tracker_logs", JSON.stringify(DEFAULT_HISTORY));
    }
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "2-digit" });

    // Prevent duplicate entries for the exact same date label to prevent recharts keys collision
    const existingIdx = logs.findIndex((log) => log.date === formattedDate);
    
    const newEntry: SeedProgressLog = {
      date: formattedDate,
      hydrationPercent: Number(hydrationInput),
      oilPercent: Number(oilInput),
      waterCups: Number(waterCupsInput),
      stressLevel: Number(stressInput),
      morningRoutineCompleted: morningDone,
      nightRoutineCompleted: nightDone
    };

    let updated = [...logs];
    if (existingIdx >= 0) {
      updated[existingIdx] = newEntry; // update today's log
    } else {
      updated.push(newEntry);
    }

    setLogs(updated);
    localStorage.setItem("luxecare_progress_tracker_logs", JSON.stringify(updated));
    showToast("🌟 Daily Skin Progress Saved! Graph updated.", "success");
  };

  const handleResetHistory = () => {
    setLogs(DEFAULT_HISTORY);
    localStorage.setItem("luxecare_progress_tracker_logs", JSON.stringify(DEFAULT_HISTORY));
    showToast("🔄 Handled Demo history restoration! Tracking logs reset to default.", "info");
  };

  // Compute stats of skin progress
  const latestLog = logs[logs.length - 1] || DEFAULT_HISTORY[DEFAULT_HISTORY.length - 1];
  const previousLog = logs[logs.length - 2] || DEFAULT_HISTORY[DEFAULT_HISTORY.length - 2];
  const hydrationChange = latestLog.hydrationPercent - previousLog.hydrationPercent;

  return (
    <div className="space-y-12 animate-fade-in" id="progress-tracker-module">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E6E0D5] text-[#2A3B2D] rounded-full text-xs font-semibold uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-[#5A6D5D]" />
          Derm-Telemetry Tracker
        </div>
        <h2 className="text-4xl font-serif italic text-[#2A3B2D] tracking-tight">
          Skin & Scalp Progress Analytics
        </h2>
        <p className="text-sm text-[#7A8C7E]">
          Log your daily skincare habits and view scientific charts showing hydration increase and sebum oil level stabilization. Watch your skin improve as K-Beauty targets active issues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Dynamic Real-time Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#F9F7F2] pb-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2A3B2D]">Skin Bio-Parameters Chart</h3>
              <p className="text-xs text-stone-500">Hydration vs. Oil stabilization trends over recent period logs</p>
            </div>
            <button
              id="reset-history-btn"
              onClick={handleResetHistory}
              className="text-xxs font-bold text-[#5A6D5D] hover:underline cursor-pointer"
            >
              Reset to Demo History
            </button>
          </div>

          {/* Recharts Container */}
          <div className="h-72 w-full text-xs" id="recharts-glow-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHydration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A6D5D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5A6D5D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3B18A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#A3B18A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0D5" />
                <XAxis dataKey="date" stroke="#7A8C7E" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7A8C7E" fontSize={10} domain={[10, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2A3B2D",
                    borderRadius: "16px",
                    color: "white",
                    border: "none",
                    fontFamily: "Inter, sans-serif"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hydrationPercent"
                  name="Water Hydration %"
                  stroke="#5A6D5D"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHydration)"
                />
                <Area
                  type="monotone"
                  dataKey="oilPercent"
                  name="Outer Sebum Oil %"
                  stroke="#A3B18A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOil)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#F5F2ED] pt-5">
            <div className="p-3 bg-emerald-50/55 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-widest block">Last Hydration</span>
                <span className="text-base font-bold text-emerald-950 font-serif">{latestLog?.hydrationPercent}%</span>
                {hydrationChange !== 0 && (
                  <span className={`text-[10px] font-semibold block ${hydrationChange > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {hydrationChange > 0 ? "+" : ""}{hydrationChange}% vs last log
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-amber-50/55 rounded-2xl border border-amber-100 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-widest block font-sans">Last Sebum Oil</span>
                <span className="text-base font-bold text-amber-950 font-serif">{latestLog?.oilPercent}%</span>
                <span className="text-[9px] text-[#7A8C7E] block">Stabilization marker (30%)</span>
              </div>
            </div>

            <div className="p-3 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D5] flex items-center gap-3">
              <div className="p-2 bg-[#E6E0D5] text-[#2A3B2D] rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-[#5A6D5D] uppercase font-bold tracking-widest block font-sans">K-Beauty Habits</span>
                <span className="text-base font-bold text-[#2A3B2D] font-serif">
                  {latestLog?.morningRoutineCompleted && latestLog?.nightRoutineCompleted ? "100%" : "50%"} Adhered
                </span>
                <span className="text-[10px] text-[#7A8C7E] block font-sans">Goal: 2x Daily application</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Log your daily skin status */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-4">
          <h3 className="text-lg font-serif text-[#2A3B2D] border-b border-[#F9F7F2] pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#5A6D5D]" /> Log Today's Status
          </h3>

          <form onSubmit={handleAddLog} className="space-y-4 text-xs" id="daily-log-form">
            {/* Range: Hydration level */}
            <div className="space-y-1 bg-[#F9F7F2] p-3 rounded-2xl border border-[#E6E0D5]">
              <div className="flex justify-between font-bold text-[#2A3B2D]">
                <span>Moisture/Hydration (%)</span>
                <span className="text-[#5A6D5D] font-bold">{hydrationInput}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={hydrationInput}
                onChange={(e) => setHydrationInput(Number(e.target.value))}
                id="form-hydration-range"
                className="w-full accent-[#5A6D5D] cursor-pointer mt-1"
              />
            </div>

            {/* Range: Oil level */}
            <div className="space-y-1 bg-[#F9F7F2] p-3 rounded-2xl border border-[#E6E0D5]">
              <div className="flex justify-between font-bold text-[#2A3B2D]">
                <span>Acne & Sebum Oil (%)</span>
                <span className="text-[#A3B18A] font-bold">{oilInput}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={oilInput}
                onChange={(e) => setOilInput(Number(e.target.value))}
                id="form-oil-range"
                className="w-full accent-[#5A6D5D] cursor-pointer mt-1"
              />
            </div>

            {/* Water intake */}
            <div className="space-y-1">
              <label className="font-bold text-[#2A3B2D] block">Water Intake Today (Cups of 250ml)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={waterCupsInput}
                  onChange={(e) => setWaterCupsInput(Number(e.target.value))}
                  id="form-water-input"
                  className="w-1/3 p-2 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-center text-[#3C3C3C] font-semibold"
                />
                <span className="text-[#7A8C7E] text-[10px]">Target: 8-10 cups to boost hydration</span>
              </div>
            </div>

            {/* Stress level */}
            <div className="space-y-1">
              <label className="font-bold text-[#2A3B2D] block text-xxs uppercase tracking-wider">Acidity/Stress Factor</label>
              <div className="grid grid-cols-5 gap-1.5" id="stress-level-selector">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setStressInput(lvl)}
                    className={`py-1.5 text-center font-bold rounded-xl text-xxs border ${
                      stressInput === lvl
                        ? "bg-[#2A3B2D] text-white border-[#2A3B2D]"
                        : "bg-[#F9F7F2] border-[#E6E0D5] text-[#3C3C3C] hover:bg-[#E6E0D5]/20"
                    }`}
                  >
                    {lvl === 1 ? "Low" : lvl === 5 ? "High" : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Ritual switches */}
            <div className="space-y-2 bg-[#F9F7F2] p-3 rounded-2xl border border-[#E6E0D5]">
              <label className="font-bold text-[#2A3B2D] block text-xxs uppercase tracking-widest">Ritual Completion</label>
              
              <label className="flex items-center gap-2 cursor-pointer py-1 text-[#3C3C3C] font-medium">
                <input
                  type="checkbox"
                  checked={morningDone}
                  onChange={(e) => setMorningDone(e.target.checked)}
                  id="form-morning-checkbox"
                  className="w-4 h-4 rounded text-[#5A6D5D] focus:ring-[#5A6D5D] cursor-pointer accent-[#5A6D5D]"
                />
                <span>☀️ Morning Cleanse & Calming Toner</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer py-1 text-[#3C3C3C] font-medium">
                <input
                  type="checkbox"
                  checked={nightDone}
                  onChange={(e) => setNightDone(e.target.checked)}
                  id="form-night-checkbox"
                  className="w-4 h-4 rounded text-[#5A6D5D] focus:ring-[#5A6D5D] cursor-pointer accent-[#5A6D5D]"
                />
                <span>🌙 Night Complex Recovery Ampoule</span>
              </label>
            </div>

            <button
              id="save-daily-log-btn"
              type="submit"
              className="w-full py-3 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white text-xs font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              Save Skin Matrix Log
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
