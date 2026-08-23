// Vercel serverless entry point. Reuses the existing Express app as-is —
// server/src/server.js (which calls app.listen) remains the local
// development entry point; this file never starts a listener, since
// Vercel's Node.js runtime invokes the exported app directly per request.
import { app } from "../server/src/app.js";

export default app;
