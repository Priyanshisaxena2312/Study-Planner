import React, { useState } from "react";
import {
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  Trash2,
  History,
  Brain,
  ArrowRight,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { FormField } from "../components/common/FormField";
import { EmptyState } from "../components/common/EmptyState";
import { predictRevisionDate } from "../services/mlService";

const TODAY_DATE = "2026-11-13";

export function RevisionCenterPage() {
  const { state, dispatch } = useStudy();

  const [activeTab, setActiveTab] = useState("UPCOMING"); // "UPCOMING" | "HISTORY"
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form state
  const [formSubjectId, setFormSubjectId] = useState(state.subjects[0]?.id || "");
  const [formTopic, setFormTopic] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("Medium");
  const [formInterval, setFormInterval] = useState(1);

  // Smart ML modal state
  const [smartRevModalOpen, setSmartRevModalOpen] = useState(false);
  const [predictingRev, setPredictingRev] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [selectedRevItem, setSelectedRevItem] = useState(null);

  const pendingRevisions = state.revisions.filter((r) => !r.completed);
  const completedRevisions = state.revisions.filter((r) => r.completed);

  // Overdue check
  function isOverdue(dateStr) {
    return dateStr < TODAY_DATE;
  }

  function handleMarkComplete(id) {
    dispatch({
      type: "COMPLETE_REVISION",
      payload: { id, rating: 4 },
    });
  }

  function handleDeleteRevision(id) {
    dispatch({ type: "DELETE_REVISION", payload: id });
  }

  function openAddModal() {
    setFormSubjectId(state.subjects[0]?.id || "");
    setFormTopic("");
    setFormDifficulty("Medium");
    setFormInterval(1);
    setAddModalOpen(true);
  }

  function handleAddRevision(e) {
    e.preventDefault();
    const selSub = state.subjects.find((s) => s.id === formSubjectId) || state.subjects[0];

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(formInterval));
    const dueDateStr = targetDate.toISOString().split("T")[0];

    const newRev = {
      id: `rev-${Date.now()}`,
      subjectId: selSub.id,
      subject: selSub.name,
      topic: formTopic.trim(),
      stage: 1,
      dueDate: dueDateStr,
      intervalDays: Number(formInterval),
      completed: false,
      completedAt: null,
      difficulty: formDifficulty,
    };

    dispatch({ type: "ADD_REVISION", payload: newRev });
    setAddModalOpen(false);
  }

  async function handleRunSmartSchedule(rev) {
    setSelectedRevItem(rev);
    setSmartRevModalOpen(true);
    setPredictingRev(true);
    try {
      const prediction = await predictRevisionDate({
        topicId: rev.id,
        topicTitle: rev.topic,
        difficulty: rev.difficulty,
        repetitionCount: rev.stage,
        retrievalSuccessRating: 4,
      });
      setMlResult(prediction);
    } catch (err) {
      console.error(err);
    } finally {
      setPredictingRev(false);
    }
  }

  return (
    <div className="revision-page">
      <PageHeader
        eyebrow="SPACED REPETITION ENGINE"
        title="Revision Center"
        subtitle="Review topics at 1, 3, 7, and 14 day intervals to lock knowledge into long-term memory."
        actions={
          <Button variant="primary" icon={Plus} onClick={openAddModal}>
            Schedule revision
          </Button>
        }
      />

      {/* Spaced Intervals Concept Ribbon */}
      <div className="spaced-ribbon-card">
        <div className="ribbon-title-col">
          <Sparkles size={18} />
          <div>
            <strong>The Spaced Repetition Ladder</strong>
            <p>Every review resets your forgetting curve and expands retention.</p>
          </div>
        </div>

        <div className="ladder-steps">
          <div className="ladder-node">
            <span className="step-num">STAGE 1</span>
            <strong>+1 Day</strong>
            <small>Immediate consolidation</small>
          </div>
          <ArrowRight size={14} className="step-arrow" />
          <div className="ladder-node">
            <span className="step-num">STAGE 2</span>
            <strong>+3 Days</strong>
            <small>Initial recall strengthening</small>
          </div>
          <ArrowRight size={14} className="step-arrow" />
          <div className="ladder-node">
            <span className="step-num">STAGE 3</span>
            <strong>+7 Days</strong>
            <small>Medium-term retention</small>
          </div>
          <ArrowRight size={14} className="step-arrow" />
          <div className="ladder-node">
            <span className="step-num">STAGE 4</span>
            <strong>+14 Days</strong>
            <small>Deep permanent memory</small>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="revision-tabs-bar">
        <div className="tab-pill-group">
          <button
            className={`tab-pill ${activeTab === "UPCOMING" ? "active" : ""}`}
            onClick={() => setActiveTab("UPCOMING")}
          >
            Due & Upcoming ({pendingRevisions.length})
          </button>
          <button
            className={`tab-pill ${activeTab === "HISTORY" ? "active" : ""}`}
            onClick={() => setActiveTab("HISTORY")}
          >
            Completed History ({completedRevisions.length})
          </button>
        </div>
      </div>

      {activeTab === "UPCOMING" && (
        <div className="revisions-list-container">
          {pendingRevisions.length === 0 ? (
            <EmptyState
              icon={RotateCcw}
              title="All revisions caught up!"
              description="No reviews are pending right now. Take pride in your consistency!"
              action={
                <Button variant="primary" icon={Plus} onClick={openAddModal}>
                  Schedule new revision
                </Button>
              }
            />
          ) : (
            pendingRevisions.map((rev) => {
              const overdue = isOverdue(rev.dueDate);
              const isToday = rev.dueDate === TODAY_DATE;

              return (
                <div
                  key={rev.id}
                  className={`revision-card ${overdue ? "revision-overdue" : ""} ${
                    isToday ? "revision-today" : ""
                  }`}
                >
                  <div className="revision-left-block">
                    <div
                      className={`stage-pill-circle ${
                        overdue ? "pill-overdue" : "pill-normal"
                      }`}
                    >
                      <span>Stage {rev.stage}</span>
                      <small>+{rev.intervalDays}d</small>
                    </div>

                    <div className="revision-info">
                      <div className="rev-subject-tag">{rev.subject}</div>
                      <h3 className="rev-topic-name">{rev.topic}</h3>
                      <div className="rev-meta-line">
                        <span className="rev-due-date">
                          <Calendar size={13} /> Due: <strong>{rev.dueDate}</strong>
                        </span>
                        {overdue && (
                          <span className="overdue-warning-badge">
                            <AlertTriangle size={13} /> Overdue by{" "}
                            {Math.round(
                              (new Date(TODAY_DATE) - new Date(rev.dueDate)) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            day(s)
                          </span>
                        )}
                        {isToday && (
                          <span className="today-due-badge">
                            <Clock size={13} /> Due Today!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="revision-right-actions">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Brain}
                      onClick={() => handleRunSmartSchedule(rev)}
                      title="Run ML Repetition Predictor"
                    >
                      AI Predict
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      icon={CheckCircle2}
                      onClick={() => handleMarkComplete(rev.id)}
                    >
                      Mark Reviewed
                    </Button>

                    <button
                      className="icon-button-sm danger"
                      onClick={() => handleDeleteRevision(rev.id)}
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "HISTORY" && (
        <div className="revisions-history-list">
          {completedRevisions.length === 0 ? (
            <EmptyState
              icon={History}
              title="No completed revisions yet"
              description="Review upcoming topics to build up your revision history."
            />
          ) : (
            completedRevisions.map((rev) => (
              <div key={rev.id} className="history-row-card">
                <div className="history-check-icon">
                  <CheckCircle2 size={18} />
                </div>
                <div className="history-details">
                  <strong>{rev.topic}</strong>
                  <span>
                    {rev.subject} · Completed at {new Date(rev.completedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="history-badge">
                  Stage {rev.stage} · {rev.difficulty}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Revision Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Schedule Spaced Revision"
        kicker="FORGETTING CURVE INVERSION"
      >
        <form onSubmit={handleAddRevision}>
          <FormField label="Subject" required>
            <select
              className="custom-select"
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              required
            >
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Topic or Chapter" required>
            <input
              type="text"
              className="custom-input"
              value={formTopic}
              onChange={(e) => setFormTopic(e.target.value)}
              placeholder="e.g. TCP Sliding Window & Flow Control"
              required
            />
          </FormField>

          <div className="form-grid-2">
            <FormField label="First Spaced Interval" required>
              <select
                className="custom-select"
                value={formInterval}
                onChange={(e) => setFormInterval(e.target.value)}
                required
              >
                <option value="1">Stage 1 (+1 day)</option>
                <option value="3">Stage 2 (+3 days)</option>
                <option value="7">Stage 3 (+7 days)</option>
                <option value="14">Stage 4 (+14 days)</option>
              </select>
            </FormField>

            <FormField label="Estimated Difficulty">
              <select
                className="custom-select"
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </FormField>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Schedule Revision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Smart ML Repetition Modal */}
      <Modal
        isOpen={smartRevModalOpen}
        onClose={() => setSmartRevModalOpen(false)}
        title="ML Spaced Repetition Predictor"
        kicker="SUPERMEMO SM-2 ALGORITHM"
      >
        {predictingRev ? (
          <div className="ai-loading-container">
            <div className="spinner-leaf" />
            <p>Evaluating memory retention curve & historical stability...</p>
          </div>
        ) : mlResult ? (
          <div className="ml-rev-result-box">
            <div className="rev-rec-header">
              <Brain size={22} />
              <div>
                <h4>Recommended Next Date: {mlResult.nextRevisionDate}</h4>
                <p>Calculated interval: +{mlResult.intervalDays} days (Stage {mlResult.nextStage})</p>
              </div>
            </div>

            <div className="rev-stats-grid">
              <div className="rev-stat-item">
                <span>Predicted Retention</span>
                <strong>{Math.round(mlResult.retentionProbability * 100)}%</strong>
              </div>
              <div className="rev-stat-item">
                <span>Urgency Category</span>
                <strong className={mlResult.urgencyLevel === "Critical" ? "text-danger" : ""}>
                  {mlResult.urgencyLevel}
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <Button variant="primary" onClick={() => setSmartRevModalOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

