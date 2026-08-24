import { useEffect, useState } from "react";
import { getLearningPosts } from "../../lib/api";

/**
 * Shared data hook for the Learning feature — used by both the full
 * /learning page and the homepage preview, so both read the same
 * loading/error/configured contract from a single place.
 * @returns {{
 *   status: "loading" | "loaded" | "error",
 *   configured: boolean,
 *   posts: import("../../lib/api").LearningPost[],
 *   message: string,
 *   retry: () => void,
 * }}
 */
export function useLearningPosts() {
  const [state, setState] = useState({
    status: "loading",
    configured: true,
    posts: [],
    message: "",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, status: "loading" }));

    getLearningPosts().then((result) => {
      if (cancelled) return;

      if (!result.success) {
        setState({
          status: "error",
          configured: true,
          posts: [],
          message:
            result.message || "Learning posts couldn't be loaded right now.",
        });
        return;
      }

      setState({
        status: "loaded",
        configured: result.configured !== false,
        posts: result.posts || [],
        message: "",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry() {
    setAttempt((current) => current + 1);
  }

  return { ...state, retry };
}
