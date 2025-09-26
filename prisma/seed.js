import { PrismaClient } from "@prisma/client";
import seedUsers from "../src/seeds/users.js";

async function main() {
  await seedUsers();
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });
