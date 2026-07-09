import bcrypt from "bcryptjs";
import { config } from "../src/config/index.js";
import { prisma } from "../src/database/prisma.js";

const main = async () => {
  const { email, password, name } = config.seedSeller;

  if (!email || !password || !name) {
    throw new Error("SELLER_EMAIL, SELLER_PASSWORD, and SELLER_NAME are required for seeding");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.seller.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name, deletedAt: null },
    create: { email: email.toLowerCase(), passwordHash, name },
  });

  console.log(`Seeded seller ${email}`);
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
