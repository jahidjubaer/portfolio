import { useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { TextLink } from "../../components/ui/TextLink";
import { ContactField } from "./ContactField";
import { ContactStatus } from "./ContactStatus";
import { validateContactForm, CONTACT_LIMITS } from "./contact-validation";
import { submitContactMessage } from "../../lib/api";
import { profile } from "../../data/profile";

const INITIAL_VALUES = {
  name: "",
  email: "",
  subject: "",
  message: "",
  companyWebsite: "",
};

/**
 * Professional contact form: client + server validation, a honeypot field,
 * and loading/success/failure states. Typed content is preserved on
 * failure so the user never has to retype their message.
 */
export function ContactForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const statusRef = useRef(null);

  function updateField(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function focusStatus() {
    // Wait one frame so the status region has mounted before focusing it.
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (status === "loading") return; // guards against duplicate rapid submits

    const fieldErrors = validateContactForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("loading");
    setStatusMessage("");

    const result = await submitContactMessage(values);

    if (result.success) {
      setStatus("success");
      setStatusMessage(result.message || "Your message has been received.");
      setValues(INITIAL_VALUES);
      setErrors({});
      focusStatus();
      return;
    }

    if (result.errors) {
      setErrors(result.errors);
      setStatus(null);
      setStatusMessage("");
      return;
    }

    setStatus("error");
    setStatusMessage(
      result.message ||
        "Something went wrong. Please try again or email directly.",
    );
    focusStatus();
  }

  const isSubmitting = status === "loading";

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-8 max-w-xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <ContactField
          id="name"
          label="Name"
          value={values.name}
          onChange={(value) => updateField("name", value)}
          error={errors.name}
          maxLength={CONTACT_LIMITS.name.max}
          autoComplete="name"
        />
        <ContactField
          id="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={(value) => updateField("email", value)}
          error={errors.email}
          maxLength={CONTACT_LIMITS.email.max}
          autoComplete="email"
        />
      </div>

      <div className="mt-6">
        <ContactField
          id="subject"
          label="Subject"
          value={values.subject}
          onChange={(value) => updateField("subject", value)}
          error={errors.subject}
          maxLength={CONTACT_LIMITS.subject.max}
        />
      </div>

      <div className="mt-6">
        <ContactField
          id="message"
          label="Message"
          as="textarea"
          value={values.message}
          onChange={(value) => updateField("message", value)}
          error={errors.message}
          maxLength={CONTACT_LIMITS.message.max}
        />
      </div>

      {/* Honeypot — visually hidden, unreachable by keyboard, invisible to
          assistive tech. A real visitor never sees or fills this. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        <label htmlFor="companyWebsite">Company website</label>
        <input
          id="companyWebsite"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.companyWebsite}
          onChange={(event) =>
            updateField("companyWebsite", event.target.value)
          }
        />
      </div>

      <div className="mt-8">
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </div>

      {status ? (
        <ContactStatus ref={statusRef} state={status} message={statusMessage} />
      ) : null}

      {status === "error" ? (
        <p className="body-sm mt-4 text-(--color-text-muted)">
          Your message is still in the form above — nothing was lost. You can
          try again, or email me directly at{" "}
          <TextLink
            href={`mailto:${profile.email}`}
            className="underline underline-offset-4"
          >
            {profile.email}
          </TextLink>
          .
        </p>
      ) : null}
    </form>
  );
}
