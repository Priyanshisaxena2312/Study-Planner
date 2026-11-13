import React, { useState } from "react";
import {
  Clock3,
  CircleCheck,
  Flame,
  Target,
  ArrowUpRight,
  Plus,
  Check,
  MoreHorizontal,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Brain,
  CalendarCheck,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useStudy } from "../context/StudyContext";
import { StatCard } from "../components/common/StatCard";

const initialWeeklyData = [
  { day: "Mon", hours: 2.2 },
  { day: "Tue", hours: 3.1 },
  { day: "Wed", hours: 2.6 },
  { day: "Thu", hours: 3.8 },
  { day: "Fri", hours: 2.9 },
  { day: "Sat", hours: 4.2 },
  { day: "Sun", hours: 3.4 },
];

export function DashboardPage({ setActive }) {
  const {
    state,
    dispatch,
    subjectProgressMap,
    todaySessions,
    todayCompleted,
    todayTotal,
    todayCompletionRate,
  } = useStudy();

  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const streak = state.streak.currentStreak;

  // Compute weekly goal hours
  const weeklyHoursGoal = state.goals.find((g) => g.type === "weekly" && g.category === "hours") || {
    current: 18.2,
    target: 24,
  };

  function toggleTask(id) {
    dispatch({ type: "TOGGLE_SESSION", payload: id });
  }

  function addTask(e) {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) return;

    // Check if matching subject exists
    const matchingSubject = state.subjects.find(
      (s) => s.name.toLowerCase() === newSubject.trim().toLowerCase()
    );

    const newSession = {
      id: `tt-${Date.now()}`,
      day: "Thu",
      startTime: "08:00 PM",
      endTime: "08:45 PM",
      subjectId: matchingSubject ? matchingSubject.id : "sub-1",
      subject: newSubject.trim(),
      topic: newTopic.trim(),
      tag: "New task",
      color: matchingSubject ? matchingSubject.tone : "olive",
      notes: "",
      done: false,
    };

    dispatch({ type: "ADD_SESSION", payload: newSession });
    setNewSubject("");
    setNewTopic("");
    setShowAdd(false);
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> THURSDAY · A FRESH START
          </div>
          <h1>Your learning, in balance.</h1>
          <p className="page-subtitle">
            A little progress each day adds up to something wonderful.
          </p>
        </div>
        <button className="primary-button" onClick={() => setShowAdd(true)}>
          <Plus size={17} /> Add a study task
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={<Clock3 size={18} />}
          label="Planned study time"
          value="4h 15m"
          note={`Across ${todayTotal} sessions today`}
          accent="green"
        />
        <StatCard
          icon={<CircleCheck size={18} />}
          label="Tasks completed"
          value={`${todayCompleted} / ${todayTotal}`}
          note={`${todayCompletionRate}% of today's plan`}
          accent="cream"
        />
        <StatCard
          icon={<Flame size={18} />}
          label="Current study streak"
          value={`${streak} days`}
          note="You're building a habit!"
          accent="peach"
        />
        <StatCard
          icon={<Target size={18} />}
          label="Weekly study goal"
          value={`${weeklyHoursGoal.current}h`}
          note={`of ${weeklyHoursGoal.target} hours completed`}
          accent="lavender"
        />
      </section>

      <section className="main-grid">
        <div className="left-column">
          <div className="section-heading">
            <div>
              <div className="section-kicker">YOUR DAY AT A GLANCE</div>
              <h2>Today's study plan</h2>
            </div>
            <button
              className="text-button"
              onClick={() => setActive("My timetable")}
            >
              View timetable <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="plan-card">
            <div className="plan-top">
              <div>
                <span className="date-label">THURSDAY, NOVEMBER 13</span>
                <h3>Make today count.</h3>
                <p>You have a thoughtful plan waiting for you.</p>
              </div>
              <div className="day-progress">
                <div
                  className="progress-ring"
                  style={{
                    background: `conic-gradient(#81977b 0 ${todayCompletionRate}%, #e9eee5 ${todayCompletionRate}% 100%)`,
                  }}
                >
                  <span>{todayCompletionRate}%</span>
                </div>
                <small>DAY COMPLETE</small>
              </div>
            </div>

            <div className="task-list">
              {todaySessions.map((task) => (
                <div
                  className={`task-row ${task.done ? "task-done" : ""}`}
                  key={task.id}
                >
                  <button
                    className="task-check"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.done ? <Check size={15} /> : <span />}
                  </button>
                  <div className="task-time">
                    {task.startTime || task.time}
                    <small>{task.endTime || task.end}</small>
                  </div>
                  <div className={`task-color ${task.color}`} />
                  <div className="task-info">
                    <strong>{task.subject}</strong>
                    <span>{task.topic}</span>
                  </div>
                  <span className={`task-tag ${task.color}`}>{task.tag}</span>
                  <button className="more-button" aria-label="More options">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button className="add-inline" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add another session
            </button>
          </div>

          <div className="section-heading subject-heading">
            <div>
              <div className="section-kicker">KEEP MOVING FORWARD</div>
              <h2>Your subjects</h2>
            </div>
            <button
              className="text-button"
              onClick={() => setActive("Subjects & topics")}
            >
              All subjects <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="subject-list">
            {state.subjects.map((s) => {
              const progress = subjectProgressMap[s.id] ?? 50;
              const chapterCount = state.chapters.filter((c) => c.subjectId === s.id).length;
              return (
                <div
                  className="subject-card"
                  key={s.id}
                  onClick={() => setActive("Subjects & topics")}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`subject-icon ${s.tone}`}>
                    <BookOpen size={18} />
                  </div>
                  <div className="subject-main">
                    <div className="subject-title-row">
                      <strong>{s.name}</strong>
                      <span>{s.scoreStatus || "On track"}</span>
                    </div>
                    <p>
                      {chapterCount} chapters · Exam on{" "}
                      {new Date(s.examDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <div className="subject-progress">
                      <div
                        className={`bar ${s.tone}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <strong className="subject-percent">{progress}%</strong>
                  <ChevronRight size={17} className="muted-icon" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="right-column">
          <div className="section-heading">
            <div>
              <div className="section-kicker">A LITTLE EVERY DAY</div>
              <h2>Study activity</h2>
            </div>
            <button
              className="select-button"
              onClick={() => setActive("Progress & analytics")}
            >
              This week <ChevronDown size={14} />
            </button>
          </div>

          <div className="chart-card">
            <div className="chart-summary">
              <strong>
                22.2 <small>hrs</small>
              </strong>
              <span className="trend">
                <ArrowUpRight size={14} /> 12% <em>vs last week</em>
              </span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={initialWeeklyData}
                  margin={{ top: 10, right: 4, left: -22, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="sageFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#108548" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#108548" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#e4efe7"
                    strokeDasharray="3 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6a8878", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6a8878", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #d4ebd9",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 8px 24px rgba(12, 107, 68, 0.12)",
                    }}
                    formatter={(v) => [`${v} hours`, "Study time"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#0c6b44"
                    strokeWidth={2.8}
                    fill="url(#sageFill)"
                    activeDot={{
                      r: 5,
                      fill: "#0c6b44",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-footer">
              <span>
                <i className="legend-dot" /> Study hours
              </span>
              <span>Goal: 24 hrs / week</span>
            </div>
          </div>

          <div className="ai-card">
            <div className="ai-heading">
              <div className="ai-icon">
                <Sparkles size={17} />
              </div>
              <span>YOUR STUDY INSIGHT</span>
              <span className="sample-label">SAMPLE</span>
            </div>
            <h3>Give Mathematics a little more love.</h3>
            <p>
              Your recent practice suggests that integration could use another
              revision session before your upcoming exam.
            </p>
            <div className="insight-meta">
              <span>
                <Brain size={14} /> Based on sample performance data
              </span>
            </div>
            <button
              className="ai-action"
              onClick={() => setActive("Revision center")}
            >
              Plan a revision session <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="exam-card">
            <div className="exam-top">
              <div>
                <div className="section-kicker">COMING UP</div>
                <h3>Next examination</h3>
              </div>
              <div className="exam-icon">
                <CalendarCheck size={19} />
              </div>
            </div>
            <div className="exam-subject">Mathematics</div>
            <div className="exam-bottom">
              <strong>
                5 <small>days left</small>
              </strong>
              <span>18 November, 2026</span>
            </div>
            <div className="exam-bar">
              <div />
            </div>
          </div>
        </div>
      </section>

      {showAdd && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAdd(false);
          }}
        >
          <form className="task-modal" onSubmit={addTask}>
            <div className="modal-head">
              <div>
                <div className="section-kicker">BUILD YOUR DAY</div>
                <h2>Add a study session</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAdd(false)}
              >
                <X size={19} />
              </button>
            </div>
            <label>
              Subject
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                autoFocus
                required
              />
            </label>
            <label>
              What will you study?
              <input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Differential equations"
                required
              />
            </label>
            <div className="modal-note">
              <Sparkles size={15} /> All added sessions synchronize directly to
              your timetable and study analytics.
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button className="primary-button" type="submit">
                <Plus size={16} /> Add session
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

