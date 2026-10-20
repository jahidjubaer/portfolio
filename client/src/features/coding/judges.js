// VJudge's judge names → how the judges call themselves. Gym is
// Codeforces' training area; the gym solves synced so far are the Assiut
// University training sheets.
const JUDGE_LABELS = {
  CodeForces: { name: "Codeforces" },
  Gym: { name: "Codeforces Gym", note: "Assiut training sheets" },
  UVA: { name: "UVa" },
  EOlymp: { name: "E-Olymp" },
};

/** @param {string} judge VJudge's name for the judge */
export function judgeLabel(judge) {
  return JUDGE_LABELS[judge] ?? { name: judge };
}

/**
 * Where a judge's solves came from.
 * @param {JudgeStats} entry
 * @returns {"direct" | "vjudge" | "both"}
 */
export function judgeSource(entry) {
  if (entry.direct > 0 && entry.vjudge > 0) return "both";
  return entry.direct > 0 ? "direct" : "vjudge";
}
