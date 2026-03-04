import { db } from "../src/server/db";
import { media, mediaTypeEnum } from "../src/server/db/schema";
import { eq } from "drizzle-orm";

const USER_ID = "user_33yIqGEB1azH4aTN6T5gvyy0pb9"; // parekhdhrish.misc@gmail.com

// Helper to generate a random date within the last n days
function getRandomDateInPast(days: number) {
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

async function scatterDates() {
  console.log(`Starting to scatter dates for actual videos owned by ${USER_ID}...`);

  try {
    // 1. Fetch all media rows for this user
    const userMedia = await db.select().from(media).where(eq(media.userId, USER_ID));

    if (userMedia.length === 0) {   
      console.log("No media found for this user.");
      return;
    }

    console.log(`Found ${userMedia.length} media items. Distributing their dates across the last 6 months...`);

    // 2. Loop through and update them with random historical dates over the past 180 days (6 months)
    for (let i = 0; i < userMedia.length; i++) {
      const record = userMedia[i];
      const randomDate = getRandomDateInPast(180);

      await db
        .update(media)
        .set({
          createdAt: randomDate,
          updatedAt: randomDate,
        })
        .where(eq(media.id, record.id));
    }

    console.log(`Successfully scattered dates for ${userMedia.length} records!`);
  } catch (error) {
    console.error("Error scattering dates:", error);
  } finally {
    process.exit(0);
  }
}

scatterDates();
