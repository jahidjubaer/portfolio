/**
 * Runs the Goodreads sync once, outside the daily cron (R4).
 *
 *   npm run sync:books -w server -- 192903871
 *
 * With an id, it's first saved as Beyond's Goodreads user ID. Covers are
 * copied to Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
 */
import "dotenv/config";
import { getDb, closeDb } from "../src/db/client.js";
import { COLLECTIONS, SINGLETON_ID } from "../src/db/collections.js";
import { syncBooks } from "../src/services/goodreadsService.js";
import { markEdited } from "../src/services/publishService.js";

const [givenId] = process.argv.slice(2);
try {
  const db = await getDb();
  const beyond = db.collection(COLLECTIONS.beyond);
  if (givenId) {
    if (!/^\d+$/.test(givenId)) throw new Error("The id is a number.");
    await beyond.updateOne(
      { _id: SINGLETON_ID },
      { $set: { goodreadsUserId: givenId } },
    );
    await markEdited({ collection: "beyond", action: "updated" });
  }
  const userId = (await beyond.findOne({ _id: SINGLETON_ID }))?.goodreadsUserId;
  if (!userId) throw new Error("No Goodreads user ID under Beyond.");
  const result = await syncBooks(userId);
  console.log(`[books] ${result.count} books.`, result.errors);
} catch (error) {
  console.error(`[books] ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeDb();
}
