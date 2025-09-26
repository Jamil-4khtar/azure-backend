import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.SEED_ADMIN_EMAIL || "admin@admin.com";
const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
const hash = await bcrypt.hash(password, 10);

async function seedUsers() {
  await prisma.user.upsert({
    where: { email },
    update: {
      password: hash,
      role: "ADMIN",
      name: "Uno Admin",
      isActive: true,
      emailVerified: new Date(),
    },
    create: { email, name: "Uno Admin", password: hash, role: "ADMIN" },
  });
  console.log("✅ Seeded admin:", email);
}

export default seedUsers