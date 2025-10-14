import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import config from "../config/env.js";

const prisma = new PrismaClient();

const email = config.admin.email || "admin@admin.com";
const password = config.admin.password || "admin123";
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

export default seedUsers;
