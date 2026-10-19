/**
 * Copy for the greeting popup (GreetingPopup) shown a few seconds after a
 * visitor arrives. Each quick reply opens the contact form with its
 * subject pre-filled — `subject` must match one of the ContactForm
 * suggestions.
 */
export const greeting = {
  salutation: "Assalamu Alaikum 👋",
  message:
    "Thanks for stopping by! How can I help you — or what are you looking for?",
  quickReplies: [
    { label: "I'm hiring", subject: "Job opportunity" },
    { label: "I have a project", subject: "Freelance project" },
    { label: "Let's collaborate", subject: "Collaboration" },
    { label: "Just saying hi", subject: "Just saying hi" },
  ],
};
