import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { FormField } from "../components/common/FormField";
import { EmptyState } from "../components/common/EmptyState";
import { recommendSchedule } from "../services/mlService";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TimetablePage() {
  const { state, dispatch } = useStudy();

  const [selectedDayTab, setSelectedDayTab] = useState("Thu"); // For mobile / single-day view
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("ALL");
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Form states
  const [formDay, setFormDay] = useState("Thu");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00 AM");
  const [formEndTime, setFormEndTime] = useState("10:00 AM");
  const [formTag, setFormTag] = useState("High priority");
  const [formNotes, setFormNotes] = useState("");

  // ML Smart Recommendation modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Drag and drop state
  const [draggedSessionId, setDraggedSessionId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  const subjects = state.subjects;

  function openAddModal(day = "Thu") {
    setEditingSession(null);
    setFormDay(day);
    setFormSubjectId(subjects[0]?.id || "");
    setFormTopic("");
    setFormStartTime("09:00 AM");
    setFormEndTime("10:15 AM");
    setFormTag("Practice");
    setFormNotes("");
    setSessionModalOpen(true);
  }

  function openEditModal(session) {
    setEditingSession(session);
    setFormDay(session.day);
    setFormSubjectId(session.subjectId || subjects[0]?.id || "");
    setFormTopic(session.topic);
    setFormStartTime(session.startTime);
    setFormEndTime(session.endTime);
    setFormTag(session.tag || "High priority");
    setFormNotes(session.notes || "");
    setSessionModalOpen(true);
  }

  function handleSaveSession(e) {
    e.preventDefault();
    const selSubject = subjects.find((s) => s.id === formSubjectId) || subjects[0];

    if (editingSession) {
      dispatch({
        type: "UPDATE_SESSION",
        payload: {
          id: editingSession.id,
          day: formDay,
          startTime: formStartTime,
          endTime: formEndTime,
          subjectId: selSubject.id,
          subject: selSubject.name,
          topic: formTopic,
          tag: formTag,
          color: selSubject.tone,
          notes: formNotes,
        },
      });
    } else {
      const newSession = {
        id: `tt-${Date.now()}`,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        subjectId: selSubject.id,
        subject: selSubject.name,
        topic: formTopic,
        tag: formTag,
        color: selSubject.tone,
        notes: formNotes,
        done: false,
      };
      dispatch({ type: "ADD_SESSION", payload: newSession });
    }
    setSessionModalOpen(false);
  }

  function handleDeleteSession(id) {
    dispatch({ type: "DELETE_SESSION", payload: id });
  }

  function handleToggleSession(id) {
    dispatch({ type: "TOGGLE_SESSION", payload: id });
  }

  // Drag and Drop handlers
  function handleDragStart(e, id) {
    setDraggedSessionId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e, day) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDay !== day) {
      setDragOverDay(day);
    }
  }

  function handleDragLeave(e, day) {
    if (dragOverDay === day) {
      setDragOverDay(null);
    }
  }

  function handleDrop(e, targetDay) {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData("text/plain") || draggedSessionId;
    if (sessionId) {
      dispatch({
        type: "MOVE_SESSION",
        payload: { id: sessionId, targetDay },
      });
    }
    setDraggedSessionId(null);
    setDragOverDay(null);
  }

  // ML Schedule Generation
  async function handleGenerateSchedule() {
    setAiModalOpen(true);
    setLoadingAi(true);
    try {
      const result = await recommendSchedule({
        preferredStudyTime: state.settings.preferredStudyTime,
        availableHoursPerDay: state.settings.weeklyHourAllocation,
        subjects: state.subjects,
      });
      setAiSuggestions(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  }

  function applyAiRecommendation(rec) {
    const sub = subjects.find((s) => s.name === rec.subject) || subjects[0];
    const newSession = {
      id: `tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      day: rec.day,
      startTime: rec.startTime,
      endTime: rec.endTime,
      subjectId: sub.id,
      subject: sub.name,
      topic: rec.suggestedTopic,
      tag: rec.priority === "High" ? "High priority" : "Revision",
      color: sub.tone,
      notes: rec.reason,
      done: false,
    };
    dispatch({ type: "ADD_SESSION", payload: newSession });
  }

  // Filtered timetable items
  const filteredSessions = state.timetable.filter((item) => {
    if (selectedSubjectFilter === "ALL") return true;
    return item.subjectId === selectedSubjectFilter;
  });

  return (
    <div className="timetable-page">
      <PageHeader
        eyebrow="WEEKLY TIMETABLE"
        title="Plan your weekly flow."
        subtitle="Organize study blocks, drag sessions across days, and pace your preparation."
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              icon={Sparkles}
              onClick={handleGenerateSchedule}
            >
              Smart schedule AI
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => openAddModal("Thu")}
            >
              Add session
            </Button>
          </div>
        }
      />

      {/* Filter and View Controls Bar */}
      <div className="timetable-controls-card">
        <div className="controls-left">
          <div className="filter-pill-label">
            <Filter size={14} /> Filter Subject:
          </div>
          <select
            className="filter-select"
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Day Tabs */}
        <div className="mobile-day-tabs">
          {DAYS_OF_WEEK.map((day) => {
            const count = filteredSessions.filter((s) => s.day === day).length;
            return (
              <button
                key={day}
                className={`day-tab-btn ${selectedDayTab === day ? "active" : ""}`}
                onClick={() => setSelectedDayTab(day)}
              >
                <span>{day}</span>
                {count > 0 && <small>{count}</small>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Weekly Grid (Mon - Sun) */}
      <div className="weekly-grid-container desktop-only-grid">
        {DAYS_OF_WEEK.map((day) => {
          const daySessions = filteredSessions.filter((s) => s.day === day);
          const isToday = day === "Thu";
          const isDropTarget = dragOverDay === day;

          return (
            <div
              key={day}
              className={`day-column ${isToday ? "current-day-col" : ""} ${
                isDropTarget ? "drop-active" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={(e) => handleDragLeave(e, day)}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className="day-col-header">
                <div>
                  <span className="col-day-name">{day}</span>
                  {isToday && <span className="today-badge">TODAY</span>}
                </div>
                <button
                  className="icon-button-sm"
                  onClick={() => openAddModal(day)}
                  title={`Add session to ${day}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="day-sessions-stack">
                {daySessions.length === 0 ? (
                  <div className="day-empty-placeholder">
                    <span>No sessions</span>
                    <button
                      className="add-subtle-link"
                      onClick={() => openAddModal(day)}
                    >
                      + Add slot
                    </button>
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`session-card tone-${session.color || "sage"} ${
                        session.done ? "session-done" : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, session.id)}
                    >
                      <div className="session-card-top">
                        <span className="session-time">
                          <Clock size={11} /> {session.startTime} - {session.endTime}
                        </span>
                        <div className="session-card-actions">
                          <button
                            className="session-mini-btn"
                            onClick={() => handleToggleSession(session.id)}
                            title={session.done ? "Mark pending" : "Mark completed"}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            className="session-mini-btn"
                            onClick={() => openEditModal(session)}
                            title="Edit"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            className="session-mini-btn danger"
                            onClick={() => handleDeleteSession(session.id)}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="session-subject">{session.subject}</div>
                      <div className="session-topic">{session.topic}</div>

                      {session.notes && (
                        <div className="session-notes">{session.notes}</div>
                      )}

                      <div className="session-card-footer">
                        <span className={`task-tag ${session.color || "sage"}`}>
                          {session.tag || "Study"}
                        </span>
                        <GripVertical size={13} className="drag-handle-icon" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Single-Day Active View */}
      <div className="mobile-only-day-view">
        <div className="mobile-day-banner">
          <h3>
            {selectedDayTab}day's Study Sessions
            {selectedDayTab === "Thu" && <span>(Today)</span>}
          </h3>
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => openAddModal(selectedDayTab)}
          >
            Add session
          </Button>
        </div>

        <div className="mobile-sessions-list">
          {filteredSessions.filter((s) => s.day === selectedDayTab).length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={`No study sessions for ${selectedDayTab}day`}
              description="Keep a steady pace. Add your first study block for this day."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={() => openAddModal(selectedDayTab)}
                >
                  Schedule study block
                </Button>
              }
            />
          ) : (
            filteredSessions
              .filter((s) => s.day === selectedDayTab)
              .map((session) => (
                <div
                  key={session.id}
                  className={`mobile-session-row tone-${session.color || "sage"} ${
                    session.done ? "session-done" : ""
                  }`}
                >
                  <button
                    className="task-check"
                    onClick={() => handleToggleSession(session.id)}
                    aria-label="Toggle completed"
                  >
                    {session.done ? <Check size={14} /> : <span />}
                  </button>

                  <div className="mobile-session-main">
                    <div className="mobile-time">
                      {session.startTime} – {session.endTime}
                    </div>
                    <strong>{session.subject}</strong>
                    <p>{session.topic}</p>
                    {session.notes && <small>{session.notes}</small>}
                  </div>

                  <div className="mobile-actions">
                    <button
                      className="icon-button-sm"
                      onClick={() => openEditModal(session)}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="icon-button-sm"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Add / Edit Session Modal */}
      <Modal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        title={editingSession ? "Edit study session" : "Add study session"}
        kicker="WEEKLY SCHEDULE"
      >
        <form onSubmit={handleSaveSession}>
          <div className="form-grid-2">
            <FormField label="Day of Week" required>
              <select
                value={formDay}
                onChange={(e) => setFormDay(e.target.value)}
                className="custom-select"
                required
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Subject" required>
              <select
                value={formSubjectId}
                onChange={(e) => setFormSubjectId(e.target.value)}
                className="custom-select"
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Topic / Chapter / Goal" required>
            <input
              type="text"
              className="custom-input"
              value={formTopic}
              onChange={(e) => setFormTopic(e.target.value)}
              placeholder="e.g. Fourier Series & Transforms practice"
              required
            />
          </FormField>

          <div className="form-grid-2">
            <FormField label="Start Time" required>
              <input
                type="text"
                className="custom-input"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                placeholder="09:00 AM"
                required
              />
            </FormField>

            <FormField label="End Time" required>
              <input
                type="text"
                className="custom-input"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                placeholder="10:30 AM"
                required
              />
            </FormField>
          </div>

          <div className="form-grid-2">
            <FormField label="Session Tag">
              <select
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                className="custom-select"
              >
                <option value="High priority">High priority</option>
                <option value="Revision">Revision</option>
                <option value="Practice">Practice</option>
                <option value="Deep Work">Deep Work</option>
                <option value="Light Read">Light Read</option>
              </select>
            </FormField>
          </div>

          <FormField label="Session Notes & Key Deliverables">
            <textarea
              className="custom-textarea"
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Solve questions 4 through 12 in textbook chapter 3."
            />
          </FormField>

          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setSessionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSession ? "Save Changes" : "Create Session"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ML Smart Schedule Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="ML Smart Schedule Recommendations"
        kicker="CIRCADIAN & SYLLABUS OPTIMIZER"
        maxWidth={560}
      >
        {loadingAi ? (
          <div className="ai-loading-container">
            <div className="spinner-leaf" />
            <p>Analyzing syllabus priorities, exam proximity & energy slots...</p>
          </div>
        ) : aiSuggestions ? (
          <div className="ai-suggestions-content">
            <div className="ai-pill-summary">
              <Sparkles size={16} /> Recommended Total Weekly Study:{" "}
              <strong>{aiSuggestions.totalRecommendedHours} hours</strong> (Model
              Confidence: {Math.round(aiSuggestions.modelConfidence * 100)}%)
            </div>

            <div className="ai-cards-list">
              {aiSuggestions.recommendations.map((rec, idx) => (
                <div className="ai-slot-item" key={idx}>
                  <div className="ai-slot-header">
                    <div>
                      <span className="slot-day-badge">{rec.day}</span>
                      <strong>
                        {rec.subject} · {rec.startTime} to {rec.endTime}
                      </strong>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        applyAiRecommendation(rec);
                        alert(`Added "${rec.suggestedTopic}" to your ${rec.day} timetable!`);
                      }}
                    >
                      Apply Slot
                    </Button>
                  </div>
                  <div className="ai-slot-topic">{rec.suggestedTopic}</div>
                  <div className="ai-slot-reason">
                    <Info size={12} /> {rec.reason}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setAiModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

