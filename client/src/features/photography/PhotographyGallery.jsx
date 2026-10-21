import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";
import { PhotographyCard } from "./PhotographyCard";
import { PhotographyFilter } from "./PhotographyFilter";
import { PhotographyViewer } from "./PhotographyViewer";
import { supportsPhotoZoom, zoomClose, zoomOpen } from "./photo-zoom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  getAvailableCategories,
  getPhotographsByCategory,
  hasSelectableCategories,
} from "./photography-selectors";

/**
 * Contact-sheet photography grid with optional category filtering and an
 * accessible full-screen viewer. Where the browser supports view
 * transitions (and motion is allowed), a photo zooms out of its frame
 * into the viewer and back; otherwise the viewer fades. Renders nothing when there are no
 * photographs — callers should show a dedicated empty state instead of
 * mounting this component with an empty list.
 * @param {{ photographs: import("../../data/photography").Photograph[] }} props
 */
export function PhotographyGallery({ photographs }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const triggerRef = useRef(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const zoom = supportsPhotoZoom() && !reducedMotion;

  if (!photographs || photographs.length === 0) return null;

  const categories = getAvailableCategories(photographs);
  const showFilters = hasSelectableCategories(photographs);
  const visible = getPhotographsByCategory(activeCategory, photographs);
  const selectedIndex = visible.findIndex((photo) => photo.id === selectedId);
  const selected = selectedIndex >= 0 ? visible[selectedIndex] : null;

  function handleCategoryChange(category) {
    setActiveCategory(category);
    setSelectedId(null);
  }

  function openPhoto(photograph, triggerElement) {
    triggerRef.current = triggerElement;
    if (zoom) {
      zoomOpen(photograph.id, () => setSelectedId(photograph.id));
    } else {
      setSelectedId(photograph.id);
    }
  }

  function closeViewer() {
    if (zoom && selectedId) {
      zoomClose(selectedId, () => setSelectedId(null));
    } else {
      setSelectedId(null);
    }
    triggerRef.current?.focus();
  }

  function showPrevious() {
    if (selectedIndex > 0) setSelectedId(visible[selectedIndex - 1].id);
  }

  function showNext() {
    if (selectedIndex < visible.length - 1) {
      setSelectedId(visible[selectedIndex + 1].id);
    }
  }

  const viewer = selected ? (
    <PhotographyViewer
      photograph={selected}
      onClose={closeViewer}
      onPrevious={showPrevious}
      onNext={showNext}
      hasPrevious={selectedIndex > 0}
      hasNext={selectedIndex < visible.length - 1}
      zoom={zoom}
    />
  ) : null;

  return (
    <div>
      {showFilters ? (
        <PhotographyFilter
          categories={categories}
          activeCategory={activeCategory}
          onChange={handleCategoryChange}
        />
      ) : null}

      <p className="mono-meta mt-4 text-(--color-text-muted)">
        {visible.length} photograph{visible.length === 1 ? "" : "s"}
      </p>

      <StaggerGroup
        as="ul"
        className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
      >
        {visible.map((photo, index) => (
          <StaggerItem key={photo.id} as="li">
            <PhotographyCard
              photograph={photo}
              frame={index + 1}
              onSelect={openPhoto}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* With the zoom, the view transition animates opening and closing,
          so the viewer mounts and unmounts at once (no Motion fade). */}
      {zoom ? viewer : <AnimatePresence>{viewer}</AnimatePresence>}
    </div>
  );
}
