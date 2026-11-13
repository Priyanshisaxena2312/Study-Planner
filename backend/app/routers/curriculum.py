import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Subject, Chapter, Topic
from app.schemas import (
    SubjectCreate, SubjectUpdate, SubjectOut,
    ChapterCreate, ChapterUpdate, ChapterOut,
    TopicCreate, TopicUpdate, TopicOut
)
from app.auth import get_current_user

router = APIRouter(tags=["Curriculum"])

# ----------------- SUBJECTS -----------------
@router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Subject).filter(Subject.user_id == current_user.id).all()

@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    sub_in: SubjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = Subject(
        id=f"sub-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        name=sub_in.name,
        code=sub_in.code,
        tone=sub_in.tone,
        exam_date=sub_in.exam_date,
        score_status=sub_in.score_status or "On track"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.put("/subjects/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: str,
    sub_in: SubjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")

    for field, val in sub_in.model_dump(exclude_unset=True).items():
        setattr(sub, field, val)

    db.commit()
    db.refresh(sub)
    return sub

@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(sub)
    db.commit()
    return None


# ----------------- CHAPTERS -----------------
@router.get("/chapters", response_model=List[ChapterOut])
def list_chapters(
    subject_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Chapter).filter(Chapter.user_id == current_user.id)
    if subject_id:
        query = query.filter(Chapter.subject_id == subject_id)
    return query.all()

@router.post("/chapters", response_model=ChapterOut, status_code=status.HTTP_201_CREATED)
def create_chapter(
    chap_in: ChapterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify subject belongs to user
    sub = db.query(Subject).filter(Subject.id == chap_in.subject_id, Subject.user_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")

    chap = Chapter(
        id=f"chap-{uuid.uuid4().hex[:8]}",
        subject_id=chap_in.subject_id,
        user_id=current_user.id,
        title=chap_in.title
    )
    db.add(chap)
    db.commit()
    db.refresh(chap)
    return chap

@router.put("/chapters/{chapter_id}", response_model=ChapterOut)
def update_chapter(
    chapter_id: str,
    chap_in: ChapterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chap = db.query(Chapter).filter(Chapter.id == chapter_id, Chapter.user_id == current_user.id).first()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")

    for field, val in chap_in.model_dump(exclude_unset=True).items():
        setattr(chap, field, val)

    db.commit()
    db.refresh(chap)
    return chap

@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(
    chapter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chap = db.query(Chapter).filter(Chapter.id == chapter_id, Chapter.user_id == current_user.id).first()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")
    db.delete(chap)
    db.commit()
    return None


# ----------------- TOPICS -----------------
@router.get("/topics", response_model=List[TopicOut])
def list_topics(
    chapter_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Topic).filter(Topic.user_id == current_user.id)
    if chapter_id:
        query = query.filter(Topic.chapter_id == chapter_id)
    return query.all()

@router.post("/topics", response_model=TopicOut, status_code=status.HTTP_201_CREATED)
def create_topic(
    top_in: TopicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chap = db.query(Chapter).filter(Chapter.id == top_in.chapter_id, Chapter.user_id == current_user.id).first()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")

    topic = Topic(
        id=f"top-{uuid.uuid4().hex[:8]}",
        chapter_id=top_in.chapter_id,
        user_id=current_user.id,
        title=top_in.title,
        difficulty=top_in.difficulty,
        completed=top_in.completed,
        estimated_minutes=top_in.estimated_minutes,
        last_revised=top_in.last_revised
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

@router.put("/topics/{topic_id}", response_model=TopicOut)
def update_topic(
    topic_id: str,
    top_in: TopicUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.id == topic_id, Topic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    for field, val in top_in.model_dump(exclude_unset=True).items():
        setattr(topic, field, val)

    db.commit()
    db.refresh(topic)
    return topic

@router.patch("/topics/{topic_id}/toggle", response_model=TopicOut)
def toggle_topic(
    topic_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.id == topic_id, Topic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    topic.completed = not topic.completed
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.id == topic_id, Topic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return None

