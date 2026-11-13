import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Sparkles,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Brain,
  Calendar,
  Layers,
  Check,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { FormField } from "../components/common/FormField";
import { ProgressBar } from "../components/common/ProgressBar";
import { EmptyState } from "../components/common/EmptyState";
import { predictDifficulty } from "../services/mlService";

export function SubjectsPage() {
  const { state, dispatch, chapterProgressMap, subjectProgressMap } = useStudy();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Subject Modal state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjName, setSubjName] = useState("");
  const [subjCode, setSubjCode] = useState("");
  const [subjTone, setSubjTone] = useState("sage");
  const [subjExamDate, setSubjExamDate] = useState("2026-11-20");

  // Chapter Modal state
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapSubjectId, setChapSubjectId] = useState("");
  const [chapTitle, setChapTitle] = useState("");

  // Topic Modal state
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topChapterId, setTopChapterId] = useState("");
  const [topTitle, setTopTitle] = useState("");
  const [topDifficulty, setTopDifficulty] = useState("Medium");
  const [topEstimatedMinutes, setTopEstimatedMinutes] = useState(45);
  const [isPredictingDifficulty, setIsPredictingDifficulty] = useState(false);

  // Accordion open/close map for chapters
  const [expandedChapters, setExpandedChapters] = useState({});

  function toggleChapterExpand(chapterId) {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: prev[chapterId] === undefined ? false : !prev[chapterId],
    }));
  }

  // ---------------- SUBJECT CRUD ----------------
  function openAddSubject() {
    setEditingSubject(null);
    setSubjName("");
    setSubjCode("");
    setSubjTone("sage");
    setSubjExamDate("2026-11-25");
    setSubjectModalOpen(true);
  }

  function openEditSubject(sub) {
    setEditingSubject(sub);
    setSubjName(sub.name);
    setSubjCode(sub.code || "");
    setSubjTone(sub.tone || "sage");
    setSubjExamDate(sub.examDate || "2026-11-25");
    setSubjectModalOpen(true);
  }

  function handleSaveSubject(e) {
    e.preventDefault();
    if (editingSubject) {
      dispatch({
        type: "UPDATE_SUBJECT",
        payload: {
          id: editingSubject.id,
          name: subjName,
          code: subjCode,
          tone: subjTone,
          examDate: subjExamDate,
        },
      });
    } else {
      const newSub = {
        id: `sub-${Date.now()}`,
        name: subjName,
        code: subjCode,
        tone: subjTone,
        examDate: subjExamDate,
        scoreStatus: "On track",
      };
      dispatch({ type: "ADD_SUBJECT", payload: newSub });
    }
    setSubjectModalOpen(false);
  }

  function handleDeleteSubject(id) {
    if (confirm("Delete this subject and all its chapters and topics?")) {
      dispatch({ type: "DELETE_SUBJECT", payload: id });
    }
  }

  // ---------------- CHAPTER CRUD ----------------
  function openAddChapter(defaultSubjectId = "") {
    setEditingChapter(null);
    setChapSubjectId(defaultSubjectId || state.subjects[0]?.id || "");
    setChapTitle("");
    setChapterModalOpen(true);
  }

  function openEditChapter(chap) {
    setEditingChapter(chap);
    setChapSubjectId(chap.subjectId);
    setChapTitle(chap.title);
    setChapterModalOpen(true);
  }

  function handleSaveChapter(e) {
    e.preventDefault();
    if (editingChapter) {
      dispatch({
        type: "UPDATE_CHAPTER",
        payload: {
          id: editingChapter.id,
          subjectId: chapSubjectId,
          title: chapTitle,
        },
      });
    } else {
      const newChap = {
        id: `chap-${Date.now()}`,
        subjectId: chapSubjectId,
        title: chapTitle,
      };
      dispatch({ type: "ADD_CHAPTER", payload: newChap });
    }
    setChapterModalOpen(false);
  }

  function handleDeleteChapter(id) {
    if (confirm("Delete this chapter and all its topics?")) {
      dispatch({ type: "DELETE_CHAPTER", payload: id });
    }
  }

  // ---------------- TOPIC CRUD ----------------
  function openAddTopic(defaultChapterId = "") {
    setEditingTopic(null);
    setTopChapterId(defaultChapterId || state.chapters[0]?.id || "");
    setTopTitle("");
    setTopDifficulty("Medium");
    setTopEstimatedMinutes(45);
    setTopicModalOpen(true);
  }

  function openEditTopic(topic) {
    setEditingTopic(topic);
    setTopChapterId(topic.chapterId);
    setTopTitle(topic.title);
    setTopDifficulty(topic.difficulty || "Medium");
    setTopEstimatedMinutes(topic.estimatedMinutes || 45);
    setTopicModalOpen(true);
  }

  async function handlePredictTopicDifficulty() {
    if (!topTitle.trim()) {
      alert("Please enter a topic title first so the model can analyze it.");
      return;
    }
    setIsPredictingDifficulty(true);
    try {
      const result = await predictDifficulty({
        topicTitle: topTitle,
        subjectName: state.subjects.find((s) => s.id === chapSubjectId)?.name || "",
      });
      setTopDifficulty(result.difficulty);
      setTopEstimatedMinutes(result.recommendedStudyMinutes);
      alert(`ML Model classified as "${result.difficulty}" (${Math.round(result.confidence * 100)}% confidence): ${result.rationale}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredictingDifficulty(false);
    }
  }

  function handleSaveTopic(e) {
    e.preventDefault();
    if (editingTopic) {
      dispatch({
        type: "UPDATE_TOPIC",
        payload: {
          id: editingTopic.id,
          chapterId: topChapterId,
          title: topTitle,
          difficulty: topDifficulty,
          estimatedMinutes: Number(topEstimatedMinutes) || 45,
        },
      });
    } else {
      const newTopic = {
        id: `top-${Date.now()}`,
        chapterId: topChapterId,
        title: topTitle,
        difficulty: topDifficulty,
        completed: false,
        estimatedMinutes: Number(topEstimatedMinutes) || 45,
        lastRevised: null,
      };
      dispatch({ type: "ADD_TOPIC", payload: newTopic });
    }
    setTopicModalOpen(false);
  }

  function handleDeleteTopic(id) {
    dispatch({ type: "DELETE_TOPIC", payload: id });
  }

  function handleToggleTopic(id) {
    dispatch({ type: "TOGGLE_TOPIC", payload: id });
  }

  // Filtered list
  const filteredSubjects = useMemo(() => {
    return state.subjects.filter((sub) => {
      if (selectedSubjectId !== "ALL" && sub.id !== selectedSubjectId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSub = sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
        const matchingChapters = state.chapters.filter((c) => c.subjectId === sub.id && c.title.toLowerCase().includes(q));
        const matchingTopics = state.topics.filter((t) => {
          const chap = state.chapters.find((c) => c.id === t.chapterId);
          return chap && chap.subjectId === sub.id && t.title.toLowerCase().includes(q);
        });
        if (!matchesSub && matchingChapters.length === 0 && matchingTopics.length === 0) return false;
      }
      return true;
    });
  }, [state.subjects, state.chapters, state.topics, selectedSubjectId, searchQuery]);

  return (
    <div className="subjects-page">
      <PageHeader
        eyebrow="CURRICULUM ARCHITECTURE"
        title="Subjects & Topics"
        subtitle="Manage your full course syllabus, track chapter mastery %, and classify topic difficulty."
        actions={
          <div className="header-action-group">
            <Button variant="secondary" icon={Layers} onClick={() => openAddChapter()}>
              + Chapter
            </Button>
            <Button variant="primary" icon={Plus} onClick={openAddSubject}>
              Add subject
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="subjects-filter-card">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search subjects, chapters, or specific topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-label">Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Subjects ({state.subjects.length})</option>
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="completed">Completed only</option>
              <option value="pending">Pending only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subjects & Chapter Hierarchy */}
      <div className="subjects-stack">
        {filteredSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No matching subjects found"
            description="Adjust your search filters or add a new subject to your curriculum."
            action={
              <Button variant="primary" icon={Plus} onClick={openAddSubject}>
                Add new subject
              </Button>
            }
          />
        ) : (
          filteredSubjects.map((subject) => {
            const subjectProgress = subjectProgressMap[subject.id] ?? 0;
            const chapters = state.chapters.filter((c) => c.subjectId === subject.id);
            const totalSubjectTopics = state.topics.filter((t) => {
              const chap = state.chapters.find((c) => c.id === t.chapterId);
              return chap && chap.subjectId === subject.id;
            });
            const completedSubjectTopics = totalSubjectTopics.filter((t) => t.completed).length;

            return (
              <div className="subject-block-card" key={subject.id}>
                {/* Subject Header */}
                <div className="subject-block-header">
                  <div className="subject-identity">
                    <div className={`subject-icon-lg ${subject.tone || "sage"}`}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="subject-code-tag">{subject.code || "COURSE"}</div>
                      <h3 className="subject-title-text">{subject.name}</h3>
                      <div className="subject-meta-details">
                        <span>
                          <Calendar size={13} /> Exam:{" "}
                          {new Date(subject.examDate).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>·</span>
                        <span>{chapters.length} Chapters</span>
                        <span>·</span>
                        <span>
                          {completedSubjectTopics}/{totalSubjectTopics.length} Topics Mastered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="subject-header-right">
                    <div className="subject-score-bar-group">
                      <div className="score-label-row">
                        <span>Overall Mastery</span>
                        <strong>{subjectProgress}%</strong>
                      </div>
                      <ProgressBar
                        value={subjectProgress}
                        tone={subject.tone || "sage"}
                        height={7}
                      />
                    </div>

                    <div className="subject-btn-group">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Plus}
                        onClick={() => openAddChapter(subject.id)}
                      >
                        Chapter
                      </Button>
                      <button
                        className="icon-button-sm"
                        onClick={() => openEditSubject(subject)}
                        title="Edit subject"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="icon-button-sm danger"
                        onClick={() => handleDeleteSubject(subject.id)}
                        title="Delete subject"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chapters in this Subject */}
                <div className="chapters-container">
                  {chapters.length === 0 ? (
                    <div className="chapter-empty-row">
                      <span>No chapters defined yet.</span>
                      <button
                        className="add-subtle-link"
                        onClick={() => openAddChapter(subject.id)}
                      >
                        + Create first chapter
                      </button>
                    </div>
                  ) : (
                    chapters.map((chapter) => {
                      const isExpanded = expandedChapters[chapter.id] !== false;
                      const chapterProgress = chapterProgressMap[chapter.id] ?? 0;
                      let topics = state.topics.filter((t) => t.chapterId === chapter.id);

                      // Filter topics
                      if (difficultyFilter !== "ALL") {
                        topics = topics.filter((t) => t.difficulty === difficultyFilter);
                      }
                      if (statusFilter === "completed") {
                        topics = topics.filter((t) => t.completed);
                      } else if (statusFilter === "pending") {
                        topics = topics.filter((t) => !t.completed);
                      }

                      return (
                        <div className="chapter-accordion-card" key={chapter.id}>
                          <div
                            className="chapter-accordion-header"
                            onClick={() => toggleChapterExpand(chapter.id)}
                          >
                            <div className="chap-head-left">
                              <span className="expand-chevron">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </span>
                              <strong>{chapter.title}</strong>
                              <span className="chap-count-tag">
                                {topics.length} topics
                              </span>
                            </div>

                            <div
                              className="chap-head-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="chap-progress-inline">
                                <span>{chapterProgress}%</span>
                                <div className="mini-track">
                                  <div
                                    className={`mini-bar ${subject.tone || "sage"}`}
                                    style={{ width: `${chapterProgress}%` }}
                                  />
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Plus}
                                onClick={() => openAddTopic(chapter.id)}
                              >
                                Topic
                              </Button>
                              <button
                                className="icon-button-sm"
                                onClick={() => openEditChapter(chapter)}
                                title="Edit chapter"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                className="icon-button-sm danger"
                                onClick={() => handleDeleteChapter(chapter.id)}
                                title="Delete chapter"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Topics List */}
                          {isExpanded && (
                            <div className="topics-list-body">
                              {topics.length === 0 ? (
                                <div className="topic-empty-row">
                                  <span>No topics added to this chapter yet.</span>
                                  <button
                                    className="add-subtle-link"
                                    onClick={() => openAddTopic(chapter.id)}
                                  >
                                    + Add topic
                                  </button>
                                </div>
                              ) : (
                                topics.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className={`topic-row ${topic.completed ? "topic-completed" : ""}`}
                                  >
                                    <button
                                      className="topic-check-btn"
                                      onClick={() => handleToggleTopic(topic.id)}
                                      aria-label={topic.completed ? "Mark incomplete" : "Mark complete"}
                                    >
                                      {topic.completed ? (
                                        <CheckCircle2 size={18} className="check-done-icon" />
                                      ) : (
                                        <Circle size={18} className="check-pending-icon" />
                                      )}
                                    </button>

                                    <div className="topic-text-col">
                                      <span className="topic-name">{topic.title}</span>
                                      <div className="topic-meta-line">
                                        <span>Est. {topic.estimatedMinutes || 45} mins</span>
                                        {topic.lastRevised && (
                                          <span>· Revised {topic.lastRevised}</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="topic-actions-col">
                                      <span
                                        className={`difficulty-pill diff-${(topic.difficulty || "medium").toLowerCase()}`}
                                      >
                                        {topic.difficulty || "Medium"}
                                      </span>

                                      <button
                                        className="icon-button-sm"
                                        onClick={() => openEditTopic(topic)}
                                        title="Edit topic"
                                      >
                                        <Edit size={13} />
                                      </button>
                                      <button
                                        className="icon-button-sm danger"
                                        onClick={() => handleDeleteTopic(topic.id)}
                                        title="Delete topic"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subject Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
        kicker="CURRICULUM ARCHITECTURE"
      >
        <form onSubmit={handleSaveSubject}>
          <FormField label="Subject Name" required>
            <input
              type="text"
              className="custom-input"
              value={subjName}
              onChange={(e) => setSubjName(e.target.value)}
              placeholder="e.g. Distributed Systems & Cloud"
              required
            />
          </FormField>

          <div className="form-grid-2">
            <FormField label="Course Code" required>
              <input
                type="text"
                className="custom-input"
                value={subjCode}
                onChange={(e) => setSubjCode(e.target.value)}
                placeholder="e.g. CS-401"
                required
              />
            </FormField>

            <FormField label="Target Exam Date" required>
              <input
                type="date"
                className="custom-input"
                value={subjExamDate}
                onChange={(e) => setSubjExamDate(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Accent Tone Theme">
            <div className="tone-selector">
              {["sage", "olive", "sand", "peach", "lavender"].map((tone) => (
                <button
                  type="button"
                  key={tone}
                  className={`tone-choice tone-box-${tone} ${subjTone === tone ? "selected" : ""}`}
                  onClick={() => setSubjTone(tone)}
                >
                  {tone}
                </button>
              ))}
            </div>
          </FormField>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSubject ? "Save Changes" : "Create Subject"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Chapter Modal */}
      <Modal
        isOpen={chapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        title={editingChapter ? "Edit Chapter" : "Add Chapter"}
        kicker="SYLLABUS MODULE"
      >
        <form onSubmit={handleSaveChapter}>
          <FormField label="Subject" required>
            <select
              className="custom-select"
              value={chapSubjectId}
              onChange={(e) => setChapSubjectId(e.target.value)}
              required
            >
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Chapter / Unit Title" required>
            <input
              type="text"
              className="custom-input"
              value={chapTitle}
              onChange={(e) => setChapTitle(e.target.value)}
              placeholder="e.g. Consensus Algorithms & Raft"
              required
            />
          </FormField>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setChapterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingChapter ? "Save Changes" : "Add Chapter"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Topic Modal */}
      <Modal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title={editingTopic ? "Edit Topic" : "Add Topic"}
        kicker="GRANULAR OBJECTIVE"
      >
        <form onSubmit={handleSaveTopic}>
          <FormField label="Parent Chapter" required>
            <select
              className="custom-select"
              value={topChapterId}
              onChange={(e) => setTopChapterId(e.target.value)}
              required
            >
              {state.chapters.map((c) => {
                const sub = state.subjects.find((s) => s.id === c.subjectId);
                return (
                  <option key={c.id} value={c.id}>
                    {sub ? sub.name + " › " : ""}
                    {c.title}
                  </option>
                );
              })}
            </select>
          </FormField>

          <FormField label="Topic Title" required>
            <div className="input-with-action">
              <input
                type="text"
                className="custom-input"
                value={topTitle}
                onChange={(e) => setTopTitle(e.target.value)}
                placeholder="e.g. Leader Election & Log Replication"
                required
              />
              <Button
                size="sm"
                variant="secondary"
                icon={Brain}
                onClick={handlePredictTopicDifficulty}
                disabled={isPredictingDifficulty}
                title="Use ML to estimate difficulty and study duration"
              >
                {isPredictingDifficulty ? "Predicting..." : "ML Predict"}
              </Button>
            </div>
          </FormField>

          <div className="form-grid-2">
            <FormField label="Difficulty Rating" required>
              <select
                className="custom-select"
                value={topDifficulty}
                onChange={(e) => setTopDifficulty(e.target.value)}
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </FormField>

            <FormField label="Est. Study Time (minutes)">
              <input
                type="number"
                min="10"
                max="240"
                className="custom-input"
                value={topEstimatedMinutes}
                onChange={(e) => setTopEstimatedMinutes(e.target.value)}
              />
            </FormField>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setTopicModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTopic ? "Save Changes" : "Save Topic"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

