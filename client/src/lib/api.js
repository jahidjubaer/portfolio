export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export async function getApiHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Submits the contact form directly to Web3Forms from the browser — this is
 * Web3Forms's supported flow; their access keys are meant to be used
 * client-side (server-side calls require a paid plan and IP safelisting and
 * are otherwise rejected).
 *
 * @param {{ name: string, email: string, subject: string, message: string, companyWebsite?: string }} payload
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function submitContactMessage(payload) {
  // Honeypot: a bot fills this hidden field. Report success without ever
  // contacting Web3Forms — telling it "rejected" would just teach it to
  // remove the honeypot field first.
  if (payload.companyWebsite) {
    return { success: true, message: "Your message has been received." };
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return {
      success: false,
      message:
        "The contact form is temporarily unavailable. Please email directly instead.",
    };
  }

  let response;
  try {
    response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: payload.name,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        // Web3Forms's own spam field, distinct from our honeypot above — a
        // real submission always sends it empty.
        botcheck: "",
      }),
    });
  } catch {
    // Network failure (offline, DNS, CORS, Web3Forms down) — never surface
    // the underlying error to the UI, just report that delivery didn't happen.
    return {
      success: false,
      message:
        "Could not reach the server. Please try again or email directly.",
    };
  }

  if (response.status === 429) {
    return {
      success: false,
      message: "Too many messages sent. Please try again later.",
    };
  }

  let body;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response (gateway error page, etc.) — don't leak it.
    return {
      success: false,
      message: "Something went wrong. Please try again or email directly.",
    };
  }

  if (!response.ok || !body?.success) {
    return {
      success: false,
      message: "Something went wrong. Please try again or email directly.",
    };
  }

  return { success: true, message: "Your message has been received." };
}

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   url: string,
 *   publishedAt: string | null,
 *   updatedAt: string | null,
 *   excerpt: string,
 *   thumbnail: string | null,
 *   labels: string[],
 * }} LearningPost
 */

/**
 * Fetches normalized Blogger posts through the same-origin API — the client
 * never talks to Blogger directly.
 * @returns {Promise<{ success: boolean, configured?: boolean, posts?: LearningPost[], message?: string }>}
 */
export async function getLearningPosts() {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/blog/posts`);
  } catch {
    return {
      success: false,
      message: "Learning posts couldn't be loaded right now.",
    };
  }

  let body;
  try {
    body = await response.json();
  } catch {
    return {
      success: false,
      message: "Learning posts couldn't be loaded right now.",
    };
  }

  if (!response.ok || !body?.success) {
    return {
      success: false,
      message: body?.message || "Learning posts couldn't be loaded right now.",
    };
  }

  return body;
}
