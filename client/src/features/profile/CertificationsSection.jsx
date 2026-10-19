import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import {
  CERTIFICATION_CATEGORIES,
  certifications,
} from "../../data/certifications";

const groups = CERTIFICATION_CATEGORIES.map((category) => ({
  ...category,
  items: certifications.filter((item) => item.category === category.id),
})).filter((group) => group.items.length > 0);

/** @param {{ item: import("../../data/certifications").Certification }} props */
function CertificationCard({ item }) {
  return (
    <li className="flex gap-3.5 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-4">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-(--radius-sm) bg-(--color-accent-primary-soft) text-(--color-accent-primary)"
      >
        <BadgeCheck size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-(--color-text-primary)">
          {item.title}
        </h4>
        <p className="text-[0.9375rem] text-(--color-text-secondary)">
          {item.issuer}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {item.status === "in-progress" ? (
            <span className="rounded-full border border-dashed border-(--color-border-strong) px-2 py-0.5 text-(--color-text-secondary)">
              In progress
            </span>
          ) : (
            <span className="mono-meta tabular-nums text-(--color-text-muted)">
              {item.issued}
            </span>
          )}
          {item.credentialUrl ? (
            <a
              href={item.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-(--color-accent-primary) underline-offset-4 hover:underline"
            >
              Verify<span className="sr-only"> {item.title}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ) : null}
        </p>
        {item.description ? (
          <p className="mt-1.5 text-sm text-(--color-text-secondary)">
            {item.description}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/** Certificates & training, grouped by kind; renders nothing while empty. */
export function CertificationsSection() {
  if (groups.length === 0) return null;
  return (
    <ProfileSection
      id="certifications"
      icon={BadgeCheck}
      title="Certifications & training"
    >
      <div className="grid gap-5">
        {groups.map((group) => (
          <div key={group.id}>
            <h3 className="mb-2.5 text-sm font-semibold text-(--color-text-secondary)">
              {group.label}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <CertificationCard key={item.id} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}
