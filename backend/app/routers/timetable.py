import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import User, TimetableSession
from app.schemas import SessionCreate, SessionUpdate, SessionOut
from app.auth import get_current_user

router = APIRouter(prefix="/timetable", tags=["Timetable"])

class MoveSessionPayload(BaseModel):
    target_day: str

@router.get("", response_model=List[SessionOut])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(TimetableSession).filter(TimetableSession.user_id == current_user.id).all()

@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    sess_in: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = TimetableSession(
        id=f"tt-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        day=sess_in.day,
        start_time=sess_in.start_time,
        end_time=sess_in.end_time,
        subject_id=sess_in.subject_id,
        subject=sess_in.subject,
        topic=sess_in.topic,
        tag=sess_in.tag,
        color=sess_in.color,
        notes=sess_in.notes or "",
        done=sess_in.done or False
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.put("/{session_id}", response_model=SessionOut)
def update_session(
    session_id: str,
    sess_in: SessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(TimetableSession).filter(
        TimetableSession.id == session_id,
        TimetableSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    for field, val in sess_in.model_dump(exclude_unset=True).items():
        setattr(session, field, val)

    db.commit()
    db.refresh(session)
    return session

@router.patch("/{session_id}/toggle", response_model=SessionOut)
def toggle_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(TimetableSession).filter(
        TimetableSession.id == session_id,
        TimetableSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.done = not session.done
    db.commit()
    db.refresh(session)
    return session

@router.patch("/{session_id}/move", response_model=SessionOut)
def move_session(
    session_id: str,
    payload: MoveSessionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(TimetableSession).filter(
        TimetableSession.id == session_id,
        TimetableSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.day = payload.target_day
    db.commit()
    db.refresh(session)
    return session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(TimetableSession).filter(
        TimetableSession.id == session_id,
        TimetableSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return None

