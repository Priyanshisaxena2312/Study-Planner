import React, { useState, useEffect, useRef } from "react";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  Bell,
  Clock,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { ProgressBar } from "../components/common/ProgressBar";

export function FocusModePage() {
  const { state, dispatch } = useStudy();

  const settings = state.settings;
  const pomodoroMinutes = settings.pomodoroMinutes || 25;
  const shortBreakMinutes = settings.shortBreakMinutes || 5;
  const longBreakMinutes = settings.longBreakMinutes || 15;
  const longBreakInterval = settings.longBreakInterval || 4;

  const [mode, setMode] = useState("pomodoro"); // "pomodoro" | "shortBreak" | "longBreak"
  const [timeLeft, setTimeLeft] = useState(pomodoroMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Focus metadata selection
  const [selectedSubjectId, setSelectedSubjectId] = useState(state.subjects[0]?.id || "");
  const [selectedTopicTitle, setSelectedTopicTitle] = useState("");
  const [customMinutes, setCustomMinutes] = useState(pomodoroMinutes);

  // Audio tone helper
  function playCompletionChime() {
    if (!settings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn("Could not play chime:", e);
    }
  }

  function showBrowserNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch (e) {
        console.warn(e);
      }
    }
  }

  // Timer interval
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Completed timer
      handleSessionFinish();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  function handleSessionFinish() {
    setIsRunning(false);
    playCompletionChime();

    if (mode === "pomodoro") {
      const newCount = completedSessionsCount + 1;
      setCompletedSessionsCount(newCount);

      // Log session to central state
      const selSubject = state.subjects.find((s) => s.id === selectedSubjectId);
      const subjectName = selSubject ? selSubject.name : "General Study";
      const topicName = selectedTopicTitle.trim() || "Focused Session";

      const focusLog = {
        id: `fl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        subject: subjectName,
        topic: topicName,
        durationMinutes: pomodoroMinutes,
        sessionType: "pomodoro",
      };

      dispatch({ type: "LOG_FOCUS_SESSION", payload: focusLog });

      showBrowserNotification(
        "Pomodoro Completed! 🌟",
        `Great focus on ${subjectName}: ${topicName}. Take a well-deserved break.`
      );

      // Switch mode to break
      if (newCount % longBreakInterval === 0) {
        setMode("longBreak");
        setTimeLeft(longBreakMinutes * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(shortBreakMinutes * 60);
      }
    } else {
      // Break finished
      showBrowserNotification(
        "Break is over ⏰",
        "Ready to resume your next study sprint?"
      );
      setMode("pomodoro");
      setTimeLeft(pomodoroMinutes * 60);
    }
  }

  function switchMode(newMode) {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "pomodoro") {
      setTimeLeft(pomodoroMinutes * 60);
    } else if (newMode === "shortBreak") {
      setTimeLeft(shortBreakMinutes * 60);
    } else if (newMode === "longBreak") {
      setTimeLeft(longBreakMinutes * 60);
    }
  }

  function resetTimer() {
    setIsRunning(false);
    if (mode === "pomodoro") {
      setTimeLeft(pomodoroMinutes * 60);
    } else if (mode === "shortBreak") {
      setTimeLeft(shortBreakMinutes * 60);
    } else {
      setTimeLeft(longBreakMinutes * 60);
    }
  }

  function skipSession() {
    if (confirm("Skip this timer interval?")) {
      handleSessionFinish();
    }
  }

  function handleManualLog() {
    const selSubject = state.subjects.find((s) => s.id === selectedSubjectId);
    const subjectName = selSubject ? selSubject.name : "General Study";
    const topicName = selectedTopicTitle.trim() || "Deep study session";

    const focusLog = {
      id: `fl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      subject: subjectName,
      topic: topicName,
      durationMinutes: 25,
      sessionType: "pomodoro",
    };

    dispatch({ type: "LOG_FOCUS_SESSION", payload: focusLog });
    setCompletedSessionsCount((c) => c + 1);
    alert(`Logged 25 min focus sprint for ${subjectName}!`);
  }

  // Formatting helpers
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalModeDuration =
    mode === "pomodoro"
      ? pomodoroMinutes * 60
      : mode === "shortBreak"
      ? shortBreakMinutes * 60
      : longBreakMinutes * 60;

  const progressPercentage = Math.round(
    ((totalModeDuration - timeLeft) / totalModeDuration) * 100
  );

  // Available topics for the selected subject
  const availableTopics = state.topics.filter((t) => {
    const chap = state.chapters.find((c) => c.id === t.chapterId);
    return chap && chap.subjectId === selectedSubjectId;
  });

  return (
    <div className="focus-page">
      <PageHeader
        eyebrow="POMODORO & FLOW ENGINE"
        title="Focus Mode"
        subtitle="Eliminate distractions. Work in rhythmic intervals that protect your deep energy."
        actions={
          <Button variant="secondary" icon={Clock} onClick={handleManualLog}>
            Log Completed Sprint
          </Button>
        }
      />

      <div className="focus-layout-grid">
        {/* Main Pomodoro Clock Card */}
        <div className="pomodoro-stage-card">
          {/* Mode Switcher Tabs */}
          <div className="timer-mode-switcher">
            <button
              className={`mode-btn ${mode === "pomodoro" ? "active" : ""}`}
              onClick={() => switchMode("pomodoro")}
            >
              <Brain size={15} /> Pomodoro ({pomodoroMinutes}m)
            </button>
            <button
              className={`mode-btn ${mode === "shortBreak" ? "active" : ""}`}
              onClick={() => switchMode("shortBreak")}
            >
              <Coffee size={15} /> Short Break ({shortBreakMinutes}m)
            </button>
            <button
              className={`mode-btn ${mode === "longBreak" ? "active" : ""}`}
              onClick={() => switchMode("longBreak")}
            >
              <Coffee size={15} /> Long Break ({longBreakMinutes}m)
            </button>
          </div>

          {/* Big Circular Clock Display */}
          <div className="timer-circle-wrap">
            <div
              className={`timer-conic-ring ring-${mode}`}
              style={{
                background: `conic-gradient(#84977d 0% ${progressPercentage}%, #eaeee6 ${progressPercentage}% 100%)`,
              }}
            >
              <div className="timer-inner-core">
                <div className="timer-time-display">{formattedTime}</div>
                <div className="timer-status-caption">
                  {isRunning ? (
                    <span className="running-pill">FOCUS IN PROGRESS</span>
                  ) : (
                    <span>READY TO START</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="timer-controls-row">
            <button
              className="timer-control-btn reset-btn"
              onClick={resetTimer}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              className={`timer-primary-toggle ${isRunning ? "running" : ""}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <>
                  <Pause size={20} /> Pause Session
                </>
              ) : (
                <>
                  <Play size={20} /> Start Focus
                </>
              )}
            </button>

            <button
              className="timer-control-btn skip-btn"
              onClick={skipSession}
              title="Skip to next session"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Cycle & Session Stats Line */}
          <div className="timer-cycle-status">
            <div className="cycle-item">
              <span className="cycle-label">SESSIONS TODAY</span>
              <strong>{completedSessionsCount + state.focusLogs.length} Completed</strong>
            </div>
            <div className="cycle-divider" />
            <div className="cycle-item">
              <span className="cycle-label">INTERVAL CYCLE</span>
              <strong>
                Cycle {(completedSessionsCount % longBreakInterval) + 1} of{" "}
                {longBreakInterval}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: Focus Target & Today's Log */}
        <div className="focus-sidebar-col">
          {/* Active Study Target Card */}
          <div className="focus-target-card">
            <div className="target-head">
              <div className="section-kicker">ACTIVE TASK</div>
              <h3>What are you studying?</h3>
            </div>

            <div className="target-fields">
              <label>
                Subject
                <select
                  className="custom-select"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedTopicTitle("");
                  }}
                >
                  {state.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Topic or Chapter
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Solving homogeneous equations"
                  value={selectedTopicTitle}
                  onChange={(e) => setSelectedTopicTitle(e.target.value)}
                  list="topics-datalist"
                />
                <datalist id="topics-datalist">
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.title} />
                  ))}
                </datalist>
              </label>
            </div>

            <div className="target-tip">
              <Sparkles size={15} />
              <span>
                Completing a Pomodoro automatically updates your study hours,
                subject progress, and streak tracker!
              </span>
            </div>
          </div>

          {/* Today's Focus Session History */}
          <div className="focus-history-card">
            <div className="history-head">
              <h4>Recent Focus Sprints</h4>
              <span className="log-count">{state.focusLogs.length} logged</span>
            </div>

            <div className="focus-history-list">
              {state.focusLogs.slice(0, 6).map((log) => (
                <div className="history-item-row" key={log.id}>
                  <div className="history-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="history-info">
                    <strong>{log.subject}</strong>
                    <span>{log.topic}</span>
                  </div>
                  <div className="history-time-badge">
                    {log.durationMinutes}m
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

