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

/**
 * Single source of truth for the shell's navigation. The left rail shows
 * both groups (separated by a divider); the phone bottom bar shows only
 * PRIMARY_NAV, and SECONDARY_NAV stays reachable from the profile and the
 * command palette.
 */
export const PRIMARY_NAV = [
  { to: "/", label: "Profile", icon: CircleUserRound, end: true },
  { to: "/work", label: "Projects", icon: Package },
  { to: "/beyond", label: "Beyond", icon: Camera },
  { to: "/contact", label: "Contact", icon: Mail },
];

export const SECONDARY_NAV = [
  { to: "/credentials", label: "Credentials", icon: BadgeCheck },
  { to: "/learning", label: "Learning", icon: Sprout },
  { to: "/writing", label: "Writing", icon: PenLine },
  { to: "/resume", label: "Resume", icon: FileText },
];
