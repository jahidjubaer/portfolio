import { Link } from "react-router-dom";
import { useDocumentHead } from "../../hooks/use-document-head";

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   heading: string,
 *   statement: string,
 *   showHomeLink?: boolean,
 * }} props
 */
export function RoutePlaceholder({
  title,
  description,
  heading,
  statement,
  showHomeLink = true,
}) {
  useDocumentHead({ title, description });

  return (
    <main id="main-content">
      <h1>{heading}</h1>
      <p>{statement}</p>
      {showHomeLink ? <Link to="/">Return to the homepage</Link> : null}
    </main>
  );
}
