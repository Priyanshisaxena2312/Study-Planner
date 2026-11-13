import React, { useState } from "react";
import {
  Target,
  Flame,
  Plus,
  CheckCircle2,
  Clock3,
  Calendar,
  Edit2,
  Trash2,
  TrendingUp,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { FormField } from "../components/common/FormField";
import { ProgressBar } from "../components/common/ProgressBar";
import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";

export function GoalsPage() {
  const { state, dispatch } = useStudy();

  const [activeTab, setActiveTab] = useState("ALL"); // "ALL" | "daily" | "weekly"
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("daily"); // "daily" | "weekly"
  const [formCategory, setFormCategory] = useState("hours"); // "hours" | "tasks"
  const [formTarget, setFormTarget] = useState(4);
  const [formCurrent, setFormCurrent] = useState(0);

  const streak = state.streak;

  function openAddGoal() {
    setEditingGoal(null);
    setFormTitle("");
    setFormType("daily");
    setFormCategory("hours");
    setFormTarget(4);
    setFormCurrent(0);
    setGoalModalOpen(true);
  }

  function openEditGoal(goal) {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormType(goal.type);
    setFormCategory(goal.category);
    setFormTarget(goal.target);
    setFormCurrent(goal.current);
    setGoalModalOpen(true);
  }

  function handleSaveGoal(e) {
    e.preventDefault();
    const targetNum = Number(formTarget) || 1;
    const currentNum = Number(formCurrent) || 0;
    const unit = formCategory === "hours" ? "hrs" : "tasks";

    if (editingGoal) {
      dispatch({
        type: "UPDATE_GOAL",
        payload: {
          id: editingGoal.id,
          title: formTitle,
          type: formType,
          category: formCategory,
          target: targetNum,
          current: currentNum,
          unit,
          completed: currentNum >= targetNum,
        },
      });
    } else {
      const newGoal = {
        id: `g-${Date.now()}`,
        title: formTitle,
        type: formType,
        category: formCategory,
        target: targetNum,
        current: currentNum,
        unit,
        completed: currentNum >= targetNum,
      };
      dispatch({ type: "ADD_GOAL", payload: newGoal });
    }
    setGoalModalOpen(false);
  }

  function handleDeleteGoal(id) {
    dispatch({ type: "DELETE_GOAL", payload: id });
  }

  function handleIncrement(id, amount = 1) {
    dispatch({
      type: "INCREMENT_GOAL",
      payload: { id, amount },
    });
  }

  const filteredGoals = state.goals.filter((g) => {
    if (activeTab === "ALL") return true;
    return g.type === activeTab;
  });

  const completedGoalsCount = state.goals.filter((g) => g.completed).length;

  return (
    <div className="goals-page">
      <PageHeader
        eyebrow="HABIT ENGINE & TARGETS"
        title="Study Goals & Streaks"
        subtitle="Keep your momentum alive. Track your daily consistency, weekly hours, and milestones."
        actions={
          <Button variant="primary" icon={Plus} onClick={openAddGoal}>
            New goal
          </Button>
        }
      />

      {/* Streak & Milestone Showcase Banner */}
      <div className="streak-hero-card">
        <div className="streak-hero-left">
          <div className="flame-badge-large">
            <Flame size={32} strokeWidth={2} />
          </div>
          <div>
            <div className="streak-kicker">ACTIVE STUDY STREAK</div>
            <h2>
              {streak.currentStreak} Days in a Row!
            </h2>
            <p>
              You're building an incredible routine. Best streak record:{" "}
              <strong>{streak.longestStreak} days</strong>.
            </p>
          </div>
        </div>

        <div className="streak-days-track">
          {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((dayName, idx) => {
            const isCompletedDay = idx < streak.currentStreak;
            const isToday = dayName === "Thu";
            return (
              <div
                key={dayName}
                className={`streak-day-node ${isCompletedDay ? "active-day" : ""} ${
                  isToday ? "today-node" : ""
                }`}
              >
                <div className="node-icon">
                  {isCompletedDay ? <CheckCircle2 size={16} /> : <div className="dot" />}
                </div>
                <span>{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <section className="stats-grid">
        <StatCard
          icon={<Flame size={18} />}
          label="Current streak"
          value={`${streak.currentStreak} days`}
          note="Unbroken since last Friday"
          accent="peach"
        />
        <StatCard
          icon={<Award size={18} />}
          label="Goals completed"
          value={`${completedGoalsCount} / ${state.goals.length}`}
          note={`${Math.round((completedGoalsCount / (state.goals.length || 1)) * 100)}% overall completion`}
          accent="green"
        />
        <StatCard
          icon={<Clock3 size={18} />}
          label="Weekly target"
          value="24.0h"
          note="Across planned focus sessions"
          accent="cream"
        />
        <StatCard
          icon={<Zap size={18} />}
          label="Momentum level"
          value="High"
          note="Top 10% study consistency"
          accent="lavender"
        />
      </section>

      {/* Goal Filter Tabs */}
      <div className="goals-tabs-bar">
        <div className="tab-pill-group">
          <button
            className={`tab-pill ${activeTab === "ALL" ? "active" : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            All Goals ({state.goals.length})
          </button>
          <button
            className={`tab-pill ${activeTab === "daily" ? "active" : ""}`}
            onClick={() => setActiveTab("daily")}
          >
            Daily Targets
          </button>
          <button
            className={`tab-pill ${activeTab === "weekly" ? "active" : ""}`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly Targets
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid-cards">
        {filteredGoals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals under this view"
            description="Create focused daily or weekly targets to track your milestones."
            action={
              <Button variant="primary" icon={Plus} onClick={openAddGoal}>
                Create a study goal
              </Button>
            }
          />
        ) : (
          filteredGoals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.round((goal.current / (goal.target || 1)) * 100)
            );
            const isHours = goal.category === "hours";
            const tone = goal.completed ? "sage" : percentage > 50 ? "olive" : "sand";

            return (
              <div
                key={goal.id}
                className={`goal-item-card ${goal.completed ? "goal-achieved" : ""}`}
              >
                <div className="goal-top-row">
                  <span className={`goal-tag-badge ${goal.type}`}>
                    {goal.type.toUpperCase()} · {goal.category.toUpperCase()}
                  </span>
                  <div className="goal-action-btns">
                    <button
                      className="icon-button-sm"
                      onClick={() => openEditGoal(goal)}
                      title="Edit goal"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="icon-button-sm danger"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Delete goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="goal-title">{goal.title}</h3>

                <div className="goal-progress-section">
                  <div className="goal-values-row">
                    <span className="current-metric">
                      <strong>{goal.current}</strong> / {goal.target} {goal.unit}
                    </span>
                    <span className="percent-text">{percentage}%</span>
                  </div>
                  <ProgressBar value={percentage} tone={tone} height={8} />
                </div>

                <div className="goal-footer-row">
                  {goal.completed ? (
                    <div className="achieved-stamp">
                      <CheckCircle2 size={15} /> Goal Completed!
                    </div>
                  ) : (
                    <div className="increment-quick-actions">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleIncrement(goal.id, isHours ? 0.5 : 1)}
                      >
                        +{isHours ? "0.5h" : "1 task"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleIncrement(goal.id, isHours ? 1 : 2)}
                      >
                        +{isHours ? "1h" : "2 tasks"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Goal Modal */}
      <Modal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? "Edit Study Goal" : "Add New Study Goal"}
        kicker="TARGET SETTING"
      >
        <form onSubmit={handleSaveGoal}>
          <FormField label="Goal Objective" required>
            <input
              type="text"
              className="custom-input"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Complete 5 practice questions or 3h study"
              required
            />
          </FormField>

          <div className="form-grid-2">
            <FormField label="Goal Horizon" required>
              <select
                className="custom-select"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                required
              >
                <option value="daily">Daily Target</option>
                <option value="weekly">Weekly Target</option>
              </select>
            </FormField>

            <FormField label="Metric Type" required>
              <select
                className="custom-select"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                required
              >
                <option value="hours">Study Hours</option>
                <option value="tasks">Completed Tasks</option>
              </select>
            </FormField>
          </div>

          <div className="form-grid-2">
            <FormField label={`Target (${formCategory === "hours" ? "Hours" : "Tasks"})`} required>
              <input
                type="number"
                step={formCategory === "hours" ? "0.5" : "1"}
                min="0.5"
                className="custom-input"
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Current Progress">
              <input
                type="number"
                step={formCategory === "hours" ? "0.5" : "1"}
                min="0"
                className="custom-input"
                value={formCurrent}
                onChange={(e) => setFormCurrent(e.target.value)}
              />
            </FormField>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingGoal ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

