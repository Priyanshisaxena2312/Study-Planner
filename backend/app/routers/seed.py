import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Subject, Chapter, Topic, TimetableSession, StudyGoal, RevisionItem, FocusLog
from app.auth import get_current_user

router = APIRouter(prefix="/seed", tags=["Data Seeding"])

@router.post("", status_code=status.HTTP_201_CREATED)
def seed_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only seed if user currently has no subjects
    existing_sub = db.query(Subject).filter(Subject.user_id == current_user.id).first()
    if existing_sub:
        return {"message": "User already has curriculum data. Skipping seed."}

    # 1. Subjects
    sub1 = Subject(id=f"sub-1-{uuid.uuid4().hex[:4]}", user_id=current_user.id, name="Mathematics", code="MATH-204", tone="sage", exam_date="2026-11-18", score_status="Needs focus")
    sub2 = Subject(id=f"sub-2-{uuid.uuid4().hex[:4]}", user_id=current_user.id, name="Computer Networks", code="CS-302", tone="olive", exam_date="2026-11-23", score_status="On track")
    sub3 = Subject(id=f"sub-3-{uuid.uuid4().hex[:4]}", user_id=current_user.id, name="Database Management", code="CS-305", tone="sand", exam_date="2026-11-20", score_status="Good progress")
    db.add_all([sub1, sub2, sub3])
    db.flush()

    # 2. Chapters
    c1 = Chapter(id=f"chap-1-{uuid.uuid4().hex[:4]}", subject_id=sub1.id, user_id=current_user.id, title="Integral Calculus")
    c2 = Chapter(id=f"chap-2-{uuid.uuid4().hex[:4]}", subject_id=sub1.id, user_id=current_user.id, title="Differential Equations")
    c3 = Chapter(id=f"chap-3-{uuid.uuid4().hex[:4]}", subject_id=sub2.id, user_id=current_user.id, title="Transport Layer Protocols")
    c4 = Chapter(id=f"chap-4-{uuid.uuid4().hex[:4]}", subject_id=sub2.id, user_id=current_user.id, title="Network Routing Algorithms")
    c5 = Chapter(id=f"chap-5-{uuid.uuid4().hex[:4]}", subject_id=sub3.id, user_id=current_user.id, title="Relational Schema Normalization")
    c6 = Chapter(id=f"chap-6-{uuid.uuid4().hex[:4]}", subject_id=sub3.id, user_id=current_user.id, title="Transaction Management & ACID")
    db.add_all([c1, c2, c3, c4, c5, c6])
    db.flush()

    # 3. Topics
    topics = [
        Topic(id=f"top-1-{uuid.uuid4().hex[:4]}", chapter_id=c1.id, user_id=current_user.id, title="Integration by Parts & Substitution", difficulty="Medium", completed=True, estimated_minutes=45, last_revised="2026-11-10"),
        Topic(id=f"top-2-{uuid.uuid4().hex[:4]}", chapter_id=c1.id, user_id=current_user.id, title="Improper Integrals & Convergence", difficulty="Hard", completed=False, estimated_minutes=60),
        Topic(id=f"top-3-{uuid.uuid4().hex[:4]}", chapter_id=c1.id, user_id=current_user.id, title="Definite Integral Applications", difficulty="Easy", completed=True, estimated_minutes=30, last_revised="2026-11-08"),
        Topic(id=f"top-4-{uuid.uuid4().hex[:4]}", chapter_id=c2.id, user_id=current_user.id, title="First-Order Linear Equations", difficulty="Easy", completed=False, estimated_minutes=40),
        Topic(id=f"top-5-{uuid.uuid4().hex[:4]}", chapter_id=c2.id, user_id=current_user.id, title="Homogeneous Second-Order Equations", difficulty="Hard", completed=False, estimated_minutes=75),
        Topic(id=f"top-6-{uuid.uuid4().hex[:4]}", chapter_id=c3.id, user_id=current_user.id, title="TCP 3-Way Handshake & Teardown", difficulty="Medium", completed=True, estimated_minutes=35, last_revised="2026-11-12"),
        Topic(id=f"top-7-{uuid.uuid4().hex[:4]}", chapter_id=c3.id, user_id=current_user.id, title="Flow Control & Sliding Window", difficulty="Medium", completed=True, estimated_minutes=45, last_revised="2026-11-11"),
        Topic(id=f"top-8-{uuid.uuid4().hex[:4]}", chapter_id=c3.id, user_id=current_user.id, title="Congestion Avoidance & Tahoe/Reno", difficulty="Hard", completed=False, estimated_minutes=50),
        Topic(id=f"top-9-{uuid.uuid4().hex[:4]}", chapter_id=c4.id, user_id=current_user.id, title="Dijkstra's Link-State Algorithm", difficulty="Medium", completed=True, estimated_minutes=40, last_revised="2026-11-09"),
        Topic(id=f"top-10-{uuid.uuid4().hex[:4]}", chapter_id=c5.id, user_id=current_user.id, title="1NF, 2NF and 3NF Normal Forms", difficulty="Easy", completed=True, estimated_minutes=40, last_revised="2026-11-11"),
        Topic(id=f"top-11-{uuid.uuid4().hex[:4]}", chapter_id=c5.id, user_id=current_user.id, title="Boyce-Codd Normal Form (BCNF)", difficulty="Hard", completed=False, estimated_minutes=50),
        Topic(id=f"top-12-{uuid.uuid4().hex[:4]}", chapter_id=c6.id, user_id=current_user.id, title="ACID Properties & Serializability", difficulty="Medium", completed=True, estimated_minutes=45, last_revised="2026-11-10"),
    ]
    db.add_all(topics)

    # 4. Timetable sessions
    sessions = [
        TimetableSession(id=f"tt-1-{uuid.uuid4().hex[:4]}", user_id=current_user.id, day="Thu", start_time="07:00 AM", end_time="08:00 AM", subject_id=sub1.id, subject="Mathematics", topic="Practice integration problems", tag="High priority", color="sage", notes="Focus on substitutions", done=True),
        TimetableSession(id=f"tt-2-{uuid.uuid4().hex[:4]}", user_id=current_user.id, day="Thu", start_time="09:30 AM", end_time="10:15 AM", subject_id=sub2.id, subject="Computer Networks", topic="Revise transport layer concepts", tag="Revision", color="sand", notes="Review TCP header flags", done=False),
        TimetableSession(id=f"tt-3-{uuid.uuid4().hex[:4]}", user_id=current_user.id, day="Thu", start_time="04:00 PM", end_time="05:00 PM", subject_id=sub3.id, subject="Database Management", topic="Normalization · 1NF to BCNF", tag="Medium", color="olive", notes="Check diagrams", done=False),
        TimetableSession(id=f"tt-4-{uuid.uuid4().hex[:4]}", user_id=current_user.id, day="Fri", start_time="08:00 AM", end_time="09:30 AM", subject_id=sub2.id, subject="Computer Networks", topic="Congestion control lab", tag="Practice", color="olive", done=False),
    ]
    db.add_all(sessions)

    # 5. Study Goals
    goals = [
        StudyGoal(id=f"g-1-{uuid.uuid4().hex[:4]}", user_id=current_user.id, title="Daily study duration", goal_type="daily", category="hours", current=3.2, target=4.5, unit="hrs", completed=False),
        StudyGoal(id=f"g-2-{uuid.uuid4().hex[:4]}", user_id=current_user.id, title="Complete planned timetable tasks", goal_type="daily", category="tasks", current=3, target=4, unit="tasks", completed=False),
        StudyGoal(id=f"g-3-{uuid.uuid4().hex[:4]}", user_id=current_user.id, title="Weekly dedicated study time", goal_type="weekly", category="hours", current=18.2, target=24, unit="hrs", completed=False),
    ]
    db.add_all(goals)

    # 6. Spaced Revisions
    revs = [
        RevisionItem(id=f"rev-1-{uuid.uuid4().hex[:4]}", user_id=current_user.id, subject_id=sub1.id, subject="Mathematics", topic="Integration by Parts", stage=2, due_date="2026-11-13", interval_days=3, completed=False, difficulty="Medium"),
        RevisionItem(id=f"rev-2-{uuid.uuid4().hex[:4]}", user_id=current_user.id, subject_id=sub2.id, subject="Computer Networks", topic="TCP 3-Way Handshake", stage=1, due_date="2026-11-13", interval_days=1, completed=False, difficulty="Medium"),
        RevisionItem(id=f"rev-3-{uuid.uuid4().hex[:4]}", user_id=current_user.id, subject_id=sub3.id, subject="Database Management", topic="1NF, 2NF and 3NF Normal Forms", stage=3, due_date="2026-11-12", interval_days=7, completed=False, difficulty="Easy"),
    ]
    db.add_all(revs)

    # 7. Focus logs
    focus = [
        FocusLog(id=f"fl-1-{uuid.uuid4().hex[:4]}", user_id=current_user.id, timestamp="2026-11-13T07:45:00Z", subject="Mathematics", topic="Integration practice", duration_minutes=25, session_type="pomodoro"),
        FocusLog(id=f"fl-2-{uuid.uuid4().hex[:4]}", user_id=current_user.id, timestamp="2026-11-13T08:15:00Z", subject="Mathematics", topic="Integration practice", duration_minutes=25, session_type="pomodoro"),
    ]
    db.add_all(focus)

    db.commit()
    return {"message": "Sample data seeded successfully for user!"}

