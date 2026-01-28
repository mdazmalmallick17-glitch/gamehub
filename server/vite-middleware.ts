import { Express } from "express";
import path from "path";

export function setupUploadMiddleware(app: Express) {
  // Serve uploads from development build directory
  app.use("/uploads", (req, res, next) => {
    const uploadPath = path.join(process.cwd(), "public/uploads");
    res.sendFile(uploadPath + req.url, (err: any) => {
      if (err) {
        // Try alternate location
        const altPath = path.join(process.cwd(), "dist/public/uploads");
        res.sendFile(altPath + req.url, (altErr: any) => {
          if (altErr) {
            res.status(404).json({ error: "File not found" });
          }
        });
      }
    });
  });
}
