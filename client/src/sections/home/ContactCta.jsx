import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";
import { profile } from "../../data/profile";

export function ContactCta() {
  return (
    <section className="py-20">
      <Container className="text-center">
        <h2 className="text-2xl font-semibold text-(--color-text) sm:text-3xl">
          Let's build something clear and useful.
        </h2>
        <p className="mx-auto mt-4 max-w-prose text-sm text-(--color-text-muted)">
          {profile.availabilityStatement}
        </p>
        <div className="mt-8">
          <ButtonLink to="/contact" variant="primary">
            Get in touch
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
