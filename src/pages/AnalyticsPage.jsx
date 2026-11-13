import React, { useState } from "react";
import {
  ChartNoAxesCombined,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowUpRight,
  Filter,
  Layers,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useStudy } from "../context/StudyContext";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/common/Card";
import { StatCard } from "../components/common/StatCard";
import { ProgressBar } from "../components/common/ProgressBar";

const WEEKLY_HOURS_DATA = [
  { day: "Mon", actual: 2.2, target: 4.0 },
  { day: "Tue", actual: 3.1, target: 4.5 },
  { day: "Wed", actual: 2.6, target: 3.5 },
  { day: "Thu", actual: 3.8, target: 5.0 },
  { day: "Fri", actual: 2.9, target: 4.0 },
  { day: "Sat", actual: 4.2, target: 6.0 },
  { day: "Sun", actual: 3.4, target: 5.0 },
];

const COMPLETION_TREND_DATA = [
  { day: "Mon", rate: 75 },
  { day: "Tue", rate: 80 },
  { day: "Wed", rate: 68 },
  { day: "Thu", rate: 85 },
  { day: "Fri", rate: 78 },
  { day: "Sat", rate: 92 },
  { day: "Sun", rate: 88 },
];

export function AnalyticsPage() {
  const {
    state,
    subjectProgressMap,
    weeklyHoursLogged,
    todayCompleted,
    todayTotal,
    todayCompletionRate,
  } = useStudy();

  const [timeframe, setTimeframe] = useState("THIS_WEEK");

  const totalStudyHours = 22.2 + weeklyHoursLogged;
  const targetWeeklyHours = 24.0;
  const streak = state.streak.currentStreak;

  // Compute subject distribution
  const subjectDistribution = state.subjects.map((sub) => {
    const chapters = state.chapters.filter((c) => c.subjectId === sub.id);
    const chapterIds = chapters.map((c) => c.id);
    const topics = state.topics.filter((t) => chapterIds.includes(t.chapterId));
    const completedTopics = topics.filter((t) => t.completed).length;
    const progress = subjectProgressMap[sub.id] ?? 0;

    return {
      id: sub.id,
      name: sub.name,
      code: sub.code,
      tone: sub.tone || "sage",
      topicsCount: topics.length,
      completedTopics,
      progress,
      estimatedHours: Number((topics.length * 0.75).toFixed(1)),
    };
  });

  return (
    <div className="analytics-page">
      <PageHeader
        eyebrow="PERFORMANCE TELEMETRY"
        title="Progress & Analytics"
        subtitle="Uncover your study patterns, compare planned vs actual hours, and track syllabus coverage."
        actions={
          <div className="header-action-group">
            <select
              className="filter-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="THIS_WEEK">This Week (Nov 10 - Nov 16)</option>
              <option value="LAST_WEEK">Last Week (Nov 03 - Nov 09)</option>
              <option value="MONTH">Full Month of November</option>
            </select>
          </div>
        }
      />

      {/* Top Telemetry Stats */}
      <section className="stats-grid">
        <StatCard
          icon={<Clock size={18} />}
          label="Total study time"
          value={`${totalStudyHours.toFixed(1)}h`}
          note={`92% of ${targetWeeklyHours}h weekly goal`}
          accent="green"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Task completion rate"
          value={`${todayCompletionRate}%`}
          note="Based on daily timetable execution"
          accent="cream"
        />
        <StatCard
          icon={<Flame size={18} />}
          label="Current streak"
          value={`${streak} days`}
          note="Consistently studying every day"
          accent="peach"
        />
        <StatCard
          icon={<Award size={18} />}
          label="Mastery score"
          value="74%"
          note="Weighted across 3 active subjects"
          accent="lavender"
        />
      </section>

      {/* Dual Charts Grid: Bar Chart & Line Chart */}
      <div className="analytics-charts-grid">
        {/* Planned vs Actual Study Hours (Bar Chart) */}
        <div className="chart-card analytics-chart-panel">
          <div className="chart-panel-header">
            <div>
              <div className="section-kicker">HOURS ALLOCATION</div>
              <h3>Planned vs. Actual Study Hours</h3>
            </div>
            <div className="chart-legend-row">
              <span className="legend-tag tag-actual">
                <i className="dot-actual" /> Actual Hours
              </span>
              <span className="legend-tag tag-target">
                <i className="dot-target" /> Target
              </span>
            </div>
          </div>

          <div className="chart-container-lg">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={WEEKLY_HOURS_DATA}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#e4efe7" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a8878", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a8878", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #d4ebd9",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(12, 107, 68, 0.12)",
                  }}
                  formatter={(val, name) => [`${val} hrs`, name === "actual" ? "Studied" : "Target"]}
                />
                <Bar dataKey="actual" fill="#0c6b44" radius={[6, 6, 0, 0]} barSize={22} />
                <Bar dataKey="target" fill="#cce8d5" radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Completion Rate (Line Chart) */}
        <div className="chart-card analytics-chart-panel">
          <div className="chart-panel-header">
            <div>
              <div className="section-kicker">DISCIPLINE TREND</div>
              <h3>Task Completion Velocity (%)</h3>
            </div>
            <span className="trend-badge-positive">
              <ArrowUpRight size={14} /> +8% vs previous cycle
            </span>
          </div>

          <div className="chart-container-lg">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={COMPLETION_TREND_DATA}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#e4efe7" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a8878", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6a8878", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #d4ebd9",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(12, 107, 68, 0.12)",
                  }}
                  formatter={(val) => [`${val}%`, "Completion Rate"]}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#0c6b44"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0c6b44", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per-Subject Syllabus Mastery Breakdown */}
      <div className="syllabus-analytics-card">
        <div className="section-heading">
          <div>
            <div className="section-kicker">DETAILED BREAKDOWN</div>
            <h2>Curriculum Mastery by Subject</h2>
          </div>
        </div>

        <div className="subject-analytics-grid">
          {subjectDistribution.map((item) => (
            <div className="subject-analytic-tile" key={item.id}>
              <div className="tile-top-row">
                <div>
                  <span className="code-chip">{item.code}</span>
                  <h4>{item.name}</h4>
                </div>
                <div className="tile-score">
                  <strong>{item.progress}%</strong>
                  <small>COMPLETE</small>
                </div>
              </div>

              <div className="tile-progress">
                <ProgressBar value={item.progress} tone={item.tone} height={8} />
              </div>

              <div className="tile-stats-footer">
                <div>
                  <span>Topics Mastered</span>
                  <strong>
                    {item.completedTopics} / {item.topicsCount}
                  </strong>
                </div>
                <div>
                  <span>Est. Hours Remaining</span>
                  <strong>
                    {Math.max(
                      0,
                      Number(
                        ((item.topicsCount - item.completedTopics) * 0.75).toFixed(1)
                      )
                    )}
                    h
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

