import type { User, Game, Review, Like } from "./types";

const API_BASE = "/api";

// Auth API
export const authApi = {
  register: async (username: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }
    return res.json();
  },

  login: async (username: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }
    return res.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  },
};

// File Upload API
export const uploadApi = {
  image: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Upload failed");
    }
    return res.json();
  },
};

// Games API
export const gamesApi = {
  getAll: async (status?: string): Promise<Game[]> => {
    const url = status ? `${API_BASE}/games?status=${status}` : `${API_BASE}/games`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch games");
    return res.json();
  },

  getById: async (id: string): Promise<Game> => {
    const res = await fetch(`${API_BASE}/games/${id}`);
    if (!res.ok) throw new Error("Failed to fetch game");
    return res.json();
  },

  create: async (game: Partial<Game>): Promise<Game> => {
    const res = await fetch(`${API_BASE}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(game),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create game");
    }
    return res.json();
  },

  update: async (id: string, updates: Partial<Game>): Promise<Game> => {
    const res = await fetch(`${API_BASE}/games/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to update game");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/games/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete game");
  },

  trackDownload: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/games/${id}/download`, {
      method: "POST",
    });
  },
};

// Reviews API
export const reviewsApi = {
  getByGame: async (gameId: string): Promise<Review[]> => {
    const res = await fetch(`${API_BASE}/games/${gameId}/reviews`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
  },

  create: async (gameId: string, rating: number, comment: string): Promise<Review> => {
    const res = await fetch(`${API_BASE}/games/${gameId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create review");
    }
    return res.json();
  },
};

// Likes API
export const likesApi = {
  get: async (gameId: string): Promise<Like | null> => {
    const res = await fetch(`${API_BASE}/games/${gameId}/like`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  },

  set: async (gameId: string, isLike: boolean): Promise<Like> => {
    const res = await fetch(`${API_BASE}/games/${gameId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLike }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to save like");
    return res.json();
  },

  remove: async (gameId: string): Promise<void> => {
    await fetch(`${API_BASE}/games/${gameId}/like`, {
      method: "DELETE",
      credentials: "include",
    });
  },
};

// Admin API
export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  },

  getStats: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  getReports: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
  },
};

// YouTube utilities
export function getYoutubeThumburl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
}
