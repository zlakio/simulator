"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { THRESHOLDS, getAlerts } from "../simulation/page";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const flattenTelemetry = (data) => ({
  time: new Date().toLocaleTimeString(),
  brake_disc_temperature:   data.tyres_and_brakes?.brake_disc_temperature,
  brake_fluid_temperature:  data.tyres_and_brakes?.brake_fluid_temperature,
  tyre_core_temperature:    data.tyres_and_brakes?.tyre_core_temperature,
  tyre_pressure:            data.tyres_and_brakes?.tyre_pressure,
  tyre_surface_temperature: data.tyres_and_brakes?.tyre_surface_temperature,
  coolant_temperature:      data.powerunit?.coolant_temperature,
  engine_rpm:               data.powerunit?.engine_rpm,
  fuel_flow_rate:           data.powerunit?.fuel_flow_rate,
  mguk_soc:                 data.powerunit?.mguk_soc,
  oil_pressure:             data.powerunit?.oil_pressure,
  oil_temperature:          data.powerunit?.oil_temperature,
});

const LEVEL_STYLE = {
  critical: { color: "#ef4444", icon: "🔴", bg: "#450a0a" },
  warn:     { color: "#f59e0b", icon: "🟡", bg: "#451a03" },
};

const CATEGORY = {
  tyre_core_temperature:    "Tyres",
  tyre_surface_temperature: "Tyres",
  tyre_pressure:            "Tyres",
  brake_disc_temperature:   "Brakes",
  brake_fluid_temperature:  "Brakes",
  coolant_temperature:      "Power Unit",
  oil_temperature:          "Power Unit",
  oil_pressure:             "Power Unit",
  engine_rpm:               "Power Unit",
  fuel_flow_rate:           "Power Unit",
  mguk_soc:                 "ERS",
};

export default function AlertsPage() {
  const [alertLog, setAlertLog]             = useState([]);
  const [filter, setFilter]                 = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paused, setPaused]                 = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const fetchAndLog = async () => {
      if (pausedRef.current) return;
      try {
        const response = await axios.post(`${BASE_URL}/simulate`, {
          track_state: "high_speed",
          weather: "dry",
          setup: "high_downforce",
        });
        const flattened = flattenTelemetry(response.data);
        const newAlerts = getAlerts(flattened);
        if (newAlerts.length) {
          const timestamped = newAlerts.map((a) => ({
            ...a,
            timestamp: new Date().toLocaleTimeString(),
            id: `${Date.now()}-${a.key}-${Math.random()}`,
            category: CATEGORY[a.key] || "Other",
          }));
          setAlertLog((prev) => [...timestamped, ...prev].slice(0, 200));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchAndLog();
    const id = setInterval(fetchAndLog, 500);
    return () => clearInterval(id);
  }, []);

  const categories = ["all", ...new Set(Object.values(CATEGORY))];

  const filtered = alertLog.filter((a) => {
    const levelOk    = filter === "all"         || a.level === filter;
    const categoryOk = categoryFilter === "all" || a.category === categoryFilter;
    return levelOk && categoryOk;
  });

  const criticalCount = alertLog.filter((a) => a.level === "critical").length;
  const warnCount     = alertLog.filter((a) => a.level === "warn").length;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
      <div style={{ height: 1, background: "linear-gradient(to right, transparent, #2dd4bf55, transparent)", margin: "14px 0 24px" }} />
        <div>
        <p style={{ color: "#2dd4bf", fontSize: 10, letterSpacing: "0.3em", margin: "0 0 4px", fontFamily: "monospace" }}>AMG PETRONAS F1 TEAM</p>
          <h1 style={styles.title}>ALERT LOG</h1>
          <p style={styles.subtitle}>Full telemetry warning history</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/simulation" style={styles.navLink}>← Dashboard</Link>
          <button onClick={() => setPaused((p) => !p)} style={{
            ...styles.pauseBtn,
            background: paused ? "#064e3b" : "#7f1d1d",
            borderColor: paused ? "#2dd4bf" : "#ef4444",
            color:       paused ? "#2dd4bf" : "#ef4444",
          }}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Alerts</span>
          <strong style={styles.summaryValue}>{alertLog.length}</strong>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: "#ef4444" }}>
          <span style={styles.summaryLabel}>Critical</span>
          <strong style={{ ...styles.summaryValue, color: "#ef4444" }}>{criticalCount}</strong>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: "#f59e0b" }}>
          <span style={styles.summaryLabel}>Warnings</span>
          <strong style={{ ...styles.summaryValue, color: "#f59e0b" }}>{warnCount}</strong>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Showing</span>
          <strong style={styles.summaryValue}>{filtered.length}</strong>
        </div>
      </div>

      {/* FILTERS */}
      <div style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>SEVERITY</span>
          {["all", "critical", "warn"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
              {f === "all" ? "All" : f === "critical" ? "🔴 Critical" : "🟡 Warning"}
            </button>
          ))}
        </div>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>SYSTEM</span>
          {categories.map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              style={{ ...styles.filterBtn, ...(categoryFilter === c ? styles.filterActive : {}) }}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span style={{ width: 90 }}>TIME</span>
          <span style={{ width: 90 }}>LEVEL</span>
          <span style={{ width: 100 }}>SYSTEM</span>
          <span style={{ flex: 1 }}>SENSOR</span>
          <span style={{ width: 100, textAlign: "right" }}>VALUE</span>
        </div>

        {filtered.length === 0 && (
          <div style={styles.emptyState}>No alerts match the current filter.</div>
        )}

        {filtered.map((a) => {
          const s = LEVEL_STYLE[a.level];
          return (
            <div key={a.id} style={{ ...styles.tableRow, background: s.bg }}>
              <span style={{ ...styles.cell, width: 90,  color: "#94a3b8" }}>{a.timestamp}</span>
              <span style={{ ...styles.cell, width: 90,  color: s.color, fontWeight: 700 }}>
                {s.icon} {a.level.toUpperCase()}
              </span>
              <span style={{ ...styles.cell, width: 100, color: "#e2e8f0" }}>{a.category}</span>
              <span style={{ ...styles.cell, flex: 1,    color: "#f1f5f9" }}>
                {a.key.replace(/_/g, " ")}
              </span>
              <span style={{ ...styles.cell, width: 100, textAlign: "right", color: s.color, fontWeight: 700 }}>
                {typeof a.value === "number" ? a.value.toFixed(2) : a.value}{a.unit}
              </span>
            </div>
          );
        })}
      </div>

      {alertLog.length >= 200 && (
        <p style={{ color: "#475569", fontSize: 11, textAlign: "center", marginTop: 12 }}>
          Showing latest 200 alerts
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "28px",
    background: "#050505",
    minHeight: "100vh",
    color: "#e5e7eb",
    fontFamily: "monospace",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 0,
  },
  title: {
    fontSize: 48,
    letterSpacing: "0.15em",
    color: "#f9fafb",
    margin: 0,
    background: "linear-gradient(to bottom, #ffffff 30%, #888888)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#2dd4bf",
    fontSize: 10,
    margin: "4px 0 0",
    letterSpacing: "0.3em",
  },
  navLink: {
    color: "#2dd4bf",
    textDecoration: "none",
    border: "1px solid #2dd4bf33",
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 11,
    letterSpacing: "0.1em",
  },
  pauseBtn: {
    padding: "6px 16px",
    borderRadius: 6,
    border: "1px solid",
    cursor: "pointer",
    fontSize: 11,
    letterSpacing: "0.1em",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 1,
    marginBottom: 20,
    background: "#111",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #111",
  },
  summaryCard: {
    background: "#080808",
    border: "none",
    borderRadius: 0,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  summaryLabel: { fontSize: 9, color: "#444", letterSpacing: "0.18em", textTransform: "uppercase" },
  summaryValue: { fontSize: 32, color: "#f1f5f9" },
  filterRow: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: 9,
    color: "#444",
    letterSpacing: "0.15em",
    width: 60,
    textTransform: "uppercase",
  },
  filterBtn: {
    background: "transparent",
    border: "1px solid #1a1a1a",
    color: "#555",
    padding: "5px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 11,
    letterSpacing: "0.06em",
  },
  filterActive: {
    background: "#2dd4bf22",
    color: "#2dd4bf",
    borderColor: "#2dd4bf",
  },
  table: {
    background: "#080808",
    borderRadius: 12,
    border: "1px solid #111",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    padding: "10px 16px",
    borderBottom: "1px solid #111",
    fontSize: 9,
    color: "#333",
    letterSpacing: "0.15em",
    gap: 12,
    textTransform: "uppercase",
  },
  tableRow: {
    display: "flex",
    padding: "10px 16px",
    borderBottom: "1px solid #0a0a0a",
    fontSize: 12,
    gap: 12,
    alignItems: "center",
  },
  cell: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#333",
    fontSize: 12,
    letterSpacing: "0.15em",
  },
};