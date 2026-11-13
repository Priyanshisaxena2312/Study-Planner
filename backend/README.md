# Smart Study Planner — FastAPI Backend

A production-ready, asynchronous REST API powering the **Smart Study Planner** application with multi-tenant data isolation, JWT authentication, and relational data modeling.

---

## 🛠 Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy with declarative models
- **Validation**: Pydantic V2 (`ConfigDict`, typed schemas)
- **Security**: JWT (`pyjwt`), password hashing with `bcrypt` (12 rounds)
- **Database**: SQLite default (`study_planner.db`), drop-in configurable for PostgreSQL via `DATABASE_URL`
- **Testing**: `pytest`, `httpx` (in-memory SQLite with `StaticPool` for fast test runs)

---

## 🚀 Quickstart

### 1. Install Requirements
From the project root:
```bash
pip install -r backend/requirements.txt
```

### 2. Start the FastAPI Server
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000/api/v1`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

### 3. Run the Test Suite
From the repository root:
```bash
python -m pytest backend/tests -v
```

---

## 🔒 Multi-Tenant Architecture & Endpoints

Every domain entity (`subjects`, `chapters`, `topics`, `timetable_sessions`, `study_goals`, `focus_logs`, `revision_items`) enforces strict `user_id` foreign key isolation matching the authenticated JWT token.

### API Routes

| Router | Method & Route | Description |
| :--- | :--- | :--- |
| **Auth** | `POST /api/v1/auth/register` | Register new user, hashes password with bcrypt |
| | `POST /api/v1/auth/login` | Authenticate and issue JWT Bearer token |
| | `GET /api/v1/auth/me` | Retrieve authenticated user profile |
| | `PUT /api/v1/auth/settings` | Update preferred study hours and target |
| **Curriculum** | `GET /api/v1/curriculum/subjects` | List subjects with nested chapters and topics |
| | `POST /api/v1/curriculum/subjects` | Create subject |
| | `PUT /api/v1/curriculum/subjects/{id}` | Update subject |
| | `DELETE /api/v1/curriculum/subjects/{id}` | Cascade delete subject |
| | `POST /api/v1/curriculum/chapters` | Add chapter to subject |
| | `DELETE /api/v1/curriculum/chapters/{id}` | Cascade delete chapter |
| | `POST /api/v1/curriculum/topics` | Add topic to chapter |
| | `PUT /api/v1/curriculum/topics/{id}` | Update topic (difficulty, completion) |
| | `DELETE /api/v1/curriculum/topics/{id}` | Delete topic |
| **Timetable** | `GET /api/v1/timetable/sessions` | List sessions (optionally filter by `?day=Mon`) |
| | `POST /api/v1/timetable/sessions` | Schedule study session |
| | `PUT /api/v1/timetable/sessions/{id}` | Edit session details |
| | `DELETE /api/v1/timetable/sessions/{id}` | Remove session |
| | `POST /api/v1/timetable/sessions/{id}/toggle` | Toggle completion status |
| | `POST /api/v1/timetable/sessions/{id}/move` | Drag/move session to new day or time |
| **Study Goals** | `GET /api/v1/goals` | List daily and weekly targets |
| | `POST /api/v1/goals` | Create target goal |
| | `PUT /api/v1/goals/{id}` | Edit goal target or category |
| | `DELETE /api/v1/goals/{id}` | Delete goal |
| | `POST /api/v1/goals/{id}/increment` | Increment current progress by amount |
| **Focus Logs** | `GET /api/v1/focus/logs` | Fetch user pomodoro history |
| | `POST /api/v1/focus/logs` | Log completed session & auto-increment hours |
| **Revisions** | `GET /api/v1/revisions` | Fetch upcoming and completed spaced revisions |
| | `POST /api/v1/revisions` | Create spaced revision item |
| | `POST /api/v1/revisions/{id}/complete` | Mark complete & compute next spaced review date |
| | `DELETE /api/v1/revisions/{id}` | Remove revision item |
| **Analytics** | `GET /api/v1/analytics/summary` | Real-time computed stats (hours, completion %) |
| **Seed** | `POST /api/v1/seed/sample-data` | Seed full sample curriculum and sessions for new user |

