export interface RoutePlaceholderProps {
  eyebrow: string;
  heading: string;
  description: string;
  phaseNote: string;
  showHomeLink?: boolean;
}

export function RoutePlaceholder({
  eyebrow,
  heading,
  description,
  phaseNote,
  showHomeLink = true,
}: RoutePlaceholderProps) {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-24">
      <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{heading}</h1>
      <p className="mt-4 text-base text-gray-700">{description}</p>
      <p className="mt-4 text-sm text-gray-500">{phaseNote}</p>
      {showHomeLink && (
        <p className="mt-8">
          <a href="/" className="underline underline-offset-4">
            Back to homepage
          </a>
        </p>
      )}
    </main>
  );
}
