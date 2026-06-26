"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Bebas_Neue } from "next/font/google";
import Link from "next/link";
import {
  Gauge, Zap, Disc, Circle, Droplets, Battery,
  Activity, Wind, Thermometer, AlertTriangle, Pause, Play,
  LayoutDashboard, BellRing, ChevronsRight,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";


const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

const BASE_URL = "http://10.190.10.155:5000";

/* ── THRESHOLDS ── */
export const THRESHOLDS = {
  tyre_core_temperature:    { warn: 90,    critical: 110,   unit: "°C",    low: false },
  tyre_surface_temperature: { warn: 100,   critical: 120,   unit: "°C",    low: false },
  brake_disc_temperature:   { warn: 700,   critical: 1000,  unit: "°C",    low: false },
  brake_fluid_temperature:  { warn: 180,   critical: 220,   unit: "°C",    low: false },
  coolant_temperature:      { warn: 110,   critical: 125,   unit: "°C",    low: false },
  oil_temperature:          { warn: 130,   critical: 150,   unit: "°C",    low: false },
  oil_pressure:             { warn: 3.5,   critical: 2.0,   unit: " bar",  low: true  },
  tyre_pressure:            { warn: 1.8,   critical: 1.6,   unit: " bar",  low: true  },
  engine_rpm:               { warn: 14000, critical: 15000, unit: " RPM",  low: false },
  fuel_flow_rate:           { warn: 90,    critical: 100,   unit: " kg/h", low: false },
  mguk_soc:                 { warn: 20,    critical: 10,    unit: "%",     low: true  },
};

export const getAlerts = (data) => {
  const alerts = [];
  Object.entries(THRESHOLDS).forEach(([key, t]) => {
    const value = data[key];
    if (value == null) return;
    if (t.low) {
      if (value <= t.critical) alerts.push({ key, level: "critical", value, unit: t.unit });
      else if (value <= t.warn) alerts.push({ key, level: "warn", value, unit: t.unit });
    } else {
      if (value >= t.critical) alerts.push({ key, level: "critical", value, unit: t.unit });
      else if (value >= t.warn) alerts.push({ key, level: "warn", value, unit: t.unit });
    }
  });
  return alerts;
};

const getLineColor = (key, history, fixedColor) => {
  const t = THRESHOLDS[key];
  if (!t || !history.length) return fixedColor || "#2dd4bf";
  const latest = history[history.length - 1]?.[key];
  if (latest == null) return fixedColor || "#2dd4bf";
  if (t.low) {
    if (latest <= t.critical) return "#ef4444";
    if (latest <= t.warn)     return "#f97316";
  } else {
    if (latest >= t.critical) return "#ef4444";
    if (latest >= t.warn)     return "#f97316";
  }
  return fixedColor || "#2dd4bf";
};

const flattenTelemetry = (data) => ({
  time: new Date().toLocaleTimeString(),
  brake_position:           data.chassis?.brake_position,
  g_force_lateral:          data.chassis?.g_force_lateral,
  g_force_longitudnal:      data.chassis?.g_force_longitudnal,
  ride_height:              data.chassis?.ride_height,
  steering_angle:           data.chassis?.steering_angle,
  throttle_position:        data.chassis?.throttle_position,
  wheel_speed_sensors:      data.chassis?.wheel_speed_sensors,
  coolant_temperature:      data.powerunit?.coolant_temperature,
  engine_rpm:               data.powerunit?.engine_rpm,
  fuel_flow_rate:           data.powerunit?.fuel_flow_rate,
  mguh_speed:               data.powerunit?.mguh_speed,
  mguk_soc:                 data.powerunit?.mguk_soc,
  oil_pressure:             data.powerunit?.oil_pressure,
  oil_temperature:          data.powerunit?.oil_temperature,
  brake_disc_temperature:   data.tyres_and_brakes?.brake_disc_temperature,
  brake_fluid_temperature:  data.tyres_and_brakes?.brake_fluid_temperature,
  tyre_core_temperature:    data.tyres_and_brakes?.tyre_core_temperature,
  tyre_pressure:            data.tyres_and_brakes?.tyre_pressure,
  tyre_surface_temperature: data.tyres_and_brakes?.tyre_surface_temperature,
});

/* ── OPTIONS ── */
const TRACK_OPTIONS = [
  { value: "high_speed",        label: "High-Speed Straight" },
  { value: "technical",         label: "Technical Circuit"   },
  { value: "high_g_lateral",    label: "High-G Lateral"      },
  { value: "street_circuit",    label: "Street Circuit"      },
  { value: "high_altitude",     label: "High Altitude"       },
  { value: "sea_level",         label: "Sea Level"           },
  { value: "high_recovery",     label: "High Recovery"       },
  { value: "low_recovery",      label: "Low Recovery"        },
  { value: "high_load_lateral", label: "High Load Lateral"   },
  { value: "heavy_braking",     label: "Heavy Braking"       },
  { value: "flowing_circuit",   label: "Flowing Circuit"     },
  { value: "bumpy",             label: "Bumpy Circuit"       },
  { value: "smooth",            label: "Smooth Circuit"      },
];
const WEATHER_OPTIONS = [
  { value: "dry", label: "Dry" },
  { value: "wet", label: "Wet" },
];
const SETUP_OPTIONS = [
  { value: "high_downforce", label: "High Downforce" },
  { value: "low_drag",       label: "Low Drag"       },
  { value: "balanced",       label: "Balanced"       },
];

/* ── TABS ── */
const TABS = [
  { id: "chassis",   label: "Chassis",        Icon: Gauge      },
  { id: "gforce",    label: "G-Force",         Icon: Activity   },
  { id: "powerunit", label: "Power Unit",      Icon: Zap        },
  { id: "tyres",     label: "Tyres & Brakes",  Icon: Circle     },
];

/* ── CHART LINES ── */
const CHART_LINES = {
  chassis: [
    { key: "brake_position",      name: "Brake",       color: "#60a5fa" },
    { key: "throttle_position",   name: "Throttle",    color: "#34d399" },
    { key: "steering_angle",      name: "Steering",    color: "#c084fc" },
    { key: "ride_height",         name: "Ride Height", color: "#94a3b8" },
    { key: "wheel_speed_sensors", name: "Wheel Speed", color: "#f0abfc" },
  ],
  gforce: [
    { key: "g_force_lateral",     name: "Lateral G",      color: "#60a5fa" },
    { key: "g_force_longitudnal", name: "Longitudinal G", color: "#f43f5e" },
  ],
  powerunit: [
    { key: "engine_rpm",          name: "RPM",          color: "#60a5fa" },
    { key: "coolant_temperature", name: "Coolant Temp", color: "#67e8f9" },
    { key: "oil_temperature",     name: "Oil Temp",     color: "#c084fc" },
    { key: "oil_pressure",        name: "Oil Pressure", color: "#86efac" },
    { key: "fuel_flow_rate",      name: "Fuel Flow",    color: "#fda4af" },
    { key: "mguk_soc",            name: "MGU-K SOC",    color: "#a5b4fc" },
    { key: "mguh_speed",          name: "MGU-H Speed",  color: "#f0abfc" },
  ],
  tyres: [
    { key: "brake_disc_temperature",   name: "Brake Disc Temp",   color: "#60a5fa" },
    { key: "brake_fluid_temperature",  name: "Brake Fluid Temp",  color: "#c084fc" },
    { key: "tyre_core_temperature",    name: "Tyre Core Temp",    color: "#67e8f9" },
    { key: "tyre_surface_temperature", name: "Tyre Surface Temp", color: "#86efac" },
    { key: "tyre_pressure",            name: "Tyre Pressure",     color: "#f0abfc" },
  ],
};

const CHART_REFS = {
  powerunit: [
    { y: 14000, label: "RPM Warn",    color: "#f97316" },
    { y: 15000, label: "RPM Critical",color: "#ef4444" },
  ],
  tyres: [
    { y: 700,  label: "Brake Warn",  color: "#f97316" },
    { y: 1000, label: "Brake Crit",  color: "#ef4444" },
    { y: 110,  label: "Tyre Max",    color: "#f97316" },
  ],
};

/* ── SELECT ── */
const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={s.configLabel}>{label}</span>
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={s.select}>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0a0a0a" }}>{o.label}</option>
        ))}
      </select>
      <ChevronsRight size={12} color="#2dd4bf" style={{ position: "absolute", right: 10, pointerEvents: "none", transform: "rotate(90deg)" }} />
    </div>
  </div>
);

/* ── TOOLTIP ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #2dd4bf33", padding: "12px 14px", borderRadius: 8 }}>
      <p style={{ color: "#555", marginBottom: 8, fontSize: 10, letterSpacing: "0.1em" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: "3px 0", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span>{p.name}</span>
          <strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── CHART CARD ── */
const ChartCard = ({ title, lines, history, references = [] }) => (
  <div style={s.card}>
    <div style={s.cardHeader}>
      <div style={s.cardAccent} />
      <h2 style={{ ...s.cardTitle, fontFamily: bebas.style.fontFamily }}>{title}</h2>
    </div>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={history} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="1 4" stroke="#1a1a1a" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#555", paddingTop: 12 }} />
        {references.map((r, i) => (
          <ReferenceLine key={i} y={r.y} stroke={r.color} strokeDasharray="3 5" strokeOpacity={0.6}
            label={{ value: r.label, fill: r.color, fontSize: 9 }} />
        ))}
        {lines.map((line) => (
          <Line key={line.key} type="monotone" dataKey={line.key} name={line.name}
            dot={false} strokeWidth={1.5} isAnimationActive={false}
            stroke={getLineColor(line.key, history, line.color)} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

/* ── ALERT BANNER ── */
const AlertBanner = ({ alerts }) => {
  if (!alerts.length) return (
    <div style={{ ...s.alertBanner, borderColor: "#2dd4bf22" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2dd4bf", boxShadow: "0 0 8px #2dd4bf", flexShrink: 0 }} />
      <span style={{ color: "#2dd4bf", fontSize: 11, letterSpacing: "0.18em" }}>ALL SYSTEMS NOMINAL</span>
    </div>
  );
  return (
    <div style={{ ...s.alertBanner, borderColor: "#ef444433", background: "#0d0505" }}>
      <Zap size={14} color="#ef4444" style={{ flexShrink: 0 }} />
      <span style={{ color: "#ef4444", fontSize: 11, letterSpacing: "0.18em", marginRight: 8, flexShrink: 0 }}>ALERT</span>
      <span style={{ width: 1, height: 14, background: "#333", flexShrink: 0 }} />
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {alerts.map((a, i) => (
          <span key={i} style={{ color: a.level === "critical" ? "#ef4444" : "#f97316", fontSize: 11 }}>
            <span style={{ color: "#555", marginRight: 6 }}>{a.key.replace(/_/g, " ")}:</span>
            <strong>{typeof a.value === "number" ? a.value.toFixed(1) : a.value}{a.unit}</strong>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── STAT CARD ── */
const StatCard = ({ label, value, unit, Icon }) => (
  <div style={s.stat}>
    <div style={s.statTop}>
      <span style={s.statLabel}>{label}</span>
      {Icon && <Icon size={16} color="#2dd4bf" strokeWidth={1.5} />}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
      <strong style={{ ...s.statValue, fontFamily: bebas.style.fontFamily }}>{value ?? "—"}</strong>
      <span style={s.statUnit}>{unit}</span>
    </div>
    <div style={s.statBar} />
  </div>
);

/* ── MERCEDES STAR ── */
const MercedesStar = () => (
  <svg width={500} height={500} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.04 }}>
    <circle cx="50" cy="50" r="48" stroke="#C0C0C0" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="42" stroke="#C0C0C0" strokeWidth="0.5" fill="none" />
    <path d="M50 4 L56 44 L94 56 L56 56 L50 96 L44 56 L6 56 L44 44 Z" fill="#C0C0C0" />
    <circle cx="50" cy="50" r="8" fill="#C0C0C0" />
  </svg>
);

/* ── MAIN ── */
export default function Simulate() {
  const [simulationData, setSimulationData] = useState(null);
  const [trackState, setTrackState]         = useState("high_speed");
  const [weather, setWeather]               = useState("dry");
  const [setup, setSetup]                   = useState("high_downforce");
  const [history, setHistory]               = useState([]);
  const [alerts, setAlerts]                 = useState([]);
  const [activeTab, setActiveTab]           = useState("chassis");
  const [paused, setPaused]                 = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const fetch_ = async () => {
      if (pausedRef.current) return;
      try {
        const res  = await axios.post(`${BASE_URL}/simulate`, { track_state: trackState, weather, setup });
        const flat = flattenTelemetry(res.data);
        setSimulationData(res.data);
        setAlerts(getAlerts(flat));
        setHistory((prev) => [...prev, flat].slice(-20));
      } catch (e) { console.error(e); }
    };
    fetch_();
    const id = setInterval(fetch_, 500);
    return () => clearInterval(id);
  }, [trackState, weather, setup]);

  const sd = simulationData;
  const tb = sd?.tyres_and_brakes;
  const pu = sd?.powerunit;
  const ch = sd?.chassis;

  const STATS = [
    { label: "WHEEL SPEED",   value: ch?.wheel_speed_sensors?.toFixed(1),  unit: "km/h", Icon: Gauge      },
    { label: "ENGINE RPM",    value: pu?.engine_rpm?.toFixed(0),            unit: "RPM",  Icon: Zap        },
    { label: "BRAKE DISC",    value: tb?.brake_disc_temperature?.toFixed(0),unit: "°C",   Icon: Disc       },
    { label: "TYRE PRESSURE", value: tb?.tyre_pressure?.toFixed(2),         unit: "bar",  Icon: Circle     },
    { label: "OIL TEMP",      value: pu?.oil_temperature?.toFixed(1),       unit: "°C",   Icon: Droplets   },
    { label: "MGU-K SOC",     value: pu?.mguk_soc?.toFixed(1),              unit: "%",    Icon: Battery    },
  ];

  return (
    <div style={s.container}>
      {/* bg layers */}
      <div style={s.bgRadial} />
      <div style={s.bgStar}><MercedesStar /></div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <header style={s.header}>
          <div>
            <p style={s.eyebrow}>AMG PETRONAS F1 TEAM</p>
            <h1 style={{ ...s.title, fontFamily: bebas.style.fontFamily }}>TELEMETRY</h1>
          </div>
          <div style={s.headerRight}>
            <div style={s.liveChip}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: paused ? "#444" : "#2dd4bf",
                boxShadow: paused ? "none" : "0 0 8px #2dd4bf",
              }} />
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: paused ? "#444" : "#2dd4bf" }}>
                {paused ? "PAUSED" : "LIVE"}
              </span>
            </div>
            <button onClick={() => setPaused((p) => !p)} style={s.iconBtn} title={paused ? "Resume" : "Pause"}>
              {paused ? <Play size={12} /> : <Pause size={12} />}
            </button>
            <Link href="/dashboard" style={s.navLink}>DASHBOARD</Link>
            <Link href="/alerts" style={s.navLink}>
              <BellRing size={13} />
              <span style={{ fontFamily: bebas.style.fontFamily, letterSpacing: "0.12em", fontSize: 13 }}>ALERTS</span>
            </Link>
          </div>
        </header>

        {/* divider */}
        <div style={s.divider} />

        {/* CONFIG */}
        <div style={s.configRow}>
          <Select label="TRACK"   value={trackState} onChange={setTrackState} options={TRACK_OPTIONS} />
          <Select label="WEATHER" value={weather}    onChange={setWeather}    options={WEATHER_OPTIONS} />
          <Select label="SETUP"   value={setup}      onChange={setSetup}      options={SETUP_OPTIONS} />
        </div>

        {/* ALERT BANNER */}
        <AlertBanner alerts={alerts} />

        {/* STAT CARDS */}
        <div style={s.grid}>
          {STATS.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>

        {/* TABS */}
        <div style={s.tabBar}>
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                ...s.tab,
                fontFamily: bebas.style.fontFamily,
                ...(active ? s.tabActive : {}),
              }}>
                <Icon size={14} strokeWidth={active ? 2 : 1.5} color={active ? "#2dd4bf" : "#444"} />
                {label}
              </button>
            );
          })}
        </div>

        {!simulationData && (
          <p style={{ color: "#333", letterSpacing: "0.2em", fontSize: 11, fontFamily: bebas.style.fontFamily }}>
            WAITING FOR DATA...
          </p>
        )}

        {/* CHART */}
        {simulationData && (
          <ChartCard
            title={TABS.find((t) => t.id === activeTab)?.label}
            history={history}
            lines={CHART_LINES[activeTab]}
            references={CHART_REFS[activeTab] || []}
          />
        )}
      </div>
    </div>
  );
}

/* ── STYLES ── */
const s = {
  container: {
    position: "relative",
    padding: "32px 28px",
    background: "#050505",
    minHeight: "100vh",
    color: "#e5e7eb",
    overflow: "hidden",
  },
  bgRadial: {
    position: "fixed", inset: 0,
    background: "radial-gradient(ellipse 80% 60% at 50% 0%, #0d1a18 0%, #050505 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  bgStar: {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none", zIndex: 0,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0,
  },
  eyebrow: {
    color: "#2dd4bf", fontSize: 10, letterSpacing: "0.3em", margin: "0 0 4px", fontFamily: "monospace",
  },
  title: {
    fontSize: 52, letterSpacing: "0.08em", margin: 0, lineHeight: 1,
    background: "linear-gradient(to bottom, #ffffff 30%, #666)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  headerRight: { display: "flex", alignItems: "center", gap: 10, paddingBottom: 6 },
  liveChip: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "4px 10px",
  },
  iconBtn: {
    background: "transparent", border: "1px solid #222", color: "#888",
    width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
  },
  navLink: {
    color: "#888", textDecoration: "none", border: "1px solid #222",
    padding: "6px 14px", borderRadius: 6, fontSize: 12,
    display: "flex", alignItems: "center", gap: 6,
  },
  divider: {
    height: 1,
    background: "linear-gradient(to right, transparent, #C0C0C033, #2dd4bf55, #C0C0C033, transparent)",
    margin: "16px 0 24px",
  },
  configRow: { display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" },
  configLabel: { fontSize: 9, letterSpacing: "0.25em", color: "#444", fontFamily: "monospace" },
  select: {
    background: "#0a0a0a", color: "#ccc", border: "1px solid #1f1f1f",
    borderRadius: 6, padding: "8px 32px 8px 12px", fontSize: 12,
    fontFamily: "monospace", cursor: "pointer", outline: "none",
    appearance: "none", minWidth: 180,
  },
  alertBanner: {
    display: "flex", alignItems: "center",
    background: "#080808", border: "1px solid",
    borderRadius: 8, padding: "10px 16px",
    marginBottom: 20, flexWrap: "wrap", gap: 10,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 1, marginBottom: 24,
    background: "#111", borderRadius: 12,
    overflow: "hidden", border: "1px solid #111",
  },
  stat: {
    background: "#080808", padding: "16px 18px 12px",
    display: "flex", flexDirection: "column", gap: 4, position: "relative",
  },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.18em", fontFamily: "monospace" },
  statValue: { fontSize: 30, color: "#e5e7eb", lineHeight: 1 },
  statUnit:  { fontSize: 11, color: "#2dd4bf", letterSpacing: "0.05em" },
  statBar: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
    background: "linear-gradient(to right, #2dd4bf44, transparent)",
  },
  tabBar: { display: "flex", gap: 2, marginBottom: 16 },
  tab: {
    background: "transparent", border: "none",
    borderBottom: "2px solid transparent",
    color: "#444", padding: "8px 18px",
    cursor: "pointer", fontSize: 15,
    letterSpacing: "0.1em", transition: "all 0.15s",
    display: "flex", alignItems: "center", gap: 7,
  },
  tabActive: { color: "#e5e7eb", borderBottomColor: "#2dd4bf" },
  card: {
    background: "#080808", padding: "20px 20px 12px",
    borderRadius: 10, border: "1px solid #111",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  cardAccent: {
    width: 3, height: 18, borderRadius: 2,
    background: "linear-gradient(to bottom, #2dd4bf, #0e7490)",
  },
  cardTitle: { fontSize: 18, letterSpacing: "0.14em", color: "#888", margin: 0, textTransform: "uppercase" },
};
