import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, FocusLog, StudyGoal
from app.schemas import FocusLogCreate, FocusLogOut
from app.auth import get_current_user

router = APIRouter(prefix="/focus-logs", tags=["Focus Sessions"])

@router.get("", response_model=List[FocusLogOut])
def list_focus_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(FocusLog).filter(FocusLog.user_id == current_user.id).order_by(FocusLog.id.desc()).all()

@router.post("", response_model=FocusLogOut, status_code=status.HTTP_201_CREATED)
def create_focus_log(
    log_in: FocusLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = FocusLog(
        id=f"fl-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        timestamp=log_in.timestamp,
        subject=log_in.subject,
        topic=log_in.topic,
        duration_minutes=log_in.duration_minutes or 25,
        session_type=log_in.session_type or "pomodoro"
    )
    db.add(log)

    # Automatically increment hour study goals
    additional_hours = round(log.duration_minutes / 60.0, 2)
    goals = db.query(StudyGoal).filter(
        StudyGoal.user_id == current_user.id,
        StudyGoal.category == "hours"
    ).all()
    for g in goals:
        g.current = round(g.current + additional_hours, 1)
        g.completed = g.current >= g.target

    db.commit()
    db.refresh(log)
    return log

