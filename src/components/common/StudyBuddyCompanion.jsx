import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  MessageCircle,
  Timer,
  BookOpen,
  Flame,
  Volume2,
  Minimize2,
  RotateCw,
} from "lucide-react";
import { useStudy } from "../../context/StudyContext";

const BUDDY_MESSAGES = [
  "Hi Priya! Remember: consistency beats intensity every single day! 🌱",
  "You're on an awesome 6-day streak! Keep the flame burning! 🔥",
  "Study tip: reviewing a topic within 24h locks 80% into long-term memory! 🧠",
  "Feeling tired? Take a gentle 5-minute Pomodoro break and stretch! ☕",
  "Don't worry about understanding everything at once. Small steps add up! ✨",
  "Mathematics exam is coming up on Nov 18. Have you revised integration yet? 📐",
  "You're doing fantastic! I'm here cheering you on every step of the way! 🌟",
  "Deep focus mode tip: silence phone notifications for the next 25 minutes! 🔕",
];

export function StudyBuddyCompanion({ setActivePage }) {
  const { state, dispatch } = useStudy();
  const mascotEnabled = state.settings.mascotEnabled ?? true;

  const [messageIndex, setMessageIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [isHappy, setIsHappy] = useState(false);
  const [pos, setPos] = useState({ x: 28, y: 28 }); // px from bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragStartPos = useRef({ startX: 0, startY: 0, initialPosX: 28, initialPosY: 28 });

  // Periodically cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % BUDDY_MESSAGES.length);
    }, 24000);
    return () => clearInterval(interval);
  }, []);

  function handleBuddyClick(e) {
    if (isDragging) return;
    setIsHappy(true);
    setShowBubble(true);
    setMessageIndex((prev) => (prev + 1) % BUDDY_MESSAGES.length);
    setTimeout(() => setIsHappy(false), 900);
  }

  function handleTurnOff(e) {
    e.stopPropagation();
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { mascotEnabled: false },
    });
  }

  // Dragging support
  function handleMouseDown(e) {
    // Only drag on left click
    if (e.button !== 0) return;
    setIsDragging(false);
    dragStartPos.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: pos.x,
      initialPosY: pos.y,
    };

    function onMouseMove(moveEvent) {
      const dx = dragStartPos.current.startX - moveEvent.clientX;
      const dy = dragStartPos.current.startY - moveEvent.clientY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsDragging(true);
      }
      const newX = Math.max(10, Math.min(window.innerWidth - 120, dragStartPos.current.initialPosX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 140, dragStartPos.current.initialPosY + dy));
      setPos({ x: newX, y: newY });
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  if (!mascotEnabled) return null;

  return (
    <div
      className="study-buddy-floating-root"
      style={{
        right: `${pos.x}px`,
        bottom: `${pos.y}px`,
      }}
      ref={dragRef}
    >
      {/* Speech Bubble */}
      {showBubble && (
        <div className="buddy-speech-bubble" onClick={(e) => e.stopPropagation()}>
          <div className="bubble-header">
            <div className="bubble-brand">
              <span className="online-dot" />
              <strong>AI Study Buddy</strong>
            </div>
            <div className="bubble-actions">
              <button
                className="bubble-btn"
                onClick={() => setMessageIndex((prev) => (prev + 1) % BUDDY_MESSAGES.length)}
                title="Next Tip"
              >
                <RotateCw size={12} />
              </button>
              <button
                className="bubble-btn"
                onClick={() => setShowBubble(false)}
                title="Minimize Bubble"
              >
                <Minimize2 size={12} />
              </button>
              <button
                className="bubble-btn danger"
                onClick={handleTurnOff}
                title="Turn off Buddy"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <p className="bubble-text">{BUDDY_MESSAGES[messageIndex]}</p>

          <div className="bubble-quick-links">
            {setActivePage && (
              <button
                className="quick-link-pill"
                onClick={() => setActivePage("Focus mode")}
              >
                <Timer size={12} /> Pomodoro
              </button>
            )}
            {setActivePage && (
              <button
                className="quick-link-pill"
                onClick={() => setActivePage("My timetable")}
              >
                <BookOpen size={12} /> Timetable
              </button>
            )}
            <button
              className="quick-link-pill ghost"
              onClick={handleTurnOff}
              title="You can re-enable anytime in the topbar or settings"
            >
              Turn off
            </button>
          </div>

          <div className="bubble-tail" />
        </div>
      )}

      {/* Mascot Avatar Widget */}
      <div
        className={`buddy-avatar-container ${isHappy ? "buddy-happy-jump" : "buddy-floating-bob"}`}
        onMouseDown={handleMouseDown}
        onClick={handleBuddyClick}
        title="I'm your AI Study Buddy! Click me for tips or drag me anywhere."
      >
        <div className="buddy-glow-ring" />

        <div className="buddy-image-wrapper">
          <img
            src="/mascot.png"
            alt="AI Study Buddy Mascot"
            className="buddy-mascot-img"
            onError={(e) => {
              // Fallback to SVG if image not found
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />

          {/* SVG Fallback */}
          <div className="buddy-svg-fallback" style={{ display: "none" }}>
            <svg width="78" height="78" viewBox="0 0 100 100" fill="none">
              {/* Sprout */}
              <path
                d="M50 25 C45 15, 30 18, 40 30 C46 28, 49 26, 50 25 Z"
                fill="#159e5a"
              />
              <path
                d="M50 25 C55 15, 70 18, 60 30 C54 28, 51 26, 50 25 Z"
                fill="#108548"
              />
              <path d="M50 25 L50 32" stroke="#0c6b44" strokeWidth="3" strokeLinecap="round" />

              {/* Headphones */}
              <circle cx="20" cy="52" r="9" fill="#0c6b44" />
              <circle cx="80" cy="52" r="9" fill="#0c6b44" />
              <path d="M22 50 C22 30, 78 30, 78 50" stroke="#0c6b44" strokeWidth="5" fill="none" />

              {/* Head */}
              <rect x="22" y="32" width="56" height="42" rx="20" fill="#ffffff" stroke="#0c6b44" strokeWidth="3.5" />

              {/* Glass Visor */}
              <rect x="28" y="39" width="44" height="24" rx="10" fill="#0c3020" />

              {/* Happy Glowing Eyes */}
              <path d="M35 50 Q40 43 45 50" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M55 50 Q60 43 65 50" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Blush */}
              <circle cx="34" cy="57" r="3" fill="#86efac" opacity="0.6" />
              <circle cx="66" cy="57" r="3" fill="#86efac" opacity="0.6" />

              {/* Body */}
              <rect x="36" y="74" width="28" height="18" rx="8" fill="#ffffff" stroke="#0c6b44" strokeWidth="3" />
              <path d="M38 78 L62 78" stroke="#108548" strokeWidth="3" />

              {/* Open Book */}
              <polygon points="40,84 50,88 60,84 60,94 50,97 40,94" fill="#0c6b44" />
            </svg>
          </div>
        </div>

        {/* Thought / Sprout Badge */}
        {!showBubble && (
          <button
            className="buddy-msg-toggle-pill"
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(true);
            }}
            title="Open Study Buddy Advice"
          >
            <Sparkles size={11} /> <span>Tip</span>
          </button>
        )}

        {/* Dynamic Shadow */}
        <div className="buddy-ground-shadow" />
      </div>
    </div>
  );
}

