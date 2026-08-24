import { Layers, TrendingUp } from "lucide-react";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { Container } from "../../components/ui/Container";
import { Surface } from "../../components/ui/Surface";
import { Reveal } from "../../features/motion/Reveal";
import { StaggerGroup, StaggerItem } from "../../features/motion/StaggerGroup";
import { capabilityGroups } from "../../data/capabilities";

const GROUP_DESCRIPTIONS = {
  "current-strengths":
    "Tools I currently use to build responsive frontend experiences.",
  "engineering-foundations":
    "Core concepts that shape how I approach software problems.",
  "currently-expanding":
    "Areas I'm actively developing toward fuller product engineering.",
};

function findGroup(id) {
  return capabilityGroups.find((group) => group.id === id);
}

export function CapabilitiesPreview() {
  const current = findGroup("current-strengths");
  const foundations = findGroup("engineering-foundations");
  const expanding = findGroup("currently-expanding");

  return (
    <section className="section-spacing border-b border-(--color-border)">
      <Container>
        <SectionHeader label="Capabilities" heading="What I work with" />

        <div className="mt-12 space-y-6">
          {/* Tier 1 — current strengths: the most prominent surface, tools
              in active use today. */}
          <Reveal>
            <Surface
              variant="raised"
              className="border-(--color-border-strong) p-6 sm:p-8"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="eyebrow text-(--color-accent-primary)">
                  {current.title}
                </h3>
                <span className="mono-meta text-(--color-text-muted)">
                  {String(current.items.length).padStart(2, "0")}
                </span>
              </div>
              <p className="body-sm mt-2 max-w-prose text-(--color-text-secondary)">
                {GROUP_DESCRIPTIONS[current.id]}
              </p>
              <ul className="mt-6 flex flex-wrap gap-3">
                {current.items.map((item) => (
                  <li key={item}>
                    <span className="inline-flex items-center rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface) px-4 py-2 text-sm font-medium text-(--color-text-primary)">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Surface>
          </Reveal>

          {/* Tiers 2 + 3 — the structural layer underneath, and the
              forward-looking growth layer, side by side on desktop. */}
          <StaggerGroup as="div" className="grid gap-6 lg:grid-cols-2">
            <StaggerItem>
              <Surface className="h-full p-6">
                <div className="flex items-center gap-2">
                  <Layers
                    aria-hidden="true"
                    size={16}
                    className="text-(--color-text-muted)"
                  />
                  <h3 className="eyebrow text-(--color-text-primary)">
                    {foundations.title}
                  </h3>
                </div>
                <p className="body-sm mt-2 text-(--color-text-secondary)">
                  {GROUP_DESCRIPTIONS[foundations.id]}
                </p>
                <ol className="mt-6 space-y-3">
                  {foundations.items.map((item, index) => (
                    <li
                      key={item}
                      className="flex gap-3 border-t border-(--color-border) pt-3 first:border-t-0 first:pt-0"
                    >
                      <span className="mono-meta shrink-0 text-(--color-text-muted)">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="body-sm text-(--color-text-secondary)">
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
              </Surface>
            </StaggerItem>

            <StaggerItem>
              <Surface className="h-full p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    aria-hidden="true"
                    size={16}
                    className="text-(--color-accent-primary)"
                  />
                  <h3 className="eyebrow text-(--color-text-primary)">
                    {expanding.title}
                  </h3>
                </div>
                <p className="body-sm mt-2 text-(--color-text-secondary)">
                  {GROUP_DESCRIPTIONS[expanding.id]}
                </p>
                <ul className="mt-6 space-y-2">
                  {expanding.items.map((item) => (
                    <li
                      key={item}
                      className="body-sm flex items-center gap-2 text-(--color-text-secondary)"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-accent-primary)"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Surface>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </Container>
    </section>
  );
}
