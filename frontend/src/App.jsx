import React, { useState, useEffect, useRef, useMemo, useCallback, useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  LabelList,
} from "recharts";

class PortalErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("CampusPilot crash:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", color: "#eee", background: "#1a1a1a", minHeight: "100vh" }}>
          <h2 style={{ color: "#ff6b6b" }}>Something broke in the {this.props.label || "app"}</h2>
          <p>{String(this.state.error && this.state.error.message)}</p>
          <pre style={{ whiteSpace: "pre-wrap", opacity: 0.7 }}>{this.state.error && this.state.error.stack}</pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: "8px 16px" }}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ICONS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  book: "M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4Z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  briefcase: "M4 8h16v11H4zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16",
  mail: "M4 6h16v12H4zM4 6l8 7 8-7",
  gear: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19.5a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 8.5 4l.1.1a1.7 1.7 0 0 0 1.9.3H10.6a1.7 1.7 0 0 0 1-1.5V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H19.5a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 17-5.6-5.6",
  bell: "M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Zm4.5 9a1.5 1.5 0 0 0 3 0",
  chevronDown: "M6 9l6 6 6-6",
  arrowUpRight: "M7 17 17 7M9 7h8v8",
  check: "M5 13l4.5 4.5L19 8",
  clock: "M12 7v5l3.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  calendar: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2M14 17h2",
  chat: "M4 5h16v11H8l-4 4Z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z M9 12l2 2 4-4",
  rupee: "M6 4h11M6 8h11M6 4c5 0 8 2 8 4.5S13 13 6 13l8 8",
  barchart: "M5 20V10M11 20V4M17 20v-7",
  inbox: "M4 5h16v14H4Z M4 12h5l2 3h2l2-3h5",
  forum: "M4 5h11v8H9l-3 3v-3H4zM13 9h7v7h-3v3l-3-3h-1z",
  clipboard: "M8 4h8v3H8zM6 6h12v15H6ZM9 12h6M9 16h6",
  upload: "M12 16V6M8 10l4-4 4 4M4 18h16",
  folder: "M4 6h6l2 2h8v11H4Z",
  chevronRight: "M9 6l6 6-6 6",
  home: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z",
  minus: "M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  sun: "M12 3v2.4M12 18.6V21M5 5l1.7 1.7M17.3 17.3 19 19M3 12h2.4M18.6 12H21M5 19l1.7-1.7M17.3 6.7 19 5M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
  lock: "M6 10.5V8a6 6 0 0 1 12 0v2.5M5 10.5h14v10H5Z",
  user: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM4 21c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 20c.6-3.4 3.4-5.5 7-5.5s6.4 2.1 7 5.5M17 8.5a3 3 0 1 0 0-6M22 20c-.4-2.3-1.7-4-3.7-4.8",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  cap: "M12 3 2 8l10 5 10-5-10-5Z M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5 M22 8v5",
  plus: "M12 5v14M5 12h14",
  camera: "M4 8h3l2-3h6l2 3h3v11H4Z M12 12a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
  wallet: "M3 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11M16 13h3",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  building: "M6 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16M3 21h18M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1",
  alert: "M12 9v3m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff: "M3 3l18 18 M10.6 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.9 17.9 0 0 1-3.5 4.4M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2",
  clipboardCheck: "M8 4h8v3H8zM6 6h12v15H6ZM9 13.5l2 2 4-4.5",
};
function Icon({ name, size = 18, strokeWidth = 1.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] || ""} />
    </svg>
  );
}

function BrandMark({ size = 26 }) {
  return (
    <span className="cp-logo-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="cpLogoGrad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3C0" />
            <stop offset="52%" stopColor="#2C7FBE" />
            <stop offset="100%" stopColor="#233E68" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11.5" fill="url(#cpLogoGrad)" />
        <path d="M20 9.5 L32.5 15 L20 20.5 L7.5 15 Z" fill="#fff" fillOpacity="0.96" />
        <path d="M13.2 17.3v6c0 1.9 3 3.4 6.8 3.4s6.8-1.5 6.8-3.4v-6" stroke="#fff" strokeOpacity="0.96" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32.5 15v6.9" stroke="#fff" strokeOpacity="0.96" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32.5" cy="23.6" r="1.5" fill="#fff" fillOpacity="0.96" />
      </svg>
    </span>
  );
}

function PortalLoading({ label = "your data" }) {
  return (
    <div className="cp-portal-loading">
      <div className="cp-portal-loading-spinner" />
      <div className="cp-portal-loading-text">Loading {label}…</div>
    </div>
  );
}

function SectionLoading({ label = "Loading…" }) {
  return <div className="cp-section-loading"><span className="cp-spinner cp-spinner--sm" />{label}</div>;
}

function uid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); }
function nowMs() { return Date.now(); }
function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const realtimeBus = (() => {
  const listeners = {};
  return {
    on(channel, fn) {
      (listeners[channel] = listeners[channel] || []).push(fn);
      return () => { listeners[channel] = (listeners[channel] || []).filter((f) => f !== fn); };
    },
    emit(channel, payload) { (listeners[channel] || []).forEach((fn) => fn(payload)); },
  };
})();
setInterval(() => realtimeBus.emit("heartbeat", { ts: nowMs() }), 4000);

const LIVE_SYNC_ENABLED = false;

const DB = {
  users: [
    { id: "u_admin1", name: "Meera Iyer", email: "admin@campuspilot.edu", password: "admin123", role: "admin", idLabel: "ADM-001", status: "active" },
    { id: "u_teach1", name: "Dr. Priya Sharma", email: "priya@campuspilot.edu", password: "teach123", role: "teacher", idLabel: "STF-114", status: "active",
      phone: "+91 98200 11234", department: "Computer Science", designation: "Associate Professor", qualification: "Ph.D. in Computer Science, IIT Delhi",
      joined: "12 Jul 2018", office: "Block B, Room 214", bio: "Teaches data structures & algorithms; research interests in graph theory and competitive programming pedagogy." },
    { id: "u_teach2", name: "Prof. Arjun Kapoor", email: "arjun@campuspilot.edu", password: "teach123", role: "teacher", idLabel: "STF-092", status: "active",
      phone: "+91 98450 88213", department: "Computer Science", designation: "Assistant Professor", qualification: "M.Tech in Database Systems, IIT Bombay",
      joined: "3 Jan 2021", office: "Block B, Room 118", bio: "Handles database systems labs; maintains the department's applied-DB research group." },
    { id: "u_stu1", name: "Rohan Mehta", email: "rohan@campuspilot.edu", password: "student123", role: "student", idLabel: "CS21B045", status: "active" },
    { id: "u_stu2", name: "Ananya Rao", email: "ananya@campuspilot.edu", password: "student123", role: "student", idLabel: "CS21B012", status: "active" },
    { id: "u_stu3", name: "Kabir Singh", email: "kabir@campuspilot.edu", password: "student123", role: "student", idLabel: "CS21B078", status: "active" },
    { id: "u_stu4", name: "Diya Nair", email: "diya@campuspilot.edu", password: "student123", role: "student", idLabel: "CS21B033", status: "active" },
    { id: "u_stu5", name: "Zoya Khan", email: "zoya@campuspilot.edu", password: "student123", role: "student", idLabel: "CS21B061", status: "active" },
  ],
  courses: [
    { id: "c1", code: "CS301", name: "Data Structures", dept: "Computer Science", faculty: "Dr. Priya Sharma", students: 5 },
    { id: "c2", code: "CS315", name: "Database Systems", dept: "Computer Science", faculty: "Prof. Arjun Kapoor", students: 5 },
    { id: "c3", code: "MA201", name: "Discrete Mathematics", dept: "Mathematics", faculty: "Dr. Ritu Nair", students: 5 },
  ],
  fees: [
    { id: "f1", student: "Rohan Mehta", total: 85000, paid: 85000, status: "paid" },
    { id: "f2", student: "Ananya Rao", total: 85000, paid: 40000, status: "partial" },
    { id: "f3", student: "Kabir Singh", total: 85000, paid: 0, status: "overdue" },
    { id: "f4", student: "Diya Nair", total: 85000, paid: 85000, status: "paid" },
    { id: "f5", student: "Zoya Khan", total: 85000, paid: 60000, status: "partial" },
  ],
  attendance: [],
  grades: [],
  assignments: [
    { id: "a1", title: "Binary Trees — Problem Set 4", course: "Data Structures", due: "2 Sep", status: "pending" },
    { id: "a2", title: "Normalization Exercise", course: "Database Systems", due: "30 Aug", status: "submitted" },
    { id: "a3", title: "Counting & Recurrences Sheet", course: "Discrete Mathematics", due: "5 Sep", status: "pending" },
  ],
  notices: [
    { tag: "Notice", date: "22 Aug", title: "Practical exam schedule for CS301 has been posted." },
    { tag: "Event", date: "20 Aug", title: "Campus tech fest registrations open this week." },
    { tag: "Library", date: "18 Aug", title: "Extended library hours during exam season." },
  ],
  studyMaterials: [
    { id: "mat1", title: "Unit 3 — Trees & Graphs, full notes", course: "Data Structures", type: "PDF", uploadedBy: "Dr. Priya Sharma", ts: nowMs() - 86400000 * 4, size: "2.4 MB" },
    { id: "mat2", title: "Lab Manual — Joins, Views & Indexing", course: "Database Systems", type: "PDF", uploadedBy: "Prof. Arjun Kapoor", ts: nowMs() - 86400000 * 6, size: "1.1 MB" },
    { id: "mat3", title: "Recurrence Relations — slide deck", course: "Discrete Mathematics", type: "PPT", uploadedBy: "Dr. Ritu Nair", ts: nowMs() - 86400000 * 2, size: "3.8 MB" },
    { id: "mat4", title: "Assignment 3 reference solutions", course: "Data Structures", type: "PDF", uploadedBy: "Dr. Priya Sharma", ts: nowMs() - 86400000, size: "640 KB" },
  ],
  classNotices: [
    { id: "cn1", title: "Practical exam rescheduled to 2 Sep, bring lab records", course: "Data Structures", sentBy: "Dr. Priya Sharma", ts: nowMs() - 86400000 * 2 },
    { id: "cn2", title: "Submit ER-diagram assignment files before Friday 6pm", course: "Database Systems", sentBy: "Prof. Arjun Kapoor", ts: nowMs() - 86400000 },
  ],
  leaveRequests: [
    { id: "lv1", applicant: "Dr. Priya Sharma", role: "teacher", type: "Conference", from: "2026-08-28", to: "2026-08-29", reason: "Presenting a paper at a national CS education conference.", status: "pending", ts: nowMs() - 3600000 * 20 },
    { id: "lv2", applicant: "Dr. Priya Sharma", role: "teacher", type: "Medical", from: "2026-07-10", to: "2026-07-11", reason: "Fever, advised rest by physician.", status: "approved", ts: nowMs() - 86400000 * 40 },
  ],
  placements: [
    { id: "pl1", company: "Nexora Systems", role: "Software Engineer Intern", package: "₹8 LPA", location: "Bengaluru", minCGPA: 7.5, minAttendance: 75, deadline: "5 Sep", postedBy: "Meera Iyer", status: "open", ts: nowMs() - 86400000 * 3 },
    { id: "pl2", company: "Vantage Analytics", role: "Data Analyst", package: "₹6.5 LPA", location: "Pune", minCGPA: 7, minAttendance: 70, deadline: "10 Sep", postedBy: "Meera Iyer", status: "open", ts: nowMs() - 86400000 * 2 },
    { id: "pl3", company: "Orbit Cloud", role: "Backend Developer", package: "₹9.2 LPA", location: "Hyderabad", minCGPA: 8, minAttendance: 80, deadline: "1 Sep", postedBy: "Meera Iyer", status: "open", ts: nowMs() - 86400000 },
  ],
  placementApplications: [],
  subjectRequests: [],
  libraryRequests: [],
  grievances: [
    { id: "grv1", raisedBy: "Rohan Mehta", role: "student", category: "Infrastructure",
      description: "Wi-Fi has been down in Block B library for three days, can't access online course material.",
      status: "open", assignedTo: null, ts: nowMs() - 3600000 * 6 },
    { id: "grv2", raisedBy: "Ananya Rao", role: "student", category: "Academic",
      description: "My CS315 lab attendance for 14 Aug was marked absent even though I attended — please recheck.",
      status: "in-review", assignedTo: "Meera Iyer", ts: nowMs() - 86400000 * 2 },
    { id: "grv3", raisedBy: "Kabir Singh", role: "student", category: "Fees & Finance",
      description: "Paid the partial fee installment on 10 Aug but the portal still shows it as overdue.",
      status: "resolved", assignedTo: "Meera Iyer", ts: nowMs() - 86400000 * 6 },
  ],
  auditLog: [],
  notifications: [],
};

function pushAudit({ actor, actorRole, action, detail }) {
  const entry = { id: uid("log"), actor, actorRole, action, detail, ts: nowMs() };
  DB.auditLog.unshift(entry);
  DB.auditLog = DB.auditLog.slice(0, 200);
  realtimeBus.emit("audit:new", entry);
  return entry;
}
function pushNotification({ toRole, title, body }) {
  const n = { id: uid("ntf"), toRole, title, body, ts: nowMs(), read: false };
  DB.notifications.unshift(n);
  realtimeBus.emit("notification:new", n);
  return n;
}
const SYSTEM_EVENTS = ["Nightly database backup completed", "Scheduled report generation finished", "Fee reminder batch sent", "Session cleanup job completed"];
setInterval(() => {
  pushAudit({ actor: "System", actorRole: "system", action: "Automated job", detail: SYSTEM_EVENTS[Math.floor(Math.random() * SYSTEM_EVENTS.length)] });
}, 25000);

const LATENCY = 380;
function delay(v) { return new Promise((res) => setTimeout(() => res(v), LATENCY)); }

function raiseGrievanceGeneric(payload, actor) {
  const g = {
    id: uid("grv"), raisedBy: actor.name, role: actor.role,
    category: payload.category, description: payload.description,
    status: "open", assignedTo: null, ts: nowMs(),
  };
  DB.grievances.unshift(g);
  pushAudit({ actor: actor.name, actorRole: actor.role, action: "Grievance raised", detail: `${g.category} — ${g.description.slice(0, 60)}${g.description.length > 60 ? "…" : ""}` });
  pushNotification({ toRole: "admin", title: "New grievance submitted", body: `${actor.name} raised a ${g.category.toLowerCase()} grievance.` });
  realtimeBus.emit("grievance:update", g);
  return delay(g);
}
function listMyGrievancesGeneric(raisedByName) {
  return delay(DB.grievances.filter((g) => g.raisedBy === raisedByName).map((g) => ({ ...g })));
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_SLOTS = ["9:00 AM", "10:00 AM", "11:15 AM", "12:30 PM", "2:00 PM", "3:15 PM"];
const ROOMS = ["B-204", "Lab 3", "A-102", "B-118", "C-210", "Lab 1"];

function buildTimetable(courses) {
  const grid = Object.fromEntries(WEEKDAYS.map((d) => [d, []]));
  if (!courses.length) return grid;
  let slotCursor = 0;
  courses.forEach((course, ci) => {
    const sessionsPerWeek = 3;
    for (let s = 0; s < sessionsPerWeek; s++) {
      const dayIdx = (ci * 2 + s * 2 + 1) % WEEKDAYS.length;
      const day = WEEKDAYS[dayIdx];
      const slot = DAY_SLOTS[slotCursor % DAY_SLOTS.length];
      grid[day].push({ time: slot, course: course.name, code: course.code, room: ROOMS[(ci + s) % ROOMS.length] });
      slotCursor++;
    }
  });
  WEEKDAYS.forEach((d) => grid[d].sort((a, b) => DAY_SLOTS.indexOf(a.time) - DAY_SLOTS.indexOf(b.time)));
  return grid;
}

function gradeDistribution(entries) {
  const bands = [{ label: "A", min: 85 }, { label: "B", min: 70 }, { label: "C", min: 55 }, { label: "D", min: 40 }, { label: "F", min: 0 }];
  const counts = bands.map((b) => ({ label: b.label, value: 0 }));
  entries.forEach((e) => {
    const idx = bands.findIndex((b) => e.score >= b.min);
    if (idx >= 0) counts[idx].value += 1;
  });
  return counts;
}

const GRIEVANCE_CATEGORIES_STUDENT = ["Academic", "Hostel", "Fees & Finance", "Ragging / Harassment", "Infrastructure", "Other"];
const GRIEVANCE_CATEGORIES_TEACHER = ["Academic / Curriculum", "Timetable & Workload", "Payroll & HR", "Infrastructure & Labs", "Harassment / Workplace Conduct", "Administrative Support", "Other"];
const GRIEVANCE_CATEGORIES_ALL = Array.from(new Set([...GRIEVANCE_CATEGORIES_STUDENT, ...GRIEVANCE_CATEGORIES_TEACHER]));

function autoClassifyGrievance(text, role = "student") {
  const t = text.toLowerCase();
  const studentRules = [
    { category: "Ragging / Harassment", keywords: ["harass", "bully", "ragging", "misconduct", "discriminat", "abuse", "threat"] },
    { category: "Hostel", keywords: ["hostel", "warden", "roommate", "mess food", "dormitory"] },
    { category: "Fees & Finance", keywords: ["fee", "payment", "refund", "scholarship", "invoice", "overdue", "installment"] },
    { category: "Infrastructure", keywords: ["wifi", "wi-fi", "internet", "projector", "washroom", "toilet", "electricity", "ac ", "classroom", "lab equipment"] },
    { category: "Academic", keywords: ["exam", "marks", "grade", "attendance", "lecture", "syllabus", "assignment", "faculty", "professor"] },
  ];
  const teacherRules = [
    { category: "Harassment / Workplace Conduct", keywords: ["harass", "bully", "misconduct", "discriminat", "abuse", "threat"] },
    { category: "Payroll & HR", keywords: ["salary", "payroll", "payslip", "reimbursement", "provident fund", " pf ", "leave balance", "increment"] },
    { category: "Timetable & Workload", keywords: ["timetable", "schedule", "workload", "overloaded", "clash", "back-to-back", "substitution"] },
    { category: "Infrastructure & Labs", keywords: ["wifi", "wi-fi", "internet", "projector", "lab equipment", "staffroom", "electricity", "classroom", "ac "] },
    { category: "Academic / Curriculum", keywords: ["syllabus", "curriculum", "exam duty", "invigilation", "grading policy", "academic calendar"] },
    { category: "Administrative Support", keywords: ["admin", "paperwork", "approval", "hr department"] },
  ];
  const rules = role === "teacher" ? teacherRules : studentRules;
  for (const rule of rules) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.category;
  }
  return "Other";
}

const RISK_WEIGHTS = { attendance: 0.45, score: 0.35, fee: 0.20 };
const RISK_THRESHOLDS = { low: 75, medium: 50 };

function feeComponentFor(feeStatus) {
  if (feeStatus === "paid") return 100;
  if (feeStatus === "partial") return 50;
  if (feeStatus === "overdue") return 0;
  return 75;
}

function computeRiskScore({ attendancePct = 0, avgScore = 0, feeStatus }) {
  const feeComponent = feeComponentFor(feeStatus);
  const healthScore = Math.round(
    RISK_WEIGHTS.attendance * attendancePct +
    RISK_WEIGHTS.score * avgScore +
    RISK_WEIGHTS.fee * feeComponent
  );
  const riskLevel = healthScore >= RISK_THRESHOLDS.low ? "low" : healthScore >= RISK_THRESHOLDS.medium ? "medium" : "high";

  const reasons = [];
  if (attendancePct < 75) reasons.push(`Attendance ${attendancePct}% (below 75%)`);
  if (avgScore < 50) reasons.push(`Avg. score ${avgScore}/100 (below 50)`);
  if (feeStatus === "overdue") reasons.push("Fee overdue");
  else if (feeStatus === "partial") reasons.push("Fee partially paid");
  if (!reasons.length) reasons.push("No risk factors flagged");

  return { healthScore, riskLevel, reasons, feeComponent };
}

function withRiskScores(records) {
  return records.map((r) => ({ ...r, ...computeRiskScore(r) }));
}

function riskSummaryCounts(scoredRecords) {
  return {
    total: scoredRecords.length,
    low: scoredRecords.filter((r) => r.riskLevel === "low").length,
    medium: scoredRecords.filter((r) => r.riskLevel === "medium").length,
    high: scoredRecords.filter((r) => r.riskLevel === "high").length,
  };
}

function feeStatusForStudentName(name) {
  return (DB.fees.find((f) => f.student === name) || {}).status || "unknown";
}

const RISK_FORMULA_TEXT =
  "Placeholder heuristic, not a trained ML model. Health score = 45% attendance + 35% average score + 20% fee status " +
  "(paid=100, partial=50, overdue=0). Score ≥75 = Low, 50–74 = Medium, <50 = High.";

function passwordStrength(pw) {
  if (!pw) return { label: "", pct: 0, tone: "" };
  let score = 0;
  if (pw.length >= 4) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (pw.length < 4) return { label: "Too short — use at least 4 characters", pct: 15, tone: "weak" };
  if (score <= 2) return { label: "Weak — try adding numbers or symbols", pct: 40, tone: "weak" };
  if (score <= 3) return { label: "Okay — a bit longer would help", pct: 65, tone: "mid" };
  if (score === 4) return { label: "Good", pct: 85, tone: "good" };
  return { label: "Strong", pct: 100, tone: "strong" };
}

function PasswordStrengthHint({ password }) {
  const s = passwordStrength(password);
  if (!password) {
    return <div className="a2-pw-hint a2-pw-hint--idle">Use at least 4 characters — 8+ with a mix of letters, numbers and symbols is stronger.</div>;
  }
  return (
    <div className="a2-pw-hint">
      <div className="a2-pw-bar"><div className={`a2-pw-bar-fill a2-pw-bar-fill--${s.tone}`} style={{ width: `${s.pct}%` }} /></div>
      <span className={`a2-pw-label a2-pw-label--${s.tone}`}>{s.label}</span>
    </div>
  );
}

const API_BASE =
  (typeof window !== "undefined" && window.__CAMPUSPILOT_API__) || "http://127.0.0.1:8000";

let authToken = null;
try { authToken = localStorage.getItem("cp_token") || null; } catch { authToken = null; }

function setAuthToken(token) {
  authToken = token || null;
  try {
    if (token) localStorage.setItem("cp_token", token);
    else localStorage.removeItem("cp_token");
  } catch {  }
}

async function apiFetch(path, { method = "GET", body, qs } = {}) {
  let url = `${API_BASE}${path}`;
  if (qs) {
    const params = new URLSearchParams();
    Object.entries(qs).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") params.set(k, v); });
    const q = params.toString();
    if (q) url += `?${q}`;
  }
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = {};
  // FormData bodies (file uploads) must NOT get a manual Content-Type — the
  // browser sets one itself with the correct multipart boundary. Setting it
  // here would produce a boundary-less header and the server can't parse
  // the upload at all.
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body) });
  } catch (e) {
    throw new Error(`Can't reach the CampusPilot backend at ${API_BASE}. Is "uvicorn app.main:app" running? (${e.message})`);
  }

  const text = await res.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }

  if (!res.ok) {
    const detail = data && typeof data === "object" ? data.detail : null;
    const msg = (typeof detail === "string" && detail) || (typeof data === "string" && data) || `Request failed (${res.status})`;
    if (res.status === 401 && authToken) {
      // The token we sent was rejected (expired, or the account behind it
      // is gone) — previously this just left the stale token in place, so
      // every subsequent call kept failing the same way with no way back
      // to the login screen short of manually clicking "Log out". Clear it
      // and tell the app to bounce back to AuthScreen.
      setAuthToken(null);
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("cp:session-expired"));
    }
    throw new Error(msg);
  }
  return data;
}

const api = {
  auth: {

    async login(email, password, role) {
      const data = await apiFetch("/auth/login", { method: "POST", body: { email, password, role } });
      setAuthToken(data.token);
      return data.user;
    },

    async signup(record) {
      const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: { name: record.name, email: record.email, password: record.password, role: record.role, idLabel: record.idLabel },
      });
      setAuthToken(data.token);
      pushAudit({ actor: record.name, actorRole: record.role, action: "Account created", detail: `Signed up as ${record.role}` });
      return data.user;
    },
    // Restores a session from a saved token (e.g. after a page refresh)
    // instead of forcing a fresh login. Returns null (no throw) if there's
    // no token to restore, so callers can just check the result.
    async me() {
      if (!authToken) return null;
      return apiFetch("/auth/me");
    },
    logout() { setAuthToken(null); },
  },
  admin: {
    listUsers: () => apiFetch("/admin/users"),
    async createUser(u, actor) {
      const user = await apiFetch("/admin/users", {
        method: "POST",
        body: { name: u.name, email: u.email, role: u.role, idLabel: u.idLabel, department: u.department, designation: u.designation, phone: u.phone },
      });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "User created", detail: `${user.name} (${user.role})` });
      return user;
    },
    async setUserStatus(id, status, actor) {
      const u = await apiFetch(`/admin/users/${id}/status`, { method: "PATCH", body: { status } });
      pushAudit({ actor: actor.name, actorRole: "admin", action: status === "active" ? "User reactivated" : "User deactivated", detail: u.name });
      return u;
    },
    listCourses: () => apiFetch("/admin/courses"),
    async createCourse(c, actor) {
      const course = await apiFetch("/admin/courses", { method: "POST", body: { code: c.code, name: c.name, dept: c.dept, faculty: c.faculty } });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Course created", detail: `${course.code} — ${course.name}` });
      return course;
    },
    listSubjectRequests: () => apiFetch("/admin/subject-requests"),
    async approveSubjectRequest(id, actor) {
      const req = await apiFetch(`/admin/subject-requests/${id}/approve`, { method: "POST" });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Subject request approved", detail: `${req.code} — ${req.name} → ${req.teacherName}` });
      pushNotification({ toRole: "teacher", title: "Subject request approved", body: `${req.code} — ${req.name} was added to your subjects.` });
      realtimeBus.emit("subjectRequest:update", req);
      return req;
    },
    async rejectSubjectRequest(id, reason, actor) {
      const req = await apiFetch(`/admin/subject-requests/${id}/reject`, { method: "POST", body: { reason: reason || "" } });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Subject request rejected", detail: `${req.code} — ${req.name}` });
      pushNotification({ toRole: "teacher", title: "Subject request declined", body: reason ? `${req.code} — ${req.name}: ${reason}` : `${req.code} — ${req.name} was not approved.` });
      realtimeBus.emit("subjectRequest:update", req);
      return req;
    },
    listFees: () => apiFetch("/admin/fees"),
    async markFeePaid(id, actor) {
      const f = await apiFetch(`/admin/fees/${id}/mark-paid`, { method: "POST" });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Fee marked paid", detail: f.student });
      return f;
    },
    reportsSummary: () => apiFetch("/admin/reports/summary"),
    listAuditLog: () => apiFetch("/admin/audit-log"),
    listGrievances: () => apiFetch("/admin/grievances"),
    async assignGrievance(id, assignee, actor) {
      const g = await apiFetch(`/admin/grievances/${id}/assign`, { method: "POST", body: { assignee } });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Grievance assigned", detail: `${g.category} → ${assignee}` });
      realtimeBus.emit("grievance:update", g);
      return g;
    },
    async resolveGrievance(id, actor) {
      const g = await apiFetch(`/admin/grievances/${id}/resolve`, { method: "POST" });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Grievance resolved", detail: g.category });
      pushNotification({ toRole: g.role, title: "Grievance resolved", body: `Your ${g.category.toLowerCase()} grievance has been resolved.` });
      realtimeBus.emit("grievance:update", g);
      return g;
    },

    riskScores: () => apiFetch("/admin/risk-scores"),
  },
  teacher: {
    myCourses: (_teacherName) => apiFetch("/teacher/courses"),
    roster: () => apiFetch("/teacher/roster"),

    // photoFile is optional — omit it (or pass nothing) to get simulated
    // demo detections without ever needing a real photo. Passing a real
    // File runs it through server-side OCR (app/ai/attendance_ocr.py) if
    // Tesseract is installed there, falling back to simulation otherwise;
    // either way the response's `source` field says honestly which one ran.
    ocrProcessAttendance: (photoFile) => {
      if (!photoFile) return apiFetch("/teacher/attendance/ocr", { method: "POST" });
      const form = new FormData();
      form.append("file", photoFile, photoFile.name);
      return apiFetch("/teacher/attendance/ocr", { method: "POST", body: form });
    },
    async markAttendance(courseId, courseLabel, records, actor, date) {
      const session = await apiFetch("/teacher/attendance", { method: "POST", body: { courseId, courseLabel, records, date } });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Attendance published", detail: `${courseLabel} · ${records.filter((r) => r.present).length}/${records.length} present` });
      pushNotification({ toRole: "student", title: "Attendance updated", body: `${courseLabel} attendance was just marked.` });
      realtimeBus.emit("attendance:update", session);
      return session;
    },
    async publishGrades(courseId, courseLabel, assessment, entries, actor) {
      const record = await apiFetch("/teacher/grades", { method: "POST", body: { courseId, courseLabel, assessment, entries } });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Grades published", detail: `${courseLabel} · ${assessment}` });
      pushNotification({ toRole: "student", title: "Grades published", body: `${assessment} results for ${courseLabel} are out.` });
      realtimeBus.emit("grades:update", record);
      return record;
    },

    getProfile: (_userId) => apiFetch("/teacher/profile"),
    async updateProfile(_userId, patch, actor) {
      const u = await apiFetch("/teacher/profile", { method: "PATCH", body: patch });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Profile updated", detail: Object.keys(patch).join(", ") });
      return u;
    },

    subjects: (_teacherName) => apiFetch("/teacher/subjects"),

    async requestSubject(payload, actor) {
      const req = await apiFetch("/teacher/subject-requests", {
        method: "POST",
        body: { code: payload.code.trim(), name: payload.name.trim(), dept: (payload.dept || "General").trim(), notes: payload.notes ? payload.notes.trim() : "" },
      });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Subject requested", detail: `${req.code} — ${req.name}` });
      pushNotification({ toRole: "admin", title: "New subject request", body: `${actor.name} requested to add ${req.code} — ${req.name}.` });
      realtimeBus.emit("subjectRequest:update", req);
      return req;
    },
    mySubjectRequests: (_teacherName) => apiFetch("/teacher/subject-requests/mine"),

    studentsWithStats: (courseIds) => apiFetch("/teacher/students", { qs: { courseIds: (courseIds || []).join(",") } }),

    riskScores: (courseIds) => apiFetch("/teacher/risk-scores", { qs: { courseIds: (courseIds || []).join(",") } }),

    listAssignments: (courseNames) => apiFetch("/teacher/assignments", { qs: { courses: (courseNames || []).join(",") } }),
    async createAssignment(payload, actor) {
      const a = await apiFetch("/teacher/assignments", { method: "POST", body: { title: payload.title, course: payload.course, due: payload.due } });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Assignment created", detail: `${a.title} · ${a.course}` });
      pushNotification({ toRole: "student", title: "New assignment posted", body: `${a.title} (${a.course}) — due ${a.due}.` });
      return a;
    },

    listMaterial: (courseNames) => apiFetch("/teacher/materials", { qs: { courses: (courseNames || []).join(",") } }),
    async uploadMaterial(payload, actor) {
      const m = await apiFetch("/teacher/materials", { method: "POST", body: { title: payload.title, course: payload.course, type: payload.type, size: payload.size } });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Study material uploaded", detail: `${m.title} · ${m.course}` });
      pushNotification({ toRole: "student", title: "New study material", body: `${m.title} was added for ${m.course}.` });
      return m;
    },

    timetable: (_courses) => apiFetch("/teacher/timetable"),

    listNotices: (_teacherName) => apiFetch("/teacher/notices"),
    async sendNotice(payload, actor) {
      const n = await apiFetch("/teacher/notices", { method: "POST", body: { title: payload.title, course: payload.course } });

      DB.notices.unshift({ tag: "Notice", date: "Today", title: `${n.title} (${n.course})` });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Class notice sent", detail: `${n.title} · ${n.course}` });
      pushNotification({ toRole: "student", title: "New class notice", body: n.title });
      return n;
    },

    listMyLeave: (_name) => apiFetch("/teacher/leave"),
    async applyLeave(payload, actor) {
      const l = await apiFetch("/teacher/leave", { method: "POST", body: { type: payload.type, from: payload.from, to: payload.to, reason: payload.reason || "" } });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Leave applied", detail: `${l.type} · ${l.from} to ${l.to}` });

      return l;
    },

    async raiseGrievance(payload, actor) {
      const g = await apiFetch("/teacher/grievances", { method: "POST", body: { category: payload.category, description: payload.description, contactEmail: payload.contactEmail || null } });
      pushAudit({ actor: actor.name, actorRole: "teacher", action: "Grievance raised", detail: `${g.category} — ${g.description.slice(0, 60)}${g.description.length > 60 ? "…" : ""}` });
      pushNotification({ toRole: "admin", title: "New grievance submitted", body: `${actor.name} raised a ${g.category.toLowerCase()} grievance.` });
      realtimeBus.emit("grievance:update", g);
      return g;
    },
    myGrievances: (_teacherName) => apiFetch("/teacher/grievances/mine"),

    reportsSummary: (_teacherName, _courses) => apiFetch("/teacher/reports/summary"),
  },
  student: {
    summary: (_studentId) => apiFetch("/student/summary"),
    assignments: () => apiFetch("/student/assignments"),
    async submitAssignment(id, actor) {
      const a = await apiFetch(`/student/assignments/${id}/submit`, { method: "POST" });
      pushAudit({ actor: actor.name, actorRole: "student", action: "Assignment submitted", detail: a.title });
      return a;
    },
    async raiseGrievance(payload, actor) {
      const g = await apiFetch("/student/grievances", { method: "POST", body: { category: payload.category, description: payload.description, contactEmail: payload.contactEmail || null } });
      pushAudit({ actor: actor.name, actorRole: "student", action: "Grievance raised", detail: `${g.category} — ${g.description.slice(0, 60)}${g.description.length > 60 ? "…" : ""}` });
      pushNotification({ toRole: "admin", title: "New grievance submitted", body: `${actor.name} raised a ${g.category.toLowerCase()} grievance.` });
      realtimeBus.emit("grievance:update", g);
      return g;
    },
    myGrievances: (_studentName) => apiFetch("/student/grievances/mine"),

    libraryCatalog: () => apiFetch("/student/library/catalog"),
    myLibraryRequests: (_studentName) => apiFetch("/student/library/requests/mine"),
    async requestBook(book, actor) {
      const req = await apiFetch("/student/library/requests", { method: "POST", body: { bookId: book.id } });
      pushAudit({ actor: actor.name, actorRole: "student", action: "Library request", detail: book.title });

      setTimeout(() => {
        req.status = book.copies > 0 ? "ready-for-pickup" : "waitlisted";
        realtimeBus.emit("library:update", req);
        pushNotification({
          toRole: "student",
          title: req.status === "ready-for-pickup" ? "Book ready for pickup" : "Added to waitlist",
          body: `${req.title} — ${req.status === "ready-for-pickup" ? "collect it from the circulation desk." : "all copies are currently out."}`,
        });
      }, 4000);
      return req;
    },

    timetable: () => apiFetch("/student/timetable"),
  },
  placements: {
    list: () => apiFetch("/placements/"),
    async create(payload, actor) {
      const p = await apiFetch("/placements/", {
        method: "POST",
        body: { company: payload.company, role: payload.role, package: payload.package, location: payload.location, minCGPA: payload.minCGPA, minAttendance: payload.minAttendance, deadline: payload.deadline },
      });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Placement posted", detail: `${p.company} — ${p.role}` });
      pushNotification({ toRole: "student", title: "New placement drive", body: `${p.company} is hiring for ${p.role}.` });
      realtimeBus.emit("placement:new", p);
      return p;
    },
    async apply(placementId, student, actor) {
      const app = await apiFetch(`/placements/${placementId}/apply`, { method: "POST" });
      pushAudit({ actor: actor.name, actorRole: "student", action: "Placement application submitted", detail: `${app.studentName} applied` });
      pushNotification({ toRole: "admin", title: "New placement application", body: `${actor.name} applied to a posting.` });
      realtimeBus.emit("placement:application", app);
      return app;
    },
    myApplications: (_studentId) => apiFetch("/placements/mine"),
    listApplicants: (placementId) => apiFetch(`/placements/${placementId}/applicants`),
    async setApplicationStatus(appId, status, actor) {
      const app = await apiFetch(`/placements/applications/${appId}`, { method: "PATCH", body: { status } });
      pushAudit({ actor: actor.name, actorRole: "admin", action: "Application status updated", detail: `${app.studentName} → ${status}` });
      pushNotification({ toRole: "student", title: "Placement update", body: `Your application status changed to "${status}".` });
      realtimeBus.emit("placement:application", app);
      return app;
    },
  },
};

const ROLES = [
  { key: "student", label: "Student", sub: "Timetable, marks & fees", icon: "cap", idLabel: "Roll Number",
    accent: "#1FC3B4", accentDeep: "#12756B", accentSoft: "#DCF3EE",
    authDesc: "Check your timetable, assignments, fees and results — all in one place." },
  { key: "teacher", label: "Faculty", sub: "Attendance & gradebook", icon: "book", idLabel: "Staff ID",
    accent: "#C79A3E", accentDeep: "#8A6A22", accentSoft: "#F6ECD5",
    authDesc: "Mark attendance by photo, publish grades, and keep your classes on track." },
  { key: "admin", label: "Admin", sub: "Full campus console", icon: "shield", idLabel: "Admin ID",
    accent: "#3A5A8C", accentDeep: "#1B2C4A", accentSoft: "#E4EAF3",
    authDesc: "Users, courses, fees, reports and the campus-wide audit trail in one console." },
];
function roleInfo(key) { return ROLES.find((r) => r.key === key) || ROLES[0]; }

function useRipples() {
  const [ripples, setRipples] = useState([]);
  function addRipple(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;
    const id = Math.random().toString(36).slice(2);
    setRipples((r) => [...r, { id, x, y, size }]);
    window.setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 620);
  }
  return [ripples, addRipple];
}
function RippleField({ ripples }) {
  return (
    <span className="cp-ripple-field" aria-hidden="true">
      {ripples.map((rp) => <span key={rp.id} className="cp-ripple" style={{ left: rp.x, top: rp.y, width: rp.size, height: rp.size }} />)}
    </span>
  );
}
function Pill({ tone = "outline", children, ...rest }) {
  const [ripples, addRipple] = useRipples();
  return (
    <button className={`cp-pill cp-pill--${tone}`} onPointerDown={(e) => { addRipple(e); rest.onPointerDown?.(e); }} {...rest}>
      <span className="cp-pill-label">{children}</span>
      <RippleField ripples={ripples} />
    </button>
  );
}
function RoundButton({ children, className = "", ...rest }) {
  const [ripples, addRipple] = useRipples();
  return (
    <button className={"cp-round-btn " + className} onPointerDown={(e) => { addRipple(e); rest.onPointerDown?.(e); }} {...rest}>
      {children}
      <RippleField ripples={ripples} />
    </button>
  );
}
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <RoundButton className="cp-theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode" onPointerDown={onToggle}>
      <span className={"cp-theme-icon" + (isDark ? " is-dark" : "")}><Icon name={isDark ? "moon" : "sun"} size={17} /></span>
    </RoundButton>
  );
}
function CountUp({ to, decimals = 0, duration = 900 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const startTime = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - startTime) / duration);
      setVal(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{val.toFixed(decimals)}</>;
}
function AuroraBackground() {
  return (
    <div className="cp-aurora" aria-hidden="true">
      <span className="cp-blob cp-blob--a" /><span className="cp-blob cp-blob--b" /><span className="cp-blob cp-blob--c" /><span className="cp-grain" />
    </div>
  );
}
function HeroIllustration() {
  return (
    <svg viewBox="0 0 320 220" width="100%" aria-hidden="true" className="cp-float">
      <circle cx="272" cy="34" r="20" fill="#FFD976" /><path d="M264 34 l6 6 12-12" fill="none" stroke="#12756B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="150" r="16" fill="#FF8A70" /><path d="M23 150h14M30 143v14" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <rect x="40" y="176" width="220" height="10" rx="5" fill="#0B5951" opacity="0.35" />
      <g transform="translate(96,120)">
        <rect x="0" y="0" width="108" height="66" rx="8" fill="#0E3B36" /><rect x="6" y="6" width="96" height="48" rx="4" fill="#DFF6F2" />
        <path d="M14 44 L38 24 L56 38 L96 12" stroke="#1FC3B4" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="-10" y="64" width="128" height="10" rx="5" fill="#12756B" />
      </g>
      <g transform="translate(150,26)">
        <circle cx="30" cy="24" r="22" fill="#FFC7A8" /><path d="M8 22a22 22 0 0 1 44 0c0 4-4 4-4 4H12s-4 0-4-4Z" fill="#12756B" />
        <rect x="8" y="46" width="44" height="60" rx="16" fill="#1FC3B4" />
      </g>
      <ellipse cx="196" cy="200" rx="60" ry="8" fill="#0B5951" opacity="0.15" />
    </svg>
  );
}

function Card({ title, actions, children, wide }) {
  return (
    <div className={"cp-card" + (wide ? " cp-card--wide" : "")}>
      {title ? <div className="cp-card-head"><h3>{title}</h3><div className="cp-card-actions">{actions}</div></div> : null}
      <div className="cp-card-body">{children}</div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="cp-stat">
      <span className="cp-stat-ico"><Icon name={icon} size={17} /></span>
      <div><div className="cp-stat-value">{typeof value === "number" ? <CountUp to={value} /> : value}</div><div className="cp-stat-label">{label}</div>{sub ? <div className="cp-stat-sub">{sub}</div> : null}</div>
    </div>
  );
}
function Badge({ tone = "neutral", children }) { return <span className={`cp-badge2 cp-badge2--${tone}`}>{children}</span>; }
function GrievanceStatusBadge({ status }) {
  const tone = status === "resolved" ? "green" : status === "in-review" ? "amber" : "red";
  const pending = status !== "resolved";
  return (
    <Badge tone={tone}>
      {pending && <span className="cp-badge-pulse-dot" aria-hidden="true" />}
      {status.replace("-", " ")}
    </Badge>
  );
}
function RiskBadge({ level }) {
  const tone = level === "high" ? "red" : level === "medium" ? "amber" : "green";
  const label = level === "high" ? "High risk" : level === "medium" ? "Medium risk" : "Low risk";
  return <Badge tone={tone}>{label}</Badge>;
}

function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="ri-tooltip-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="button"
      aria-label="How risk is calculated"
    >
      <span className="ri-tooltip-icon"><Icon name="alert" size={13} /></span>
      {open && <span className="ri-tooltip-bubble">{text}</span>}
    </span>
  );
}
function Tabs({ tabs, active, onChange }) {
  return <div className="cp-tabs2">{tabs.map((t) => <button key={t.key} className={"cp-tab2" + (active === t.key ? " is-active" : "")} onClick={() => onChange(t.key)}>{t.label}</button>)}</div>;
}
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="cp-modal-veil" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cp-modal-head"><h3>{title}</h3><button className="cp-icon-btn" onClick={onClose}><Icon name="close" size={15} /></button></div>
        <div className="cp-modal-body">{children}</div>
      </div>
    </div>
  );
}
function DataTable({ columns, rows, empty = "No records yet." }) {
  return (
    <div className="cp-table-wrap">
      <table className="cp-data-table">
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, i) => <tr key={row.id || i}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>)
            : <tr><td colSpan={columns.length} className="cp-table-empty">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
const SORT_ICO_UP = "M6 15l6-6 6 6"; const SORT_ICO_DOWN = "M6 9l6 6 6-6"; const SORT_ICO_UPDOWN = "M8 9l4-4 4 4M8 15l4 4 4-4";

function SortableTable({ columns, rows, empty = "No records yet.", defaultSortKey, defaultSortDir = "desc", rowClassName }) {
  const [sortKey, setSortKey] = useState(defaultSortKey || null);
  const [sortDir, setSortDir] = useState(defaultSortDir);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    const getVal = col && col.sortValue ? col.sortValue : (r) => r[sortKey];
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = getVal(a), bv = getVal(b);
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir, columns]);

  function toggleSort(col) {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(col.key); setSortDir("desc"); }
  }

  return (
    <div className="cp-table-wrap">
      <table className="cp-data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.sortable ? "ri-th-sortable" : ""} onClick={() => toggleSort(c)}>
                <span className="ri-th-inner">
                  {c.label}
                  {c.sortable && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={sortKey === c.key ? (sortDir === "asc" ? SORT_ICO_UP : SORT_ICO_DOWN) : SORT_ICO_UPDOWN} />
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length
            ? sortedRows.map((row, i) => <tr key={row.id || i} className={rowClassName ? rowClassName(row) : undefined}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>)
            : <tr><td colSpan={columns.length} className="cp-table-empty">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, tone = "ok") => { setToast({ msg, tone, id: uid("t") }); window.setTimeout(() => setToast(null), 2600); }, []);
  return [toast, show];
}
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`cp-toast cp-toast--${toast.tone}`}>
      <span className="cp-toast-ico"><Icon name={toast.tone === "warn" ? "alert" : "check"} size={14} /></span>
      {toast.msg}
    </div>
  );
}
function useHeartbeat() {
  const [lastSync, setLastSync] = useState(nowMs());
  useEffect(() => realtimeBus.on("heartbeat", ({ ts }) => setLastSync(ts)), []);
  const [, force] = useState(0);
  useEffect(() => { const t = setInterval(() => force((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  return lastSync;
}

function LiveBadge() {
  const lastSync = useHeartbeat();
  return (
    <span className="cp-live" title={LIVE_SYNC_ENABLED ? "Synced with the server in real time" : "This tab only — not yet synced across devices"}>
      <span className={"cp-live-dot2" + (LIVE_SYNC_ENABLED ? "" : " cp-live-dot2--local")} />
      {LIVE_SYNC_ENABLED ? "Live" : "Local session"} · updated {timeAgo(lastSync)}
    </span>
  );
}
function Switch({ checked, onChange }) {
  return <label className="cp-switch"><input type="checkbox" checked={checked} onChange={onChange} /><span /></label>;
}
function AuditList({ entries }) {
  return (
    <div className="cp-audit-list">
      {entries.length ? entries.map((e) => (
        <div className="cp-audit-row" key={e.id}>
          <span className={"cp-audit-dot cp-audit-dot--" + e.actorRole} />
          <div className="cp-audit-body"><div className="cp-audit-line"><strong>{e.actor}</strong> · {e.action}</div>{e.detail ? <div className="cp-audit-detail">{e.detail}</div> : null}</div>
          <span className="cp-audit-time">{timeAgo(e.ts)}</span>
        </div>
      )) : <div className="cp-table-empty">No activity yet.</div>}
    </div>
  );
}

function GlassTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: 10,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--ink)",
        boxShadow: "0 10px 24px rgba(18,60,55,0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      {label !== undefined && (
        <div style={{ color: "var(--ink-faint)", fontWeight: 700, marginBottom: 2 }}>{label}</div>
      )}
      {payload[0].value}{suffix}
    </div>
  );
}

function ChartSparkline({
  data,
  height = 84,
  stroke = "var(--accent-deep)",
  fillFrom,
  suffix = "%",
}) {
  const gradId = useId().replace(/[:]/g, "");
  const chartData = (data || []).map((v, i) => ({ i, value: v }));
  const from = fillFrom || stroke;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={from} stopOpacity={0.35} />
              <stop offset="100%" stopColor={from} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis hide domain={["dataMin - 6", "dataMax + 6"]} />
          <Tooltip content={<GlassTooltip suffix={suffix} />} cursor={false} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#spark-fill-${gradId})`}
            dot={{ r: 2.5, fill: stroke, strokeWidth: 0 }}
            activeDot={{ r: 4.5, fill: stroke, strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartBarRow({ data, height = 140, suffix = "%" }) {
  const gradId = useId().replace(/[:]/g, "");
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data || []} margin={{ top: 18, right: 8, left: 8, bottom: 0 }} barCategoryGap="28%">
          <defs>
            <linearGradient id={`bar-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-deep)" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--panel-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--ink-faint)", fontSize: 10.5 }}
          />
          <YAxis hide domain={[0, (max) => Math.max(max, 1)]} />
          <Tooltip content={<GlassTooltip suffix={suffix} />} cursor={{ fill: "var(--surface)" }} />
          <Bar
            dataKey="value"
            fill={`url(#bar-fill-${gradId})`}
            radius={[8, 8, 0, 0]}
            maxBarSize={34}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-out"
          >
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v) => `${v}${suffix}`}
              style={{ fill: "var(--ink)", fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const RISK_COLUMNS = [
  { key: "name", label: "Student", sortable: true },
  { key: "idLabel", label: "ID", sortable: true },
  { key: "attendancePct", label: "Attendance", sortable: true, render: (r) => <span>{r.attendancePct}%</span> },
  { key: "avgScore", label: "Avg. score", sortable: true, render: (r) => <span>{r.avgScore}/100</span> },
  { key: "feeStatus", label: "Fees", sortable: true, render: (r) => <span style={{ textTransform: "capitalize" }}>{r.feeStatus}</span> },
  { key: "healthScore", label: "Health score", sortable: true, render: (r) => <strong>{r.healthScore}</strong> },
  {
    key: "riskLevel", label: "Risk", sortable: true,
    sortValue: (r) => ({ low: 0, medium: 1, high: 2 }[r.riskLevel]),
    render: (r) => <RiskBadge level={r.riskLevel} />,
  },
  { key: "reasons", label: "Why", sortable: false, render: (r) => <span className="cp-muted">{r.reasons.join(" · ")}</span> },
];

function RiskSummaryStats({ counts }) {
  return (
    <div className="cp-stat-grid">
      <StatCard icon="users" label="Students scored" value={counts.total} />
      <StatCard icon="alert" label="High risk" value={counts.high} sub="needs attention" />
      <StatCard icon="target" label="Medium risk" value={counts.medium} />
      <StatCard icon="check" label="Low risk" value={counts.low} />
    </div>
  );
}

function TeacherRiskInsights({ courses }) {
  const [scored, setScored] = useState([]);
  const courseIds = useMemo(() => (courses || []).map((c) => c.id), [courses]);
  const refresh = useCallback(() => { if (courseIds.length) api.teacher.riskScores(courseIds).then(setScored); }, [courseIds.join(",")]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => realtimeBus.on("attendance:update", refresh), [refresh]);
  useEffect(() => realtimeBus.on("grades:update", refresh), [refresh]);
  const counts = useMemo(() => riskSummaryCounts(scored), [scored]);

  return (
    <>
      <RiskSummaryStats counts={counts} />
      <Card title="Risk Insights" actions={<InfoTooltip text={RISK_FORMULA_TEXT} />}>
        <div className="ri-formula-note">
          <Icon name="alert" size={13} />
          <span>Scores are a demo heuristic, not a trained model — hover the info icon above for the exact formula.</span>
        </div>
        <SortableTable columns={RISK_COLUMNS} rows={scored} defaultSortKey="healthScore" defaultSortDir="asc" empty="No students found for your subjects." rowClassName={(r) => "ri-row-" + r.riskLevel} />
      </Card>
    </>
  );
}

function AdminRiskInsights() {
  const [scored, setScored] = useState([]);
  const refresh = useCallback(() => { api.admin.riskScores().then(setScored); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => realtimeBus.on("attendance:update", refresh), [refresh]);
  useEffect(() => realtimeBus.on("grades:update", refresh), [refresh]);
  const counts = useMemo(() => riskSummaryCounts(scored), [scored]);

  return (
    <>
      <RiskSummaryStats counts={counts} />
      <Card title="Campus-wide Risk Insights" actions={<InfoTooltip text={RISK_FORMULA_TEXT} />}>
        <div className="ri-formula-note">
          <Icon name="alert" size={13} />
          <span>Scores are a demo heuristic, not a trained model — hover the info icon above for the exact formula.</span>
        </div>
        <SortableTable columns={RISK_COLUMNS} rows={scored} defaultSortKey="healthScore" defaultSortDir="asc" empty="No students found." rowClassName={(r) => "ri-row-" + r.riskLevel} />
      </Card>
    </>
  );
}

function FieldInput({ icon, placeholder, value, onChange, type = "text", autoComplete, onEnter }) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  return (
    <label className={"a2-field" + (isPassword ? " a2-field--pw" : "")}>
      <input type={isPassword ? (reveal ? "text" : "password") : type} placeholder={placeholder} value={value} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }} />
      <span className="a2-field-icon"><Icon name={icon} size={16} /></span>
      {isPassword ? (
        <button type="button" className="a2-field-toggle" tabIndex={-1}
          aria-label={reveal ? "Hide password" : "Show password"}
          onClick={() => setReveal((v) => !v)}>
          <Icon name={reveal ? "eyeOff" : "eye"} size={16} />
        </button>
      ) : null}
    </label>
  );
}
function RoleDropdown({ role, setRole, options = ROLES }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = roleInfo(role);
  useEffect(() => {
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  return (
    <div className="a2-role-select" ref={ref}>
      <button type="button" className={"a2-role-trigger" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="a2-role-trigger-icon"><Icon name={current.icon} size={16} /></span>
        <span className="a2-role-trigger-text"><span className="a2-rt-label">{current.label}</span><span className="a2-rt-sub">{current.sub}</span></span>
        <span className={"a2-chevron" + (open ? " is-open" : "")}><Icon name="chevronDown" size={15} /></span>
      </button>
      <div className={"a2-role-panel" + (open ? " is-open" : "")}>
        {options.map((r) => (
          <button type="button" key={r.key} className={"a2-role-option" + (r.key === role ? " is-selected" : "")} onClick={() => { setRole(r.key); setOpen(false); }}>
            <span className="a2-role-opt-icon" style={{ background: r.accentSoft, color: r.accentDeep }}><Icon name={r.icon} size={15} /></span>
            <span className="a2-role-opt-text"><span className="a2-ot-label">{r.label}</span><span className="a2-ot-sub">{r.sub}</span></span>
            {r.key === role ? <span className="a2-check"><Icon name="check" size={14} /></span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
function FloatingStage({ role }) {
  const info = roleInfo(role);
  return (
    <div className="a2-stage">
      <div className="a2-stage-item a2-doc" style={{ top: "0%", left: "64%", "--rot": "7deg", "--dur": "5.2s", "--delay": ".4s" }}><span /><span /><span /></div>
      <div className="a2-stage-item a2-folder" style={{ top: "4%", left: "0%", "--rot": "-9deg", "--dur": "4.6s", "--delay": "0s" }} />
      <div className="a2-stage-item a2-folder a2-folder--alt" style={{ top: "62%", left: "68%", "--rot": "6deg", "--dur": "5.6s", "--delay": ".8s" }} />
      <div className="a2-stage-item a2-chip" style={{ top: "68%", left: "2%", "--rot": "0deg", "--dur": "4.8s", "--delay": "1.1s" }}><Icon name="check" size={18} /></div>
      <div className="a2-stage-item a2-center" style={{ top: "24%", left: "32%", "--rot": "0deg", "--dur": "5.8s", "--delay": ".15s" }}><Icon name={info.icon} size={30} /></div>
    </div>
  );
}

const AUTH_NAV_PANELS = {
  Home: {
    title: "Welcome to CampusPilot",
    body: "CampusPilot is a campus ERP covering attendance, grades, fees, placements, grievances and more — for students, faculty and administrators in one place. Sign in above, or create a student/faculty account to get started.",
  },
  Academics: {
    title: "Academics",
    body: "Students track attendance, sessional marks, assignments and their timetable. Faculty publish grades and attendance, share study material, and manage their subjects — all from their respective portals after signing in.",
  },
  Departments: {
    title: "Departments",
    body: "CampusPilot is department-agnostic: Computer Science, Mathematics and every other department on campus share the same courses, faculty and student records under one roof, managed centrally from the Admin console.",
  },
  Support: {
    title: "Support",
    body: "Having trouble signing in? Double-check you've selected the right portal (Student / Faculty / Admin) above — an account only works for the portal it was created under. For anything else, reach your campus admin, or use the Grievances desk once you're signed in.",
  },
};

function AuthScreen({ theme, onToggleTheme, onAuthed }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [idLabel, setIdLabel] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [showDemoCreds, setShowDemoCreds] = useState(false);
  const [navPanel, setNavPanel] = useState(null);
  const info = roleInfo(role);

  const signupRoles = useMemo(() => ROLES.filter((r) => r.key !== "admin"), []);
  const roleOptions = mode === "signup" ? signupRoles : ROLES;

  function switchMode(m) {
    setMode(m); setError("");
    if (m === "signup" && role === "admin") setRole("student");
  }

  async function handleLogin() {
    setError("");
    if (!email.trim() || !password) return setError("Enter both your email and password to continue.");
    setLoading(true);
    try { const user = await api.auth.login(email, password, role); onAuthed(user); }
    catch (err) { setError(err.message); }
    setLoading(false);
  }
  async function handleSignup() {
    setError("");
    if (!name.trim() || !email.trim() || !password) return setError("Fill in your name, email and password to continue.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 4) return setError("Use a password with at least 4 characters.");
    setLoading(true);
    try { const user = await api.auth.signup({ name: name.trim(), email: email.trim(), password, role, idLabel: idLabel.trim() }); onAuthed(user); }
    catch (err) { setError(err.message); }
    setLoading(false);
  }
  const submit = mode === "login" ? handleLogin : handleSignup;

  return (
    <div className="a2-page" style={{ "--a2-accent": info.accent, "--a2-accent-deep": info.accentDeep, "--a2-accent-soft": info.accentSoft }}>
      <span className="a2-shape a2-shape--1" /><span className="a2-shape a2-shape--2" /><span className="a2-shape a2-shape--3" /><span className="a2-shape a2-shape--4" />
      <div className="a2-shell">
        <div className="a2-card">
          <div className="a2-nav">
            <div className="a2-brand"><BrandMark size={30} />
              <span className="a2-brand-name">Campus<span className="a2-pilot">Pilot</span></span></div>
            <ul className="a2-nav-links">
              {Object.keys(AUTH_NAV_PANELS).map((label) => (
                <li key={label}><button type="button" className="a2-nav-link-btn" onClick={() => setNavPanel(label)}>{label}</button></li>
              ))}
            </ul>
            <div className="a2-nav-right">
              <button type="button" className="a2-theme-toggle" aria-label="Toggle dark mode" onClick={onToggleTheme}><Icon name={theme === "dark" ? "moon" : "sun"} size={16} /></button>
              <div className="a2-badge">{info.label} Portal</div>
            </div>
          </div>
          <div className="a2-grid">
            <div className="a2-panel-form"><div className="a2-form-inner">
              <div className="a2-tabs">
                <button type="button" className={"a2-tab" + (mode === "login" ? " is-active" : "")} onClick={() => switchMode("login")}>Login</button>
                <button type="button" className={"a2-tab" + (mode === "signup" ? " is-active" : "")} onClick={() => switchMode("signup")}>Sign up</button>
                <span className="a2-tab-underline" style={{ transform: `translateX(${mode === "signup" ? "100%" : "0"})` }} />
              </div>
              <label className="a2-field-label">{mode === "login" ? "I am signing in as" : "I am signing up as"}</label>
              <RoleDropdown role={role} setRole={setRole} options={roleOptions} />
              {mode === "signup" && (
                <p className="a2-role-note">Admin accounts aren't self-serve — an existing admin creates those from the console.</p>
              )}
              {error ? <div className="a2-error">{error}</div> : null}
              {mode === "login" ? (
                <div>
                  <FieldInput icon="mail" placeholder="Email address" value={email} onChange={setEmail} type="email" autoComplete="username" onEnter={submit} />
                  <FieldInput icon="lock" placeholder="Password" value={password} onChange={setPassword} type="password" autoComplete="current-password" onEnter={submit} />
                  <button type="button" className="a2-submit" disabled={loading} onClick={submit}>{loading ? "Signing in…" : `Sign in as ${info.label}`}</button>
                </div>
              ) : (
                <div>
                  <FieldInput icon="user" placeholder="Full name" value={name} onChange={setName} autoComplete="name" onEnter={submit} />
                  <FieldInput icon="mail" placeholder="Email address" value={email} onChange={setEmail} type="email" autoComplete="username" onEnter={submit} />
                  <FieldInput icon="clipboard" placeholder={info.idLabel} value={idLabel} onChange={setIdLabel} onEnter={submit} />
                  <FieldInput icon="lock" placeholder="Password" value={password} onChange={setPassword} type="password" autoComplete="new-password" onEnter={submit} />
                  <PasswordStrengthHint password={password} />
                  <FieldInput icon="lock" placeholder="Confirm password" value={confirm} onChange={setConfirm} type="password" autoComplete="new-password" onEnter={submit} />
                  <button type="button" className="a2-submit" disabled={loading} onClick={submit}>{loading ? "Creating account…" : `Create ${info.label.toLowerCase()} account`}</button>
                </div>
              )}
              <p className="a2-switch">
                {mode === "login" ? <>New to CampusPilot? <button type="button" onClick={() => switchMode("signup")}>Create an account</button></>
                  : <>Already have an account? <button type="button" onClick={() => switchMode("login")}>Sign in</button></>}
              </p>
              <div className="a2-demo-creds">
                <button
                  type="button"
                  className="a2-demo-toggle"
                  onClick={() => setShowDemoCreds((v) => !v)}
                  aria-expanded={showDemoCreds}
                >
                  <Icon name={showDemoCreds ? "chevronDown" : "chevronRight"} size={13} />
                  Demo credentials
                </button>
                {showDemoCreds && (
                  <div className="a2-demo-panel">
                    <div className="a2-demo-row"><span>Student</span><code>rohan@campuspilot.edu</code> / <code>student123</code></div>
                    <div className="a2-demo-row"><span>Faculty</span><code>priya@campuspilot.edu</code> / <code>teach123</code></div>
                    <div className="a2-demo-row"><span>Admin</span><code>admin@campuspilot.edu</code> / <code>admin123</code></div>
                    <div className="a2-demo-warn">For demo purposes only — never surface real credentials in a UI like this.</div>
                  </div>
                )}
              </div>
            </div></div>
            <div className="a2-panel-visual">
              <div className="a2-blob" /><div className="a2-orbit2" /><div className="a2-orbit" />
              <div className="a2-particles"><span /><span /><span /><span /><span /></div>
              <div className="a2-visual-content">
                <FloatingStage role={role} />
                <div className="a2-role-caption"><h3>{info.label}</h3><p>{info.authDesc}</p></div>
              </div>
            </div>
          </div>
        </div>
        <div className="a2-page-foot"><span>CampusPilot ERP</span><span className="a2-dot" /><span>Built for colleges &amp; universities</span><span className="a2-dot" /><span>v2.0</span></div>
      </div>
      <Modal open={!!navPanel} onClose={() => setNavPanel(null)} title={navPanel ? AUTH_NAV_PANELS[navPanel].title : ""}>
        <p>{navPanel ? AUTH_NAV_PANELS[navPanel].body : ""}</p>
      </Modal>
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  const [ripples, addRipple] = useRipples();
  return (
    <button className={"cp-nav-item" + (active ? " is-active" : "")} onPointerDown={addRipple} onClick={onClick}>
      <span className="cp-nav-ico"><Icon name={item.icon} size={17} /></span><span>{item.label}</span>
      {item.badge ? <span className="cp-nav-badge">{item.badge}</span> : null}
      <RippleField ripples={ripples} />
    </button>
  );
}

function PortalShell({ roleKey, navItems, active, onNavigate, user, theme, onToggleTheme, onLogout, headerTitle, headerSub, children }) {
  const info = roleInfo(roleKey);
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);
  useEffect(() => { setMobileNavOpen(false); }, [active]);

  function navigate(key) { onNavigate(key); }

  return (
    <div className={`cp-shell cp-shell--${roleKey}`} data-theme={theme} style={{ "--accent": info.accent, "--accent-deep": info.accentDeep, "--accent-soft": info.accentSoft }}>
      <AuroraBackground />
      <CopilotWidget user={user} roleKey={roleKey} api={api} />
      <div className={"cp-frame" + (mounted ? " is-mounted" : "")}>
        {mobileNavOpen && <div className="cp-sidebar-veil" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />}
        <aside className={"cp-sidebar" + (mobileNavOpen ? " is-open" : "")}>
          <div className="cp-brand"><BrandMark size={28} /><span className="cp-brand-name">CampusPilot</span>
            <button className="cp-sidebar-close" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}><Icon name="close" size={16} /></button>
          </div>
          <div className="cp-profile-card">
            <div className="cp-profile-card-avatar">{initialsOf(user.name)}</div>
            <div className="cp-profile-card-name">{user.name}</div>
            <div className="cp-profile-card-id">{info.label} · {info.idLabel} {user.idLabel || "—"}</div>
          </div>
          <div className="cp-nav-label">{info.label} Menu</div>
          <nav className="cp-nav cp-nav--full">
            {navItems.map((item, i) => (
              <div key={item.key} className="cp-nav-item-wrap" style={{ "--i": i }}>
                <NavItem item={item} active={active === item.key} onClick={() => navigate(item.key)} />
              </div>
            ))}
          </nav>
          <button className="cp-sidebar-logout" onClick={onLogout}><Icon name="logout" size={15} /> Log out</button>
          <div className="cp-sidebar-foot">CampusPilot ERP · {info.label} view</div>
        </aside>

        <main className="cp-main">
          <header className="cp-topbar">
            <button className="cp-hamburger" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
              <Icon name="grid" size={17} />
            </button>
            <div className="cp-topbar-title"><h1>{headerTitle}</h1><p>{headerSub}</p></div>
            <div className="cp-topbar-actions">
              <LiveBadge />
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <div className="cp-profile"><div className="cp-avatar">{initialsOf(user.name)}</div>
                <div className="cp-profile-text"><div className="cp-profile-name">{user.name}</div><div className="cp-profile-handle">{info.label}</div></div>
              </div>
              <Pill tone="ghost" onClick={onLogout}><Icon name="logout" size={13} /> Log out</Pill>
            </div>
          </header>
          <div className="cp-content" key={active}>{children}</div>
        </main>
      </div>
    </div>
  );
}

const STUDENT_NAV = [
  { key: "overview", label: "Dashboard", icon: "grid" },
  { key: "attendance", label: "Attendance", icon: "target" },
  { key: "marks", label: "Sessional Marks", icon: "barchart" },
  { key: "assignments", label: "Assignments", icon: "clipboard" },
  { key: "placements", label: "Placements", icon: "briefcase" },
  { key: "grievances", label: "Grievances", icon: "alert" },
  { key: "fees", label: "Fee Information", icon: "rupee" },
  { key: "library", label: "Library", icon: "book" },
  { key: "timetable", label: "Time Table", icon: "clock" },
];
const TODAY = [
  { code: "U", color: "teal", course: "Data Structures", meta: "CS301 · B-204 · 9:00 AM", state: "done" },
  { code: "M", color: "coral", course: "Database Systems", meta: "CS315 · Lab 3 · 12:30 PM", state: "next" },
  { code: "W", color: "yellow", course: "Discrete Mathematics", meta: "MA201 · A-102 · 3:00 PM", state: "upcoming" },
];
const FACULTY = [
  { initials: "PS", name: "Dr. Priya Sharma", course: "Data Structures" },
  { initials: "AK", name: "Prof. Arjun Kapoor", course: "Database Systems", highlight: true },
  { initials: "RN", name: "Dr. Ritu Nair", course: "Discrete Mathematics" },
];
const LIBRARY_CATALOG = [
  { id: "bk1", title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", category: "Computer Science", copies: 4 },
  { id: "bk2", title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Computer Science", copies: 2 },
  { id: "bk3", title: "Discrete Mathematics and Its Applications", author: "Kenneth Rosen", category: "Mathematics", copies: 3 },
  { id: "bk4", title: "Operating System Concepts", author: "Silberschatz, Galvin, Gagne", category: "Computer Science", copies: 1 },
  { id: "bk5", title: "Computer Networking: A Top-Down Approach", author: "Kurose, Ross", category: "Computer Science", copies: 0 },
  { id: "bk6", title: "Linear Algebra and Its Applications", author: "Gilbert Strang", category: "Mathematics", copies: 5 },
];

function StudentApp({ user, theme, onToggleTheme, onLogout }) {
  const [active, setActive] = useState("overview");
  const [toast, showToast] = useToast();
  const [summary, setSummary] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [week, setWeek] = useState([72, 75, 69, 79, 81, 78, 83]);

  const refreshSummary = useCallback(() => { api.student.summary(user.id).then(setSummary); }, [user.id]);
  const refreshAssignments = useCallback(() => { api.student.assignments().then(setAssignments); }, []);
  useEffect(() => { refreshSummary(); refreshAssignments(); }, [refreshSummary, refreshAssignments]);
  useEffect(() => realtimeBus.on("attendance:update", () => { refreshSummary(); setWeek((w) => [...w.slice(1), Math.min(96, w[w.length - 1] + (Math.random() > 0.5 ? 2 : -2))]); }), [refreshSummary]);
  useEffect(() => realtimeBus.on("notification:new", (n) => { if (n.toRole === "student") showToast(n.title); }), [showToast]);

  async function submit(a) { await api.student.submitAssignment(a.id, user); refreshAssignments(); showToast("Assignment submitted"); }

  if (!summary) return <PortalLoading label="your dashboard" />;
  const pending = assignments.filter((a) => a.status === "pending").length;

  return (
    <PortalShell roleKey="student" navItems={STUDENT_NAV} active={active} onNavigate={setActive} user={user} theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout}
      headerTitle="Academic Overview" headerSub={`Welcome back, ${user.name.split(" ")[0]} — attendance, marks and campus updates in one place.`}>
      <Toast toast={toast} />

      {active === "overview" && (
        <>
          <section className="cp-hero">
            <div className="cp-hero-text">
              <div className="cp-hero-eyebrow"><span className="cp-live-dot" aria-hidden="true" />AI-Powered Campus Assistant</div>
              <h2>Predict. Automate. Act.</h2>
              <p>Real-time insights across attendance, grades and placements — all in one glance.</p>
              <div className="cp-hero-stats">
                <div className="cp-hero-stat"><span className="cp-hero-ico cp-hero-ico--coral"><Icon name="check" size={15} /></span>
                  <div><div className="cp-hero-stat-value">{summary.attendancePct}%</div><div className="cp-hero-stat-label">Attendance</div></div></div>
                <div className="cp-hero-stat"><span className="cp-hero-ico cp-hero-ico--yellow"><Icon name="target" size={15} /></span>
                  <div><div className="cp-hero-stat-value"><CountUp to={summary.cgpa} decimals={2} /></div><div className="cp-hero-stat-label">CGPA · out of 10</div></div></div>
              </div>
              <div className="cp-hero-actions">
                <Pill tone="hero-solid" onClick={() => setActive("marks")}>View Full Report <Icon name="arrowUpRight" size={13} /></Pill>
                <div className="cp-hero-quicklinks">
                  <button className="cp-hero-chip" onClick={() => setActive("attendance")}>Attendance</button>
                  <button className="cp-hero-chip" onClick={() => setActive("marks")}>Marks</button>
                  <button className="cp-hero-chip" onClick={() => setActive("assignments")}>Assignments</button>
                </div>
              </div>
            </div>
            <div className="cp-hero-art"><HeroIllustration /></div>
          </section>

          <section className="cp-quickgrid">
            <div className="cp-quick cp-quick--navy"><div className="cp-quick-label">My Attendance</div>
              <div className="cp-quick-main">Present {summary.present} / {summary.totalLectures}</div><Pill tone="quick" onClick={() => setActive("attendance")}>Details ({summary.attendancePct}%)</Pill></div>
            <div className="cp-quick cp-quick--teal"><div className="cp-quick-label">My Marks</div>
              <div className="cp-quick-main">Assignment / Exam</div><Pill tone="quick" onClick={() => setActive("marks")}>Click Here to view</Pill></div>
            <div className="cp-quick cp-quick--purple"><div className="cp-quick-label">Fee</div>
              <div className="cp-quick-main">{summary.feeDue ? `₹${summary.feeDue} due` : "Fully paid"}</div><Pill tone="quick" onClick={() => setActive("fees")}>Click Here for details</Pill></div>
            <div className="cp-quick cp-quick--coral"><div className="cp-quick-label">Library</div>
              <div className="cp-quick-main">Circulation / BookBank</div><span className="cp-quick-sub">Late Fine — Rs. 0/-</span><Pill tone="quick" onClick={() => setActive("library")}>Click Here to view details</Pill></div>
          </section>

          <section className="cp-panelgrid">
            <Card wide title="Notice Board" actions={<Pill tone="ghost">All Notice</Pill>}>
              <div className="cp-notice-list">
                {DB.notices.map((n, i) => (
                  <div className="cp-notice-row" key={n.title} style={{ "--i": i }}>
                    <span className="cp-notice-tag">{n.tag}</span><span className="cp-notice-title">{n.title}</span><span className="cp-notice-date">{n.date}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Info At A Glance">
              <div className="cp-glance">
                {[["My Attendance", `${summary.attendancePct}%`, "coral"], ["Total Lecture", summary.totalLectures, "teal"], ["Total Present", summary.present, "yellow"],
                  ["My Library", "Fine ₹0", "coral"], ["Pending Work", pending, "navy"]].map(([label, val, tone], i) => (
                  <div className="cp-glance-row" key={label} style={{ "--i": i }}><span>{label}</span><span className={`cp-badge cp-badge--${tone}`}>{val}</span></div>
                ))}
              </div>
            </Card>
          </section>

          <section className="cp-columns">
            <div className="cp-col cp-col--wide">
              <div className="cp-col-head"><h3>Today's Classes</h3><Pill tone="ghost">This week <Icon name="chevronDown" size={14} /></Pill></div>
              <div className="cp-list">
                {TODAY.map((row, i) => (
                  <div className="cp-row" key={i} style={{ "--i": i }}>
                    <span className={`cp-tile cp-tile--${row.color}`}>{row.code}</span>
                    <div className="cp-row-body"><div className="cp-row-title">{row.course}</div><div className="cp-row-sub">{row.meta}</div></div>
                    <Pill tone={row.state === "next" ? "solid" : "outline"}>{row.state === "done" ? "Notes" : row.state === "next" ? "Join" : "View"}</Pill>
                  </div>
                ))}
              </div>
            </div>
            <div className="cp-col">
              <div className="cp-col-head"><h3>Current Activity</h3></div>
              <div className="cp-progress-card">
                <div className="cp-progress-top"><div><div className="cp-progress-title">Weekly Attendance</div><div className="cp-progress-sub">Trending this week</div></div>
                  <span className="cp-progress-badge">{week[week.length - 1] >= week[0] ? "+" : ""}{week[week.length - 1] - week[0]}%</span></div>
                <ChartSparkline data={week} stroke="#fff" fillFrom="#fff" />
              </div>
              <div className="cp-mini-grid">
                <div className="cp-mini-card cp-mini-card--yellow"><div className="cp-mini-value">{assignments.filter((a) => a.status === "submitted").length}</div><div className="cp-mini-label">Assignments Done</div></div>
                <div className="cp-mini-card cp-mini-card--coral"><div className="cp-mini-value">{pending}</div><div className="cp-mini-label">Assignments Pending</div></div>
              </div>
            </div>
            <div className="cp-col">
              <div className="cp-col-head"><h3>My Faculty</h3></div>
              <div className="cp-list cp-list--faculty">
                {FACULTY.map((f, i) => (
                  <div className="cp-row" key={i} style={{ "--i": i }}>
                    <span className="cp-avatar cp-avatar--sm">{f.initials}</span>
                    <div className="cp-row-body"><div className="cp-row-title">{f.name}</div><div className="cp-row-sub">{f.course}</div></div>
                    <Pill tone={f.highlight ? "solid" : "outline"}>Message</Pill>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {active === "attendance" && (
        <>
          <div className="cp-stat-grid"><StatCard icon="target" label="Overall Attendance" value={`${summary.attendancePct}%`} />
            <StatCard icon="check" label="Lectures Present" value={summary.present} /><StatCard icon="clock" label="Total Lectures" value={summary.totalLectures} /></div>
          <Card title="Weekly Trend"><ChartSparkline data={week} /></Card>
        </>
      )}
      {active === "marks" && (
        <div className="cp-stat-grid"><StatCard icon="barchart" label="CGPA" value={summary.cgpa} sub="out of 10" /><StatCard icon="clipboard" label="Assignments Submitted" value={assignments.filter((a) => a.status === "submitted").length} /></div>
      )}
      {active === "assignments" && (
        <Card title="Assignments">
          <DataTable columns={[
            { key: "title", label: "Assignment" }, { key: "course", label: "Course" }, { key: "due", label: "Due" },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "submitted" ? "green" : "amber"}>{r.status}</Badge> },
            { key: "actions", label: "", render: (r) => r.status === "pending" ? <Pill tone="solid" onClick={() => submit(r)}><Icon name="upload" size={13} /> Submit</Pill> : <span className="cp-muted">Submitted</span> },
          ]} rows={assignments} />
        </Card>
      )}
      {active === "placements" && <StudentPlacements user={user} summary={summary} showToast={showToast} />}
      {active === "grievances" && <StudentGrievances user={user} showToast={showToast} />}
      {active === "fees" && <Card title="Fee Information"><div className="cp-stat-grid"><StatCard icon="rupee" label="Balance due" value={summary.feeDue ? `₹${summary.feeDue}` : "₹0"} /></div></Card>}
      {active === "library" && <StudentLibrary user={user} showToast={showToast} />}
      {active === "timetable" && <StudentTimetable />}
    </PortalShell>
  );
}

function StudentPlacements({ user, summary, showToast }) {
  const [postings, setPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applying, setApplying] = useState(null);

  const refresh = useCallback(() => {
    api.placements.list().then(setPostings);
    api.placements.myApplications(user.id).then(setApplications);
  }, [user.id]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => realtimeBus.on("placement:new", refresh), [refresh]);
  useEffect(() => realtimeBus.on("placement:application", refresh), [refresh]);

  const statusFor = (id) => applications.find((a) => a.placementId === id)?.status;
  const isEligible = (p) => summary.cgpa >= p.minCGPA && summary.attendancePct >= p.minAttendance;
  const eligibleCount = postings.filter(isEligible).length;

  async function apply(posting) {
    setApplying(posting.id);
    try {
      await api.placements.apply(posting.id, user, user);
      showToast(`Applied to ${posting.company}`);
      refresh();
    } catch (err) {
      showToast(err.message, "warn");
    }
    setApplying(null);
  }

  return (
    <>
      <div className="cp-stat-grid">
        <StatCard icon="briefcase" label="Open drives" value={postings.filter((p) => p.status === "open").length} />
        <StatCard icon="check" label="You're eligible for" value={eligibleCount} />
        <StatCard icon="clipboard" label="Applications sent" value={applications.length} />
      </div>
      <Card title="Placement Drives" actions={<LiveBadge />}>
        <DataTable columns={[
          { key: "company", label: "Company" },
          { key: "role", label: "Role" },
          { key: "package", label: "Package" },
          { key: "location", label: "Location" },
          { key: "deadline", label: "Deadline" },
          { key: "eligible", label: "Eligibility", render: (r) => {
            const eligible = isEligible(r);
            return <Badge tone={eligible ? "green" : "red"}>{eligible ? "Eligible" : `Needs ${r.minCGPA}+ CGPA, ${r.minAttendance}%+ att.`}</Badge>;
          } },
          { key: "actions", label: "", render: (r) => {
            const status = statusFor(r.id);
            if (status) return <Badge tone={status === "selected" ? "green" : status === "rejected" ? "red" : "amber"}>{status}</Badge>;
            if (r.status !== "open") return <span className="cp-muted">Closed</span>;
            return <Pill tone="solid" disabled={!isEligible(r) || applying === r.id} onClick={() => isEligible(r) && apply(r)}>
              {applying === r.id ? "Applying…" : "Apply"}
            </Pill>;
          } },
        ]} rows={postings} empty="No placement drives posted yet." />
      </Card>
    </>
  );
}

function StudentLibrary({ user, showToast }) {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [requesting, setRequesting] = useState(null);

  const refreshRequests = useCallback(() => { api.student.myLibraryRequests(user.name).then(setRequests); }, [user.name]);
  useEffect(() => { api.student.libraryCatalog().then(setBooks); refreshRequests(); }, [refreshRequests]);
  useEffect(() => realtimeBus.on("library:update", () => refreshRequests()), [refreshRequests]);

  const filtered = books.filter((b) => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(query.toLowerCase()));
  const activeRequestFor = (bookId) => requests.find((r) => r.bookId === bookId && r.status !== "returned");

  async function request(book) {
    setRequesting(book.id);
    await api.student.requestBook(book, user);
    setRequesting(null);
    showToast(`Requested "${book.title}" — the library desk will confirm shortly.`);
    refreshRequests();
  }

  return (
    <>
      <div className="cp-stat-grid">
        <StatCard icon="book" label="Titles in catalog" value={books.length} />
        <StatCard icon="clock" label="My active requests" value={requests.filter((r) => r.status === "pending").length} />
        <StatCard icon="rupee" label="Late fine" value="₹0" />
      </div>
      <Card title="Book Catalog" actions={<input className="cp-search-input" placeholder="Search title, author, category…" value={query} onChange={(e) => setQuery(e.target.value)} />}>
        <DataTable
          columns={[
            { key: "title", label: "Title" }, { key: "author", label: "Author" }, { key: "category", label: "Category" },
            { key: "copies", label: "Availability", render: (r) => <Badge tone={r.copies > 0 ? "green" : "red"}>{r.copies > 0 ? `${r.copies} available` : "All copies out"}</Badge> },
            {
              key: "actions", label: "", render: (r) => {
                const existing = activeRequestFor(r.id);
                if (existing) return <Badge tone={existing.status === "ready-for-pickup" ? "green" : existing.status === "waitlisted" ? "amber" : "neutral"}>{existing.status.replace(/-/g, " ")}</Badge>;
                return <Pill tone="solid" disabled={requesting === r.id} onClick={() => request(r)}>{requesting === r.id ? "Requesting…" : <><Icon name="plus" size={13} /> Request</>}</Pill>;
              },
            },
          ]}
          rows={filtered}
          empty="No books match your search."
        />
      </Card>
      {requests.length > 0 && (
        <Card title="My Library Requests" actions={<LiveBadge />}>
          <DataTable
            columns={[
              { key: "title", label: "Book" },
              { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "ready-for-pickup" ? "green" : r.status === "waitlisted" ? "amber" : "neutral"}>{r.status.replace(/-/g, " ")}</Badge> },
              { key: "ts", label: "Requested", render: (r) => timeAgo(r.ts) },
            ]}
            rows={requests}
          />
        </Card>
      )}
    </>
  );
}

function StudentTimetable() {
  const [grid, setGrid] = useState(null);
  useEffect(() => { api.student.timetable().then(setGrid); }, []);
  if (!grid) return <SectionLoading label="Building your timetable…" />;
  const hasAny = WEEKDAYS.some((d) => grid[d].length);
  return (
    <Card title="My Timetable" actions={<LiveBadge />}>
      {hasAny ? (
        <div className="cp-timetable">
          {WEEKDAYS.map((day, i) => (
            <div className="cp-tt-col" key={day} style={{ "--i": i }}>
              <div className="cp-tt-day">{day}</div>
              {grid[day].length ? grid[day].map((slot, si) => (
                <div className="cp-tt-slot" key={si}>
                  <div className="cp-tt-time">{slot.time}</div>
                  <div className="cp-tt-course">{slot.code}</div>
                  <div className="cp-tt-room">{slot.room}</div>
                </div>
              )) : <div className="cp-tt-empty">Free</div>}
            </div>
          ))}
        </div>
      ) : <p className="cp-muted">Your schedule will appear here once courses are set up for the term.</p>}
    </Card>
  );
}

const GMAIL_RE = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

function GrievanceDesk({ user, showToast, raiseFn, listFn, introText, categories }) {
  const cats = categories || GRIEVANCE_CATEGORIES_STUDENT;
  const [category, setCategory] = useState(cats[0]);
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState(user.email || "");
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const suggestion = description.trim().length > 8 ? autoClassifyGrievance(description, user.role) : null;
  const emailTouched = contactEmail.trim().length > 0;
  const emailValid = !emailTouched || GMAIL_RE.test(contactEmail.trim());

  const refresh = useCallback(() => { listFn(user.name).then(setItems); }, [user.name, listFn]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => realtimeBus.on("grievance:update", () => refresh()), [refresh]);

  async function submit() {
    if (!description.trim()) return showToast("Describe your grievance first", "warn");
    if (!emailValid) return showToast("Enter a valid Gmail address (e.g. name@gmail.com), or leave the contact email blank", "warn");
    setSubmitting(true);
    try {
      await raiseFn({ category, description: description.trim(), contactEmail: contactEmail.trim() || null }, user);
    } catch (err) {
      setSubmitting(false);
      return showToast(err.message || "Couldn't submit grievance", "warn");
    }
    setSubmitting(false);
    setDescription("");
    showToast("Grievance submitted");
    setJustSubmitted(true);
    window.setTimeout(() => setJustSubmitted(false), 1800);
  }

  const openCount = items.filter((g) => g.status !== "resolved").length;

  return (
    <>
      <div className="cp-stat-grid">
        <StatCard icon="clipboard" label="Total raised" value={items.length} />
        <StatCard icon="clock" label="Open / in review" value={openCount} />
        <StatCard icon="check" label="Resolved" value={items.filter((g) => g.status === "resolved").length} />
      </div>

      <Card title="Raise a Grievance">
        {introText && <p className="cp-muted" style={{ marginTop: 0 }}>{introText}</p>}
        <div className={"cp-form-grid" + (justSubmitted ? " cp-form-grid--flash" : "")}>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <textarea rows={4} placeholder="Describe the issue in detail…" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div>
            <FieldInput
              icon="mail"
              placeholder="Contact email (Gmail) — so admin/teacher can reply"
              value={contactEmail}
              onChange={setContactEmail}
              type="email"
            />
            {!emailValid && (
              <div className="cp-autotag-hint" style={{ color: "var(--danger, #e5484d)" }}>
                Enter a valid Gmail address (e.g. name@gmail.com), or clear this field to skip it.
              </div>
            )}
          </div>
          {suggestion && (
            <div className="cp-autotag-hint">
              <span className="cp-autotag-label">Auto-tagged (demo heuristic):</span>
              <span className="cp-autotag-value">{suggestion}</span>
              {suggestion !== category && (
                <Pill tone="ghost" onClick={() => setCategory(suggestion)}>Use this category</Pill>
              )}
            </div>
          )}
          <button type="button" className="cp-btn-accent" disabled={submitting || !emailValid} onClick={submit}>
            {submitting ? "Submitting…" : justSubmitted ? <><Icon name="check" size={13} /> Submitted</> : "Submit grievance"}
          </button>
        </div>
      </Card>

      <Card title="My Grievances" actions={<LiveBadge />}>
        <DataTable
          columns={[
            { key: "category", label: "Category" },
            { key: "description", label: "Description", render: (r) => <span className="cp-grv-desc">{r.description}</span> },
            { key: "status", label: "Status", render: (r) => <GrievanceStatusBadge status={r.status} /> },
            { key: "contactEmail", label: "Contact", render: (r) => r.contactEmail || "—" },
            { key: "assignedTo", label: "Handled by", render: (r) => r.assignedTo || "—" },
            { key: "ts", label: "Raised", render: (r) => timeAgo(r.ts) },
          ]}
          rows={items}
          empty="You haven't raised any grievances yet."
        />
      </Card>
    </>
  );
}

function StudentGrievances({ user, showToast }) {
  return <GrievanceDesk user={user} showToast={showToast} raiseFn={api.student.raiseGrievance} listFn={api.student.myGrievances} categories={GRIEVANCE_CATEGORIES_STUDENT} />;
}

function TeacherGrievances({ user, showToast }) {
  return (
    <GrievanceDesk
      user={user}
      showToast={showToast}
      raiseFn={api.teacher.raiseGrievance}
      listFn={api.teacher.myGrievances}
      categories={GRIEVANCE_CATEGORIES_TEACHER}
      introText="Raise an issue with admin — curriculum, timetable & workload, payroll/HR, infrastructure, or workplace conduct concerns."
    />
  );
}

const TEACHER_NAV = [
  { key: "overview", label: "My Dashboard", icon: "grid" },
  { key: "profile", label: "My Profile", icon: "user" },
  { key: "subjects", label: "My Subjects", icon: "book" },
  { key: "students", label: "My Students", icon: "users" },
  { key: "attendance", label: "Take Attendance", icon: "camera" },
  { key: "assignments", label: "Manage Assignments", icon: "clipboard" },
  { key: "marks", label: "Enter Marks", icon: "barchart" },
  { key: "material", label: "Study Material", icon: "upload" },
  { key: "timetable", label: "My Timetable", icon: "clock" },
  { key: "notices", label: "Class Notices", icon: "forum" },
  { key: "leave", label: "Apply Leave", icon: "calendar" },
  { key: "grievances", label: "Grievances", icon: "alert" },
  { key: "reports", label: "My Reports", icon: "activity" },
];

function TeacherApp({ user, theme, onToggleTheme, onLogout }) {
  const [active, setActive] = useState("overview");
  const [toast, showToast] = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [recentAudit, setRecentAudit] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [pendingLeave, setPendingLeave] = useState(0);
  const [openGrievances, setOpenGrievances] = useState(0);

  const refreshCourses = useCallback(() => { api.teacher.myCourses(user.name).then((cs) => { setCourses(cs); setSelectedCourse((sel) => sel || (cs[0] && cs[0].id)); }); }, [user.name]);
  const refreshRoster = useCallback(() => { api.teacher.roster().then(setRoster); }, []);
  const refreshAudit = useCallback(() => { api.admin.listAuditLog().then((a) => setRecentAudit(a.filter((e) => e.actor === user.name).slice(0, 6))); }, [user.name]);
  const refreshStudentStats = useCallback((cs) => { if (cs.length) api.teacher.studentsWithStats(cs.map((c) => c.id)).then(setStudentStats); }, []);
  const refreshReports = useCallback((cs) => { if (cs.length) api.teacher.reportsSummary(user.name, cs).then(setReportSummary); }, [user.name]);
  const refreshLeave = useCallback(() => { api.teacher.listMyLeave(user.name).then((l) => setPendingLeave(l.filter((x) => x.status === "pending").length)); }, [user.name]);
  const refreshGrievances = useCallback(() => { api.teacher.myGrievances(user.name).then((g) => setOpenGrievances(g.filter((x) => x.status !== "resolved").length)); }, [user.name]);

  useEffect(() => { refreshCourses(); refreshRoster(); refreshAudit(); refreshLeave(); refreshGrievances(); }, [refreshCourses, refreshRoster, refreshAudit, refreshLeave, refreshGrievances]);
  useEffect(() => { if (courses.length) { refreshStudentStats(courses); refreshReports(courses); } }, [courses, refreshStudentStats, refreshReports]);
  useEffect(() => realtimeBus.on("audit:new", (e) => { if (e.actor === user.name) setRecentAudit((a) => [e, ...a].slice(0, 6)); }), [user.name]);
  useEffect(() => realtimeBus.on("attendance:update", () => { refreshStudentStats(courses); refreshReports(courses); }), [courses, refreshStudentStats, refreshReports]);
  useEffect(() => realtimeBus.on("grades:update", () => { refreshStudentStats(courses); refreshReports(courses); }), [courses, refreshStudentStats, refreshReports]);
  useEffect(() => realtimeBus.on("leave:update", () => refreshLeave()), [refreshLeave]);
  useEffect(() => realtimeBus.on("grievance:update", () => refreshGrievances()), [refreshGrievances]);

  const courseNames = useMemo(() => courses.map((c) => c.name), [courses]);
  const navWithBadges = useMemo(() => TEACHER_NAV.map((n) => {
    if (n.key === "leave" && pendingLeave) return { ...n, badge: pendingLeave };
    if (n.key === "grievances" && openGrievances) return { ...n, badge: openGrievances };
    return n;
  }), [pendingLeave, openGrievances]);

  return (
    <PortalShell roleKey="teacher" navItems={navWithBadges}
      active={active} onNavigate={setActive} user={user} theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout}
      headerTitle="Faculty Workspace" headerSub="Mark attendance, publish grades, and keep every class moving — all from one desk.">
      <Toast toast={toast} />
      {active === "overview" && (
        <TeacherOverview user={user} courses={courses} roster={roster} recentAudit={recentAudit} reportSummary={reportSummary} pendingLeave={pendingLeave} setActive={setActive} />
      )}
      {active === "profile" && <TeacherProfile user={user} showToast={showToast} />}
      {active === "subjects" && <MySubjects user={user} setActive={setActive} showToast={showToast} />}
      {active === "students" && <MyStudents students={studentStats} courses={courses} />}
      {active === "attendance" && <AttendanceOCR courses={courses} selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} roster={roster} user={user} showToast={showToast} />}
      {active === "assignments" && <AssignmentsManager courses={courses} courseNames={courseNames} user={user} showToast={showToast} />}
      {active === "marks" && <Gradebook courses={courses} selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} roster={roster} user={user} showToast={showToast} />}
      {active === "material" && <StudyMaterial courses={courses} courseNames={courseNames} user={user} showToast={showToast} />}
      {active === "timetable" && <TeacherTimetable courses={courses} />}
      {active === "notices" && <ClassNotices courses={courses} user={user} showToast={showToast} />}
      {active === "leave" && <ApplyLeave user={user} showToast={showToast} onChange={refreshLeave} />}
      {active === "grievances" && <TeacherGrievances user={user} showToast={showToast} />}
      {active === "reports" && <TeacherReports courses={courses} summary={reportSummary} />}
    </PortalShell>
  );
}

function TeacherOverview({ user, courses, roster, recentAudit, reportSummary, pendingLeave, setActive }) {
  return (
    <>
      <section className="cp-hero cp-hero--teacher">
        <div className="cp-hero-text">
          <div className="cp-hero-eyebrow"><span className="cp-live-dot" aria-hidden="true" />Faculty Workspace</div>
          <h2>Good to see you, {user.name.split(" ").slice(-1)[0]}.</h2>
          <p>{courses.length} {courses.length === 1 ? "class" : "classes"} in your charge this term — attendance, grading and notices, all synced live.</p>
          <div className="cp-hero-stats">
            <div className="cp-hero-stat"><span className="cp-hero-ico cp-hero-ico--coral"><Icon name="target" size={15} /></span>
              <div><div className="cp-hero-stat-value">{reportSummary ? `${reportSummary.avgAttendance}%` : "—"}</div><div className="cp-hero-stat-label">Avg. class attendance</div></div></div>
            <div className="cp-hero-stat"><span className="cp-hero-ico cp-hero-ico--yellow"><Icon name="barchart" size={15} /></span>
              <div><div className="cp-hero-stat-value">{reportSummary ? reportSummary.avgScore || "—" : "—"}</div><div className="cp-hero-stat-label">Avg. score / 100</div></div></div>
          </div>
          <div className="cp-hero-actions">
            <Pill tone="hero-solid" onClick={() => setActive("reports")}>View Full Report <Icon name="arrowUpRight" size={13} /></Pill>
            <div className="cp-hero-quicklinks">
              <button className="cp-hero-chip" onClick={() => setActive("attendance")}>Take attendance</button>
              <button className="cp-hero-chip" onClick={() => setActive("assignments")}>Assignments</button>
              <button className="cp-hero-chip" onClick={() => setActive("notices")}>Send notice</button>
            </div>
          </div>
        </div>
      </section>

      <div className="cp-stat-grid">
        <StatCard icon="building" label="My Subjects" value={courses.length} />
        <StatCard icon="users" label="Students Taught" value={roster.length} />
        <StatCard icon="clipboard" label="Assignments Posted" value={reportSummary ? reportSummary.assignmentsPosted : "—"} />
        <StatCard icon="calendar" label="Leave Requests Open" value={pendingLeave} />
      </div>

      <section className="cp-panelgrid">
        <Card wide title="My recent actions"><AuditList entries={recentAudit} /></Card>
        <Card title="This week">
          <div className="cp-glance">
            {courses.map((c, i) => (
              <div className="cp-glance-row" key={c.id} style={{ "--i": i }}><span>{c.code} — {c.name}</span><span className="cp-badge cp-badge--teal">{c.students} students</span></div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AttendanceOCR({ courses, selectedCourse, setSelectedCourse, roster, user, showToast }) {
  const [mode, setMode] = useState("ocr");
  const [sessionDate, setSessionDate] = useState(todayIso);
  const [photoName, setPhotoName] = useState("");
  const [stage, setStage] = useState("idle");
  const [detected, setDetected] = useState(null);
  const [ocrMeta, setOcrMeta] = useState(null); // { source: "ocr" | "simulated", note }
  const [manual, setManual] = useState([]);
  const fileRef = useRef(null);
  const course = courses.find((c) => c.id === selectedCourse);

  useEffect(() => { setManual(roster.map((s) => ({ ...s, present: true }))); }, [roster]);

  function handlePickPhoto(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setPhotoName(f.name); setDetected(null); setOcrMeta(null); runOcrPipeline(f);
  }
  async function runOcrPipeline(photoFile) {
    setStage("uploading"); await new Promise((r) => setTimeout(r, 400));
    setStage("detecting"); await new Promise((r) => setTimeout(r, 400));
    setStage("matching");
    try {
      const result = await api.teacher.ocrProcessAttendance(photoFile);
      setStage("done"); setDetected(result.detections); setOcrMeta({ source: result.source, note: result.note });
    } catch (err) {
      setStage("idle"); setPhotoName(""); if (fileRef.current) fileRef.current.value = "";
      showToast(err.message || "Couldn't process that photo", "warn");
    }
  }
  function toggleDetected(id) { setDetected((d) => d.map((x) => (x.studentId === id ? { ...x, present: !x.present } : x))); }
  function toggleManual(id) { setManual((m) => m.map((x) => (x.id === id ? { ...x, present: !x.present } : x))); }

  async function publish(records) {
    if (!course) return showToast("Pick a course first", "warn");
    await api.teacher.markAttendance(course.id, `${course.code} — ${course.name}`, records, user, sessionDate || todayIso());
    showToast("Attendance published");
    setDetected(null); setOcrMeta(null); setStage("idle"); setPhotoName(""); if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Card title="Mark Attendance">
      <div className="cp-attendance-layout">
        <div className="cp-attendance-options">
          <div className="cp-attendance-opt-group">
            <span className="cp-attendance-opt-label">Mode</span>
            <div className="cp-attendance-mode-switch">
              <button type="button" className={"cp-nav-item" + (mode === "ocr" ? " is-active" : "")} onClick={() => setMode("ocr")}>
                <Icon name="camera" size={15} /> Photo (OCR)
              </button>
              <button type="button" className={"cp-nav-item" + (mode === "manual" ? " is-active" : "")} onClick={() => setMode("manual")}>
                <Icon name="clipboard" size={15} /> Manual
              </button>
            </div>
          </div>
          <div className="cp-attendance-opt-group">
            <span className="cp-attendance-opt-label">Course / class</span>
            {courses.length
              ? <select value={selectedCourse || ""} onChange={(e) => setSelectedCourse(e.target.value)} className="cp-select">
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              : <span className="cp-muted">No courses assigned</span>}
          </div>
          <div className="cp-attendance-opt-group">
            <span className="cp-attendance-opt-label">Date</span>
            <input type="date" className="cp-select" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            <span className="cp-attendance-opt-hint">Defaults to today — change this to backfill an older photo or log a makeup class.</span>
          </div>
        </div>
        <div className="cp-attendance-main">
          {mode === "ocr" && (
            <div className="cp-ocr-panel">
              {!detected && stage === "idle" && (
                <label className="cp-ocr-drop">
                  <Icon name="camera" size={26} />
                  <div><strong>Upload a class photo</strong><span>We'll detect students and pre-fill attendance for you to review.</span></div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePickPhoto} hidden />
                </label>
              )}
              {stage !== "idle" && stage !== "done" && (
                <div className="cp-ocr-processing">
                  <div className="cp-spinner" />
                  <div className="cp-ocr-steps">
                    <div className={stage === "uploading" ? "is-active" : "is-done"}>Uploading {photoName}…</div>
                    <div className={stage === "detecting" ? "is-active" : stage === "matching" ? "is-done" : ""}>Reading roll numbers &amp; marks…</div>
                    <div className={stage === "matching" ? "is-active" : ""}>Matching against class roster…</div>
                  </div>
                </div>
              )}
              {stage === "done" && detected && (
                <>
                  {ocrMeta && (
                    <div className={"cp-ocr-source-banner" + (ocrMeta.source === "ocr" ? " cp-ocr-source-banner--real" : " cp-ocr-source-banner--sim")}>
                      <Icon name={ocrMeta.source === "ocr" ? "check" : "alert"} size={14} />
                      <span>{ocrMeta.source === "ocr" ? "Read from your photo. " : "Simulated demo data — not read from your photo. "}{ocrMeta.note}</span>
                    </div>
                  )}
                  <div className="cp-ocr-summary">Detected {detected.filter((d) => d.present).length} of {detected.length} students present for {sessionDate}. Review and correct before publishing.</div>
                  <DataTable columns={[
                    { key: "name", label: "Student" }, { key: "idLabel", label: "ID" },
                    { key: "confidence", label: "Confidence", render: (r) => <Badge tone={r.confidence > 85 ? "green" : "amber"}>{r.confidence}%</Badge> },
                    { key: "present", label: "Present", render: (r) => <Switch checked={r.present} onChange={() => toggleDetected(r.studentId)} /> },
                  ]} rows={detected} />
                  <div className="cp-ocr-actions">
                    <Pill tone="ghost" onClick={() => { setDetected(null); setStage("idle"); setPhotoName(""); }}>Retake / cancel</Pill>
                    <Pill tone="solid" onClick={() => publish(detected.map((d) => ({ studentId: d.studentId, present: d.present })))}>Confirm &amp; publish</Pill>
                  </div>
                </>
              )}
            </div>
          )}
          {mode === "manual" && (
            <>
              <DataTable columns={[
                { key: "name", label: "Student" }, { key: "idLabel", label: "ID" },
                { key: "present", label: "Present", render: (r) => <Switch checked={r.present} onChange={() => toggleManual(r.id)} /> },
              ]} rows={manual} />
              <div className="cp-ocr-actions"><Pill tone="solid" onClick={() => publish(manual.map((m) => ({ studentId: m.id, present: m.present })))}>Publish attendance for {sessionDate}</Pill></div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function Gradebook({ courses, selectedCourse, setSelectedCourse, roster, user, showToast }) {
  const [assessment, setAssessment] = useState("Midterm");
  const [scores, setScores] = useState({});
  const [history, setHistory] = useState([]);
  const course = courses.find((c) => c.id === selectedCourse);
  useEffect(() => { setScores(Object.fromEntries(roster.map((s) => [s.id, ""]))); }, [roster]);
  useEffect(() => { setHistory(DB.grades.filter((g) => g.courseId === selectedCourse)); }, [selectedCourse]);
  useEffect(() => realtimeBus.on("grades:update", (g) => { if (g.courseId === selectedCourse) setHistory((h) => [g, ...h]); }), [selectedCourse]);

  const filledCount = Object.values(scores).filter((v) => v !== "").length;
  const liveEntries = roster.map((s) => ({ studentId: s.id, score: Number(scores[s.id]) || 0 })).filter((e) => scores[e.studentId] !== "");
  const distribution = gradeDistribution(liveEntries.length ? liveEntries : []);

  async function publish() {
    if (!course) return showToast("Pick a course first", "warn");
    const entries = roster.map((s) => ({ studentId: s.id, score: Number(scores[s.id]) || 0 }));
    await api.teacher.publishGrades(course.id, `${course.code} — ${course.name}`, assessment, entries, user);
    showToast("Grades published");
  }

  return (
    <>
      <Card title="Enter Marks" actions={
        <div className="cp-inline-controls">
          <select value={selectedCourse || ""} onChange={(e) => setSelectedCourse(e.target.value)} className="cp-select">
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <select value={assessment} onChange={(e) => setAssessment(e.target.value)} className="cp-select">
            <option>Midterm</option><option>Final</option><option>Assignment 1</option><option>Quiz 1</option>
          </select>
        </div>}>
        <div className="cp-gradebook-meta">
          <span className="cp-muted">{filledCount} / {roster.length} entered</span>
          <div className="cp-gradebook-bar"><div className="cp-gradebook-bar-fill" style={{ width: `${roster.length ? (filledCount / roster.length) * 100 : 0}%` }} /></div>
        </div>
        <DataTable columns={[
          { key: "name", label: "Student" }, { key: "idLabel", label: "ID" },
          { key: "score", label: "Score (/100)", render: (r) => <input className="cp-score-input" type="number" min="0" max="100" value={scores[r.id] ?? ""} onChange={(e) => setScores((s) => ({ ...s, [r.id]: e.target.value }))} /> },
        ]} rows={roster} />
        <div className="cp-ocr-actions"><Pill tone="solid" onClick={publish}>Publish grades</Pill></div>
      </Card>
      {liveEntries.length > 1 && <Card title="Live distribution preview"><ChartBarRow data={distribution} suffix="" /></Card>}
      <Card title="Previously published" actions={<LiveBadge />}>
        <DataTable columns={[
          { key: "assessment", label: "Assessment" },
          { key: "entries", label: "Avg. score", render: (r) => Math.round(r.entries.reduce((a, e) => a + e.score, 0) / r.entries.length) },
          { key: "publishedBy", label: "Published by" },
          { key: "ts", label: "When", render: (r) => timeAgo(r.ts) },
        ]} rows={history} empty="No assessments published yet for this subject." />
      </Card>
    </>
  );
}

function TeacherProfile({ user, showToast }) {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  useEffect(() => { api.teacher.getProfile(user.id).then((p) => { setProfile(p); setForm(p); }); }, [user.id]);

  async function save() {
    const updated = await api.teacher.updateProfile(user.id, form, user);
    setProfile(updated); setEdit(false); showToast("Profile updated");
  }
  if (!profile) return <SectionLoading label="Loading your profile…" />;

  return (
    <>
      <Card title="My Profile" actions={edit
        ? <><Pill tone="ghost" onClick={() => { setForm(profile); setEdit(false); }}>Cancel</Pill><Pill tone="solid" onClick={save}>Save changes</Pill></>
        : <Pill tone="solid" onClick={() => setEdit(true)}><Icon name="gear" size={13} /> Edit profile</Pill>}>
        <div className="cp-profile-detail">
          <div className="cp-profile-detail-avatar">{initialsOf(profile.name)}</div>
          <div className="cp-profile-detail-grid">
            {[
              ["Full name", "name"], ["Email", "email"], ["Phone", "phone"], ["Staff ID", "idLabel"],
              ["Department", "department"], ["Designation", "designation"], ["Qualification", "qualification"],
              ["Office", "office"], ["Joined", "joined"],
            ].map(([label, key]) => (
              <label className="cp-pd-field" key={key}>
                <span>{label}</span>
                {edit ? <input value={form[key] || ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                  : <strong>{profile[key] || "—"}</strong>}
              </label>
            ))}
            <label className="cp-pd-field cp-pd-field--wide">
              <span>Bio</span>
              {edit ? <textarea rows={3} value={form.bio || ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                : <strong>{profile.bio || "—"}</strong>}
            </label>
          </div>
        </div>
      </Card>
    </>
  );
}

function MySubjects({ user, setActive, showToast }) {
  const teacherName = user.name;
  const [subjects, setSubjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", dept: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const refreshSubjects = useCallback(() => { api.teacher.subjects(teacherName).then(setSubjects); }, [teacherName]);
  const refreshRequests = useCallback(() => { api.teacher.mySubjectRequests(teacherName).then(setRequests); }, [teacherName]);
  useEffect(() => { refreshSubjects(); refreshRequests(); }, [refreshSubjects, refreshRequests]);
  useEffect(() => realtimeBus.on("subjectRequest:update", (req) => {
    if (req && req.teacherName === teacherName) { refreshRequests(); if (req.status === "approved") refreshSubjects(); }
  }), [teacherName, refreshRequests, refreshSubjects]);

  async function submitRequest() {
    if (!form.code.trim() || !form.name.trim()) return showToast && showToast("Add a subject code and name", "warn");
    setSubmitting(true);
    await api.teacher.requestSubject(form, user);
    setSubmitting(false);
    setModal(false); setForm({ code: "", name: "", dept: "", notes: "" });
    showToast && showToast("Subject request sent to admin for approval");
    refreshRequests();
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <>
      <Card title="My Subjects" actions={
        <div className="cp-inline-controls">
          <Pill tone="solid" onClick={() => setModal(true)}><Icon name="plus" size={14} /> Request new subject</Pill>
          <LiveBadge />
        </div>}>
        <div className="cp-subject-grid">
          {subjects.map((s, i) => (
            <div className="cp-subject-card" key={s.id} style={{ "--i": i }}>
              <div className="cp-subject-top">
                <span className="cp-subject-code">{s.code}</span>
                <Badge tone="teal">{s.students} students</Badge>
              </div>
              <h4>{s.name}</h4>
              <div className="cp-subject-dept">{s.dept}</div>
              <div className="cp-subject-progress-label"><span>Syllabus progress</span><span>{s.progress}%</span></div>
              <div className="cp-gradebook-bar"><div className="cp-gradebook-bar-fill" style={{ width: `${s.progress}%` }} /></div>
              <div className="cp-subject-next">Next up: {s.nextTopic}</div>
              <div className="cp-subject-actions">
                <Pill tone="outline" onClick={() => setActive("attendance")}>Attendance</Pill>
                <Pill tone="outline" onClick={() => setActive("material")}>Materials</Pill>
              </div>
            </div>
          ))}
          {!subjects.length && <div className="cp-table-empty">No subjects assigned yet — request one above to get started.</div>}
        </div>
      </Card>

      {requests.length > 0 && (
        <Card title="My Subject Requests" actions={pendingCount ? <Badge tone="amber">{pendingCount} pending</Badge> : null}>
          <DataTable
            columns={[
              { key: "code", label: "Code" }, { key: "name", label: "Subject" }, { key: "dept", label: "Department" },
              { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "amber"}>{r.status}</Badge> },
              { key: "ts", label: "Requested", render: (r) => timeAgo(r.ts) },
            ]}
            rows={requests}
          />
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Request a new subject">
        <div className="cp-form-grid">
          <p className="cp-muted" style={{ marginTop: 0 }}>Sent to admin for approval — once approved, it's added straight to your subjects.</p>
          <input placeholder="Subject code (e.g. CS410)" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <input placeholder="Subject name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input placeholder="Department" value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))} />
          <textarea rows={3} placeholder="Notes for admin (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <button type="button" className="cp-btn-accent" disabled={submitting} onClick={submitRequest}>{submitting ? "Sending…" : "Send request"}</button>
        </div>
      </Modal>
    </>
  );
}

function MyStudents({ students, courses }) {
  const [tab, setTab] = useState("roster");
  const [query, setQuery] = useState("");
  const filtered = students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.idLabel.toLowerCase().includes(query.toLowerCase()));
  const atRisk = students.filter((s) => s.attendancePct < 75).length;
  return (
    <>
      <div className="cp-stat-grid">
        <StatCard icon="users" label="Total students" value={students.length} sub={`across ${courses.length} subjects`} />
        <StatCard icon="target" label="Below 75% attendance" value={atRisk} sub="needs attention" />
        <StatCard icon="barchart" label="Avg. score" value={students.length ? Math.round(students.reduce((a, s) => a + s.avgScore, 0) / students.length) : "—"} />
      </div>
      <Tabs tabs={[{ key: "roster", label: "Roster" }, { key: "risk", label: "Risk Insights" }]} active={tab} onChange={setTab} />
      {tab === "roster" && (
        <Card title="My Students" actions={<input className="cp-search-input" placeholder="Search by name or ID…" value={query} onChange={(e) => setQuery(e.target.value)} />}>
          <DataTable columns={[
            { key: "name", label: "Student" }, { key: "idLabel", label: "ID" },
            { key: "attendancePct", label: "Attendance", render: (r) => <Badge tone={r.attendancePct >= 85 ? "green" : r.attendancePct >= 75 ? "amber" : "red"}>{r.attendancePct}%</Badge> },
            { key: "avgScore", label: "Avg. score", render: (r) => <Badge tone={r.avgScore >= 75 ? "green" : r.avgScore >= 50 ? "amber" : "red"}>{r.avgScore}/100</Badge> },
          ]} rows={filtered} />
        </Card>
      )}
      {tab === "risk" && <TeacherRiskInsights courses={courses} />}
    </>
  );
}

function AssignmentsManager({ courses, courseNames, user, showToast }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", course: courseNames[0] || "", due: "", maxMarks: 100, description: "" });
  const refresh = useCallback(() => { if (courseNames.length) api.teacher.listAssignments(courseNames).then(setItems); }, [courseNames]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { setForm((f) => ({ ...f, course: f.course || courseNames[0] || "" })); }, [courseNames]);

  async function create() {
    if (!form.title.trim() || !form.due.trim()) return showToast("Add a title and due date", "warn");
    await api.teacher.createAssignment({ title: form.title.trim(), course: form.course, due: form.due.trim(), maxMarks: Number(form.maxMarks) || 100, description: form.description }, user);
    setModal(false); setForm({ title: "", course: courseNames[0] || "", due: "", maxMarks: 100, description: "" });
    refresh(); showToast("Assignment posted to class");
  }

  return (
    <Card title="Manage Assignments" actions={<Pill tone="solid" onClick={() => setModal(true)}><Icon name="plus" size={14} /> New assignment</Pill>}>
      <DataTable columns={[
        { key: "title", label: "Assignment" }, { key: "course", label: "Subject" }, { key: "due", label: "Due" },
        { key: "submittedCount", label: "Submissions", render: (r) => `${r.submittedCount ?? "—"}${r.totalStudents ? ` / ${r.totalStudents}` : ""}` },
        { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "submitted" ? "green" : "amber"}>{r.status}</Badge> },
      ]} rows={items} empty="No assignments posted for your subjects yet." />
      <Modal open={modal} onClose={() => setModal(false)} title="New assignment">
        <div className="cp-form-grid">
          <input placeholder="Assignment title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <select value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
            {courses.map((c) => <option key={c.id} value={c.name}>{c.code} — {c.name}</option>)}
          </select>
          <input placeholder="Due date (e.g. 5 Sep)" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} />
          <input placeholder="Max marks" type="number" value={form.maxMarks} onChange={(e) => setForm((f) => ({ ...f, maxMarks: e.target.value }))} />
          <textarea placeholder="Instructions (optional)" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <button type="button" className="cp-btn-accent" onClick={create}>Post to class</button>
        </div>
      </Modal>
    </Card>
  );
}

function StudyMaterial({ courses, courseNames, user, showToast }) {
  const [items, setItems] = useState([]);
  const [course, setCourse] = useState(courseNames[0] || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const refresh = useCallback(() => { if (courseNames.length) api.teacher.listMaterial(courseNames).then(setItems); }, [courseNames]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { setCourse((c) => c || courseNames[0] || ""); }, [courseNames]);

  async function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f || !course) return;
    setUploading(true);
    const ext = (f.name.split(".").pop() || "file").toUpperCase();
    const sizeKb = Math.max(1, Math.round(f.size / 1024));
    await new Promise((r) => setTimeout(r, 900));
    await api.teacher.uploadMaterial({ title: f.name, course, type: ext, size: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB` }, user);
    setUploading(false); if (fileRef.current) fileRef.current.value = "";
    refresh(); showToast("Study material uploaded");
  }

  return (
    <Card title="Study Material" actions={
      courses.length
        ? <select value={course} onChange={(e) => setCourse(e.target.value)} className="cp-select">
            {courses.map((c) => <option key={c.id} value={c.name}>{c.code} — {c.name}</option>)}
          </select>
        : <span className="cp-muted">No subjects assigned</span>}>
      <label className="cp-ocr-drop">
        <Icon name="upload" size={26} />
        <div><strong>{uploading ? "Uploading…" : "Upload a file for this subject"}</strong><span>Notes, slides, lab manuals, reference solutions — students see it instantly.</span></div>
        <input ref={fileRef} type="file" onChange={handleFile} hidden disabled={uploading || !course} />
      </label>
      <DataTable columns={[
        { key: "title", label: "File" }, { key: "course", label: "Subject" },
        { key: "type", label: "Type", render: (r) => <Badge tone="navy">{r.type}</Badge> }, { key: "size", label: "Size" },
        { key: "ts", label: "Uploaded", render: (r) => timeAgo(r.ts) },
      ]} rows={items} empty="No material uploaded yet." />
    </Card>
  );
}

function TeacherTimetable({ courses }) {
  const [grid, setGrid] = useState(null);
  useEffect(() => { api.teacher.timetable(courses).then(setGrid); }, [courses]);
  if (!grid) return <SectionLoading label="Building your timetable…" />;
  return (
    <Card title="My Timetable" actions={<LiveBadge />}>
      <div className="cp-timetable">
        {WEEKDAYS.map((day, i) => (
          <div className="cp-tt-col" key={day} style={{ "--i": i }}>
            <div className="cp-tt-day">{day}</div>
            {grid[day].length ? grid[day].map((slot, si) => (
              <div className="cp-tt-slot" key={si}>
                <div className="cp-tt-time">{slot.time}</div>
                <div className="cp-tt-course">{slot.code}</div>
                <div className="cp-tt-room">{slot.room}</div>
              </div>
            )) : <div className="cp-tt-empty">Free</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ClassNotices({ courses, user, showToast }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", course: "" });
  const refresh = useCallback(() => { api.teacher.listNotices(user.name).then(setItems); }, [user.name]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { setForm((f) => ({ ...f, course: f.course || (courses[0] && courses[0].name) || "" })); }, [courses]);

  async function send() {
    if (!form.title.trim()) return showToast("Write a notice first", "warn");
    await api.teacher.sendNotice({ title: form.title.trim(), course: form.course }, user);
    setForm({ title: "", course: form.course }); refresh(); showToast("Notice sent to class");
  }

  return (
    <>
      <Card title="Send Class Notice">
        <div className="cp-notice-composer">
          <select value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} className="cp-select">
            {courses.map((c) => <option key={c.id} value={c.name}>{c.code} — {c.name}</option>)}
          </select>
          <textarea rows={3} placeholder="e.g. Tomorrow's lecture moved to Lab 3, 10am." value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="cp-ocr-actions"><Pill tone="solid" onClick={send}><Icon name="forum" size={13} /> Send to class</Pill></div>
        </div>
      </Card>
      <Card title="Sent Notices" actions={<LiveBadge />}>
        <div className="cp-notice-list">
          {items.length ? items.map((n, i) => (
            <div className="cp-notice-row" key={n.id} style={{ "--i": i }}>
              <span className="cp-notice-tag">{n.course}</span><span className="cp-notice-title">{n.title}</span><span className="cp-notice-date">{timeAgo(n.ts)}</span>
            </div>
          )) : <div className="cp-table-empty">You haven't sent any notices yet.</div>}
        </div>
      </Card>
    </>
  );
}

function ApplyLeave({ user, showToast, onChange }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: "Casual", from: "", to: "", reason: "" });
  const refresh = useCallback(() => { api.teacher.listMyLeave(user.name).then(setItems); }, [user.name]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => realtimeBus.on("leave:update", () => { refresh(); onChange && onChange(); }), [refresh, onChange]);

  async function apply() {
    if (!form.from || !form.to || !form.reason.trim()) return showToast("Fill in dates and a reason", "warn");
    await api.teacher.applyLeave(form, user);
    setForm({ type: "Casual", from: "", to: "", reason: "" });
    refresh(); onChange && onChange();
    showToast("Leave request submitted");
  }

  return (
    <>
      <Card title="Apply for Leave">
        <div className="cp-form-grid">
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option>Casual</option><option>Medical</option><option>Conference</option><option>Earned</option>
          </select>
          <div className="cp-leave-dates">
            <label>From<input type="date" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} /></label>
            <label>To<input type="date" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} /></label>
          </div>
          <textarea placeholder="Reason for leave" rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          <button type="button" className="cp-btn-accent" onClick={apply}>Submit request</button>
        </div>
      </Card>
      <Card title="My Leave History" actions={<LiveBadge />}>
        <DataTable columns={[
          { key: "type", label: "Type" }, { key: "from", label: "From" }, { key: "to", label: "To" }, { key: "reason", label: "Reason" },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "amber"}>{r.status}</Badge> },
        ]} rows={items} empty="No leave requests filed yet." />
      </Card>
    </>
  );
}

function TeacherReports({ courses, summary }) {
  if (!summary) return <SectionLoading label="Crunching your reports…" />;
  return (
    <>
      <div className="cp-stat-grid">
        <StatCard icon="target" label="Avg. attendance" value={`${summary.avgAttendance}%`} />
        <StatCard icon="barchart" label="Avg. score" value={summary.avgScore || "—"} />
        <StatCard icon="camera" label="Classes held" value={summary.classesHeld} />
        <StatCard icon="check" label="Assessments published" value={summary.gradesPublished} />
      </div>
      <Card title="Attendance trend (7 sessions)"><ChartSparkline data={summary.trend} /></Card>
      <Card title="Grade distribution across your subjects"><ChartBarRow data={summary.distribution} suffix="" /></Card>
      <Card title="Subjects covered">
        <DataTable columns={[{ key: "code", label: "Code" }, { key: "name", label: "Subject" }, { key: "dept", label: "Department" }, { key: "students", label: "Students" }]} rows={courses} />
      </Card>
    </>
  );
}

const ADMIN_NAV = [
  { key: "overview", label: "Overview", icon: "grid" },
  { key: "users", label: "Users & Roles", icon: "users" },
  { key: "courses", label: "Courses & Faculty", icon: "building" },
  { key: "placements", label: "Placements", icon: "briefcase" },
  { key: "grievances", label: "Grievances", icon: "alert" },
  { key: "fees", label: "Fees & Finance", icon: "wallet" },
  { key: "reports", label: "Reports & Analytics", icon: "barchart" },
  { key: "audit", label: "Audit Log", icon: "activity" },
];

function AdminApp({ user, theme, onToggleTheme, onLogout }) {
  const [active, setActive] = useState("overview");
  const [toast, showToast] = useToast();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [audit, setAudit] = useState([]);
  const [reportsTab, setReportsTab] = useState("overview");
  const [userModal, setUserModal] = useState(false);
  const [courseModal, setCourseModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "student", idLabel: "" });
  const [newCourse, setNewCourse] = useState({ code: "", name: "", dept: "", faculty: "" });
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [openGrievances, setOpenGrievances] = useState(0);
  const [openDrives, setOpenDrives] = useState(0);
  const [subjectRequests, setSubjectRequests] = useState([]);

  const refreshUsers = useCallback(() => { api.admin.listUsers().then(setUsers); }, []);
  const refreshCourses = useCallback(() => { api.admin.listCourses().then(setCourses); }, []);
  const refreshFees = useCallback(() => { api.admin.listFees().then(setFees); }, []);
  const refreshReports = useCallback(() => { api.admin.reportsSummary().then(setSummary); }, []);
  const refreshAudit = useCallback(() => { api.admin.listAuditLog().then(setAudit); }, []);
  const refreshGrievanceBadge = useCallback(() => { api.admin.listGrievances().then((g) => setOpenGrievances(g.filter((x) => x.status !== "resolved").length)); }, []);
  const refreshDrivesBadge = useCallback(() => { api.placements.list().then((p) => setOpenDrives(p.filter((x) => x.status === "open").length)); }, []);
  const refreshSubjectRequests = useCallback(() => { api.admin.listSubjectRequests().then(setSubjectRequests); }, []);
  useEffect(() => { refreshUsers(); refreshCourses(); refreshFees(); refreshReports(); refreshAudit(); refreshGrievanceBadge(); refreshDrivesBadge(); refreshSubjectRequests(); }, [refreshUsers, refreshCourses, refreshFees, refreshReports, refreshAudit, refreshGrievanceBadge, refreshDrivesBadge, refreshSubjectRequests]);
  useEffect(() => realtimeBus.on("audit:new", (entry) => setAudit((a) => [entry, ...a].slice(0, 60))), []);
  useEffect(() => realtimeBus.on("grievance:update", () => refreshGrievanceBadge()), [refreshGrievanceBadge]);
  useEffect(() => realtimeBus.on("placement:new", () => refreshDrivesBadge()), [refreshDrivesBadge]);
  useEffect(() => realtimeBus.on("subjectRequest:update", () => { refreshSubjectRequests(); refreshCourses(); }), [refreshSubjectRequests, refreshCourses]);

  const pendingSubjectRequests = subjectRequests.filter((r) => r.status === "pending").length;
  const navWithBadges = useMemo(() => ADMIN_NAV.map((n) => {
    if (n.key === "grievances" && openGrievances) return { ...n, badge: openGrievances };
    if (n.key === "placements" && openDrives) return { ...n, badge: openDrives };
    if (n.key === "courses" && pendingSubjectRequests) return { ...n, badge: pendingSubjectRequests };
    return n;
  }), [openGrievances, openDrives, pendingSubjectRequests]);

  async function addUser() {
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    await api.admin.createUser({ ...newUser }, user);
    setUserModal(false); setNewUser({ name: "", email: "", role: "student", idLabel: "" });
    refreshUsers(); showToast("User created");
  }
  async function toggleStatus(u) { await api.admin.setUserStatus(u.id, u.status === "active" ? "inactive" : "active", user); refreshUsers(); showToast(u.status === "active" ? "User deactivated" : "User reactivated"); }
  async function addCourse() {
    if (!newCourse.code.trim() || !newCourse.name.trim()) return;
    await api.admin.createCourse(newCourse, user);
    setCourseModal(false); setNewCourse({ code: "", name: "", dept: "", faculty: "" });
    refreshCourses(); showToast("Course added");
  }
  async function markPaid(f) { await api.admin.markFeePaid(f.id, user); refreshFees(); showToast(`Marked ${f.student}'s fees as paid`); }
  async function approveSubject(r) { await api.admin.approveSubjectRequest(r.id, user); refreshSubjectRequests(); refreshCourses(); showToast(`Approved ${r.code} for ${r.teacherName}`); }
  async function confirmRejectSubject() {
    await api.admin.rejectSubjectRequest(rejectTarget.id, rejectReason.trim(), user);
    showToast(`Declined ${rejectTarget.code} request`, "warn");
    setRejectTarget(null); setRejectReason("");
    refreshSubjectRequests();
  }

  return (
    <PortalShell roleKey="admin" navItems={navWithBadges} active={active} onNavigate={setActive} user={user} theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout}
      headerTitle="Admin Console" headerSub="Users, courses, finance and the campus-wide audit trail.">
      <Toast toast={toast} />
      {active === "overview" && (summary ? (
        <>
          <div className="cp-stat-grid">
            <StatCard icon="users" label="Students" value={summary.totalStudents} /><StatCard icon="user" label="Teachers" value={summary.totalTeachers} />
            <StatCard icon="building" label="Courses" value={summary.totalCourses} /><StatCard icon="wallet" label="Fees collected" value={`${summary.feeCollectedPct}%`} />
          </div>
          <Card title="Attendance by department"><ChartBarRow data={summary.attendanceByDept} /></Card>
          <Card title="Recent activity" actions={<Pill tone="ghost" onClick={() => setActive("audit")}>View all</Pill>}><AuditList entries={audit.slice(0, 6)} /></Card>
        </>
      ) : <SectionLoading label="Loading campus overview…" />)}
      {active === "users" && (
        <Card title="Users & Roles" actions={<Pill tone="solid" onClick={() => setUserModal(true)}><Icon name="plus" size={14} /> Add user</Pill>}>
          <DataTable columns={[
            { key: "name", label: "Name" }, { key: "email", label: "Email" },
            { key: "role", label: "Role", render: (r) => <Badge tone={r.role === "admin" ? "navy" : r.role === "teacher" ? "amber" : "teal"}>{r.role}</Badge> },
            { key: "idLabel", label: "ID" }, { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "active" ? "green" : "red"}>{r.status}</Badge> },
            { key: "actions", label: "", render: (r) => <Pill tone="ghost" onClick={() => toggleStatus(r)}>{r.status === "active" ? "Deactivate" : "Reactivate"}</Pill> },
          ]} rows={users} />
        </Card>
      )}
      {active === "courses" && (
        <>
          {subjectRequests.some((r) => r.status === "pending") && (
            <Card title="Pending Subject Requests" actions={<Badge tone="amber">{pendingSubjectRequests} pending</Badge>}>
              <DataTable
                columns={[
                  { key: "code", label: "Code" }, { key: "name", label: "Subject" }, { key: "dept", label: "Department" },
                  { key: "teacherName", label: "Requested by" },
                  { key: "notes", label: "Notes", render: (r) => r.notes || "—" },
                  { key: "ts", label: "Requested", render: (r) => timeAgo(r.ts) },
                  {
                    key: "actions", label: "", render: (r) => r.status === "pending" ? (
                      <div className="cp-inline-controls">
                        <Pill tone="solid" onClick={() => approveSubject(r)}>Approve</Pill>
                        <Pill tone="ghost" onClick={() => { setRejectTarget(r); setRejectReason(""); }}>Decline</Pill>
                      </div>
                    ) : <Badge tone={r.status === "approved" ? "green" : "red"}>{r.status}</Badge>,
                  },
                ]}
                rows={subjectRequests.filter((r) => r.status === "pending")}
              />
            </Card>
          )}
          <Card title="Courses & Faculty" actions={<Pill tone="solid" onClick={() => setCourseModal(true)}><Icon name="plus" size={14} /> Add course</Pill>}>
            <DataTable columns={[{ key: "code", label: "Code" }, { key: "name", label: "Course" }, { key: "dept", label: "Department" }, { key: "faculty", label: "Faculty" }, { key: "students", label: "Students" }]} rows={courses} />
          </Card>
        </>
      )}
      {active === "placements" && <AdminPlacements user={user} showToast={showToast} />}
      {active === "grievances" && <AdminGrievances user={user} showToast={showToast} />}
      {active === "fees" && (
        <>
          <div className="cp-stat-grid">
            <StatCard icon="wallet" label="Total collected" value={`₹${fees.reduce((s, f) => s + f.paid, 0).toLocaleString("en-IN")}`} />
            <StatCard icon="wallet" label="Pending" value={`₹${fees.reduce((s, f) => s + (f.total - f.paid), 0).toLocaleString("en-IN")}`} />
            <StatCard icon="user" label="Overdue accounts" value={fees.filter((f) => f.status === "overdue").length} />
          </div>
          <Card title="Fee records">
            <DataTable columns={[
              { key: "student", label: "Student" }, { key: "total", label: "Total", render: (r) => `₹${r.total.toLocaleString("en-IN")}` },
              { key: "paid", label: "Paid", render: (r) => `₹${r.paid.toLocaleString("en-IN")}` },
              { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "paid" ? "green" : r.status === "overdue" ? "red" : "amber"}>{r.status}</Badge> },
              { key: "actions", label: "", render: (r) => (r.status !== "paid" ? <Pill tone="ghost" onClick={() => markPaid(r)}>Mark paid</Pill> : null) },
            ]} rows={fees} />
          </Card>
        </>
      )}
      {active === "reports" && (
        <>
          <Tabs tabs={[{ key: "overview", label: "Overview" }, { key: "risk", label: "Risk Insights" }]} active={reportsTab} onChange={setReportsTab} />
          {reportsTab === "overview" && (summary ? (
            <>
              <div className="cp-stat-grid">
                <StatCard icon="barchart" label="Avg. attendance" value={`${summary.avgAttendance}%`} /><StatCard icon="target" label="Avg. CGPA" value={summary.avgCGPA} /><StatCard icon="wallet" label="Fee collection" value={`${summary.feeCollectedPct}%`} />
              </div>
              <Card title="Attendance by department"><ChartBarRow data={summary.attendanceByDept} /></Card>
            </>
          ) : <SectionLoading label="Loading report data…" />)}
          {reportsTab === "risk" && <AdminRiskInsights />}
        </>
      )}
      {active === "audit" && <Card title="System-wide audit log" actions={<LiveBadge />}><AuditList entries={audit} /></Card>}

      <Modal open={userModal} onClose={() => setUserModal(false)} title="Add user">
        <div className="cp-form-grid">
          <input placeholder="Full name" value={newUser.name} onChange={(e) => setNewUser((v) => ({ ...v, name: e.target.value }))} />
          <input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser((v) => ({ ...v, email: e.target.value }))} />
          <select value={newUser.role} onChange={(e) => setNewUser((v) => ({ ...v, role: e.target.value }))}>
            <option value="student">Student</option><option value="teacher">Faculty</option><option value="admin">Admin</option>
          </select>
          <input placeholder="ID (roll no. / staff ID)" value={newUser.idLabel} onChange={(e) => setNewUser((v) => ({ ...v, idLabel: e.target.value }))} />
          <button type="button" className="cp-btn-accent" onClick={addUser}>Create user</button>
        </div>
      </Modal>
      <Modal open={courseModal} onClose={() => setCourseModal(false)} title="Add course">
        <div className="cp-form-grid">
          <input placeholder="Course code (e.g. CS401)" value={newCourse.code} onChange={(e) => setNewCourse((v) => ({ ...v, code: e.target.value }))} />
          <input placeholder="Course name" value={newCourse.name} onChange={(e) => setNewCourse((v) => ({ ...v, name: e.target.value }))} />
          <input placeholder="Department" value={newCourse.dept} onChange={(e) => setNewCourse((v) => ({ ...v, dept: e.target.value }))} />
          <input placeholder="Faculty name" value={newCourse.faculty} onChange={(e) => setNewCourse((v) => ({ ...v, faculty: e.target.value }))} />
          <button type="button" className="cp-btn-accent" onClick={addCourse}>Add course</button>
        </div>
      </Modal>
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={rejectTarget ? `Decline ${rejectTarget.code} — ${rejectTarget.name}` : "Decline request"}>
        <div className="cp-form-grid">
          <textarea rows={3} placeholder="Reason for the teacher (optional)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <button type="button" className="cp-btn-accent" onClick={confirmRejectSubject}>Confirm decline</button>
        </div>
      </Modal>
    </PortalShell>
  );
}

function AdminPlacements({ user, showToast }) {
  const [tab, setTab] = useState("postings");
  const [postings, setPostings] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", package: "", location: "", minCGPA: 7, minAttendance: 75, deadline: "" });
  const [selected, setSelected] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const refreshPostings = useCallback(() => { api.placements.list().then((ps) => { setPostings(ps); setSelected((s) => s || (ps[0] && ps[0].id)); }); }, []);
  useEffect(() => { refreshPostings(); }, [refreshPostings]);
  useEffect(() => realtimeBus.on("placement:new", refreshPostings), [refreshPostings]);

  const refreshApplicants = useCallback(() => { if (selected) api.placements.listApplicants(selected).then(setApplicants); }, [selected]);
  useEffect(() => { refreshApplicants(); }, [refreshApplicants]);
  useEffect(() => realtimeBus.on("placement:application", refreshApplicants), [refreshApplicants]);

  async function post() {
    if (!form.company.trim() || !form.role.trim() || !form.deadline.trim()) return showToast("Fill in company, role and deadline", "warn");
    await api.placements.create({ ...form, minCGPA: Number(form.minCGPA) || 0, minAttendance: Number(form.minAttendance) || 0 }, user);
    setModal(false); setForm({ company: "", role: "", package: "", location: "", minCGPA: 7, minAttendance: 75, deadline: "" });
    refreshPostings(); showToast("Placement drive posted");
  }
  async function setStatus(app, status) { await api.placements.setApplicationStatus(app.id, status, user); refreshApplicants(); showToast(`Marked ${app.studentName} as ${status}`); }

  const currentPosting = postings.find((p) => p.id === selected);

  return (
    <>
      <div className="cp-stat-grid">
        <StatCard icon="briefcase" label="Open drives" value={postings.filter((p) => p.status === "open").length} />
        <StatCard icon="users" label={currentPosting ? `Applicants — ${currentPosting.company}` : "Applicants"} value={applicants.length} />
      </div>
      <Tabs tabs={[{ key: "postings", label: "Postings" }, { key: "applicants", label: "Applicants" }]} active={tab} onChange={setTab} />
      {tab === "postings" && (
        <Card title="Placement Drives" actions={<Pill tone="solid" onClick={() => setModal(true)}><Icon name="plus" size={14} /> Post job</Pill>}>
          <DataTable columns={[
            { key: "company", label: "Company" }, { key: "role", label: "Role" }, { key: "package", label: "Package" },
            { key: "minCGPA", label: "Min CGPA" }, { key: "minAttendance", label: "Min attendance", render: (r) => `${r.minAttendance}%` },
            { key: "deadline", label: "Deadline" },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "open" ? "green" : "neutral"}>{r.status}</Badge> },
          ]} rows={postings} empty="No drives posted yet." />
        </Card>
      )}
      {tab === "applicants" && (
        <Card title="Applicants" actions={
          postings.length
            ? <select value={selected || ""} onChange={(e) => setSelected(e.target.value)} className="cp-select">
                {postings.map((p) => <option key={p.id} value={p.id}>{p.company} — {p.role}</option>)}
              </select>
            : null}>
          <DataTable columns={[
            { key: "studentName", label: "Student" }, { key: "idLabel", label: "ID" },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "selected" ? "green" : r.status === "rejected" ? "red" : "amber"}>{r.status}</Badge> },
            { key: "ts", label: "Applied", render: (r) => timeAgo(r.ts) },
            { key: "actions", label: "", render: (r) => (
              <div className="cp-inline-controls">
                <Pill tone="ghost" onClick={() => setStatus(r, "shortlisted")}>Shortlist</Pill>
                <Pill tone="solid" onClick={() => setStatus(r, "selected")}>Select</Pill>
                <Pill tone="ghost" onClick={() => setStatus(r, "rejected")}>Reject</Pill>
              </div>
            ) },
          ]} rows={applicants} empty={currentPosting ? `No applicants for ${currentPosting.company} yet.` : "Pick a posting to see applicants."} />
        </Card>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Post a placement drive">
        <div className="cp-form-grid">
          <input placeholder="Company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          <input placeholder="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
          <input placeholder="Package (e.g. ₹8 LPA)" value={form.package} onChange={(e) => setForm((f) => ({ ...f, package: e.target.value }))} />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <input placeholder="Min CGPA" type="number" step="0.1" value={form.minCGPA} onChange={(e) => setForm((f) => ({ ...f, minCGPA: e.target.value }))} />
          <input placeholder="Min attendance %" type="number" value={form.minAttendance} onChange={(e) => setForm((f) => ({ ...f, minAttendance: e.target.value }))} />
          <input placeholder="Deadline (e.g. 12 Sep)" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          <button type="button" className="cp-btn-accent" onClick={post}>Post drive</button>
        </div>
      </Modal>
    </>
  );
}

function AdminGrievances({ user, showToast }) {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignee, setAssignee] = useState("");

  const refresh = useCallback(() => { api.admin.listGrievances().then(setItems); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => realtimeBus.on("grievance:update", () => refresh()), [refresh]);

  const filtered = items.filter((g) =>
    (statusFilter === "all" || g.status === statusFilter) &&
    (categoryFilter === "all" || g.category === categoryFilter)
  );

  async function confirmAssign() {
    if (!assignee.trim()) return showToast("Enter a name to assign to", "warn");
    await api.admin.assignGrievance(assignTarget.id, assignee.trim(), user);
    setAssignTarget(null); setAssignee("");
    refresh(); showToast("Grievance assigned");
  }
  async function resolve(g) {
    await api.admin.resolveGrievance(g.id, user);
    refresh(); showToast("Grievance marked resolved");
  }

  const counts = {
    total: items.length,
    open: items.filter((g) => g.status === "open").length,
    review: items.filter((g) => g.status === "in-review").length,
    resolved: items.filter((g) => g.status === "resolved").length,
  };

  return (
    <>
      <div className="cp-stat-grid">
        <StatCard icon="clipboard" label="Total grievances" value={counts.total} />
        <StatCard icon="clock" label="Open" value={counts.open} />
        <StatCard icon="activity" label="In review" value={counts.review} />
        <StatCard icon="check" label="Resolved" value={counts.resolved} />
      </div>

      <Card title="Grievances" actions={
        <div className="cp-inline-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cp-select">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in-review">In review</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="cp-select">
            <option value="all">All categories</option>
            {GRIEVANCE_CATEGORIES_ALL.map((c) => <option key={c}>{c}</option>)}
          </select>
          <LiveBadge />
        </div>}>
        <DataTable
          columns={[
            { key: "raisedBy", label: "Raised by" },
            { key: "role", label: "Role", render: (r) => <Badge tone={r.role === "teacher" ? "amber" : "teal"}>{r.role}</Badge> },
            { key: "category", label: "Category" },
            { key: "description", label: "Description", render: (r) => <span className="cp-grv-desc">{r.description}</span> },
            { key: "status", label: "Status", render: (r) => <GrievanceStatusBadge status={r.status} /> },
            { key: "contactEmail", label: "Contact", render: (r) => r.contactEmail ? <a href={`mailto:${r.contactEmail}`}>{r.contactEmail}</a> : "—" },
            { key: "assignedTo", label: "Assigned to", render: (r) => r.assignedTo || "—" },
            { key: "ts", label: "Raised", render: (r) => timeAgo(r.ts) },
            {
              key: "actions", label: "", render: (r) => r.status !== "resolved" ? (
                <div className="cp-inline-controls">
                  <Pill tone="ghost" onClick={() => { setAssignTarget(r); setAssignee(r.assignedTo || ""); }}>Assign</Pill>
                  <Pill tone="solid" onClick={() => resolve(r)}>Resolve</Pill>
                </div>
              ) : <span className="cp-muted">Closed</span>,
            },
          ]}
          rows={filtered}
          empty="No grievances match this filter."
        />
      </Card>

      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title="Assign grievance">
        <div className="cp-form-grid">
          <p className="cp-muted">{assignTarget?.category} — {assignTarget?.description}</p>
          <input placeholder="Assign to (staff name)" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          <button type="button" className="cp-btn-accent" onClick={confirmAssign}>Confirm assignment</button>
        </div>
      </Modal>
    </>
  );
}

const COPILOT_LATENCY = 550;
function copilotDelay(v) { return new Promise((res) => setTimeout(() => res(v), COPILOT_LATENCY)); }

function buildCopilotRules(apiRef) {
  return {
    student: [
      {
        match: ["attendance", "present", "bunk"],
        handle: async (user) => {
          const s = await apiRef.student.summary(user.id);
          return `Your attendance is currently **${s.attendancePct}%** — ${s.present} of ${s.totalLectures} lectures attended. ${
            s.attendancePct < 75 ? "That's below the usual 75% cutoff, so it's worth catching up on a few classes." : "You're comfortably above the usual 75% cutoff."
          }`;
        },
      },
      {
        match: ["cgpa", "gpa", "marks", "grade", "score"],
        handle: async (user) => {
          const s = await apiRef.student.summary(user.id);
          return `Your CGPA is **${s.cgpa}/10**. Head to "Sessional Marks" in the sidebar for a full assessment-by-assessment breakdown.`;
        },
      },
      {
        match: ["fee", "due", "payment", "invoice"],
        handle: async (user) => {
          const s = await apiRef.student.summary(user.id);
          return s.feeDue ? `You have **₹${s.feeDue}** in outstanding fees. Check the "Fee Information" tab for the breakdown.` : `You're all paid up — no outstanding fee balance right now.`;
        },
      },
      {
        match: ["assignment", "homework", "submission", "due date", "deadline"],
        handle: async () => {
          const list = await apiRef.student.assignments();
          const pending = list.filter((a) => a.status === "pending");
          if (!pending.length) return `You have no pending assignments right now — nicely done.`;
          const lines = pending.slice(0, 4).map((a) => `• ${a.title} (${a.course}) — due ${a.due}`).join("\n");
          return `You have ${pending.length} pending assignment${pending.length > 1 ? "s" : ""}:\n${lines}`;
        },
      },
      {
        match: ["placement", "job", "internship", "drive", "hiring", "eligib"],
        handle: async (user) => {
          const [posts, s] = await Promise.all([apiRef.placements.list(), apiRef.student.summary(user.id)]);
          const eligible = posts.filter((p) => s.cgpa >= p.minCGPA && s.attendancePct >= p.minAttendance && p.status === "open");
          if (!eligible.length) return `There are open placement drives, but none match your current CGPA/attendance yet. Check "Placements" for the full list and requirements.`;
          const lines = eligible.slice(0, 4).map((p) => `• ${p.company} — ${p.role} (${p.package})`).join("\n");
          return `You're eligible for ${eligible.length} open drive${eligible.length > 1 ? "s" : ""}:\n${lines}`;
        },
      },
      {
        match: ["grievance", "complaint", "issue", "wifi", "wi-fi"],
        handle: async (user) => {
          const mine = await apiRef.student.myGrievances(user.name);
          if (!mine.length) return `You haven't raised any grievances yet. You can file one from the "Grievances" tab — I'll auto-suggest a category as you type.`;
          const open = mine.filter((g) => g.status !== "resolved").length;
          return `You've raised ${mine.length} grievance${mine.length > 1 ? "s" : ""}, ${open} still open. Check "Grievances" for status and who it's assigned to.`;
        },
      },
      {
        match: ["notice", "notification", "announcement"],
        handle: async () => {
          const n = DB.notices[0];
          return n ? `Latest notice: **${n.title}** (${n.date}). See the Notice Board on your Dashboard for more.` : `No notices posted yet.`;
        },
      },
      {
        match: ["timetable", "schedule", "class today", "today's class"],
        handle: async () => `Today's classes are on your Dashboard under "Today's Classes" — full weekly view is under "Time Table" in the sidebar.`,
      },
      {
        match: ["library", "book", "borrow"],
        handle: async (user) => {
          const [reqs, catalog] = await Promise.all([apiRef.student.myLibraryRequests(user.name), apiRef.student.libraryCatalog()]);
          const pending = reqs.filter((r) => r.status === "pending" || r.status === "waitlisted").length;
          return `The catalog has ${catalog.length} titles listed. You have ${reqs.length} library request${reqs.length !== 1 ? "s" : ""}${pending ? `, ${pending} still pending` : ""}. Browse and request books from the "Library" tab.`;
        },
      },
    ],
    teacher: [
      {
        match: ["attendance", "class average", "present"],
        handle: async (user) => {
          const courses = await apiRef.teacher.myCourses(user.name);
          const r = await apiRef.teacher.reportsSummary(user.name, courses);
          return `Your average class attendance across ${courses.length} subject${courses.length !== 1 ? "s" : ""} is **${r.avgAttendance}%**, from ${r.classesHeld} recorded session${r.classesHeld !== 1 ? "s" : ""}. Use "Take Attendance" to mark a new class.`;
        },
      },
      {
        match: ["grade", "score", "marks", "gradebook", "distribution"],
        handle: async (user) => {
          const courses = await apiRef.teacher.myCourses(user.name);
          const r = await apiRef.teacher.reportsSummary(user.name, courses);
          return r.gradesPublished ? `You've published ${r.gradesPublished} assessment${r.gradesPublished > 1 ? "s" : ""} with an average score of **${r.avgScore}/100**. Full distribution is under "My Reports".` : `No grades published yet — head to "Enter Marks" to publish your first assessment.`;
        },
      },
      {
        match: ["student", "roster", "at risk", "low attendance"],
        handle: async (user) => {
          const courses = await apiRef.teacher.myCourses(user.name);
          const stats = await apiRef.teacher.studentsWithStats(courses.map((c) => c.id));
          const atRisk = stats.filter((s) => s.attendancePct < 75);
          if (!atRisk.length) return `All ${stats.length} students across your subjects are at or above 75% attendance.`;
          const lines = atRisk.slice(0, 5).map((s) => `• ${s.name} (${s.idLabel}) — ${s.attendancePct}%`).join("\n");
          return `${atRisk.length} student${atRisk.length > 1 ? "s are" : " is"} below 75% attendance:\n${lines}`;
        },
      },
      {
        match: ["assignment", "submission", "homework"],
        handle: async (user) => {
          const courses = await apiRef.teacher.myCourses(user.name);
          const items = await apiRef.teacher.listAssignments(courses.map((c) => c.name));
          return items.length ? `You have ${items.length} assignment${items.length > 1 ? "s" : ""} posted across your subjects. Check "Manage Assignments" for submission counts.` : `No assignments posted yet — create one from "Manage Assignments".`;
        },
      },
      {
        match: ["leave", "vacation", "time off"],
        handle: async (user) => {
          const leave = await apiRef.teacher.listMyLeave(user.name);
          const pending = leave.filter((l) => l.status === "pending").length;
          return pending ? `You have ${pending} leave request${pending > 1 ? "s" : ""} still pending approval.` : `No pending leave requests — you can file a new one from "Apply Leave".`;
        },
      },
      {
        match: ["material", "notes", "upload", "syllabus"],
        handle: async () => `You can upload notes, slides, or lab manuals for a subject from the "Study Material" tab — students see it instantly.`,
      },
      {
        match: ["risk", "dropout", "struggling", "health score"],
        handle: async (user) => {
          const courses = await apiRef.teacher.myCourses(user.name);
          const scored = await apiRef.teacher.riskScores(courses.map((c) => c.id));
          const high = scored.filter((s) => s.riskLevel === "high");
          if (!high.length) return `No students are flagged high-risk right now. See "My Students → Risk Insights" for the full breakdown.`;
          const lines = high.slice(0, 5).map((s) => `• ${s.name} (${s.idLabel}) — health score ${s.healthScore}`).join("\n");
          return `${high.length} student${high.length > 1 ? "s are" : " is"} flagged high-risk:\n${lines}\nFull details under "My Students → Risk Insights".`;
        },
      },
      {
        match: ["grievance", "complaint"],
        handle: async (user) => {
          const mine = await apiRef.teacher.myGrievances(user.name);
          if (!mine.length) return `You haven't raised any grievances yet. You can file one from the "Grievances" tab.`;
          const open = mine.filter((g) => g.status !== "resolved").length;
          return `You've raised ${mine.length} grievance${mine.length > 1 ? "s" : ""}, ${open} still open. Check "Grievances" for status and who it's assigned to.`;
        },
      },
      {
        match: ["timetable", "my schedule", "class today", "today's class"],
        handle: async (user) => {
          await apiRef.teacher.timetable(user.name);
          return `Your weekly teaching schedule is under "Time Table" in the sidebar.`;
        },
      },
      {
        match: ["subject request", "new subject", "add subject", "request a subject"],
        handle: async (user) => {
          const reqs = await apiRef.teacher.mySubjectRequests(user.name);
          const pending = reqs.filter((r) => r.status === "pending").length;
          if (!reqs.length) return `You haven't requested any new subjects yet. Do that from "My Subjects".`;
          return `You have ${reqs.length} subject request${reqs.length !== 1 ? "s" : ""} on file, ${pending} still pending admin approval.`;
        },
      },
    ],
    admin: [
      {
        match: ["fee", "collection", "revenue", "finance", "overdue"],
        handle: async () => {
          const r = await apiRef.admin.reportsSummary();
          const fees = await apiRef.admin.listFees();
          const overdue = fees.filter((f) => f.status === "overdue").length;
          return `Fee collection stands at **${r.feeCollectedPct}%** campus-wide, with ${overdue} overdue account${overdue !== 1 ? "s" : ""}. See "Fees & Finance" for the full ledger.`;
        },
      },
      {
        match: ["attendance", "average attendance"],
        handle: async () => {
          const r = await apiRef.admin.reportsSummary();
          return `Campus-wide average attendance is **${r.avgAttendance}%**. Department breakdown is available on the "Reports & Analytics" tab.`;
        },
      },
      {
        match: ["student", "teacher", "faculty", "user", "headcount"],
        handle: async () => {
          const r = await apiRef.admin.reportsSummary();
          return `You currently have **${r.totalStudents}** students and **${r.totalTeachers}** teachers across **${r.totalCourses}** courses. Manage them from "Users & Roles".`;
        },
      },
      {
        match: ["grievance", "complaint"],
        handle: async () => {
          const list = await apiRef.admin.listGrievances();
          const open = list.filter((g) => g.status !== "resolved").length;
          return `There are ${open} open or in-review grievance${open !== 1 ? "s" : ""} out of ${list.length} total. Check the "Grievances" tab to assign or resolve them.`;
        },
      },
      {
        match: ["placement", "job", "drive", "hiring"],
        handle: async () => {
          const posts = await apiRef.placements.list();
          const open = posts.filter((p) => p.status === "open").length;
          return `There are ${open} open placement drive${open !== 1 ? "s" : ""} right now. Post a new one from "Placements".`;
        },
      },
      {
        match: ["audit", "log", "activity", "recent action"],
        handle: async () => {
          const log = await apiRef.admin.listAuditLog();
          const last = log[0];
          return last ? `Most recent activity: **${last.actor}** — ${last.action}${last.detail ? ` (${last.detail})` : ""}, ${timeAgo(last.ts)}. Full trail is under "Audit Log".` : `No activity logged yet.`;
        },
      },
      {
        match: ["risk", "dropout", "struggling", "health score"],
        handle: async () => {
          const scored = await apiRef.admin.riskScores();
          const high = scored.filter((s) => s.riskLevel === "high");
          if (!high.length) return `No students are flagged high-risk campus-wide right now. See "Reports & Analytics → Risk Insights" for the full breakdown.`;
          const lines = high.slice(0, 5).map((s) => `• ${s.name} (${s.idLabel}) — health score ${s.healthScore}`).join("\n");
          return `${high.length} student${high.length > 1 ? "s are" : " is"} flagged high-risk campus-wide:\n${lines}\nFull details under "Reports & Analytics → Risk Insights".`;
        },
      },
      {
        match: ["course", "subject request", "new subject", "add subject"],
        handle: async () => {
          const [courses, reqs] = await Promise.all([apiRef.admin.listCourses(), apiRef.admin.listSubjectRequests()]);
          const pending = reqs.filter((r) => r.status === "pending").length;
          return `You have ${courses.length} course${courses.length !== 1 ? "s" : ""} set up${pending ? `, and ${pending} subject request${pending !== 1 ? "s" : ""} awaiting approval` : ""}. Manage both from "Courses" and "Subject Requests".`;
        },
      },
    ],
  };
}

// Small-talk / meta questions that aren't about any specific portal data —
// checked only after the role-specific rules above find no match, so a real
// question like "can you help with my fees" still hits the fee rule instead
// of getting swallowed by the word "help" here. Word-boundary regexes (not
// plain .includes()) so short words like "hi" don't false-match inside
// unrelated words (e.g. "which", "this").
const COPILOT_SMALLTALK = [
  { re: /\b(hi|hello|hey|yo|namaste)\b/i, handle: (user, roleKey) => `Hey ${user.name.split(" ")[0]}! ${COPILOT_FALLBACKS[roleKey] || COPILOT_FALLBACKS.student}` },
  { re: /\b(thanks|thank you|thx|appreciate it)\b/i, handle: () => `You're welcome! Let me know if there's anything else you'd like to check.` },
  { re: /\b(bye|goodbye|see you|see ya)\b/i, handle: () => `Bye for now — I'll be right here if you need anything else.` },
  { re: /\b(who are you|what are you|what can you do|what do you do|help)\b/i, handle: (_user, roleKey) => COPILOT_FALLBACKS[roleKey] || COPILOT_FALLBACKS.student },
];

const COPILOT_FALLBACKS = {
  student: `I can help with your attendance, CGPA/marks, fees, assignments, placements, grievances or timetable — try asking something like "what's my attendance?" or "any pending assignments?"`,
  teacher: `I can help with class attendance, grades, at-risk students, assignments or leave requests — try "what's my class average?" or "any pending leave requests?"`,
  admin: `I can help with fee collection, campus attendance, headcounts, grievances, placements or the audit log — try "fee collection status" or "any open grievances?"`,
};

const copilotApi = {
  ask: async (query, roleKey, user, apiRef) => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return copilotDelay({ text: "Ask me something about your " + (roleKey === "student" ? "attendance, marks, fees or assignments." : roleKey === "teacher" ? "classes, grades or students." : "campus data.") });
    const rules = buildCopilotRules(apiRef)[roleKey] || [];
    const hit = rules.find((r) => r.match.some((kw) => q.includes(kw)));
    if (hit) {
      try {
        const text = await hit.handle(user);
        return copilotDelay({ text, matched: true });
      } catch (err) {
        return copilotDelay({ text: "I couldn't pull that up right now — try again in a moment.", matched: false, error: true });
      }
    }
    const smalltalk = COPILOT_SMALLTALK.find((r) => r.re.test(q));
    if (smalltalk) return copilotDelay({ text: smalltalk.handle(user, roleKey), matched: true });
    return copilotDelay({ text: COPILOT_FALLBACKS[roleKey] || COPILOT_FALLBACKS.student, matched: false });
  },
};
api.copilot = copilotApi;

function CopilotIcon({ name, size = 18 }) {
  const paths = {
    chat: "M4 5h16v11H8l-4 4Z",
    close: "M6 6l12 12M18 6L6 18",
    send: "M4 12 20 4l-6 16-3-7-7-1Z",
    sparkle: "M12 3l1.6 4.9L18.5 9.5l-4.9 1.6L12 16l-1.6-4.9L5.5 9.5l4.9-1.6Z",
    bot: "M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M5 8h14v10H5ZM9 13h.01M15 13h.01",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || ""} />
    </svg>
  );
}

function CopilotWidget({ user, roleKey, api: apiRef }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      from: "bot",
      text: `Hi ${user.name.split(" ")[0]}, I'm your Campus Copilot. ${COPILOT_FALLBACKS[roleKey] || ""}`,
    },
  ]);
  const listRef = useRef(null);
  const info = roleInfo(roleKey);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking, open]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const userMsg = { id: uid("cwm"), from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    const { text: reply } = await copilotApi.ask(text, roleKey, user, apiRef);
    setThinking(false);
    setMessages((m) => [...m, { id: uid("cwm"), from: "bot", text: reply }]);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="cw-root" style={{ "--cw-accent": info.accent, "--cw-accent-deep": info.accentDeep, "--cw-accent-soft": info.accentSoft }}>
      {!open && (
        <button className="cw-fab" onClick={() => setOpen(true)} aria-label="Open Campus Copilot">
          <CopilotIcon name="chat" size={22} />
          <span className="cw-fab-ping" />
        </button>
      )}

      {open && (
        <div className="cw-panel" role="dialog" aria-label="Campus Copilot chat">
          <div className="cw-head">
            <div className="cw-head-left">
              <span className="cw-head-avatar"><CopilotIcon name="bot" size={16} /></span>
              <div>
                <div className="cw-head-title">Campus Copilot</div>
                <div className="cw-head-sub">
                  <span className="cw-proto-badge"><CopilotIcon name="sparkle" size={10} /> Prototype demo — not a live AI</span>
                </div>
              </div>
            </div>
            <button className="cw-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat"><CopilotIcon name="close" size={15} /></button>
          </div>

          <div className="cw-disclaimer">
            This assistant answers from scripted keyword matches against your own portal data — it isn't a connected LLM yet.
          </div>

          <div className="cw-messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={"cw-msg cw-msg--" + m.from}>
                {m.from === "bot" && <span className="cw-msg-avatar"><CopilotIcon name="bot" size={13} /></span>}
                <div className="cw-bubble">{m.text.split("\n").map((line, i) => <div key={i}>{line}</div>)}</div>
              </div>
            ))}
            {thinking && (
              <div className="cw-msg cw-msg--bot">
                <span className="cw-msg-avatar"><CopilotIcon name="bot" size={13} /></span>
                <div className="cw-bubble cw-bubble--typing"><span /><span /><span /></div>
              </div>
            )}
          </div>

          <div className="cw-inputbar">
            <input
              placeholder={roleKey === "student" ? "Ask about attendance, marks, fees…" : roleKey === "teacher" ? "Ask about classes, grades, students…" : "Ask about fees, users, grievances…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="cw-send-btn" onClick={send} disabled={!input.trim() || thinking} aria-label="Send">
              <CopilotIcon name="send" size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // On first mount, if a token survived from a previous visit (localStorage
  // persists across page refreshes), try to restore the session instead of
  // forcing a fresh login. A rejected/expired token just falls back to the
  // login screen — apiFetch has already cleared it via the 401 handler.
  useEffect(() => {
    let cancelled = false;
    api.auth.me()
      .then((restored) => { if (!cancelled && restored) setUser(restored); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
  }, []);

  // Fires when any API call comes back 401 mid-session (token expired, or
  // the account was deactivated/deleted while logged in) — bounce back to
  // the login screen instead of leaving the user stuck on a portal that can
  // no longer load any data.
  useEffect(() => {
    function onExpired() { setUser(null); }
    window.addEventListener("cp:session-expired", onExpired);
    return () => window.removeEventListener("cp:session-expired", onExpired);
  }, []);

  if (restoring) {
    return (
      <div className="cp-shell cp-shell--auth" data-theme={theme}>
        <Style />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cp-shell cp-shell--auth" data-theme={theme}>
        <Style />
        <PortalErrorBoundary label="login screen">
          <AuthScreen theme={theme} onToggleTheme={toggleTheme} onAuthed={setUser} />
        </PortalErrorBoundary>
      </div>
    );
  }
  const Portal = user.role === "admin" ? AdminApp : user.role === "teacher" ? TeacherApp : StudentApp;
  return (
    <>
      <Style />
      <PortalErrorBoundary label={`${user.role} portal`}>
        <Portal user={user} theme={theme} onLogout={() => { api.auth.logout(); setUser(null); }} onToggleTheme={toggleTheme} />
      </PortalErrorBoundary>
    </>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
      *{ box-sizing:border-box; }
      /* The document itself never scrolls — every screen (auth page, each
         portal) owns exactly one internal scroll region. Without this,
         a tall child (e.g. the auth card growing when an error message or
         the demo-credentials panel appears) can make the outer document
         scrollable too, stacking a second scrollbar on top of the screen's
         own — this is what produced the "2 scrollbars / stuck" bug. */
      html,body,#root{ height:100%; margin:0; overflow:hidden; overscroll-behavior:none; }
      body{ overscroll-behavior-y:none; }
      :root{
        --teal:#1FC3B4; --teal-dark:#12756B; --teal-soft:#E3F7F4;
        --coral:#FF7A5C; --coral-soft:#FFE9E3; --yellow:#FFC93C; --yellow-soft:#FFF3D6;
        --purple:#7C6CF0; --navy:#2B3E6B; --radius-lg:26px; --radius-md:18px;
        --ease:cubic-bezier(.22,1,.36,1);
      }

      .cp-shell{ --bg:#E3EFED; --ink:#16232A; --ink-soft:#4C5D64; --ink-faint:#7C8D93;
        --glass:rgba(255,255,255,0.66); --glass-strong:rgba(255,255,255,0.86); --glass-border:rgba(255,255,255,0.75);
        --panel:rgba(255,255,255,0.72); --panel-border:rgba(17,40,45,0.10); --surface:rgba(255,255,255,0.8); --surface-border:rgba(17,40,45,0.14);
        --shadow:0 20px 60px rgba(15,60,55,0.16); --blob-opacity:0.5; }
      .cp-shell[data-theme="dark"]{ --bg:#0B141C; --ink:#EAF3F1; --ink-soft:#9FB2B7; --ink-faint:#66787E;
        --glass:rgba(22,32,40,0.62); --glass-strong:rgba(26,38,47,0.85); --glass-border:rgba(255,255,255,0.09);
        --panel:rgba(22,33,41,0.78); --panel-border:rgba(255,255,255,0.08); --surface:rgba(30,43,52,0.85); --surface-border:rgba(255,255,255,0.1);
        --shadow:0 20px 60px rgba(0,0,0,0.5); --blob-opacity:0.26; }
      body{ background:var(--bg); font-family:'Inter', system-ui, sans-serif; }
      .cp-shell{ position:relative; width:100vw; width:100dvw; height:100vh; height:100dvh; display:flex; align-items:stretch; justify-content:stretch;
        color:var(--ink); background:var(--bg); padding:14px; overflow:hidden; transition:background-color .5s var(--ease), color .5s var(--ease); }
      .cp-shell--auth{ padding:0; overflow:hidden; height:100vh; height:100dvh; }

      .cp-aurora{ position:absolute; inset:0; overflow:hidden; z-index:0;
        background:radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--bg) 60%, white 40%) 0%, var(--bg) 55%); }
      .cp-blob{ position:absolute; border-radius:50%; filter:blur(70px); opacity:var(--blob-opacity); }
      .cp-blob--a{ width:520px; height:520px; background:var(--accent, var(--teal)); top:-160px; left:-120px; animation:blobA 22s ease-in-out infinite; }
      .cp-blob--b{ width:420px; height:420px; background:var(--coral); bottom:-140px; right:-80px; animation:blobB 26s ease-in-out infinite; }
      .cp-blob--c{ width:360px; height:360px; background:var(--yellow); bottom:10%; left:38%; animation:blobC 30s ease-in-out infinite; }
      .cp-grain{ position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px); background-size:3px 3px; opacity:0.3; mix-blend-mode:overlay; }
      @keyframes blobA{ 0%,100%{ transform:translate(0,0) scale(1);} 50%{ transform:translate(60px,50px) scale(1.12);} }
      @keyframes blobB{ 0%,100%{ transform:translate(0,0) scale(1);} 50%{ transform:translate(-50px,-40px) scale(1.08);} }
      @keyframes blobC{ 0%,100%{ transform:translate(0,0) scale(1);} 50%{ transform:translate(-40px,30px) scale(1.15);} }

      /* NOTE on glass: backdrop-filter (the actual live blur) has been
         removed from the whole app. It was tried in two narrower forms first
         (stacking it on every card, then trimming to a single frame-level
         layer) and the black-rendering bug persisted through both, which
         points at backdrop-filter itself being unreliable in this browser/GPU
         environment rather than how many layers used it. The "glass" look
         now comes entirely from translucent backgrounds (--glass/--panel/
         --surface, all rgba with alpha) layered over the blurred, animated
         --cp-blob shapes in AuroraBackground — those blobs carry their own
         filter:blur(70px) at the source, so panels sitting above them still
         read as soft frosted glass without any element needing its own
         backdrop-filter. This also used to do a continuous mouse-tilt
         (rotateX/rotateY, transform-style:preserve-3d, updated on every
         mousemove); that was purely decorative and already the cause of an
         earlier hover-jank complaint, so it's gone too — the frame now only
         does its one-time fade/rise-in entrance. */
      .cp-frame{ position:relative; z-index:1; flex:1; display:flex; background:var(--glass-strong);
        border:1px solid var(--glass-border); border-radius:var(--radius-lg); box-shadow:var(--shadow), inset 0 1px 0 rgba(255,255,255,0.5);
        overflow:hidden; min-height:0; min-width:0; opacity:0; transform:translateY(18px) scale(0.99);
        transition:opacity .7s var(--ease), transform .7s var(--ease); }
      .cp-frame.is-mounted{ opacity:1; transform:translateY(0) scale(1); }
      h1,h2,h3{ font-family:'Poppins', sans-serif; margin:0; }

      .cp-sidebar{ --sb-x:10px; width:236px; flex-shrink:0; padding:22px 14px 16px; display:flex; flex-direction:column;
        border-right:1px solid var(--panel-border); background:linear-gradient(180deg, color-mix(in srgb, var(--surface) 60%, transparent), transparent);
        min-height:0; position:relative; }
      .cp-sidebar-close{ display:none; }
      .cp-hamburger{ display:none; }
      .cp-sidebar-veil{ display:none; }
      .cp-brand{ display:flex; align-items:center; gap:10px; padding:0 var(--sb-x) 26px; }
      .cp-brand-mark{ position:relative; width:26px; height:20px; flex-shrink:0; }
      .cp-logo-mark{ display:inline-flex; flex-shrink:0; filter:drop-shadow(0 3px 8px rgba(20,60,90,0.28)); }
      .cp-dot-teal, .cp-dot-coral{ position:absolute; width:18px; height:18px; border-radius:50%; top:0; box-shadow:0 3px 8px rgba(0,0,0,0.12); }
      .cp-dot-teal{ background:var(--accent, var(--teal)); left:0; animation:pulseDot 3.6s ease-in-out infinite; }
      .cp-dot-coral{ background:var(--coral); left:9px; opacity:0.9; animation:pulseDot 3.6s ease-in-out infinite 0.4s; }
      @keyframes pulseDot{ 0%,100%{ transform:scale(1);} 50%{ transform:scale(1.15);} }
      .cp-brand-name{ font-family:'Poppins',sans-serif; font-weight:700; font-size:16px; letter-spacing:-0.01em; }

      .cp-profile-card{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:4px; padding:14px var(--sb-x) 16px; margin-bottom:6px; border-bottom:1px solid var(--panel-border); }
      .cp-profile-card-avatar{ width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, var(--accent, var(--teal)), var(--accent-deep, var(--teal-dark))); color:#fff; font-weight:700; font-size:16px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 18px rgba(18,60,55,0.28); border:2.5px solid var(--glass-border); margin-bottom:4px; }
      .cp-profile-card-name{ font-family:'Poppins',sans-serif; font-weight:700; font-size:13px; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }
      .cp-profile-card-id{ font-size:10.5px; color:var(--ink-faint); }
      .cp-nav-label{ font-size:10px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:var(--ink-faint); padding:4px var(--sb-x) 8px; }
      .cp-nav--full{ flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:2px; padding-right:2px; scrollbar-width:thin; }
      .cp-nav-item-wrap{ opacity:0; transform:translateX(-10px); animation:navIn .5s var(--ease) forwards; animation-delay:calc(var(--i) * 60ms + 120ms); }
      @keyframes navIn{ to{ opacity:1; transform:translateX(0); } }
      .cp-nav-item{ all:unset; box-sizing:border-box; position:relative; overflow:hidden; display:flex; align-items:center; gap:11px; width:100%;
        padding:9px var(--sb-x); border-radius:12px; font-size:13px; font-weight:500; color:var(--ink-soft); cursor:pointer; transition:background .25s var(--ease), color .25s var(--ease), transform .18s var(--ease); }
      .cp-nav-ico{ display:flex; flex-shrink:0; width:17px; }
      .cp-nav-item:hover{ background:var(--surface); color:var(--ink); transform:translateX(3px); }
      .cp-nav-item.is-active{ background:linear-gradient(120deg, var(--accent-deep, var(--teal-dark)), color-mix(in srgb, var(--accent-deep, var(--teal-dark)) 70%, black));
        color:#fff; box-shadow:0 10px 24px rgba(18,60,55,0.28); }
      .cp-nav-badge{ margin-left:auto; background:var(--coral); color:#fff; font-size:10.5px; font-weight:700; padding:1.5px 6.5px; border-radius:20px; }
      .cp-sidebar-logout{ all:unset; box-sizing:border-box; cursor:pointer; display:flex; align-items:center; gap:9px; margin-top:10px; padding:9px var(--sb-x); border-radius:12px;
        font-size:12.5px; font-weight:600; color:var(--ink-soft); background:var(--surface); border:1px solid var(--surface-border); }
      .cp-sidebar-logout:hover{ background:var(--coral-soft); color:#B84A32; }
      .cp-sidebar-foot{ margin-top:10px; padding-top:12px; border-top:1px solid var(--panel-border); text-align:center; font-size:10px; color:var(--ink-faint); }

      .cp-ripple-field{ position:absolute; inset:0; overflow:hidden; border-radius:inherit; pointer-events:none; }
      .cp-ripple{ position:absolute; border-radius:50%; background:radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%); transform:scale(0); animation:rippleOut .62s ease-out forwards; }
      @keyframes rippleOut{ to{ transform:scale(1); opacity:0; } }
      .cp-float{ animation:floatY 5.5s ease-in-out infinite; } @keyframes floatY{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-8px);} }

      .cp-main{ flex:1; min-width:0; min-height:0; padding:22px 34px 30px; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; }
      .cp-topbar{ display:flex; align-items:center; gap:14px; margin-bottom:20px; padding:14px 18px; border-radius:18px;
        background:var(--panel); border:1px solid var(--panel-border);
        box-shadow:0 10px 26px rgba(15,40,45,0.08), inset 0 1px 0 rgba(255,255,255,0.35);
        opacity:0; animation:dropIn .55s var(--ease) forwards; animation-delay:.15s; }
      @keyframes dropIn{ from{ opacity:0; transform:translateY(-8px);} to{ opacity:1; transform:translateY(0);} }
      .cp-topbar-title{ min-width:0; }
      .cp-topbar-title h1{ font-size:19px; font-weight:800; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .cp-topbar-title p{ margin:2px 0 0; font-size:12px; color:var(--ink-soft); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .cp-topbar-actions{ margin-left:auto; display:flex; align-items:center; gap:10px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end; }

      .cp-live{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:600; color:var(--ink-soft); background:var(--surface); border:1px solid var(--surface-border); padding:7px 12px; border-radius:20px; white-space:nowrap; }
      .cp-live-dot2{ width:7px; height:7px; border-radius:50%; background:#2ECC71; animation:pulseLive 1.8s ease-in-out infinite; }
      .cp-live-dot2--local{ background:#9AA7AC; animation:none; }
      @keyframes pulseLive{ 0%,100%{ box-shadow:0 0 0 0 rgba(46,204,113,.55);} 50%{ box-shadow:0 0 0 5px rgba(46,204,113,0);} }
      @media (max-width: 1100px){ .cp-live{ display:none; } }

      .cp-round-btn{ all:unset; position:relative; overflow:hidden; cursor:pointer; isolation:isolate; width:38px; height:38px; border-radius:50%;
        display:flex; align-items:center; justify-content:center; background:var(--surface); border:1px solid var(--surface-border); color:var(--ink-soft);
        transition:background .22s var(--ease), color .22s var(--ease), transform .2s var(--ease); flex-shrink:0; }
      .cp-round-btn:hover{ background:var(--accent-soft, var(--teal-soft)); color:var(--accent-deep, var(--teal-dark)); transform:translateY(-2px) rotate(-6deg); }
      .cp-theme-icon.is-dark{ transform:rotate(-14deg); }

      .cp-profile{ display:flex; align-items:center; gap:9px; border:1px solid var(--surface-border); background:var(--surface); border-radius:40px; padding:5px 14px 5px 5px; }
      .cp-avatar{ width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, var(--accent, var(--teal)), var(--accent-deep, var(--teal-dark))); color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .cp-avatar--sm{ width:34px; height:34px; font-size:11.5px; background:linear-gradient(135deg, var(--navy), #1D2C4D); }
      .cp-profile-name{ font-size:12.5px; font-weight:600; line-height:1.2; color:var(--ink); }
      .cp-profile-handle{ font-size:10.5px; color:var(--ink-faint); }

      .cp-content{ display:flex; flex-direction:column; gap:0; min-width:0; animation:contentIn .38s var(--ease); }
      @keyframes contentIn{ from{ opacity:0; transform:translateY(8px);} to{ opacity:1; transform:translateY(0);} }

      .cp-portal-loading{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; min-height:60vh; color:var(--ink-soft); }
      .cp-portal-loading-spinner{ width:34px; height:34px; border-radius:50%; border:3px solid var(--surface-border); border-top-color:var(--accent, var(--teal)); animation:spin 0.8s linear infinite; }
      .cp-portal-loading-text{ font-size:13px; font-weight:600; }
      .cp-section-loading{ display:flex; align-items:center; gap:10px; padding:26px 4px; color:var(--ink-soft); font-size:12.5px; font-weight:600; }
      .cp-spinner--sm{ width:16px; height:16px; border-width:2px; }

      .cp-hero{ position:relative; overflow:hidden; background:linear-gradient(125deg, var(--accent, #22CDBD), var(--accent-deep, #0F8F84) 70%); border-radius:var(--radius-md);
        padding:34px 34px 30px; display:flex; align-items:center; justify-content:space-between; gap:24px; color:#fff; margin-bottom:18px;
        border:1px solid rgba(255,255,255,0.35); box-shadow:0 22px 48px rgba(15,90,80,0.3); opacity:0; animation:heroIn .7s var(--ease) forwards; animation-delay:.2s; }
      @keyframes heroIn{ from{ opacity:0; transform:translateY(14px);} to{ opacity:1; transform:translateY(0);} }
      .cp-hero-eyebrow{ display:inline-flex; align-items:center; gap:7px; font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:rgba(255,255,255,0.92);
        background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.3); padding:5px 12px 5px 10px; border-radius:20px; margin-bottom:14px; }
      .cp-live-dot{ width:6px; height:6px; border-radius:50%; background:#B6FFCE; animation:liveDot 1.8s ease-in-out infinite; }
      @keyframes liveDot{ 0%,100%{ box-shadow:0 0 0 0 rgba(182,255,206,0.6); } 50%{ box-shadow:0 0 0 5px rgba(182,255,206,0); } }
      .cp-hero-text{ min-width:0; }
      .cp-hero-text h2{ font-size:27px; font-weight:800; margin-bottom:7px; }
      .cp-hero-text p{ font-size:13.5px; opacity:0.92; max-width:360px; margin:0 0 20px; line-height:1.55; }
      .cp-hero-stats{ display:flex; gap:28px; margin-bottom:22px; flex-wrap:wrap; }
      .cp-hero-stat{ display:flex; align-items:center; gap:9px; }
      .cp-hero-ico{ width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
      .cp-hero-ico--coral{ background:var(--coral); } .cp-hero-ico--yellow{ background:var(--yellow); color:#5A4200; }
      .cp-hero-stat-value{ font-weight:800; font-size:17px; font-family:'Poppins',sans-serif; }
      .cp-hero-stat-label{ font-size:11px; opacity:0.85; margin-top:1px; }
      .cp-hero-actions{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
      .cp-hero-quicklinks{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      .cp-hero-chip{ all:unset; cursor:pointer; font-size:11.5px; font-weight:600; color:rgba(255,255,255,0.92); background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.3); padding:7px 13px; border-radius:20px; }
      .cp-hero-chip:hover{ background:rgba(255,255,255,0.26); }
      .cp-hero-art{ position:relative; z-index:1; width:240px; flex-shrink:0; }
      @media (max-width: 900px){ .cp-hero-art{ display:none; } .cp-hero{ padding:26px 22px 24px; } }

      .cp-quickgrid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin:0 0 22px; }
      .cp-quick{ position:relative; overflow:hidden; border-radius:var(--radius-md); padding:16px 16px 14px; color:#fff; display:flex; flex-direction:column; gap:6px; align-items:flex-start; min-width:0;
        border:1px solid rgba(255,255,255,0.3); box-shadow:0 14px 26px rgba(18,40,60,0.16); opacity:0; transform:translateY(12px); animation:rowIn .55s var(--ease) forwards; animation-delay:calc(var(--i,0) * 70ms + .3s); }
      @keyframes rowIn{ to{ opacity:1; transform:translateY(0);} }
      .cp-quick--navy{ background:linear-gradient(135deg, var(--navy), #1D2C4D); } .cp-quick--teal{ background:linear-gradient(135deg, var(--accent, #26D6C4), var(--accent-deep, var(--teal-dark))); }
      .cp-quick--purple{ background:linear-gradient(135deg, var(--purple), #5B4CD6); } .cp-quick--coral{ background:linear-gradient(135deg, var(--coral), #E8503A); }
      .cp-quick-label{ font-size:12px; font-weight:700; opacity:0.92; } .cp-quick-main{ font-family:'Poppins',sans-serif; font-weight:700; font-size:15px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }
      .cp-quick-sub{ font-size:10.5px; opacity:0.85; margin-top:-4px; }
      .cp-pill--quick{ margin-top:6px; background:rgba(255,255,255,0.22); color:#fff; font-weight:600; }
      .cp-pill--quick:hover{ background:rgba(255,255,255,0.34); }

      .cp-panelgrid{ display:grid; grid-template-columns:1.5fr 1fr; gap:18px; margin-bottom:18px; min-width:0; }
      .cp-columns{ display:grid; grid-template-columns:1.35fr 1fr 1fr; gap:18px; align-items:start; min-width:0; }
      .cp-col{ min-width:0; } .cp-col--wide{ min-width:0; }
      .cp-col-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; gap:10px; }
      .cp-col-head h3{ font-size:15px; font-weight:700; }
      @media (max-width: 1180px){ .cp-panelgrid{ grid-template-columns:1fr; } .cp-columns{ grid-template-columns:1fr; } }
      @media (max-width: 760px){ .cp-quickgrid{ grid-template-columns:1fr 1fr; } }
      @media (max-width: 480px){ .cp-quickgrid{ grid-template-columns:1fr; } }

      .cp-list{ display:flex; flex-direction:column; gap:10px; }
      .cp-row{ position:relative; display:flex; align-items:center; gap:12px; background:var(--panel); border:1px solid var(--panel-border); border-radius:15px; padding:11px 12px; min-width:0;
        transition:box-shadow .22s var(--ease), transform .2s var(--ease); opacity:0; transform:translateY(10px); animation:rowIn .5s var(--ease) forwards; animation-delay:calc(var(--i) * 70ms + .35s); }
      .cp-row:hover{ box-shadow:0 12px 26px rgba(18,60,55,0.12); transform:translateY(-3px); }
      .cp-tile{ width:36px; height:36px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; color:#fff; box-shadow:0 6px 14px rgba(0,0,0,0.14); }
      .cp-tile--teal{ background:linear-gradient(135deg, var(--teal), var(--teal-dark)); } .cp-tile--coral{ background:linear-gradient(135deg, var(--coral), #E85E3F); } .cp-tile--yellow{ background:linear-gradient(135deg, var(--yellow), #F0AF12); color:#5A4200; }
      .cp-row-body{ flex:1; min-width:0; } .cp-row-title{ font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--ink); }
      .cp-row-sub{ font-size:11px; color:var(--ink-faint); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

      .cp-pill{ all:unset; position:relative; overflow:hidden; isolation:isolate; cursor:pointer; flex-shrink:0; display:inline-flex; align-items:center; gap:4px;
        font-size:11.5px; font-weight:600; padding:7px 14px; border-radius:20px; transition:transform .18s var(--ease); white-space:nowrap; }
      .cp-pill-label{ display:inline-flex; align-items:center; gap:4px; } .cp-pill:active{ transform:scale(0.93); }
      .cp-pill--outline{ border:1.4px solid var(--surface-border); background:var(--surface); color:var(--ink-soft); }
      .cp-pill--outline:hover{ border-color:var(--accent, var(--teal)); color:var(--accent-deep, var(--teal-dark)); background:var(--accent-soft, var(--teal-soft)); }
      .cp-pill--solid{ background:linear-gradient(120deg, var(--accent, var(--coral)), var(--accent-deep, #FF9478)); color:#fff; box-shadow:0 6px 14px rgba(0,0,0,0.18); }
      .cp-pill--hero-solid{ background:#fff; color:var(--accent-deep, var(--teal-dark)); font-weight:700; box-shadow:0 8px 18px rgba(0,0,0,0.16); }
      .cp-pill--ghost{ background:var(--surface); color:var(--ink-soft); } .cp-pill--ghost:hover{ background:var(--glass-strong); color:var(--ink); }
      .cp-pill--quick{ margin-top:6px; }
      .cp-pill:disabled{ opacity:.5; cursor:not-allowed; }

      .cp-progress-card{ position:relative; overflow:hidden; background:linear-gradient(135deg, var(--accent, #22CDBD), var(--accent-deep, #0E8A80)); border-radius:var(--radius-md); padding:18px 18px 8px; color:#fff; margin-bottom:14px; border:1px solid rgba(255,255,255,0.3); box-shadow:0 14px 30px rgba(15,90,80,0.24); }
      .cp-progress-top{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:6px; gap:10px; }
      .cp-progress-title{ font-weight:700; font-size:14px; } .cp-progress-sub{ font-size:11px; opacity:0.85; margin-top:2px; }
      .cp-progress-badge{ font-size:11px; font-weight:700; background:rgba(255,255,255,0.25); padding:3px 9px; border-radius:20px; white-space:nowrap; }
      .cp-spark-line{ stroke-dasharray:400; stroke-dashoffset:400; transition:stroke-dashoffset 1.1s var(--ease); } .cp-spark-line.is-drawn{ stroke-dashoffset:0; }

      .cp-mini-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .cp-mini-card{ border-radius:var(--radius-md); padding:16px; border:1px solid var(--panel-border); min-width:0; }
      .cp-mini-card--yellow{ background:linear-gradient(160deg, var(--yellow-soft), color-mix(in srgb, var(--yellow-soft) 60%, var(--panel))); }
      .cp-mini-card--coral{ background:linear-gradient(160deg, var(--coral-soft), color-mix(in srgb, var(--coral-soft) 60%, var(--panel))); }
      .cp-mini-value{ font-size:22px; font-weight:800; font-family:'Poppins',sans-serif; color:var(--ink); }
      .cp-mini-label{ font-size:11px; color:var(--ink-soft); margin-top:2px; }

      .cp-card{ background:var(--panel); border:1px solid var(--panel-border); border-radius:var(--radius-md); overflow:hidden;
        box-shadow:0 12px 26px rgba(18,60,55,0.08), inset 0 1px 0 rgba(255,255,255,0.35); margin-bottom:18px; min-width:0; }
      .cp-card-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:14px 18px; color:#fff; background:linear-gradient(120deg, var(--accent-deep, var(--navy)), color-mix(in srgb, var(--accent-deep, var(--navy)) 70%, black)); flex-wrap:wrap; }
      .cp-card-head h3{ font-size:13.5px; font-weight:700; } .cp-card-actions{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      .cp-card-body{ padding:18px; min-width:0; }

      .cp-notice-list{ display:flex; flex-direction:column; gap:8px; }
      .cp-notice-row{ display:flex; align-items:center; gap:10px; background:var(--surface); border:1px solid var(--surface-border); border-radius:11px; padding:9px 12px; opacity:0; transform:translateY(8px); animation:rowIn .45s var(--ease) forwards; animation-delay:calc(var(--i) * 70ms + .1s); flex-wrap:wrap; }
      .cp-notice-tag{ flex-shrink:0; font-size:10px; font-weight:700; color:var(--accent-deep, var(--teal-dark)); background:var(--accent-soft, var(--teal-soft)); padding:3px 9px; border-radius:20px; }
      .cp-notice-title{ flex:1; font-size:12.3px; color:var(--ink); min-width:160px; } .cp-notice-date{ flex-shrink:0; font-size:11px; color:var(--ink-faint); }

      .cp-glance{ display:flex; flex-direction:column; }
      .cp-glance-row{ display:flex; align-items:center; justify-content:space-between; padding:9px 2px; font-size:12.5px; font-weight:600; color:var(--ink); border-bottom:1px dashed var(--panel-border); opacity:0; transform:translateX(-6px); animation:navIn .4s var(--ease) forwards; animation-delay:calc(var(--i) * 60ms + .3s); gap:10px; }
      .cp-glance-row:last-child{ border-bottom:none; }
      .cp-glance-row > span:first-child{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .cp-badge{ font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:20px; color:#fff; flex-shrink:0; white-space:nowrap; }
      .cp-badge--coral{ background:var(--coral); } .cp-badge--teal{ background:var(--teal); } .cp-badge--yellow{ background:var(--yellow); color:#5A4200; } .cp-badge--navy{ background:var(--navy); }

      .cp-muted{ color:var(--ink-faint); font-size:12.5px; }

      /* generic glass widgets: stats, badges2, tabs2, tables, modal, toast, switch, bars, audit */
      .cp-stat-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:14px; margin-bottom:16px; }
      .cp-stat{ display:flex; align-items:center; gap:12px; background:var(--panel); border:1px solid var(--panel-border); border-radius:var(--radius-md); padding:14px 16px; min-width:0; }
      .cp-stat-ico{ width:36px; height:36px; border-radius:10px; background:var(--accent-soft); color:var(--accent-deep); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .cp-stat-value{ font-size:19px; font-weight:800; font-family:'Poppins',sans-serif; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .cp-stat-label{ font-size:11px; color:var(--ink-soft); } .cp-stat-sub{ font-size:10px; color:var(--ink-faint); }

      .cp-badge2{ font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:20px; display:inline-flex; align-items:center; gap:5px; text-transform:capitalize; white-space:nowrap; }
      .cp-badge-pulse-dot{ width:5px; height:5px; border-radius:50%; background:currentColor; animation:pulseLive 1.8s ease-in-out infinite; flex-shrink:0; }
      .cp-badge2--green{ background:#DCF6E6; color:#1D8A4E; } .cp-badge2--red{ background:#FBE4E1; color:#B23A2C; }
      .cp-badge2--amber{ background:#FBF0D9; color:#8A6A22; } .cp-badge2--teal{ background:#DCF3EE; color:#12756B; }
      .cp-badge2--navy{ background:#E4EAF3; color:#1B2C4A; } .cp-badge2--neutral{ background:var(--surface); color:var(--ink-soft); }

      .cp-tabs2{ display:flex; gap:6px; margin-bottom:14px; border-bottom:1px solid var(--panel-border); flex-wrap:wrap; overflow-x:auto; }
      .cp-tab2{ all:unset; cursor:pointer; padding:8px 14px; font-size:12.5px; font-weight:600; color:var(--ink-faint); border-radius:8px 8px 0 0; white-space:nowrap; }
      .cp-tab2.is-active{ color:var(--accent-deep); box-shadow:0 -2px 0 var(--accent) inset; }

      .cp-modal-veil{ position:fixed; inset:0; background:rgba(10,20,25,.4); display:flex; align-items:center; justify-content:center; z-index:300; padding:20px; overflow-y:auto; }
      .cp-modal{ background:var(--glass-strong); border:1px solid var(--glass-border); border-radius:18px; width:100%; max-width:420px; box-shadow:0 30px 60px rgba(0,0,0,.3); max-height:calc(100vh - 40px); max-height:calc(100dvh - 40px); display:flex; flex-direction:column; margin:auto; }
      .cp-modal-head{ display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid var(--panel-border); flex-shrink:0; }
      .cp-modal-head h3{ margin:0; font-size:14px; font-weight:700; color:var(--ink); } .cp-modal-body{ padding:18px; overflow-y:auto; min-height:0; }
      .cp-icon-btn{ all:unset; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--ink-soft); }
      .cp-form-grid{ display:flex; flex-direction:column; gap:10px; }
      .cp-form-grid input, .cp-form-grid select{ padding:10px 12px; border-radius:10px; border:1.4px solid var(--surface-border); background:var(--surface); font-size:13px; color:var(--ink); width:100%; }
      .cp-btn-accent{ all:unset; text-align:center; cursor:pointer; background:var(--accent); color:#fff; font-weight:700; font-size:12.5px; padding:10px 15px; border-radius:20px; box-shadow:0 8px 18px color-mix(in srgb, var(--accent) 45%, transparent); transition:transform .15s var(--ease), background .2s var(--ease); }
      .cp-btn-accent:hover{ background:var(--accent-deep); }
      .cp-btn-accent:active{ transform:scale(.96); }
      .cp-btn-accent:disabled{ opacity:.6; cursor:not-allowed; }
      .cp-form-grid--flash{ animation:formFlash .9s var(--ease); border-radius:14px; }
      @keyframes formFlash{ 0%{ box-shadow:0 0 0 0 color-mix(in srgb, var(--accent) 55%, transparent); } 60%{ box-shadow:0 0 0 10px color-mix(in srgb, var(--accent) 0%, transparent); } 100%{ box-shadow:0 0 0 0 transparent; } }

      .cp-table-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:10px; }
      .cp-data-table{ width:100%; min-width:560px; border-collapse:collapse; font-size:12.8px; }
      .cp-data-table th{ text-align:left; font-size:10.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint); padding:8px 10px; border-bottom:1px solid var(--panel-border); white-space:nowrap; }
      .cp-data-table td{ padding:10px; border-bottom:1px solid var(--panel-border); color:var(--ink); vertical-align:middle; }
      .cp-data-table tr:last-child td{ border-bottom:none; } .cp-table-empty{ text-align:center; color:var(--ink-faint); padding:20px; }
      .ri-th-sortable{ cursor:pointer; user-select:none; }
      .ri-th-inner{ display:inline-flex; align-items:center; gap:4px; }
      .ri-formula-note{ display:flex; align-items:center; gap:7px; font-size:11.5px; color:var(--ink-faint);
        background:var(--surface); border:1px solid var(--surface-border); padding:8px 12px; border-radius:10px; margin-bottom:12px; }
      /* Risk Insights rows — a quick-scan left-border + tint per risk band, on top of the RiskBadge cell */
      .ri-row-high{ box-shadow:inset 3px 0 0 #C0392B; background:color-mix(in srgb, #FBE4E1 30%, transparent); }
      .ri-row-medium{ box-shadow:inset 3px 0 0 #C7900F; background:color-mix(in srgb, #FBF0D9 22%, transparent); }
      .ri-row-low{ box-shadow:inset 3px 0 0 #1D8A4E; }
      .ri-tooltip-wrap{ position:relative; display:inline-flex; align-items:center; justify-content:center;
        width:22px; height:22px; border-radius:50%; color:#fff; background:rgba(255,255,255,0.18);
        border:1px solid rgba(255,255,255,0.3); cursor:help; }
      .ri-tooltip-icon{ display:flex; }
      .ri-tooltip-bubble{ position:absolute; right:0; top:calc(100% + 8px); width:260px; max-width:80vw; font-size:11.5px; line-height:1.5;
        color:#fff; background:#16232A; padding:10px 12px; border-radius:10px; box-shadow:0 14px 30px rgba(0,0,0,.25); z-index:50; text-align:left; }

      .cp-toast{ position:fixed; top:18px; right:18px; left:auto; max-width:calc(100vw - 36px); z-index:400; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:600; color:#fff; background:var(--accent-deep, #12756B); box-shadow:0 14px 30px rgba(0,0,0,.2); animation:toastIn .25s ease; display:flex; align-items:center; gap:8px; }
      .cp-toast-ico{ display:flex; flex-shrink:0; width:20px; height:20px; border-radius:50%; background:rgba(255,255,255,0.2); align-items:center; justify-content:center; }
      .cp-toast--warn{ background:#B8551F; } @keyframes toastIn{ from{ opacity:0; transform:translateY(-8px);} to{ opacity:1; transform:translateY(0);} }

      .cp-switch{ position:relative; display:inline-block; width:38px; height:22px; flex-shrink:0; }
      .cp-switch input{ opacity:0; width:0; height:0; }
      .cp-switch span{ position:absolute; inset:0; background:var(--surface-border); border-radius:20px; transition:.2s; }
      .cp-switch span::before{ content:''; position:absolute; width:16px; height:16px; left:3px; top:3px; background:#fff; border-radius:50%; transition:.2s; }
      .cp-switch input:checked + span{ background:var(--accent); } .cp-switch input:checked + span::before{ transform:translateX(16px); }

      .cp-audit-list{ display:flex; flex-direction:column; gap:2px; }
      .cp-audit-row{ display:flex; align-items:flex-start; gap:10px; padding:9px 2px; border-bottom:1px dashed var(--panel-border); }
      .cp-audit-row:last-child{ border-bottom:none; } .cp-audit-dot{ width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
      .cp-audit-dot--admin{ background:#3A5A8C; } .cp-audit-dot--teacher{ background:#C79A3E; } .cp-audit-dot--student{ background:#1FC3B4; } .cp-audit-dot--system{ background:#8C8C8C; }
      .cp-audit-body{ flex:1; min-width:0; } .cp-audit-line{ font-size:12.5px; color:var(--ink); } .cp-audit-detail{ font-size:11.5px; color:var(--ink-faint); }
      .cp-audit-time{ font-size:10.5px; color:var(--ink-faint); white-space:nowrap; }

      .cp-select{ font-size:12.5px; padding:8px 10px; border-radius:10px; border:1.4px solid var(--surface-border); background:var(--surface); color:var(--ink); max-width:100%; }
      .cp-inline-controls{ display:flex; gap:8px; flex-wrap:wrap; }
      .cp-score-input{ width:70px; padding:6px 8px; border-radius:8px; border:1.4px solid var(--surface-border); background:var(--surface); font-size:12.5px; color:var(--ink); }

      .cp-attendance-layout{ display:flex; gap:20px; align-items:flex-start; }
      .cp-attendance-options{ --sb-x:10px; width:200px; flex-shrink:0; display:flex; flex-direction:column; gap:16px;
        padding:14px; border-radius:14px; background:var(--surface); border:1px solid var(--surface-border); }
      .cp-attendance-opt-group{ display:flex; flex-direction:column; gap:6px; }
      .cp-attendance-opt-label{ font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--ink-faint); }
      .cp-attendance-opt-hint{ font-size:10.5px; color:var(--ink-faint); line-height:1.4; }
      .cp-attendance-mode-switch{ display:flex; flex-direction:column; gap:3px; }
      .cp-attendance-mode-switch .cp-nav-item{ font-size:12.5px; border:1px solid transparent; }
      .cp-attendance-mode-switch .cp-nav-item:hover{ transform:none; }
      .cp-attendance-main{ flex:1; min-width:0; }
      @media (max-width: 720px){
        .cp-attendance-layout{ flex-direction:column; }
        .cp-attendance-options{ width:100%; flex-direction:row; flex-wrap:wrap; gap:14px; }
        .cp-attendance-opt-group{ flex:1; min-width:150px; }
      }

      .cp-ocr-panel{ display:flex; flex-direction:column; gap:14px; }
      .cp-ocr-drop{ display:flex; align-items:center; gap:14px; padding:22px; border:1.6px dashed var(--surface-border); border-radius:14px; cursor:pointer; color:var(--ink-soft); background:var(--surface); flex-wrap:wrap; }
      .cp-ocr-drop:hover{ border-color:var(--accent); color:var(--accent-deep); }
      .cp-ocr-drop strong{ display:block; color:var(--ink); font-size:13.5px; } .cp-ocr-drop span{ font-size:12px; }
      .cp-ocr-processing{ display:flex; align-items:center; gap:16px; padding:20px; background:var(--surface); border-radius:14px; flex-wrap:wrap; }
      .cp-spinner{ width:30px; height:30px; border-radius:50%; border:3px solid var(--surface-border); border-top-color:var(--accent); animation:spin 0.8s linear infinite; flex-shrink:0; }
      @keyframes spin{ to{ transform:rotate(360deg); } }
      .cp-ocr-steps div{ font-size:12.5px; color:var(--ink-faint); padding:2px 0; }
      .cp-ocr-steps div.is-active{ color:var(--ink); font-weight:700; } .cp-ocr-steps div.is-done{ color:var(--accent-deep); text-decoration:line-through; opacity:.7; }
      .cp-ocr-summary{ font-size:12.5px; color:var(--ink-soft); } .cp-ocr-actions{ display:flex; justify-content:flex-end; gap:10px; margin-top:14px; flex-wrap:wrap; }
      .cp-ocr-source-banner{ display:flex; align-items:flex-start; gap:8px; padding:10px 12px; border-radius:12px; font-size:12px; line-height:1.5; margin-bottom:10px; }
      .cp-ocr-source-banner--real{ background:var(--green-soft, rgba(52,199,89,.12)); color:var(--green-deep, #1a7f37); }
      .cp-ocr-source-banner--sim{ background:var(--amber-soft, rgba(255,159,10,.14)); color:var(--amber-deep, #9a5b00); }

      /* ---- teacher: new module styling ---- */
      .cp-hero--teacher{ background:linear-gradient(125deg, var(--accent, #C79A3E), var(--accent-deep, #8A6A22) 70%); }
      .cp-hero--teacher h2{ font-family:'Fraunces', serif; font-weight:600; }

      .cp-gradebook-meta{ display:flex; align-items:center; gap:12px; margin-bottom:12px; }
      .cp-gradebook-bar{ flex:1; height:7px; border-radius:20px; background:var(--surface-border); overflow:hidden; }
      .cp-gradebook-bar-fill{ height:100%; background:linear-gradient(90deg, var(--accent), var(--accent-deep)); border-radius:20px; transition:width .5s var(--ease); }

      .cp-search-input{ padding:8px 14px; border-radius:20px; border:1.4px solid var(--surface-border); background:var(--surface); font-size:12.5px; color:var(--ink); min-width:0; width:100%; max-width:220px; }

      .cp-profile-detail{ display:flex; gap:24px; align-items:flex-start; }
      .cp-profile-detail-avatar{ width:76px; height:76px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg, var(--accent), var(--accent-deep)); color:#fff; font-size:24px; font-weight:800; display:flex; align-items:center; justify-content:center; box-shadow:0 14px 26px rgba(0,0,0,0.16); }
      .cp-profile-detail-grid{ flex:1; min-width:0; display:grid; grid-template-columns:1fr 1fr; gap:14px 20px; }
      .cp-pd-field{ display:flex; flex-direction:column; gap:5px; font-size:11.5px; color:var(--ink-faint); min-width:0; }
      .cp-pd-field strong{ font-size:13.5px; font-weight:600; color:var(--ink); word-break:break-word; }
      .cp-pd-field input, .cp-pd-field textarea{ padding:9px 11px; border-radius:10px; border:1.4px solid var(--surface-border); background:var(--surface); font-size:13px; color:var(--ink); font-family:inherit; width:100%; }
      .cp-pd-field--wide{ grid-column:1 / -1; }
      @media (max-width: 700px){ .cp-profile-detail{ flex-direction:column; } .cp-profile-detail-grid{ grid-template-columns:1fr; } }

      .cp-subject-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
      .cp-subject-card{ background:var(--surface); border:1px solid var(--surface-border); border-radius:16px; padding:16px; display:flex; flex-direction:column; gap:8px; min-width:0;
        opacity:0; transform:translateY(10px); animation:rowIn .5s var(--ease) forwards; animation-delay:calc(var(--i) * 80ms + .15s); }
      .cp-subject-top{ display:flex; align-items:center; justify-content:space-between; }
      .cp-subject-code{ font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:700; color:var(--accent-deep); background:var(--accent-soft); padding:3px 8px; border-radius:8px; }
      .cp-subject-card h4{ font-family:'Fraunces', serif; font-size:16px; font-weight:600; margin:2px 0 0; color:var(--ink); }
      .cp-subject-dept{ font-size:11.5px; color:var(--ink-faint); margin-bottom:4px; }
      .cp-subject-progress-label{ display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:var(--ink-soft); }
      .cp-subject-next{ font-size:11.5px; color:var(--ink-faint); margin-top:2px; }
      .cp-subject-actions{ display:flex; gap:8px; margin-top:6px; flex-wrap:wrap; }

      .cp-timetable{ display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
      .cp-tt-col{ display:flex; flex-direction:column; gap:8px; opacity:0; transform:translateY(8px); animation:rowIn .45s var(--ease) forwards; animation-delay:calc(var(--i) * 70ms + .1s); min-width:0; }
      .cp-tt-day{ text-align:center; font-family:'Fraunces', serif; font-weight:600; font-size:13px; color:var(--accent-deep); padding-bottom:6px; border-bottom:1.4px solid var(--panel-border); }
      .cp-tt-slot{ background:var(--surface); border:1px solid var(--surface-border); border-radius:11px; padding:8px 9px; text-align:center; }
      .cp-tt-time{ font-size:10px; color:var(--ink-faint); font-weight:600; } .cp-tt-course{ font-size:12px; font-weight:700; color:var(--ink); font-family:'JetBrains Mono', monospace; }
      .cp-tt-room{ font-size:10.5px; color:var(--ink-soft); } .cp-tt-empty{ text-align:center; font-size:11px; color:var(--ink-faint); padding:14px 0; }
      @media (max-width: 900px){ .cp-timetable{ grid-template-columns:repeat(3,1fr); } }
      @media (max-width: 520px){ .cp-timetable{ grid-template-columns:repeat(2,1fr); } }

      .cp-notice-composer{ display:flex; flex-direction:column; gap:10px; }
      .cp-notice-composer textarea{ padding:11px 13px; border-radius:12px; border:1.4px solid var(--surface-border); background:var(--surface); font-size:13px; color:var(--ink); font-family:inherit; resize:vertical; width:100%; }

      .cp-leave-dates{ display:flex; gap:12px; flex-wrap:wrap; }
      .cp-leave-dates label{ flex:1; min-width:140px; display:flex; flex-direction:column; gap:5px; font-size:11.5px; color:var(--ink-faint); }
      .cp-leave-dates input{ padding:9px 11px; border-radius:10px; border:1.4px solid var(--surface-border); background:var(--surface); font-size:13px; color:var(--ink); width:100%; }
      .cp-form-grid textarea{ padding:10px 12px; border-radius:10px; border:1.4px solid var(--surface-border); background:var(--surface); font-size:13px; color:var(--ink); font-family:inherit; resize:vertical; width:100%; }

      .cp-grv-desc{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; max-width:280px; font-size:12.5px; color:var(--ink); }
      .cp-autotag-hint{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:11.5px; padding:8px 10px; border-radius:10px; background:var(--accent-soft); color:var(--accent-deep); }
      .cp-autotag-label{ font-weight:700; }
      .cp-autotag-value{ font-family:'JetBrains Mono', monospace; font-weight:600; }

      .cp-shell--teacher h1, .cp-shell--teacher h2, .cp-shell--teacher h3, .cp-shell--teacher .cp-brand-name{ font-family:'Fraunces', serif; font-weight:600; }
      .cp-shell--teacher .cp-sidebar{ background:linear-gradient(180deg, color-mix(in srgb, var(--accent-soft) 45%, var(--surface)), transparent); }
      .cp-shell--teacher .cp-card{ border-width:1.4px; }

      .cp-shell--admin .cp-sidebar{ background:linear-gradient(180deg, var(--accent-deep), color-mix(in srgb, var(--accent-deep) 80%, black)); border-right:none; }
      .cp-shell--admin .cp-brand-name, .cp-shell--admin .cp-profile-card-name{ color:#fff; }
      .cp-shell--admin .cp-profile-card-id, .cp-shell--admin .cp-nav-label{ color:rgba(255,255,255,.55); }
      .cp-shell--admin .cp-nav-item{ color:rgba(255,255,255,.78); }
      .cp-shell--admin .cp-nav-item:hover{ background:rgba(255,255,255,.1); color:#fff; }
      .cp-shell--admin .cp-nav-item.is-active{ background:rgba(255,255,255,.16); box-shadow:none; }
      .cp-shell--admin .cp-sidebar-logout{ background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.15); color:rgba(255,255,255,.78); }
      .cp-shell--admin .cp-sidebar-foot{ color:rgba(255,255,255,.4); border-top-color:rgba(255,255,255,.12); }
      .cp-shell--admin .cp-profile-card{ border-bottom-color:rgba(255,255,255,.12); }
      .cp-shell--admin .cp-profile-card-avatar{ border-color:rgba(255,255,255,.25); }
      .cp-shell--admin .cp-stat-value, .cp-shell--admin .cp-audit-time{ font-family:'JetBrains Mono', monospace; }
      .cp-shell--admin .cp-frame{ --radius-lg:16px; --radius-md:12px; }

      /* ===========================================================
         RESPONSIVE / FIT-TO-SCREEN — collapsible sidebar on narrow
         viewports so nothing gets clipped and only the content area
         scrolls (the shell itself never grows past the viewport).
      =========================================================== */
      @media (max-width: 960px){
        .cp-shell{ padding:0; }
        .cp-frame{ border-radius:0; border-width:0 0 0 0; }
        .cp-hamburger{ all:unset; box-sizing:border-box; display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:10px;
          background:var(--surface); border:1px solid var(--surface-border); color:var(--ink-soft); cursor:pointer; flex-shrink:0; }
        .cp-hamburger:hover{ color:var(--ink); }
        .cp-sidebar{ position:fixed; top:0; bottom:0; left:0; z-index:200; width:min(80vw, 280px); max-width:280px; height:100vh; height:100dvh;
          background:var(--bg); box-shadow:0 0 0 1px var(--panel-border); transform:translateX(-100%); transition:transform .3s var(--ease); border-right:1px solid var(--panel-border); }
        .cp-shell--admin .cp-sidebar{ background:linear-gradient(180deg, var(--accent-deep), color-mix(in srgb, var(--accent-deep) 80%, black)); }
        .cp-sidebar.is-open{ transform:translateX(0); }
        .cp-sidebar-veil{ display:block; position:fixed; inset:0; background:rgba(6,14,18,.5); z-index:190; animation:toastIn .2s ease; }
        .cp-sidebar-close{ display:flex; align-items:center; justify-content:center; margin-left:auto; width:28px; height:28px; border-radius:50%; color:var(--ink-soft); cursor:pointer; background:transparent; border:none; }
        .cp-topbar-title p{ display:none; }
        .cp-main{ padding:16px 16px 24px; }
        .cp-topbar{ padding:10px 12px; margin-bottom:14px; }
      }
      @media (max-width: 600px){
        .cp-topbar-actions{ gap:6px; }
        .cp-profile-text{ display:none; }
        .cp-topbar .cp-pill--ghost .cp-pill-label span{ display:none; }
        .cp-hero{ padding:22px 18px; }
        .cp-hero-text h2{ font-size:21px; }
        .cp-hero-stats{ gap:16px; }
        .cp-card-body{ padding:14px; }
      }

      /* ===========================================================
         AUTH SCREEN (a2-*) — full-bleed split card, role-aware
      =========================================================== */
      .a2-page{ position:fixed; inset:0; z-index:5; --a2-ink:#0F2A26; --a2-ink-soft:#5C7A73; --a2-line:#DCEBE5; --a2-paper:#F3FAF7; --a2-white:#ffffff;
        --a2-glass:rgba(255,255,255,0.88); --a2-glass-border:rgba(255,255,255,0.8);
        --a2-mint1:#CFEDE3; --a2-mint2:#A9E0D2; --a2-mint3:#8FD6C6; --a2-shape-opacity:.55; --a2-shadow:rgba(14,60,50,.35);
        font-family:'Manrope', sans-serif; color:var(--a2-ink); min-height:100vh; min-height:100dvh; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch;
        background: radial-gradient(1200px 800px at 85% 10%, var(--a2-mint3) 0%, transparent 55%), radial-gradient(1000px 900px at 10% 95%, var(--a2-mint3) 0%, transparent 50%), linear-gradient(160deg, #EAF7F2 0%, var(--a2-mint1) 60%, var(--a2-mint2) 100%);
        display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 24px;
        /* When the card grows taller than the viewport (an error message or the
           demo-credentials panel expanding it), plain center-alignment clips the
           start edge and makes it unreachable even with a scrollbar — "safe
           center" falls back to start-alignment instead of clipping, so the
           whole card always stays scrollable into view. Unsupported browsers
           just keep the plain "center" above, which is still fine. */
        align-items:safe center; justify-content:safe center; }
      .cp-shell[data-theme="dark"] .a2-page{ --a2-ink:#EAF6F1; --a2-ink-soft:#8FAFA7; --a2-line:#1C3A34; --a2-paper:#0F2723; --a2-white:#132E29;
        --a2-glass:rgba(19,46,41,0.86); --a2-glass-border:rgba(255,255,255,0.1);
        --a2-mint1:#0A1F1B; --a2-mint2:#0D2A24; --a2-mint3:#11362E; --a2-shape-opacity:.28; --a2-shadow:rgba(0,0,0,.55);
        background: radial-gradient(1200px 800px at 85% 10%, var(--a2-mint3) 0%, transparent 55%), radial-gradient(1000px 900px at 10% 95%, var(--a2-mint3) 0%, transparent 50%), linear-gradient(160deg, #081714 0%, var(--a2-mint1) 60%, var(--a2-mint2) 100%); }
      .a2-shape{ position:fixed; border-radius:50%; filter:blur(2px); opacity:var(--a2-shape-opacity); animation:a2Drift 14s ease-in-out infinite; pointer-events:none; }
      .a2-shape--1{ width:420px; height:420px; background:var(--a2-mint3); top:-120px; right:-120px; }
      .a2-shape--2{ width:300px; height:300px; background:var(--a2-mint2); bottom:-90px; left:-90px; animation-delay:2s; }
      .a2-shape--3{ width:170px; height:170px; background:var(--a2-accent); opacity:calc(var(--a2-shape-opacity) * .6); top:60%; right:8%; animation-delay:4s; }
      .a2-shape--4{ width:120px; height:120px; background:var(--a2-accent); opacity:calc(var(--a2-shape-opacity) * .5); top:8%; left:6%; animation-delay:1.4s; }
      @keyframes a2Drift{ 0%,100%{ transform:translateY(0) scale(1);} 50%{ transform:translateY(-22px) scale(1.04);} }
      .a2-shell{ position:relative; z-index:2; width:100%; max-width:1120px; display:flex; flex-direction:column; align-items:center; gap:22px; }
      .a2-card{ width:100%; max-width:1120px; min-height:min(680px, 86vh); background:var(--a2-glass); border:1px solid var(--a2-glass-border);
        border-radius:28px; box-shadow:0 40px 90px -30px var(--a2-shadow), inset 0 1px 0 rgba(255,255,255,0.45); display:flex; flex-direction:column; overflow:hidden;
        opacity:0; transform:translateY(18px); animation:a2CardIn .7s cubic-bezier(.2,.8,.2,1) forwards; }
      @keyframes a2CardIn{ to{ opacity:1; transform:translateY(0);} }
      .a2-page-foot{ display:flex; align-items:center; gap:10px; color:var(--a2-ink-soft); font-size:12.5px; opacity:0; animation:a2CardIn .7s cubic-bezier(.2,.8,.2,1) .15s forwards; flex-wrap:wrap; justify-content:center; text-align:center; }
      .a2-dot{ width:4px; height:4px; border-radius:50%; background:var(--a2-ink-soft); opacity:.6; }
      .a2-nav{ display:flex; align-items:center; justify-content:space-between; padding:24px 42px; gap:12px; flex-wrap:wrap; }
      .a2-brand{ display:flex; align-items:center; gap:11px; } .a2-brand-mark{ position:relative; width:26px; height:20px; flex-shrink:0; }
      .a2-brand-name{ font-family:'Fraunces', serif; font-weight:600; font-size:19px; color:var(--a2-ink); } .a2-pilot{ color:var(--a2-accent); }
      .a2-nav-links{ display:flex; gap:32px; list-style:none; margin:0; padding:0; } .a2-nav-links li{ font-size:13.5px; font-weight:600; color:var(--a2-ink-soft); }
      .a2-nav-link-btn{ background:none; border:none; padding:0; margin:0; font:inherit; font-size:13.5px; font-weight:600; color:var(--a2-ink-soft); cursor:pointer; } .a2-nav-link-btn:hover{ color:var(--a2-ink); }
      .a2-nav-right{ display:flex; align-items:center; gap:12px; }
      .a2-badge{ padding:9px 18px; border-radius:999px; background:var(--a2-accent); color:#fff; font-size:12px; font-weight:800; white-space:nowrap; }
      .a2-theme-toggle{ all:unset; box-sizing:border-box; width:38px; height:38px; border-radius:50%; flex-shrink:0; cursor:pointer; border:1.5px solid var(--a2-line); background:var(--a2-paper); display:flex; align-items:center; justify-content:center; color:var(--a2-ink-soft); }
      .a2-theme-toggle:hover{ border-color:var(--a2-accent); color:var(--a2-accent); }
      .a2-grid{ display:grid; grid-template-columns:1fr 1fr; flex:1; min-height:0; }
      .a2-panel-form{ display:flex; flex-direction:column; justify-content:center; padding:10px min(6.5vw, 90px) 36px; min-width:0; }
      .a2-form-inner{ width:100%; max-width:400px; margin:0 auto; }
      .a2-tabs{ display:flex; gap:30px; border-bottom:1.5px solid var(--a2-line); margin-bottom:22px; position:relative; }
      .a2-tab{ all:unset; box-sizing:border-box; cursor:pointer; font-weight:700; font-size:16px; color:#B9C7C2; padding:0 0 13px; }
      .a2-tab.is-active{ color:var(--a2-accent); }
      .a2-tab-underline{ position:absolute; bottom:-1.5px; left:0; height:2.5px; width:50%; background:var(--a2-accent); border-radius:2px; transition:transform .35s cubic-bezier(.4,0,.2,1); }
      .a2-field-label{ font-size:11.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--a2-ink-soft); margin-bottom:9px; display:block; }
      .a2-role-select{ position:relative; margin-bottom:16px; }
      .a2-role-trigger{ all:unset; box-sizing:border-box; width:100%; display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid var(--a2-line); border-radius:999px; background:var(--a2-paper); cursor:pointer; }
      .a2-role-trigger.is-open{ border-color:var(--a2-accent); box-shadow:0 0 0 3px color-mix(in srgb, var(--a2-accent) 16%, transparent); }
      .a2-role-trigger-icon{ width:32px; height:32px; border-radius:50%; flex-shrink:0; background:var(--a2-accent-soft); color:var(--a2-accent); display:flex; align-items:center; justify-content:center; }
      .a2-role-trigger-text{ flex:1; min-width:0; text-align:left; } .a2-rt-label{ display:block; font-weight:700; font-size:14px; color:var(--a2-ink); } .a2-rt-sub{ display:block; font-size:11px; color:var(--a2-ink-soft); }
      .a2-chevron{ display:flex; color:var(--a2-ink-soft); transition:transform .3s cubic-bezier(.4,0,.2,1); flex-shrink:0; } .a2-chevron.is-open{ transform:rotate(180deg); color:var(--a2-accent); }
      .a2-role-panel{ position:absolute; left:0; right:0; top:calc(100% + 8px); background:var(--a2-white); border:1.5px solid var(--a2-line); border-radius:16px; box-shadow:0 20px 40px -18px rgba(16,26,48,0.28); padding:7px; z-index:20; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .22s ease, transform .22s cubic-bezier(.2,.8,.2,1); max-height:60vh; overflow-y:auto; }
      .a2-role-panel.is-open{ opacity:1; transform:translateY(0); pointer-events:auto; }
      .a2-role-option{ all:unset; box-sizing:border-box; display:flex; align-items:center; gap:12px; width:100%; padding:10px; border-radius:12px; cursor:pointer; text-align:left; }
      .a2-role-option:hover{ background:var(--a2-paper); } .a2-role-option.is-selected{ background:var(--a2-accent-soft); }
      .a2-role-opt-icon{ width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .a2-role-opt-text{ flex:1; min-width:0; } .a2-ot-label{ display:block; font-weight:700; font-size:13.5px; color:var(--a2-ink); } .a2-ot-sub{ display:block; font-size:11px; color:var(--a2-ink-soft); }
      .a2-check{ margin-left:auto; color:var(--a2-accent); display:flex; flex-shrink:0; }
      .a2-field{ position:relative; display:block; margin-bottom:14px; }
      .a2-field input{ width:100%; box-sizing:border-box; padding:14px 16px 14px 44px; border:1.5px solid var(--a2-line); border-radius:999px; font-size:14.5px; background:var(--a2-paper); color:var(--a2-ink); outline:none; }
      .a2-field input:focus{ border-color:var(--a2-accent); background:var(--a2-white); box-shadow:0 0 0 3px color-mix(in srgb, var(--a2-accent) 16%, transparent); }
      .a2-field-icon{ position:absolute; left:15px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:#9DB3AC; pointer-events:none; display:flex; }
      .a2-field--pw input{ padding-right:44px; }
      .a2-field-toggle{ position:absolute; right:6px; top:50%; transform:translateY(-50%); width:32px; height:32px; border:none; background:transparent; color:#9DB3AC; display:flex; align-items:center; justify-content:center; border-radius:999px; cursor:pointer; transition:color .15s ease, background .15s ease; }
      .a2-field-toggle:hover{ color:var(--a2-accent); background:color-mix(in srgb, var(--a2-accent) 10%, transparent); }
      .a2-role-note{ margin:-4px 0 12px; font-size:12px; color:var(--a2-ink-soft); }
      .a2-submit{ all:unset; box-sizing:border-box; width:100%; text-align:center; margin-top:4px; padding:15px; border-radius:999px; background:var(--a2-accent); color:#fff; font-weight:800; font-size:14.5px; cursor:pointer; box-shadow:0 14px 26px -12px color-mix(in srgb, var(--a2-accent) 70%, transparent); }
      .a2-submit:hover{ background:var(--a2-accent-deep); } .a2-submit:disabled{ opacity:.6; cursor:default; }
      .a2-error{ font-size:13px; color:#a13d3d; background:#fbeaea; border:1px solid #f0cccc; padding:10px 13px; border-radius:10px; margin-bottom:14px; }
      .cp-shell[data-theme="dark"] .a2-error{ background:rgba(161,61,61,0.18); border-color:rgba(161,61,61,0.4); color:#ff9c9c; }
      .a2-switch{ text-align:center; font-size:12.5px; color:var(--a2-ink-soft); margin-top:16px; } .a2-switch button{ all:unset; cursor:pointer; color:var(--a2-accent); font-weight:700; }
      .a2-foot-note{ padding-top:18px; font-size:11px; color:var(--a2-ink-soft); text-align:center; line-height:1.6; }
      .a2-foot-note code{ background:var(--a2-paper); padding:1px 5px; border-radius:5px; }

      /* password strength hint (Prompt 7) */
      .a2-pw-hint{ margin:-6px 0 14px; font-size:11px; color:var(--a2-ink-soft); }
      .a2-pw-hint--idle{ line-height:1.4; }
      .a2-pw-bar{ height:5px; border-radius:20px; background:var(--a2-line); overflow:hidden; margin-bottom:5px; }
      .a2-pw-bar-fill{ height:100%; border-radius:20px; transition:width .25s ease, background .25s ease; }
      .a2-pw-bar-fill--weak{ background:#D9534F; }
      .a2-pw-bar-fill--mid{ background:#E8A33D; }
      .a2-pw-bar-fill--good{ background:#4FA37A; }
      .a2-pw-bar-fill--strong{ background:var(--a2-accent); }
      .a2-pw-label--weak{ color:#B23A2C; } .a2-pw-label--mid{ color:#8A6A22; }
      .a2-pw-label--good, .a2-pw-label--strong{ color:#1D8A4E; }

      /* collapsible demo credentials (Prompt 7) */
      .a2-demo-creds{ padding-top:16px; }
      .a2-demo-toggle{ all:unset; box-sizing:border-box; cursor:pointer; display:inline-flex; align-items:center; gap:6px;
        font-size:11.5px; font-weight:700; color:var(--a2-ink-soft); }
      .a2-demo-toggle:hover{ color:var(--a2-accent); }
      .a2-demo-panel{ margin-top:10px; padding:12px 14px; border-radius:12px; background:var(--a2-paper); border:1px solid var(--a2-line); }
      .a2-demo-row{ display:flex; align-items:center; gap:8px; font-size:11.5px; color:var(--a2-ink-soft); padding:3px 0; flex-wrap:wrap; }
      .a2-demo-row span{ flex-shrink:0; width:52px; font-weight:700; color:var(--a2-ink); }
      .a2-demo-row code{ background:var(--a2-white); padding:1px 6px; border-radius:5px; }
      .a2-demo-warn{ margin-top:8px; font-size:10.5px; color:var(--a2-ink-soft); opacity:.8; }

      .a2-panel-visual{ position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; min-height:420px; padding:40px 24px; }
      .a2-blob{ position:absolute; inset:-6%; background:linear-gradient(150deg, var(--a2-accent) 0%, var(--a2-accent-deep) 100%); border-radius:38% 62% 61% 39% / 42% 46% 54% 58%; animation:a2Morph 11s ease-in-out infinite; }
      @keyframes a2Morph{ 0%,100%{ border-radius:38% 62% 61% 39% / 42% 46% 54% 58%; } 33%{ border-radius:60% 40% 42% 58% / 55% 40% 60% 45%; } 66%{ border-radius:40% 60% 55% 45% / 60% 48% 52% 40%; } }
      .a2-orbit{ position:absolute; width:66%; height:66%; border:1.5px dashed rgba(255,255,255,.32); border-radius:50%; animation:a2Spin 28s linear infinite; }
      .a2-orbit2{ position:absolute; width:84%; height:84%; border:1px dashed rgba(255,255,255,.2); border-radius:50%; animation:a2Spin 42s linear infinite reverse; }
      @keyframes a2Spin{ to{ transform:rotate(360deg); } }
      .a2-visual-content{ position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:26px; width:100%; }
      .a2-stage{ position:relative; width:min(280px, 82%); height:200px; flex-shrink:0; }
      .a2-stage-item{ position:absolute; animation:a2Float var(--dur,4.5s) ease-in-out infinite; animation-delay:var(--delay,0s); filter:drop-shadow(0 14px 20px rgba(10,40,34,.22)); }
      @keyframes a2Float{ 0%,100%{ transform:translateY(0) rotate(var(--rot,0deg)); } 50%{ transform:translateY(-14px) rotate(calc(var(--rot,0deg) + 2deg)); } }
      .a2-doc{ width:52px; height:64px; background:#fff; border-radius:9px; padding:9px 8px; display:flex; flex-direction:column; gap:5px; }
      .a2-doc span{ display:block; height:4px; border-radius:2px; background:var(--a2-accent); opacity:.85; }
      .a2-doc span:nth-child(1){ width:85%; } .a2-doc span:nth-child(2){ width:100%; } .a2-doc span:nth-child(3){ width:60%; }
      .a2-folder{ width:64px; height:48px; background:var(--a2-accent); border-radius:3px 12px 12px 12px; position:relative; opacity:0.92; }
      .a2-folder::before{ content:''; position:absolute; top:-9px; left:0; width:30px; height:11px; background:var(--a2-accent); border-radius:7px 7px 0 0; }
      .a2-folder--alt{ background:var(--a2-accent-deep); } .a2-folder--alt::before{ background:var(--a2-accent-deep); }
      .a2-chip{ width:44px; height:44px; border-radius:50%; background:var(--a2-accent-deep); display:flex; align-items:center; justify-content:center; color:#fff; }
      .a2-center{ width:78px; height:78px; border-radius:22px; background:#fff; display:flex; align-items:center; justify-content:center; color:var(--a2-accent); box-shadow:0 18px 30px rgba(10,40,34,.28); z-index:3; }
      .a2-particles span{ position:absolute; width:5px; height:5px; background:rgba(255,255,255,.55); border-radius:50%; animation:a2Drift2 6s ease-in-out infinite; }
      .a2-particles span:nth-child(1){ top:10%; left:12%; } .a2-particles span:nth-child(2){ top:78%; left:10%; animation-delay:1.2s; }
      .a2-particles span:nth-child(3){ top:14%; left:88%; animation-delay:2.1s; } .a2-particles span:nth-child(4){ top:82%; left:86%; animation-delay:3s; }
      .a2-particles span:nth-child(5){ top:46%; left:94%; animation-delay:.6s; }
      @keyframes a2Drift2{ 0%,100%{ transform:translateY(0) scale(1); opacity:.6;} 50%{ transform:translateY(-14px) scale(1.3); opacity:1;} }
      .a2-role-caption{ text-align:center; position:relative; z-index:2; }
      .a2-role-caption h3{ font-family:'Fraunces', serif; color:#fff; font-weight:600; font-size:22px; margin:0 0 7px; }
      .a2-role-caption p{ color:rgba(255,255,255,.85); font-size:13px; margin:0 auto; max-width:260px; line-height:1.55; }
      @media (max-width: 900px){
        .a2-grid{ grid-template-columns:1fr; } .a2-panel-visual{ order:-1; min-height:260px; } .a2-nav-links{ display:none; }
        .a2-nav{ padding:18px 22px; } .a2-panel-form{ padding:24px 22px; } .a2-page{ padding:20px 14px; } .a2-card{ border-radius:20px; min-height:auto; }
      }
      @media (max-width: 480px){
        .a2-nav{ padding:14px 16px; } .a2-badge{ padding:7px 12px; font-size:11px; }
        .a2-panel-visual{ min-height:180px; padding:24px 16px; }
        .a2-stage{ height:150px; }
        .a2-role-caption h3{ font-size:18px; }
      }
      @media (prefers-reduced-motion: reduce){
        *{ animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important; }
        .cp-blob, .a2-shape{ animation:none !important; }
      }

      /* ===========================================================
         AI COPILOT WIDGET (cw-*)
      =========================================================== */
      .cw-root{ position:fixed; right:26px; bottom:26px; z-index:500; font-family:'Inter', system-ui, sans-serif; }

      .cw-fab{ all:unset; box-sizing:border-box; cursor:pointer; position:relative; width:56px; height:56px; border-radius:50%;
        display:flex; align-items:center; justify-content:center; color:#fff;
        background:linear-gradient(135deg, var(--cw-accent), var(--cw-accent-deep));
        box-shadow:0 16px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.35);
        transition:transform .22s cubic-bezier(.22,1,.36,1); }
      .cw-fab:hover{ transform:translateY(-3px) scale(1.04); }
      .cw-fab-ping{ position:absolute; inset:-4px; border-radius:50%; border:2px solid var(--cw-accent); opacity:.55; animation:cwPing 2.4s ease-out infinite; }
      @keyframes cwPing{ 0%{ transform:scale(0.85); opacity:.55; } 100%{ transform:scale(1.35); opacity:0; } }

      .cw-panel{ position:fixed; right:22px; bottom:22px; width:min(380px, calc(100vw - 32px)); height:min(560px, calc(100vh - 48px)); height:min(560px, calc(100dvh - 48px));
        display:flex; flex-direction:column; overflow:hidden; border-radius:22px;
        background:var(--glass-strong, rgba(255,255,255,0.92)); border:1px solid var(--glass-border, rgba(255,255,255,0.6));
        box-shadow:0 30px 70px rgba(10,30,28,0.32);
        opacity:0; transform:translateY(16px) scale(.97); animation:cwPanelIn .32s cubic-bezier(.22,1,.36,1) forwards; }
      @keyframes cwPanelIn{ to{ opacity:1; transform:translateY(0) scale(1); } }

      .cw-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:14px 14px 12px;
        background:linear-gradient(120deg, var(--cw-accent-deep), color-mix(in srgb, var(--cw-accent-deep) 70%, black)); color:#fff; flex-shrink:0; }
      .cw-head-left{ display:flex; align-items:center; gap:10px; min-width:0; }
      .cw-head-avatar{ width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.3);
        display:flex; align-items:center; justify-content:center; flex-shrink:0; }
      .cw-head-title{ font-weight:700; font-size:13.5px; font-family:'Poppins', sans-serif; }
      .cw-head-sub{ margin-top:2px; }
      .cw-proto-badge{ display:inline-flex; align-items:center; gap:4px; font-size:9.5px; font-weight:700; letter-spacing:.02em;
        color:#fff; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.3); padding:2.5px 8px; border-radius:20px; white-space:nowrap; }
      .cw-icon-btn{ all:unset; cursor:pointer; width:28px; height:28px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center;
        color:rgba(255,255,255,0.85); }
      .cw-icon-btn:hover{ background:rgba(255,255,255,0.14); color:#fff; }

      .cw-disclaimer{ flex-shrink:0; font-size:10.5px; line-height:1.4; color:var(--ink-soft, #5C7A73); background:var(--cw-accent-soft);
        padding:8px 14px; border-bottom:1px solid var(--panel-border, rgba(17,40,45,0.1)); }

      .cw-messages{ flex:1; min-height:0; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; }
      .cw-msg{ display:flex; align-items:flex-end; gap:7px; max-width:88%; animation:cwMsgIn .28s var(--ease); }
      .cw-msg--bot{ align-self:flex-start; }
      .cw-msg--user{ align-self:flex-end; flex-direction:row-reverse; }
      @keyframes cwMsgIn{ from{ opacity:0; transform:translateY(6px) scale(.97);} to{ opacity:1; transform:translateY(0) scale(1);} }
      .cw-msg-avatar{ width:22px; height:22px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center;
        background:var(--cw-accent-soft); color:var(--cw-accent-deep); }
      .cw-bubble{ font-size:12.8px; line-height:1.5; padding:9px 12px; border-radius:14px; word-break:break-word; }
      .cw-msg--bot .cw-bubble{ background:var(--surface, rgba(255,255,255,0.8)); border:1px solid var(--surface-border, rgba(17,40,45,0.14)); color:var(--ink, #16232A); border-bottom-left-radius:4px; }
      .cw-msg--user .cw-bubble{ background:linear-gradient(120deg, var(--cw-accent), var(--cw-accent-deep)); color:#fff; border-bottom-right-radius:4px; }
      .cw-bubble--typing{ display:flex; align-items:center; gap:4px; padding:11px 13px; }
      .cw-bubble--typing span{ width:5px; height:5px; border-radius:50%; background:var(--ink-faint, #7C8D93); animation:cwTyping 1.1s ease-in-out infinite; }
      .cw-bubble--typing span:nth-child(2){ animation-delay:.15s; } .cw-bubble--typing span:nth-child(3){ animation-delay:.3s; }
      @keyframes cwTyping{ 0%,60%,100%{ transform:translateY(0); opacity:.5; } 30%{ transform:translateY(-4px); opacity:1; } }

      .cw-inputbar{ flex-shrink:0; display:flex; align-items:center; gap:8px; padding:10px 12px; border-top:1px solid var(--panel-border, rgba(17,40,45,0.1)); }
      .cw-inputbar input{ flex:1; min-width:0; padding:10px 13px; border-radius:20px; border:1.4px solid var(--surface-border, rgba(17,40,45,0.14));
        background:var(--surface, rgba(255,255,255,0.8)); font-size:12.8px; color:var(--ink, #16232A); outline:none; }
      .cw-inputbar input:focus{ border-color:var(--cw-accent); }
      .cw-send-btn{ all:unset; box-sizing:border-box; cursor:pointer; flex-shrink:0; width:34px; height:34px; border-radius:50%;
        display:flex; align-items:center; justify-content:center; color:#fff; background:linear-gradient(135deg, var(--cw-accent), var(--cw-accent-deep));
        transition:transform .18s ease, opacity .18s ease; }
      .cw-send-btn:hover{ transform:scale(1.06); }
      .cw-send-btn:disabled{ opacity:.45; cursor:not-allowed; }

      @media (max-width: 480px){
        .cw-root{ right:14px; bottom:14px; }
        .cw-fab{ width:50px; height:50px; }
        .cw-panel{ right:8px; bottom:8px; width:calc(100vw - 16px); height:min(76vh, 560px); border-radius:18px; }
      }
    `}</style>
  );
}
