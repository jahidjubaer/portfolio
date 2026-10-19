import { useEffect, useState } from "react";

const TIME_ZONE = "Asia/Dhaka";

function formatNow() {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TIME_ZONE,
    }).format(new Date());
  } catch {
    return "";
  }
}

/**
 * Jahid's local time (Sylhet, GMT+6), refreshed every 15 s while the tab is
 * visible. Rendered in a <time> so it reads as a time, not decoration.
 * @param {{ className?: string }} props
 */
export function LocalTime({ className }) {
  const [now, setNow] = useState(formatNow);

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setNow(formatNow());
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className={className} aria-label={`Local time in Sylhet: ${now}`}>
      {now}
    </time>
  );
}
