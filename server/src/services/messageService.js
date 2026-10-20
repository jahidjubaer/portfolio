import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { COLLECTIONS } from "../db/collections.js";
import { validate } from "./adminContentService.js";

const HIDE_ID = { projection: { _id: 0 } };
const INBOX_SIZE = 200;

// Same limits as the form (client/src/features/contact/contact-validation.js).
export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email: z.email({ error: "Enter a valid email address." }).max(254),
  subject: z.string().trim().min(2, "Subject is too short.").max(120),
  message: z.string().trim().min(10, "Message is too short.").max(2000),
});

/**
 * Stores a contact-form message for the admin inbox. The honeypot field
 * (`companyWebsite`) is checked by the controller before this runs.
 * @param {unknown} input
 */
export async function saveMessage(input) {
  const message = validate(contactMessageSchema, input);
  const db = await getDb();
  const document = {
    id: randomUUID(),
    ...message,
    receivedAt: new Date().toISOString(),
    read: false,
    archived: false,
  };
  await db.collection(COLLECTIONS.messages).insertOne({ ...document });
  return { id: document.id };
}

/** Newest first, archived ones included (the inbox filters them). */
export async function listMessages() {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.messages)
    .find({}, HIDE_ID)
    .sort({ receivedAt: -1 })
    .limit(INBOX_SIZE)
    .toArray();
}

const messageUpdateSchema = z
  .object({ read: z.boolean().optional(), archived: z.boolean().optional() })
  .strict();

function notFound() {
  const error = new Error("Message not found.");
  error.status = 404;
  return error;
}

/** @param {string} id @param {unknown} input `{ read?, archived? }` */
export async function updateMessage(id, input) {
  const changes = validate(messageUpdateSchema, input);
  const db = await getDb();
  const updated = await db
    .collection(COLLECTIONS.messages)
    .findOneAndUpdate(
      { id },
      { $set: changes },
      { returnDocument: "after", ...HIDE_ID },
    );
  if (!updated) throw notFound();
  return updated;
}

/** @param {string} id */
export async function deleteMessage(id) {
  const db = await getDb();
  const { deletedCount } = await db
    .collection(COLLECTIONS.messages)
    .deleteOne({ id });
  if (!deletedCount) throw notFound();
}
