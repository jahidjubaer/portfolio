import {
  BadgeCheck,
  Camera,
  CircleUserRound,
  FileText,
  Mail,
  Package,
  PenLine,
  Sprout,
} from "lucide-react";
import { navSetting } from "../data/settings";

/**
 * Single source of truth for the shell's navigation. The left rail shows
 * both groups (separated by a divider); the phone bottom bar shows only
 * PRIMARY_NAV, and SECONDARY_NAV stays reachable from the profile and the
 * command palette. Labels and visibility come from Site settings.
 */

/** Renamed per Site settings, or null when the page is hidden from menus. */
function applySetting(item) {
  const setting = navSetting(item.to, item.label);
  return setting.visible ? { ...item, label: setting.label } : null;
}

export const PRIMARY_NAV = [
  { to: "/", label: "Profile", icon: CircleUserRound, end: true },
  { to: "/work", label: "Projects", icon: Package },
  { to: "/beyond", label: "Beyond", icon: Camera },
  { to: "/contact", label: "Contact", icon: Mail },
]
  .map(applySetting)
  .filter(Boolean);

export const SECONDARY_NAV = [
  { to: "/credentials", label: "Credentials", icon: BadgeCheck },
  { to: "/learning", label: "Learning", icon: Sprout },
  { to: "/writing", label: "Writing", icon: PenLine },
  { to: "/resume", label: "Resume", icon: FileText },
]
  .map(applySetting)
  .filter(Boolean);
