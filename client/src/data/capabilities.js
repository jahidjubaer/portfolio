import { skills } from "../generated/content.json";

/**
 * Capability groups, not skill levels or percentages, in the order set in
 * the admin panel. Grouped by honesty, not aspiration: "Currently
 * expanding" is being learned and must never be presented as expert-level.
 * @type {Array<{ id: string, title: string, description: string, accent: "primary" | "secondary" | "muted", items: string[] }>}
 */
export const capabilityGroups = [...skills].sort((a, b) => a.order - b.order);
