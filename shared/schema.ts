import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  avatar: text("avatar"),
  bio: text("bio"),
  banned: boolean("banned").default(false),
  featured: boolean("featured").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "user"]).default("user"),
}).omit({ id: true, joinedAt: true });

export const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  banned: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

// Games Table
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  developerId: varchar("developer_id").notNull().references(() => users.id),
  developer: text("developer").notNull(),
  thumbnail: text("thumbnail").notNull(),
  screenshots: text("screenshots").array().notNull(),
  apkUrl: text("apk_url").notNull(),
  externalLink: text("external_link"),
  status: text("status").notNull().default("pending"),
  featured: boolean("featured").default(false),
  rating: real("rating").default(0),
  downloads: integer("downloads").default(0),
  views: integer("views").default(0),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
});

export const insertGameSchema = createInsertSchema(games, {
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  screenshots: z.array(z.string().min(1)).min(1, "At least one screenshot required"),
  apkUrl: z.string().min(1, "APK URL is required"),
  externalLink: z.string().optional(),
}).omit({ id: true, uploadDate: true, rating: true, downloads: true, views: true, developerId: true, developer: true, status: true, featured: true });

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Reviews Table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
}).omit({ id: true, date: true, gameId: true, userId: true, username: true });

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Likes/Dislikes Table
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isLike: boolean("is_like").notNull(),
});

export const insertLikeSchema = createInsertSchema(likes, {
  isLike: z.boolean(),
}).omit({ id: true });

export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

// Featured Video Table
export const featuredVideo = pgTable("featured_video", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  youtubeUrl: text("youtube_url").notNull(),
  thumbnail: text("thumbnail"),
  title: text("title"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertFeaturedVideoSchema = createInsertSchema(featuredVideo, {
  youtubeUrl: z.string().min(1, "YouTube URL required"),
  title: z.string().optional(),
}).omit({ id: true, uploadedAt: true });

export type InsertFeaturedVideo = z.infer<typeof insertFeaturedVideoSchema>;
export type FeaturedVideo = typeof featuredVideo.$inferSelect;

// Game Reports Table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  message: text("message"),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports, {
  reason: z.string().min(1, "Reason is required"),
  message: z.string().optional(),
}).omit({ id: true, date: true, gameId: true, userId: true });

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
