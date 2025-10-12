import { db } from "../db/index";
import * as schema from "../db/schema";

export const ensureUserExists = async (userId: string) => {
  try {
    await db.insert(schema.users).values({ id: userId }).onConflictDoNothing();
    console.log(`Ensured user ${userId} exists.`);
  } catch (error) {
    console.error(`Error ensuring user ${userId} exists:`, error);
    throw error;
  }
};
