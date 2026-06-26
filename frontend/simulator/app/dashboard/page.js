"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { getAlerts } from "../simulation/page";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const BASE_URL = "http://10.190.10.155:5000";

const COMPOUNDS = [
  { id: "soft",   label: "SOFT",   color: "#ef4444" },
  { id: "medium", label: "MEDIUM", color: "#f59e0b" },
  { id: "hard",   label: "HARD",   color: "#e5e7eb" },
  { id: "inter",  label: "INTER",  color: "#22c55e" },
  { id: "wet",    label: "WET",    color: "#3b82f6" },
];

const getTyreColor = (temp) => {
  if (!temp) return "#1f2937";
  if (temp < 60)  return "#3b82f6";
  if (temp < 80)  return "#22c55e";
  if (temp < 100) return "#f59e0b";
  if (temp < 120) return "#f97316";
  return "#ef4444";
};

/* ── SPEEDOMETER ── */
const Speedometer = ({ value, max, label, unit, color = "#2dd4bf" }) => {
  const pct = Math.min((value || 0) / max, 1);
  const toRad = (d) => (d * Math.PI) / 180;

  // Arc goes from 220° to 320° (bottom-left to bottom-right, opening downward)
  const START = 220;
  const END   = 320;
  const SWEEP = 360 - (END - START); // = 260°
  const cx = 100, cy = 100, r = 75;

  const pt = (deg, radius) => [
    cx + radius * Math.cos(toRad(deg)),
    cy + radius * Math.sin(toRad(deg)),
  ];

  // Track arc: from START going counter-clockwise (sweep-flag=0) to END
  const [tx1, ty1] = pt(START, r);
  const [tx2, ty2] = pt(END,   r);

  // Filled arc: from START, sweeping clockwise by pct*SWEEP degrees
  const fillAngle = START - pct * SWEEP; // counter-clockwise = decreasing angle
  const [fx1, fy1] = pt(START,     r);
  const [fx2, fy2] = pt(fillAngle, r);
  const fillLarge  = pct * SWEEP > 180 ? 1 : 0;

  // Needle
  const [nx, ny] = pt(fillAngle, r - 18);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={200} height={170} viewBox="0 0 200 170">
        {/* background track */}
        <path
          d={`M ${tx1} ${ty1} A ${r} ${r} 0 1 0 ${tx2} ${ty2}`}
          fill="none" stroke="#1a1a2e" strokeWidth={10} strokeLinecap="round"
        />
        {/* filled portion */}
        {pct > 0 && (
          <path
            d={`M ${fx1} ${fy1} A ${r} ${r} 0 ${fillLarge} 0 ${fx2} ${fy2}`}
            fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          />
        )}
        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny}
          stroke={color} strokeWidth={2} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill={color} />
        <circle cx={cx} cy={cy} r={2} fill="#050505" />

        {/* value text */}
        <text x={cx} y={cy + 16} textAnchor="middle"
          fill="#f1f5f9" fontSize={26} fontFamily={bebas.style.fontFamily} letterSpacing={1}>
          {value != null ? Math.round(value) : "—"}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle"
          fill={color} fontSize={9} letterSpacing={2}>
          {unit}
        </text>

        {/* 0 and max labels */}
        <text x={pt(START, r + 12)[0]} y={pt(START, r + 12)[1] + 4}
          textAnchor="middle" fill="#333" fontSize={8}>0</text>
        <text x={pt(END, r + 12)[0]} y={pt(END, r + 12)[1] + 4}
          textAnchor="middle" fill="#333" fontSize={8}>{max}</text>
      </svg>
      <p style={{ color: "#555", fontSize: 10, letterSpacing: "0.2em", margin: "-8px 0 0" }}>{label}</p>
    </div>
  );
};

/* ── TYRE WIDGET ── */
const TyreWidget = ({ temps, compound }) => {
  const { fl, fr, rl, rr } = temps;
  const compoundColor = COMPOUNDS.find((c) => c.id === compound)?.color || "#e5e7eb";

  const Tyre = ({ temp, label }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: getTyreColor(temp),
        boxShadow: `0 0 14px ${getTyreColor(temp)}88`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#000", fontFamily: "monospace" }}>
          {temp?.toFixed(0) ?? "—"}°
        </span>
      </div>
      <span style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.1em" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{
        background: compoundColor + "22", border: `1px solid ${compoundColor}`,
        borderRadius: 20, padding: "4px 18px", color: compoundColor,
        fontSize: 12, fontFamily: bebas.style.fontFamily, letterSpacing: "0.15em",
      }}>
        {compound.toUpperCase()}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>
        <Tyre temp={fl} label="FL" />
        <Tyre temp={fr} label="FR" />
        <Tyre temp={rl} label="RL" />
        <Tyre temp={rr} label="RR" />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "Cold",    color: "#3b82f6" },
          { label: "Optimal", color: "#22c55e" },
          { label: "Warm",    color: "#f59e0b" },
          { label: "Hot",     color: "#f97316" },
          { label: "Crit",    color: "#ef4444" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color }} />
            <span style={{ fontSize: 9, color: "#4b5563" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── MAIN ── */
export default function Dashboard() {
  const [data, setData]         = useState(null);
  const [compound, setCompound] = useState("soft");
  const [alerts, setAlerts]     = useState([]);
  const [paused, setPaused]     = useState(false);
  const pausedRef               = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const fetch_ = async () => {
      if (pausedRef.current) return;
      try {
        const res = await axios.post(`${BASE_URL}/simulate`, {
          track_state: "high_speed", weather: "dry", setup: "high_downforce",
        });
        setData(res.data);
        const flat = {
          engine_rpm:               res.data.powerunit?.engine_rpm,
          fuel_flow_rate:           res.data.powerunit?.fuel_flow_rate,
          oil_temperature:          res.data.powerunit?.oil_temperature,
          oil_pressure:             res.data.powerunit?.oil_pressure,
          coolant_temperature:      res.data.powerunit?.coolant_temperature,
          mguk_soc:                 res.data.powerunit?.mguk_soc,
          tyre_core_temperature:    res.data.tyres_and_brakes?.tyre_core_temperature,
          tyre_surface_temperature: res.data.tyres_and_brakes?.tyre_surface_temperature,
          tyre_pressure:            res.data.tyres_and_brakes?.tyre_pressure,
          brake_disc_temperature:   res.data.tyres_and_brakes?.brake_disc_temperature,
          brake_fluid_temperature:  res.data.tyres_and_brakes?.brake_fluid_temperature,
        };
        setAlerts(getAlerts(flat));
      } catch (e) { console.error(e); }
    };
    fetch_();
    const id = setInterval(fetch_, 500);
    return () => clearInterval(id);
  }, []);

  const pu = data?.powerunit;
  const tb = data?.tyres_and_brakes;
  const ch = data?.chassis;
  const tyreTemp = tb?.tyre_core_temperature || 0;

  return (
    <div style={s.container}>
      <div style={s.bgRadial} />
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <header style={s.header}>
          <div>
            <p style={s.eyebrow}>AMG PETRONAS F1 TEAM</p>
            <h1 style={{ ...s.title, fontFamily: bebas.style.fontFamily }}>DASHBOARD</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={s.liveChip}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: paused ? "#444" : "#2dd4bf", boxShadow: paused ? "none" : "0 0 8px #2dd4bf" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: paused ? "#444" : "#2dd4bf" }}>
                {paused ? "PAUSED" : "LIVE"}
              </span>
            </div>
            <button onClick={() => setPaused(p => !p)} style={s.pauseBtn}>
              {paused ? "▶ RESUME" : "⏸ PAUSE"}
            </button>
            <Link href="/simulation" style={s.navLink}>← TELEMETRY</Link>
            <Link href="/alerts"     style={s.navLink}>ALERTS →</Link>
          </div>
        </header>

        <div style={s.divider} />

        {/* ALERT BAR */}
        {alerts.length > 0 && (
          <div style={s.alertBar}>
            <span style={{ color: "#ef4444", fontSize: 11, letterSpacing: "0.15em", flexShrink: 0 }}>⚡ ALERT</span>
            <span style={{ width: 1, height: 12, background: "#333", flexShrink: 0 }} />
            {alerts.map((a, i) => (
              <span key={i} style={{ color: a.level === "critical" ? "#ef4444" : "#f97316", fontSize: 11 }}>
                {a.key.replace(/_/g, " ")}: <strong>{a.value?.toFixed(1)}{a.unit}</strong>
              </span>
            ))}
          </div>
        )}

        {/* MAIN GRID */}
        <div style={s.mainGrid}>
          {/* Gauges */}
          <div style={s.card}>
            <p style={{ ...s.cardLabel, fontFamily: bebas.style.fontFamily }}>GAUGES</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
              <Speedometer value={pu?.engine_rpm}          max={16000} label="ENGINE RPM"  unit="RPM"  color={pu?.engine_rpm > 14000 ? "#ef4444" : "#2dd4bf"} />
              <Speedometer value={ch?.wheel_speed_sensors} max={350}   label="WHEEL SPEED" unit="KM/H" color="#a855f7" />
              <Speedometer value={pu?.mguk_soc}            max={100}   label="MGU-K SOC"   unit="%"    color="#22c55e" />
            </div>
          </div>

          {/* Tyres */}
          <div style={s.card}>
            <p style={{ ...s.cardLabel, fontFamily: bebas.style.fontFamily }}>TYRES</p>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
              {COMPOUNDS.map((c) => (
                <button key={c.id} onClick={() => setCompound(c.id)} style={{
                  background: compound === c.id ? c.color + "33" : "transparent",
                  border: `1px solid ${compound === c.id ? c.color : "#1f2937"}`,
                  color: compound === c.id ? c.color : "#4b5563",
                  padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                  fontSize: 11, fontFamily: bebas.style.fontFamily, letterSpacing: "0.1em",
                }}>
                  {c.label}
                </button>
              ))}
            </div>
            <TyreWidget
              compound={compound}
              temps={{ fl: tyreTemp, fr: tyreTemp * 1.02, rl: tyreTemp * 0.97, rr: tyreTemp * 0.99 }}
            />
          </div>
        </div>

        {/* BOTTOM STATS */}
        <div style={s.bottomGrid}>
          {[
            { label: "OIL TEMP",     value: pu?.oil_temperature?.toFixed(1),       unit: "°C"   },
            { label: "COOLANT",      value: pu?.coolant_temperature?.toFixed(1),    unit: "°C"   },
            { label: "OIL PRESSURE", value: pu?.oil_pressure?.toFixed(2),           unit: "bar"  },
            { label: "FUEL FLOW",    value: pu?.fuel_flow_rate?.toFixed(1),         unit: "kg/h" },
            { label: "BRAKE DISC",   value: tb?.brake_disc_temperature?.toFixed(0), unit: "°C"   },
            { label: "TYRE PRESS",   value: tb?.tyre_pressure?.toFixed(2),          unit: "bar"  },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <span style={s.statLabel}>{stat.label}</span>
              <strong style={{ ...s.statValue, fontFamily: bebas.style.fontFamily }}>
                {stat.value ?? "—"} <span style={s.statUnit}>{stat.unit}</span>
              </strong>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const s = {
  container:  { position: "relative", padding: "28px", background: "#050505", minHeight: "100vh", color: "#e5e7eb", overflow: "hidden" },
  bgRadial:   { position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, #0d1a18 0%, #050505 70%)", pointerEvents: "none", zIndex: 0 },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0 },
  eyebrow:    { color: "#2dd4bf", fontSize: 10, letterSpacing: "0.3em", margin: "0 0 4px", fontFamily: "monospace" },
  title:      { fontSize: 48, letterSpacing: "0.08em", margin: 0, lineHeight: 1, background: "linear-gradient(to bottom, #fff 30%, #666)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  liveChip:   { display: "flex", alignItems: "center", gap: 6, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "4px 10px" },
  pauseBtn:   { background: "transparent", border: "1px solid #333", color: "#888", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em" },
  navLink:    { color: "#2dd4bf", textDecoration: "none", border: "1px solid #2dd4bf33", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em" },
  divider:    { height: 1, background: "linear-gradient(to right, transparent, #2dd4bf55, transparent)", margin: "14px 0 20px" },
  alertBar:   { display: "flex", alignItems: "center", gap: 12, background: "#0d0505", border: "1px solid #ef444422", borderRadius: 8, padding: "10px 16px", marginBottom: 20, flexWrap: "wrap" },
  mainGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  card:       { background: "#080808", border: "1px solid #111", borderRadius: 12, padding: "20px" },
  cardLabel:  { fontSize: 13, letterSpacing: "0.2em", color: "#2dd4bf", margin: "0 0 16px" },
  bottomGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 1, background: "#111", borderRadius: 12, overflow: "hidden", border: "1px solid #111" },
  statCard:   { background: "#080808", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  statLabel:  { fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.18em", fontFamily: "monospace" },
  statValue:  { fontSize: 22, color: "#e5e7eb" },
  statUnit:   { fontSize: 11, color: "#2dd4bf" },
};
