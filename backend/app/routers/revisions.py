import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RevisionItem
from app.schemas import RevisionCreate, RevisionComplete, RevisionOut
from app.auth import get_current_user

router = APIRouter(prefix="/revisions", tags=["Spaced Revisions"])

INTERVALS = [1, 3, 7, 14, 30]

@router.get("", response_model=List[RevisionOut])
def list_revisions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(RevisionItem).filter(RevisionItem.user_id == current_user.id).all()

@router.post("", response_model=RevisionOut, status_code=status.HTTP_201_CREATED)
def create_revision(
    rev_in: RevisionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rev = RevisionItem(
        id=f"rev-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        subject_id=rev_in.subject_id,
        subject=rev_in.subject,
        topic=rev_in.topic,
        stage=rev_in.stage or 1,
        due_date=rev_in.due_date,
        interval_days=rev_in.interval_days or 1,
        completed=False,
        completed_at=None,
        difficulty=rev_in.difficulty or "Medium"
    )
    db.add(rev)
    db.commit()
    db.refresh(rev)
    return rev

@router.post("/{revision_id}/complete", response_model=RevisionOut)
def complete_revision(
    revision_id: str,
    payload: RevisionComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rev = db.query(RevisionItem).filter(
        RevisionItem.id == revision_id,
        RevisionItem.user_id == current_user.id
    ).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Revision item not found")

    next_stage = rev.stage + 1
    if next_stage > 4:
        # Completed the entire spaced repetition sequence
        rev.completed = True
        rev.completed_at = datetime.datetime.utcnow().isoformat()
    else:
        interval = INTERVALS[next_stage - 1] if next_stage - 1 < len(INTERVALS) else 30
        next_due = datetime.date.today() + datetime.timedelta(days=interval)
        rev.stage = next_stage
        rev.interval_days = interval
        rev.due_date = next_due.isoformat()
        rev.completed = False
        rev.completed_at = datetime.datetime.utcnow().isoformat()

    db.commit()
    db.refresh(rev)
    return rev

@router.delete("/{revision_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_revision(
    revision_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rev = db.query(RevisionItem).filter(
        RevisionItem.id == revision_id,
        RevisionItem.user_id == current_user.id
    ).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Revision item not found")

    db.delete(rev)
    db.commit()
    return None

