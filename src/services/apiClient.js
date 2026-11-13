/**
 * API Client Bridge for Smart Study Planner
 * Connects to FastAPI backend (default: http://localhost:8000/api/v1)
 * Includes JWT authorization header handling, error resilience, and health check.
 */

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:8000/api/v1";
const TOKEN_KEY = "ssp_auth_token";
const USER_KEY = "ssp_user_info";

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn("Could not save token:", e);
    }
  },
  remove: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn("Could not clear auth:", e);
    }
  },
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn("Could not save user profile:", e);
    }
  },
};

async function apiRequest(endpoint, { method = "GET", body = null, requireAuth = true } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = tokenStore.get();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        errorDetail = errJson.detail || JSON.stringify(errJson);
      } catch {
        // fallback
      }
      throw new Error(errorDetail);
    }
    return await res.json();
  } catch (err) {
    // Network / offline error or backend server not running
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE.replace("/api/v1", "")}/docs`, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth
  auth: {
    register: async (email, password, fullName = "Student") => {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: { email, password, full_name: fullName },
        requireAuth: false,
      });
      tokenStore.set(data.access_token);
      tokenStore.setUser({ id: data.user_id, email: data.email, full_name: data.full_name });
      return data;
    },
    login: async (email, password) => {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
        requireAuth: false,
      });
      tokenStore.set(data.access_token);
      tokenStore.setUser({ id: data.user_id, email: data.email, full_name: data.full_name });
      return data;
    },
    getMe: async () => {
      return await apiRequest("/auth/me");
    },
    updateSettings: async (settings) => {
      return await apiRequest("/auth/settings", {
        method: "PUT",
        body: settings,
      });
    },
    logout: () => {
      tokenStore.remove();
    },
  },

  // Curriculum
  curriculum: {
    getSubjects: async () => await apiRequest("/curriculum/subjects"),
    createSubject: async (sub) =>
      await apiRequest("/curriculum/subjects", { method: "POST", body: sub }),
    updateSubject: async (id, sub) =>
      await apiRequest(`/curriculum/subjects/${id}`, { method: "PUT", body: sub }),
    deleteSubject: async (id) =>
      await apiRequest(`/curriculum/subjects/${id}`, { method: "DELETE" }),

    createChapter: async (chap) =>
      await apiRequest("/curriculum/chapters", { method: "POST", body: chap }),
    deleteChapter: async (id) =>
      await apiRequest(`/curriculum/chapters/${id}`, { method: "DELETE" }),

    createTopic: async (topic) =>
      await apiRequest("/curriculum/topics", { method: "POST", body: topic }),
    updateTopic: async (id, topic) =>
      await apiRequest(`/curriculum/topics/${id}`, { method: "PUT", body: topic }),
    deleteTopic: async (id) =>
      await apiRequest(`/curriculum/topics/${id}`, { method: "DELETE" }),
  },

  // Timetable
  timetable: {
    getSessions: async (day = null) => {
      const query = day ? `?day=${encodeURIComponent(day)}` : "";
      return await apiRequest(`/timetable/sessions${query}`);
    },
    createSession: async (session) =>
      await apiRequest("/timetable/sessions", { method: "POST", body: session }),
    updateSession: async (id, session) =>
      await apiRequest(`/timetable/sessions/${id}`, { method: "PUT", body: session }),
    deleteSession: async (id) =>
      await apiRequest(`/timetable/sessions/${id}`, { method: "DELETE" }),
    toggleSession: async (id) =>
      await apiRequest(`/timetable/sessions/${id}/toggle`, { method: "POST" }),
    moveSession: async (id, day, startTime, endTime) =>
      await apiRequest(`/timetable/sessions/${id}/move`, {
        method: "POST",
        body: { day, start_time: startTime, end_time: endTime },
      }),
  },

  // Study Goals
  goals: {
    getGoals: async () => await apiRequest("/goals/"),
    createGoal: async (goal) =>
      await apiRequest("/goals/", { method: "POST", body: goal }),
    updateGoal: async (id, goal) =>
      await apiRequest(`/goals/${id}`, { method: "PUT", body: goal }),
    deleteGoal: async (id) =>
      await apiRequest(`/goals/${id}`, { method: "DELETE" }),
    incrementGoal: async (id, amount = 1.0) =>
      await apiRequest(`/goals/${id}/increment`, {
        method: "POST",
        body: { amount },
      }),
  },

  // Focus
  focus: {
    getLogs: async () => await apiRequest("/focus/logs"),
    createLog: async (log) =>
      await apiRequest("/focus/logs", { method: "POST", body: log }),
  },

  // Revisions
  revisions: {
    getRevisions: async () => await apiRequest("/revisions/"),
    createRevision: async (rev) =>
      await apiRequest("/revisions/", { method: "POST", body: rev }),
    completeRevision: async (id, rating = 4) =>
      await apiRequest(`/revisions/${id}/complete`, {
        method: "POST",
        body: { rating },
      }),
    deleteRevision: async (id) =>
      await apiRequest(`/revisions/${id}`, { method: "DELETE" }),
  },

  // Analytics
  analytics: {
    getSummary: async () => await apiRequest("/analytics/summary"),
  },

  // Seeding
  seed: {
    populateSampleData: async () =>
      await apiRequest("/seed/sample-data", { method: "POST" }),
  },
};

