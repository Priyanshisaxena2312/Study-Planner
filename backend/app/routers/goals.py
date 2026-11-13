import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, StudyGoal
from app.schemas import GoalCreate, GoalUpdate, GoalIncrement, GoalOut
from app.auth import get_current_user

router = APIRouter(prefix="/goals", tags=["Study Goals"])

@router.get("", response_model=List[GoalOut])
def list_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(StudyGoal).filter(StudyGoal.user_id == current_user.id).all()

@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = StudyGoal(
        id=f"g-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        title=goal_in.title,
        goal_type=goal_in.goal_type or "daily",
        category=goal_in.category or "hours",
        target=goal_in.target,
        current=goal_in.current or 0.0,
        unit=goal_in.unit or "hrs",
        completed=(goal_in.current or 0.0) >= goal_in.target
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: str,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(StudyGoal).filter(
        StudyGoal.id == goal_id,
        StudyGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    for field, val in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, field, val)

    if goal.current is not None and goal.target is not None:
        goal.completed = goal.current >= goal.target

    db.commit()
    db.refresh(goal)
    return goal

@router.post("/{goal_id}/increment", response_model=GoalOut)
def increment_goal(
    goal_id: str,
    payload: GoalIncrement,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(StudyGoal).filter(
        StudyGoal.id == goal_id,
        StudyGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.current = round(goal.current + payload.amount, 1)
    goal.completed = goal.current >= goal.target

    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(StudyGoal).filter(
        StudyGoal.id == goal_id,
        StudyGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()
    return None

