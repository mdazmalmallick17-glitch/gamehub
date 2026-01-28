import type { Express, Request, Response, NextFunction } from "express";
import type { Multer } from "multer";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGameSchema, insertReviewSchema, insertLikeSchema, updateUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import fsSync from "fs";

// Configure file upload
const uploadDir = path.join(process.cwd(), "uploads");
const storage_config = multer.diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomBytes(8).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId || req.session?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role: role || "user",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });

      req.session.userId = user.id;
      req.session.role = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.banned) {
        return res.status(403).json({ error: "Account banned" });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.patch("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = updateUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }

      const updated = await storage.updateUser(req.session.userId!, result.data);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/upload/image", upload.single("file"), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  app.get("/api/games", async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const games = await storage.getAllGames(status as string);
      res.json(games);
    } catch (error) {
      console.error("Get games error:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req: Request, res: Response) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      await storage.incrementViews(req.params.id);
      res.json(game);
    } catch (error) {
      console.error("Get game error:", error);
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  app.post("/api/games", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertGameSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const gameData: any = {
        ...result.data,
        developerId: user.id,
        developer: user.username.split('@')[0],
      };

      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      console.error("Create game error:", error);
      res.status(500).json({ error: "Failed to create game" });
    }
  });

  app.patch("/api/games/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (game.developerId !== req.session.userId && req.session.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updated = await storage.updateGame(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update game error:", error);
      res.status(500).json({ error: "Failed to update game" });
    }
  });

  app.delete("/api/games/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      // Only admins can delete games
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized - Admin access required" });
      }

      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Helper function to safely delete files
      const deleteIfExists = (filePath: string) => {
        try {
          if (fsSync.existsSync(filePath)) {
            fsSync.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn(`Warning: Could not delete file ${filePath}:`, err);
        }
      };

      // Delete thumbnail
      if (game.thumbnail) {
        const thumbPath = path.join(process.cwd(), "uploads", path.basename(game.thumbnail));
        deleteIfExists(thumbPath);
      }

      // Delete screenshots
      if (game.screenshots && Array.isArray(game.screenshots)) {
        game.screenshots.forEach((screenshot: string) => {
          const screenshotPath = path.join(process.cwd(), "uploads", path.basename(screenshot));
          deleteIfExists(screenshotPath);
        });
      }

      // Delete game from database
      await storage.deleteGame(req.params.id);
      
      console.log(`Game "${game.title}" (${req.params.id}) deleted by admin ${req.session.userId}`);
      res.json({ success: true, message: "Game deleted successfully" });
    } catch (error) {
      console.error("Delete game error:", error);
      res.status(500).json({ error: "Failed to delete game" });
    }
  });

  app.post("/api/games/:id/download", async (req: Request, res: Response) => {
    try {
      await storage.incrementDownloads(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Download increment error:", error);
      res.status(500).json({ error: "Failed to track download" });
    }
  });

  app.get("/api/games/:id/reviews", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviewsByGame(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/games/:id/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertReviewSchema.safeParse({
        rating: req.body.rating,
        comment: req.body.comment,
      });

      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).toString() });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const reviewData: any = {
        ...result.data,
        gameId: req.params.id,
        userId: req.session.userId!,
        username: user.username.split('@')[0],
      };

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/games/:id/like", requireAuth, async (req: Request, res: Response) => {
    try {
      const like = await storage.getLike(req.params.id, req.session.userId!);
      res.json(like || null);
    } catch (error) {
      console.error("Get like error:", error);
      res.status(500).json({ error: "Failed to fetch like status" });
    }
  });

  app.post("/api/games/:id/like", requireAuth, async (req: Request, res: Response) => {
    try {
      const { isLike } = req.body;
      const like = await storage.createOrUpdateLike({
        gameId: req.params.id,
        userId: req.session.userId!,
        isLike,
      });
      res.json(like);
    } catch (error) {
      console.error("Like error:", error);
      res.status(500).json({ error: "Failed to save like" });
    }
  });

  app.delete("/api/games/:id/like", requireAuth, async (req: Request, res: Response) => {
    try {
      await storage.deleteLike(req.params.id, req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete like error:", error);
      res.status(500).json({ error: "Failed to delete like" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateUser(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const games = await storage.getAllGames();
      
      const totalDownloads = games.reduce((sum, g) => sum + (g.downloads || 0), 0);
      const avgRating = games.length > 0 
        ? games.reduce((sum, g) => sum + (g.rating || 0), 0) / games.length 
        : 0;

      res.json({
        totalUsers: users.length,
        totalGames: games.length,
        totalDownloads,
        avgRating: avgRating.toFixed(1),
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/admin/featured-video", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { youtubeUrl, title } = req.body;
      if (!youtubeUrl) {
        return res.status(400).json({ error: "YouTube URL required" });
      }
      const video = await storage.setFeaturedVideo({ youtubeUrl, title });
      res.json(video);
    } catch (error) {
      console.error("Set featured video error:", error);
      res.status(500).json({ error: "Failed to set featured video" });
    }
  });

  app.get("/api/featured-video", async (req: Request, res: Response) => {
    try {
      const video = await storage.getFeaturedVideo();
      res.json(video || null);
    } catch (error) {
      console.error("Get featured video error:", error);
      res.status(500).json({ error: "Failed to fetch featured video" });
    }
  });

  app.post("/api/games/:id/report", requireAuth, async (req: Request, res: Response) => {
    try {
      const { reason, message } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Reason is required" });
      }
      const report = await storage.createReport({
        gameId: req.params.id,
        userId: req.session.userId!,
        reason,
        message,
      });
      res.json(report);
    } catch (error) {
      console.error("Report game error:", error);
      res.status(500).json({ error: "Failed to report game" });
    }
  });

  app.get("/api/admin/reports", requireAdmin, async (req: Request, res: Response) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  return httpServer;
}
