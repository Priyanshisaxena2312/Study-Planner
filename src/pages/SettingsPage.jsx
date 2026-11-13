import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { FormField } from "../components/common/FormField";

export function SettingsPage() {
  const { state, dispatch } = useStudy();
  const settings = state.settings;

  // Local form state initialized from context
  const [preferredStudyTime, setPreferredStudyTime] = useState(
    settings.preferredStudyTime || "morning"
  );
  const [dailyHourTarget, setDailyHourTarget] = useState(
    settings.dailyHourTarget || 4.5
  );
  const [pomodoroMinutes, setPomodoroMinutes] = useState(
    settings.pomodoroMinutes || 25
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState(
    settings.shortBreakMinutes || 5
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(
    settings.longBreakMinutes || 15
  );
  const [longBreakInterval, setLongBreakInterval] = useState(
    settings.longBreakInterval || 4
  );
  const [soundEnabled, setSoundEnabled] = useState(
    settings.soundEnabled ?? true
  );
  const [desktopNotifications, setDesktopNotifications] = useState(
    settings.desktopNotifications ?? false
  );
  const [mascotEnabled, setMascotEnabled] = useState(
    settings.mascotEnabled ?? true
  );
  const [weeklyHours, setWeeklyHours] = useState(
    settings.weeklyHourAllocation || {
      Mon: 4,
      Tue: 4.5,
      Wed: 3.5,
      Thu: 5,
      Fri: 4,
      Sat: 6,
      Sun: 5,
    }
  );

  const [notificationPermissionState, setNotificationPermissionState] = useState(
    "Notification" in window ? Notification.permission : "default"
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermissionState(Notification.permission);
    }
  }, []);

  async function handleToggleNotifications() {
    if (!("Notification" in window)) {
      alert("Browser desktop notifications are not supported by this browser.");
      return;
    }

    if (Notification.permission === "granted") {
      const nextState = !desktopNotifications;
      setDesktopNotifications(nextState);
    } else {
      const permission = await Notification.requestPermission();
      setNotificationPermissionState(permission);
      if (permission === "granted") {
        setDesktopNotifications(true);
        new Notification("StudyWell Notifications Enabled!", {
          body: "You will now receive gentle alerts for session completions and revision reminders.",
        });
      } else {
        setDesktopNotifications(false);
      }
    }
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: {
        preferredStudyTime,
        dailyHourTarget: Number(dailyHourTarget),
        pomodoroMinutes: Number(pomodoroMinutes),
        shortBreakMinutes: Number(shortBreakMinutes),
        longBreakMinutes: Number(longBreakMinutes),
        longBreakInterval: Number(longBreakInterval),
        soundEnabled,
        desktopNotifications,
        mascotEnabled,
        weeklyHourAllocation: weeklyHours,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  function handleResetData() {
    const confirmation = window.confirm(
      "Are you sure you want to reset all data back to the default sample dataset? Any custom tasks or changes will be restored."
    );
    if (confirmation) {
      dispatch({ type: "RESET_DATA" });
      alert("Sample data has been re-seeded successfully!");
      window.location.reload();
    }
  }

  function handleExportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smart-study-planner-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function handleImportJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        dispatch({ type: "IMPORT_DATA", payload: parsed });
        alert("State successfully imported!");
      } catch (err) {
        alert("Invalid JSON file provided.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="settings-page">
      <PageHeader
        eyebrow="CONFIGURATION & PREFERENCES"
        title="Settings"
        subtitle="Customize your circadian study rhythm, Pomodoro session lengths, and alert permissions."
        actions={
          <Button variant="primary" icon={Check} onClick={handleSaveSettings}>
            {saveSuccess ? "Saved Successfully!" : "Save Changes"}
          </Button>
        }
      />

      <form onSubmit={handleSaveSettings} className="settings-form-layout">
        {/* Preferred Study Times & Daily Targets */}
        <div className="settings-section-card">
          <div className="section-head-row">
            <Sun size={20} className="section-icon" />
            <div>
              <h3>Study Rhythm & Daily Capacity</h3>
              <p>Tune your peak concentration slots and target study hours.</p>
            </div>
          </div>

          <div className="settings-controls-stack">
            <FormField label="Preferred Daily Study Rhythm">
              <div className="radio-pill-group">
                {[
                  { id: "morning", label: "Morning (07:00 - 12:00)", icon: Sun },
                  { id: "afternoon", label: "Afternoon (13:00 - 17:00)", icon: Coffee },
                  { id: "evening", label: "Evening (17:00 - 21:00)", icon: Moon },
                  { id: "night", label: "Late Night (21:00+)", icon: Sparkles },
                ].map((slot) => (
                  <button
                    type="button"
                    key={slot.id}
                    className={`radio-pill-btn ${
                      preferredStudyTime === slot.id ? "selected" : ""
                    }`}
                    onClick={() => setPreferredStudyTime(slot.id)}
                  >
                    <slot.icon size={15} />
                    <span>{slot.label}</span>
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Target Daily Study Hours">
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                className="custom-input"
                value={dailyHourTarget}
                onChange={(e) => setDailyHourTarget(e.target.value)}
              />
            </FormField>

            <div className="weekly-hours-matrix">
              <div className="field-label">Available Hours by Day of Week</div>
              <div className="matrix-inputs-row">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="matrix-day-cell">
                    <span>{day}</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="16"
                      value={weeklyHours[day] || 4}
                      onChange={(e) =>
                        setWeeklyHours({
                          ...weeklyHours,
                          [day]: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pomodoro Timer Configuration */}
        <div className="settings-section-card">
          <div className="section-head-row">
            <Clock size={20} className="section-icon" />
            <div>
              <h3>Pomodoro Engine Configurations</h3>
              <p>Configure durations for focus blocks and rest intervals.</p>
            </div>
          </div>

          <div className="form-grid-3">
            <FormField label="Focus Duration (minutes)" required>
              <input
                type="number"
                min="10"
                max="90"
                className="custom-input"
                value={pomodoroMinutes}
                onChange={(e) => setPomodoroMinutes(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Short Break (minutes)" required>
              <input
                type="number"
                min="2"
                max="30"
                className="custom-input"
                value={shortBreakMinutes}
                onChange={(e) => setShortBreakMinutes(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Long Break (minutes)" required>
              <input
                type="number"
                min="5"
                max="60"
                className="custom-input"
                value={longBreakMinutes}
                onChange={(e) => setLongBreakMinutes(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Long Break Interval (every N pomodoros)">
            <input
              type="number"
              min="2"
              max="10"
              className="custom-input"
              value={longBreakInterval}
              onChange={(e) => setLongBreakInterval(e.target.value)}
            />
          </FormField>
        </div>

        {/* Notifications & Audio */}
        <div className="settings-section-card">
          <div className="section-head-row">
            <Bell size={20} className="section-icon" />
            <div>
              <h3>Alerts & Browser Notifications</h3>
              <p>Manage audio feedback and native desktop alerts.</p>
            </div>
          </div>

          <div className="toggles-list">
            <div className="setting-toggle-row">
              <div className="toggle-info">
                <strong>Audio Completion Chime</strong>
                <span>Plays a gentle, calming sine chime when a focus session or break ends.</span>
              </div>
              <button
                type="button"
                className={`switch-btn ${soundEnabled ? "on" : "off"}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                <div className="switch-thumb" />
              </button>
            </div>

            <div className="setting-toggle-row">
              <div className="toggle-info">
                <strong>Native Browser Desktop Notifications</strong>
                <span>
                  Uses standard HTML5 Notification API. Permission status:{" "}
                  <em>{notificationPermissionState}</em>
                </span>
              </div>
              <button
                type="button"
                className={`switch-btn ${
                  desktopNotifications && notificationPermissionState === "granted"
                    ? "on"
                    : "off"
                }`}
                onClick={handleToggleNotifications}
              >
                <div className="switch-thumb" />
              </button>
            </div>

            <div className="setting-toggle-row">
              <div className="toggle-info">
                <strong>Floating AI Study Buddy Mascot</strong>
                <span>
                  Show the cute animated study companion with helpful study tips, cheer-ups, and reminders.
                </span>
              </div>
              <button
                type="button"
                className={`switch-btn ${mascotEnabled ? "on" : "off"}`}
                onClick={() => setMascotEnabled(!mascotEnabled)}
              >
                <div className="switch-thumb" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Persistence, Portability & Reset */}
        <div className="settings-section-card danger-zone-card">
          <div className="section-head-row">
            <Shield size={20} className="section-icon" />
            <div>
              <h3>Data Portability & State Reset</h3>
              <p>Export your study planner JSON or reset back to default sample state.</p>
            </div>
          </div>

          <div className="data-actions-row">
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportJSON}
            >
              Export JSON Backup
            </Button>

            <label className="import-file-label">
              <Upload size={16} /> Import JSON
              <input
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImportJSON}
              />
            </label>

            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={handleResetData}
            >
              Reset Sample Data
            </Button>
            <div className="setting-toggle-row">
              <div className="toggle-info">
                <strong>Floating AI Study Buddy Mascot</strong>
                <span>
                  Show the cute animated study companion with helpful study tips, cheer-ups, and reminders.
                </span>
              </div>
              <button
                type="button"
                className={`switch-btn ${mascotEnabled ? "on" : "off"}`}
                onClick={() => setMascotEnabled(!mascotEnabled)}
              >
                <div className="switch-thumb" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

