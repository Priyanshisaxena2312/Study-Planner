from typing import Optional, List
from pydantic import BaseModel, ConfigDict

# ----------------- AUTH SCHEMAS -----------------
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Student"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    preferred_study_time: str = "morning"
    daily_hour_target: float = 4.5

    model_config = ConfigDict(from_attributes=True)

class UserSettingsUpdate(BaseModel):
    preferred_study_time: Optional[str] = None
    daily_hour_target: Optional[float] = None
    full_name: Optional[str] = None


# ----------------- CURRICULUM SCHEMAS -----------------
class TopicBase(BaseModel):
    title: str
    difficulty: Optional[str] = "Medium"
    completed: Optional[bool] = False
    estimated_minutes: Optional[int] = 45
    last_revised: Optional[str] = None

class TopicCreate(TopicBase):
    chapter_id: str

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[str] = None
    completed: Optional[bool] = None
    estimated_minutes: Optional[int] = None
    last_revised: Optional[str] = None

class TopicOut(TopicBase):
    id: str
    chapter_id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)

class ChapterBase(BaseModel):
    title: str

class ChapterCreate(ChapterBase):
    subject_id: str

class ChapterUpdate(BaseModel):
    title: Optional[str] = None

class ChapterOut(ChapterBase):
    id: str
    subject_id: str
    user_id: str
    topics: List[TopicOut] = []

    model_config = ConfigDict(from_attributes=True)

class SubjectBase(BaseModel):
    name: str
    code: Optional[str] = ""
    tone: Optional[str] = "sage"
    exam_date: Optional[str] = None
    score_status: Optional[str] = "On track"

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    tone: Optional[str] = None
    exam_date: Optional[str] = None
    score_status: Optional[str] = None

class SubjectOut(SubjectBase):
    id: str
    user_id: str
    chapters: List[ChapterOut] = []

    model_config = ConfigDict(from_attributes=True)


# ----------------- TIMETABLE SCHEMAS -----------------
class SessionBase(BaseModel):
    day: str
    start_time: str
    end_time: str
    subject_id: Optional[str] = None
    subject: str
    topic: str
    tag: Optional[str] = "Practice"
    color: Optional[str] = "sage"
    notes: Optional[str] = ""
    done: Optional[bool] = False

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    day: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    subject_id: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    tag: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None
    done: Optional[bool] = None

class SessionOut(SessionBase):
    id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)


# ----------------- STUDY GOALS SCHEMAS -----------------
class GoalBase(BaseModel):
    title: str
    goal_type: Optional[str] = "daily"  # daily | weekly
    category: Optional[str] = "hours"   # hours | tasks
    target: float
    current: Optional[float] = 0.0
    unit: Optional[str] = "hrs"
    completed: Optional[bool] = False

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    goal_type: Optional[str] = None
    category: Optional[str] = None
    target: Optional[float] = None
    current: Optional[float] = None
    unit: Optional[str] = None
    completed: Optional[bool] = None

class GoalIncrement(BaseModel):
    amount: float = 1.0

class GoalOut(GoalBase):
    id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)


# ----------------- FOCUS LOG SCHEMAS -----------------
class FocusLogCreate(BaseModel):
    timestamp: str
    subject: str
    topic: str
    duration_minutes: Optional[int] = 25
    session_type: Optional[str] = "pomodoro"

class FocusLogOut(FocusLogCreate):
    id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)


# ----------------- REVISION SCHEMAS -----------------
class RevisionCreate(BaseModel):
    subject_id: Optional[str] = None
    subject: str
    topic: str
    stage: Optional[int] = 1
    due_date: str
    interval_days: Optional[int] = 1
    difficulty: Optional[str] = "Medium"

class RevisionComplete(BaseModel):
    rating: Optional[int] = 4  # 1 to 5 scale

class RevisionOut(BaseModel):
    id: str
    user_id: str
    subject_id: Optional[str] = None
    subject: str
    topic: str
    stage: int
    due_date: str
    interval_days: int
    completed: bool
    completed_at: Optional[str] = None
    difficulty: str

    model_config = ConfigDict(from_attributes=True)
