import { SectionHeader } from "../../components/ui/SectionHeader";
import { Container } from "../../components/ui/Container";
import { StaggerGroup, StaggerItem } from "../../features/motion/StaggerGroup";
import { capabilityGroups } from "../../data/capabilities";

export function CapabilitiesPreview() {
  return (
    <section className="section-spacing border-b border-(--color-border)">
      <Container>
        <SectionHeader label="Capabilities" heading="What I work with" />

        <StaggerGroup
          as="div"
          className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-3"
        >
          {capabilityGroups.map((group) => (
            <StaggerItem key={group.id}>
              <h3 className="label text-(--color-text-primary)">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2 border-l border-(--color-border) pl-4">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="body-sm text-(--color-text-secondary)"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
