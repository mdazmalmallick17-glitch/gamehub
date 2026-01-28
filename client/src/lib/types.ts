export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password?: string; // In real app, never store plain text
  role: UserRole;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  banned?: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  views: number;
  developer: string;
  developerId: string;
  thumbnail: string;
  screenshots: string[];
  apkUrl: string;
  status: "pending" | "approved" | "rejected";
  featured?: boolean;
  uploadDate: string;
  price?: number;
}

export interface Review {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}
