import { SectionLabel } from "../../components/ui/SectionLabel";
import { Container } from "../../components/ui/Container";
import { capabilityGroups } from "../../data/capabilities";

export function CapabilitiesPreview() {
  return (
    <section className="border-b border-(--color-border) py-20">
      <Container>
        <SectionLabel>Capabilities</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold text-(--color-text) sm:text-3xl">
          What I work with
        </h2>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {capabilityGroups.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-semibold text-(--color-text)">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-(--color-text-muted)">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
