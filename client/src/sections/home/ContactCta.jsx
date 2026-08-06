import { ButtonLink } from "../../components/ui/ButtonLink";
import { Container } from "../../components/ui/Container";
import { StatusIndicator } from "../../components/ui/StatusIndicator";
import { Reveal } from "../../features/motion/Reveal";
import { profile } from "../../data/profile";

export function ContactCta() {
  return (
    <section className="section-spacing">
      <Container className="text-center">
        <Reveal>
          <h2 className="heading-xl text-(--color-text-primary)">
            Let&apos;s build something clear and useful.
          </h2>
          <p className="body-md mx-auto mt-4 max-w-prose text-(--color-text-secondary)">
            {profile.title} · {profile.location}
          </p>
          <div className="mt-6 flex justify-center">
            <StatusIndicator tone="positive">
              {profile.availabilityStatement}
            </StatusIndicator>
          </div>
          <div className="mt-8">
            <ButtonLink to="/contact" variant="primary" size="lg">
              Get in touch
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
