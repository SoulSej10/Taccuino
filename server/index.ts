import app from "./app.js";
import prisma from "./prisma.js";

const PORT = parseInt(process.env.PORT || "3001", 10);

async function start(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

function shutdown(): void {
  console.log("Shutting down gracefully...");
  prisma.$disconnect().catch(() => {});
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
