import { 
  type User, 
  type InsertUser, 
  type Game,
  type InsertGame,
  type Review,
  type InsertReview,
  type Like,
  type InsertLike,
  type FeaturedVideo,
  type InsertFeaturedVideo,
  type Report,
  type InsertReport,
  users,
  games,
  reviews,
  likes,
  featuredVideo,
  reports
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Game methods
  getGame(id: string): Promise<Game | undefined>;
  getAllGames(status?: string): Promise<Game[]>;
  getGamesByDeveloper(developerId: string): Promise<Game[]>;
  createGame(game: InsertGame & { developerId: string; developer: string }): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  deleteGame(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  incrementDownloads(id: string): Promise<void>;
  
  // Review methods
  getReviewsByGame(gameId: string): Promise<Review[]>;
  createReview(review: InsertReview & { gameId: string; userId: string; username: string }): Promise<Review>;
  deleteReview(id: string, userId: string): Promise<boolean>;
  
  // Like methods
  getLike(gameId: string, userId: string): Promise<Like | undefined>;
  createOrUpdateLike(like: InsertLike): Promise<Like>;
  deleteLike(gameId: string, userId: string): Promise<boolean>;
  
  // Featured Video methods
  getFeaturedVideo(): Promise<FeaturedVideo | undefined>;
  setFeaturedVideo(video: InsertFeaturedVideo): Promise<FeaturedVideo>;

  // Report methods
  createReport(report: InsertReport & { gameId: string; userId: string }): Promise<Report>;
  getReports(): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        joinedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.joinedAt));
  }

  // Game methods
  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getAllGames(status?: string): Promise<Game[]> {
    if (status) {
      return await db.select().from(games).where(eq(games.status, status)).orderBy(desc(games.uploadDate));
    }
    return await db.select().from(games).orderBy(desc(games.uploadDate));
  }

  async getGamesByDeveloper(developerId: string): Promise<Game[]> {
    return await db.select().from(games).where(eq(games.developerId, developerId)).orderBy(desc(games.uploadDate));
  }

  async createGame(insertGame: InsertGame & { developerId: string; developer: string }): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values({
        ...insertGame,
        uploadDate: new Date(),
        status: "approved",
      })
      .returning();
    return game;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const [game] = await db
      .update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning();
    return game || undefined;
  }

  async deleteGame(id: string): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementViews(id: string): Promise<void> {
    await db
      .update(games)
      .set({ views: sql`${games.views} + 1` })
      .where(eq(games.id, id));
  }

  async incrementDownloads(id: string): Promise<void> {
    await db
      .update(games)
      .set({ downloads: sql`${games.downloads} + 1` })
      .where(eq(games.id, id));
  }

  // Review methods
  async getReviewsByGame(gameId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.gameId, gameId)).orderBy(desc(reviews.date));
  }

  async createReview(insertReview: InsertReview & { gameId: string; userId: string; username: string }): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...insertReview,
        date: new Date(),
      })
      .returning();
    
    // Update game rating
    const gameReviews = await this.getReviewsByGame(insertReview.gameId);
    const avgRating = gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length;
    await this.updateGame(insertReview.gameId, { rating: avgRating });
    
    return review;
  }

  async deleteReview(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(reviews).where(and(eq(reviews.id, id), eq(reviews.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Like methods
  async getLike(gameId: string, userId: string): Promise<Like | undefined> {
    const [like] = await db.select().from(likes).where(and(eq(likes.gameId, gameId), eq(likes.userId, userId)));
    return like || undefined;
  }

  async createOrUpdateLike(insertLike: InsertLike): Promise<Like> {
    const existing = await this.getLike(insertLike.gameId, insertLike.userId);
    
    if (existing) {
      const [like] = await db
        .update(likes)
        .set({ isLike: insertLike.isLike })
        .where(eq(likes.id, existing.id))
        .returning();
      return like;
    }
    
    const [like] = await db
      .insert(likes)
      .values(insertLike)
      .returning();
    return like;
  }

  async deleteLike(gameId: string, userId: string): Promise<boolean> {
    const result = await db.delete(likes).where(and(eq(likes.gameId, gameId), eq(likes.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Featured Video methods
  async getFeaturedVideo(): Promise<FeaturedVideo | undefined> {
    const [video] = await db.select().from(featuredVideo).orderBy(desc(featuredVideo.uploadedAt)).limit(1);
    return video || undefined;
  }

  async setFeaturedVideo(insertVideo: InsertFeaturedVideo): Promise<FeaturedVideo> {
    const [video] = await db
      .insert(featuredVideo)
      .values({
        ...insertVideo,
        uploadedAt: new Date(),
      })
      .returning();
    return video;
  }

  // Report methods
  async createReport(insertReport: InsertReport & { gameId: string; userId: string }): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values({
        ...insertReport,
        date: new Date(),
      })
      .returning();
    return report;
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.date));
  }
}

export const storage = new DatabaseStorage();
