import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user if doesn't exist
  const adminUsername = "admin.admin";
  const [existingAdmin] = await db.select().from(users).where(eq(users.username, adminUsername));

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin9123761447", 10);
    await db.insert(users).values({
      username: adminUsername,
      password: hashedPassword,
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      bio: "Platform Administrator",
      banned: false,
    });
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
