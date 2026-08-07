export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export async function getApiHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * @param {{ name: string, email: string, subject: string, message: string, companyWebsite?: string }} payload
 * @returns {Promise<{ success: boolean, message: string, errors?: Record<string, string> }>}
 */
export async function submitContactMessage(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Network failure (offline, DNS, CORS, server down) — never surface the
    // underlying error to the UI, just report that delivery didn't happen.
    return {
      success: false,
      message:
        "Could not reach the server. Please try again or email directly.",
    };
  }

  let body;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response (proxy error page, 502, etc.) — don't leak it.
    return {
      success: false,
      message: "Something went wrong. Please try again or email directly.",
    };
  }

  if (!response.ok && !body?.message) {
    return {
      success: false,
      message: "Something went wrong. Please try again or email directly.",
    };
  }

  return body;
}
