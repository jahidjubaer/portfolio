import { createContext, useContext } from "react";

/**
 * Shared by every admin page once signed in.
 * @typedef {{
 *   admin: { id: number, login: string, avatarUrl: string },
 *   content: Record<string, any>,
 *   reload: () => Promise<void>,
 * }} AdminState
 */

/** @type {import("react").Context<AdminState | null>} */
export const AdminContext = createContext(null);

/** @returns {AdminState} */
export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside AdminLayout.");
  return value;
}
