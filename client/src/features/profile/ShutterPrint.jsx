import { X } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { TechLogo } from "../../components/icons/TechIcons";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { cn } from "../../lib/cn";
import { getProjectCover } from "../../lib/project-assets";

// Prints are photographic paper in every theme: cream stock, dark ink.
const PAPER = "bg-[#f3efe6] text-[#1c1b19]";
const TILTS = [-2.5, 3, -4];

function PrintImage({ item, project }) {
  if (item.kind === "project" && project) {
    const cover = getProjectCover(project);
    return (
      <ImageWithFallback
        src={cover.src}
        srcSet={cover.srcSet}
        sizes="12rem"
        fallbackSrc={cover.fallback}
        alt=""
        width={cover.width ?? 640}
        height={cover.height ?? 400}
        className="size-full object-cover"
      />
    );
  }
  return (
    <span className="grid size-full place-items-center">
      <TechLogo name={item.name} size={34} className="text-white" />
    </span>
  );
}

function PrintCaption({ item }) {
  if (item.kind === "project") {
    return (
      <>
        <Link
          to={`/work/${item.slug}`}
          className="block truncate rounded-xs font-semibold underline decoration-[#1c1b19]/30 underline-offset-2 after:absolute after:inset-0 hover:decoration-[#1c1b19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c1b19]"
        >
          {item.name}
        </Link>
        <span className="mt-0.5 line-clamp-2 text-[0.6875rem] leading-snug text-[#4a4741] max-sm:hidden">
          {item.summary}
        </span>
      </>
    );
  }
  return (
    <>
      <span className="block truncate font-semibold">{item.name}</span>
      <span className="mt-0.5 line-clamp-2 text-[0.6875rem] leading-snug text-[#4a4741] max-sm:hidden">
        {skillNote(item)}
      </span>
    </>
  );
}

/** "Used in Sarabo, Bang Learner", from the projects' own stacks. */
function skillNote(item) {
  const usedIn = item.usedIn ?? [];
  if (usedIn.length > 0) {
    return `Used in ${usedIn.map((project) => project.title).join(", ")}`;
  }
  return item.learning ? "Learning it now" : "In my stack";
}

/**
 * One print from the banner's shutter (docs/14 R6): a picture of the item
 * and its name; a project's links to its case study. Only the newest print
 * is interactive; older ones lie behind it, tilted, and are hidden from
 * assistive technology since they're mostly covered.
 * @param {{
 *   item: import("./shutter-items").ShutterItem,
 *   project?: object,
 *   depth: number,
 *   onClear: () => void,
 * }} props  `depth`: 0 for the newest print.
 */
export function ShutterPrint({ item, project, depth, onClear }) {
  const top = depth === 0;
  const label = item.kind === "project" ? "Project" : "Stack";

  return (
    <motion.article
      aria-label={top ? `Print: ${item.name}` : undefined}
      aria-hidden={top ? undefined : true}
      inert={top ? undefined : true}
      initial={{ y: -24, opacity: 0, rotate: 0 }}
      animate={{
        y: depth * 5,
        x: depth * -7,
        opacity: 1,
        rotate: TILTS[depth % TILTS.length],
      }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      style={{ zIndex: 3 - depth }}
      className={cn(
        PAPER,
        "w-[6.75rem] rounded-[3px] p-1.5 pb-2 shadow-[0_10px_24px_-8px_rgb(0_0_0/0.55)] sm:w-48 sm:p-2 sm:pb-2.5",
        top ? "relative" : "absolute inset-x-0 top-0",
      )}
    >
      <div className="print-develop aspect-[16/10] overflow-hidden bg-[#141414]">
        <PrintImage item={item} project={project} />
      </div>
      <div className="mt-1.5 text-[0.75rem] leading-tight sm:text-[0.8125rem]">
        <span className="block font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#5c5852]">
          {label}
        </span>
        <PrintCaption item={item} />
      </div>
      {top ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear the prints"
          className="absolute -right-1 -top-1 z-10 grid size-11 place-items-center rounded-full focus-visible:outline-none [&:focus-visible>span]:outline-2 [&:focus-visible>span]:outline-offset-1 [&:focus-visible>span]:outline-white"
        >
          <span className="grid size-6 place-items-center rounded-full bg-[#1c1b19] text-white shadow">
            <X size={13} aria-hidden="true" />
          </span>
        </button>
      ) : null}
    </motion.article>
  );
}
