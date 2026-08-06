import { SectionLabel } from "../../components/ui/SectionLabel";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";

export function BeyondPortal() {
  return (
    <section className="border-b border-(--color-border) bg-(--color-surface) py-20">
      <Container className="text-center">
        <SectionLabel>Beyond the Code</SectionLabel>
        <h2 className="mt-3 text-2xl font-semibold text-(--color-text) sm:text-3xl">
          Photography, sports, and leadership
        </h2>
        <p className="mx-auto mt-4 max-w-prose text-sm text-(--color-text-muted)">
          Outside of engineering, I'm involved in photography, cricket and
          sports leadership, university club organisation, and volunteering.
        </p>
        <div className="mt-8">
          <ButtonLink to="/beyond" variant="secondary">
            Explore Beyond the Code
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
