import { useContext } from "react";
import { IdentityContext } from "./IdentityProvider";

/**
 * @returns {"system" | "story"}
 */
export function useIdentity() {
  const identity = useContext(IdentityContext);
  if (identity === null) {
    throw new Error("useIdentity must be used within an IdentityProvider");
  }
  return identity;
}
