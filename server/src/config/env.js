import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  // MongoDB Atlas (provisioned through the Vercel Marketplace, which sets
  // MONGODB_URI). Blank locally until Jahid connects a database; the
  // /api/public/* routes then answer 503 "not configured".
  mongodbUri: process.env.MONGODB_URI || "",
  mongodbDb: process.env.MONGODB_DB || "portfolio",
  // Admin sign-in (R4). A GitHub OAuth App's credentials; leave blank and
  // /api/auth/* answers 503 "not configured".
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  // Must exactly match the OAuth App's callback URL. Defaults to this
  // server's own /api/auth/github/callback.
  oauthCallbackUrl: process.env.OAUTH_CALLBACK_URL || "",
  // The only account allowed in: jahidjubaer's numeric GitHub user id.
  // An id, not the login, because a login can be renamed and re-registered.
  adminGithubId: Number(process.env.ADMIN_GITHUB_ID) || 139990599,
  // Signs the admin session cookie; at least 32 random characters.
  sessionSecret: process.env.SESSION_SECRET || "",
  // Vercel Blob read-write token (set by Vercel when a Blob store is
  // connected to the project). Blank → admin uploads answer 503.
  blobToken: process.env.BLOB_READ_WRITE_TOKEN || "",
  // GitHub sync (R6). Public repositories are listed without a token too,
  // but only 60 requests/hour; a read-only token raises that to 5,000.
  githubToken: process.env.GITHUB_TOKEN || "",
  githubUsername: process.env.GITHUB_USERNAME || "jahidjubaer",
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Blank → the
  // cron endpoint answers 503 instead of running unauthenticated.
  cronSecret: process.env.CRON_SECRET || "",
  // Publish (R7): a Vercel Deploy Hook URL (Project → Settings → Git →
  // Deploy Hooks). Anyone with the URL can trigger a build, so it's a
  // secret. Blank → the admin's Publish button answers 503.
  deployHookUrl: process.env.VERCEL_DEPLOY_HOOK_URL || "",
  // "Draft with AI" in the admin, through Vercel AI Gateway. On Vercel the
  // deployment's OIDC token authenticates it; locally set
  // AI_GATEWAY_API_KEY. Neither → the draft buttons answer 503.
  aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY || "",
  onVercel: Boolean(process.env.VERCEL),
  // A model id from https://ai-gateway.vercel.sh/v1/models.
  aiModel: process.env.AI_GATEWAY_MODEL || "anthropic/claude-haiku-5.5",
};
