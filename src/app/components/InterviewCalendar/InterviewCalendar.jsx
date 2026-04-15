"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  ChevronLeft, ChevronRight, Calendar as CalIcon,
  Video, Phone, MapPin, Clock, Building, X, ExternalLink,
} from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { "en-US": enUS },
});

const STATUS_COLORS = {
  scheduled:  { bg: "#6366f1", light: "#eef2ff", text: "#4338ca", surfaceDark: "rgba(99,102,241,0.18)", textDark: "#c7d2fe" },
  completed:  { bg: "#10b981", light: "#ecfdf5", text: "#065f46", surfaceDark: "rgba(16,185,129,0.16)", textDark: "#6ee7b7" },
  cancelled:  { bg: "#ef4444", light: "#fef2f2", text: "#991b1b", surfaceDark: "rgba(239,68,68,0.16)", textDark: "#fecaca" },
  live:       { bg: "#f59e0b", light: "#fffbeb", text: "#92400e", surfaceDark: "rgba(245,158,11,0.16)", textDark: "#fde68a" },
};

const TYPE_ICON = { video: Video, phone: Phone, "in-person": MapPin };

function EventComponent({ event }) {
  const colors = STATUS_COLORS[event.resource?.status] || STATUS_COLORS.scheduled;
  const Icon = TYPE_ICON[event.resource?.type] || Video;
  return (
    <div className="flex items-center gap-1 px-1 py-0.5 rounded text-white text-[11px] font-semibold truncate w-full h-full"
      style={{ backgroundColor: colors.bg }}>
      <Icon className="w-3 h-3 shrink-0" />
      <span className="truncate">{event.title}</span>
    </div>
  );
}

function CustomToolbar({ label, onNavigate, onView, view }) {
  const views = ["month", "week", "day", "agenda"];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate("PREV")}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <button onClick={() => onNavigate("TODAY")}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
          Today
        </button>
        <button onClick={() => onNavigate("NEXT")}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-base font-black text-slate-900 ml-1">{label}</span>
      </div>
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        {views.map((v) => (
          <button key={v} onClick={() => onView(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              view === v ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InterviewCalendar({ interviews = [], role = "recruiter" }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = useMemo(() => interviews.map((iv) => {
    // Handle MongoDB date objects and plain ISO strings
    const rawDate = iv.scheduledDateTime || iv.scheduledAt || iv.date;
    const start = rawDate ? new Date(rawDate?.$date || rawDate) : new Date();
    if (isNaN(start.getTime())) return null; // skip invalid dates
    const durationMs = (iv.duration || iv.durationMinutes || 30) * 60000;
    const end = new Date(start.getTime() + durationMs);
    const label = role === "candidate"
      ? (iv.company || iv.jobTitle || "Interview")
      : (iv.applicantEmail?.split("@")[0] || iv.jobTitle || "Interview");
    return { id: iv._id, title: label, start, end, resource: iv };
  }).filter(Boolean), [interviews, role]);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event.resource);
  }, []);

  const eventStyleGetter = useCallback((event) => {
    const colors = STATUS_COLORS[event.resource?.status] || STATUS_COLORS.scheduled;
    return {
      style: {
        backgroundColor: colors.bg,
        border: "none",
        borderRadius: "6px",
        color: "#fff",
        fontSize: "11px",
        padding: "1px 4px",
      },
    };
  }, []);

  // Legend
  const legend = [
    { label: "Scheduled", ...STATUS_COLORS.scheduled },
    { label: "Completed", ...STATUS_COLORS.completed },
    { label: "Cancelled", ...STATUS_COLORS.cancelled },
    { label: "Live",      ...STATUS_COLORS.live },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {legend.map(({ label, bg }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: bg }} />
            {label}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="rbc-wrapper" style={{ height: currentView === "agenda" ? "auto" : "min(70vh, 600px)" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={currentView}
          date={currentDate}
          onView={setCurrentView}
          onNavigate={setCurrentDate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
            toolbar: (props) => <CustomToolbar {...props} view={currentView} />,
          }}
          popup
          style={{ height: "100%" }}
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventModal
          interview={selectedEvent}
          role={role}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

function EventModal({ interview, role, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = STATUS_COLORS[interview.status] || STATUS_COLORS.scheduled;
  const Icon = TYPE_ICON[interview.type] || Video;
  const date = new Date((interview.scheduledDateTime || interview.scheduledAt)?.$date || interview.scheduledDateTime || interview.scheduledAt);
  const meetingLink = interview.meetingUrl || (interview.meetingRoomName ? `https://meet.jit.si/${interview.meetingRoomName}` : null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: isDark ? colors.surfaceDark : colors.light }}>
              <Icon className="w-5 h-5" style={{ color: isDark ? colors.textDark : colors.text }} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base leading-tight">
                {interview.jobTitle || "Interview"}
              </h3>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
                style={{ backgroundColor: isDark ? colors.surfaceDark : colors.light, color: isDark ? colors.textDark : colors.text }}>
                {interview.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <Row icon={<Building className="w-4 h-4 text-slate-400" />}
            label={role === "candidate" ? "Company" : "Candidate"}
            value={role === "candidate" ? interview.company : interview.applicantEmail} />
          <Row icon={<CalIcon className="w-4 h-4 text-slate-400" />} label="Date"
            value={date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} />
          <Row icon={<Clock className="w-4 h-4 text-slate-400" />} label="Time"
            value={`${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${interview.duration ? ` · ${interview.duration} min` : ""}`} />
          {interview.notes && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 italic border border-slate-100">
              &ldquo;{interview.notes}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          {interview.status === "scheduled" && interview.type === "video" && meetingLink && (
            <a href={meetingLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-colors">
              <Video className="w-4 h-4" /> Join Interview
            </a>
          )}
          {interview.status === "scheduled" && interview.type === "video" && meetingLink && (
            <a href={meetingLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors">
              <ExternalLink className="w-4 h-4" /> Open in Browser
            </a>
          )}
          <button onClick={onClose}
            className="py-2.5 border border-slate-200 text-slate-500 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
