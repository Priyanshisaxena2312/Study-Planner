import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    preferred_study_time = Column(String, default="morning")
    daily_hour_target = Column(Float, default=4.5)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    timetable_sessions = relationship("TimetableSession", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("StudyGoal", back_populates="user", cascade="all, delete-orphan")
    focus_logs = relationship("FocusLog", back_populates="user", cascade="all, delete-orphan")
    revisions = relationship("RevisionItem", back_populates="user", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    code = Column(String, default="")
    tone = Column(String, default="sage")
    exam_date = Column(String, nullable=True)
    score_status = Column(String, default="On track")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    user = relationship("User", back_populates="subjects")
    chapters = relationship("Chapter", back_populates="subject", cascade="all, delete-orphan")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(String, primary_key=True, index=True)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)

    subject = relationship("Subject", back_populates="chapters")
    topics = relationship("Topic", back_populates="chapter", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, index=True)
    chapter_id = Column(String, ForeignKey("chapters.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")
    completed = Column(Boolean, default=False)
    estimated_minutes = Column(Integer, default=45)
    last_revised = Column(String, nullable=True)

    chapter = relationship("Chapter", back_populates="topics")


class TimetableSession(Base):
    __tablename__ = "timetable_sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    day = Column(String, nullable=False)  # Mon, Tue, Wed, Thu, Fri, Sat, Sun
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    subject_id = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    tag = Column(String, default="Practice")
    color = Column(String, default="sage")
    notes = Column(Text, default="")
    done = Column(Boolean, default=False)

    user = relationship("User", back_populates="timetable_sessions")


class StudyGoal(Base):
    __tablename__ = "study_goals"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    goal_type = Column(String, default="daily")  # daily | weekly
    category = Column(String, default="hours")   # hours | tasks
    target = Column(Float, nullable=False)
    current = Column(Float, default=0.0)
    unit = Column(String, default="hrs")
    completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="goals")


class FocusLog(Base):
    __tablename__ = "focus_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    timestamp = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=25)
    session_type = Column(String, default="pomodoro")

    user = relationship("User", back_populates="focus_logs")


class RevisionItem(Base):
    __tablename__ = "revision_items"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    stage = Column(Integer, default=1)
    due_date = Column(String, nullable=False)
    interval_days = Column(Integer, default=1)
    completed = Column(Boolean, default=False)
    completed_at = Column(String, nullable=True)
    difficulty = Column(String, default="Medium")

    user = relationship("User", back_populates="revisions")
