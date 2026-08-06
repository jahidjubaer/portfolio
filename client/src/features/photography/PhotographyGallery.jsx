import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";
import { PhotographyCard } from "./PhotographyCard";
import { PhotographyFilter } from "./PhotographyFilter";
import { PhotographyViewer } from "./PhotographyViewer";
import {
  getAvailableCategories,
  getPhotographsByCategory,
  hasSelectableCategories,
} from "./photography-selectors";

/**
 * Editorial photography grid with optional category filtering and an
 * accessible full-screen viewer. Renders nothing when there are no
 * photographs — callers should show a dedicated empty state instead of
 * mounting this component with an empty list.
 * @param {{ photographs: import("../../data/photography").Photograph[] }} props
 */
export function PhotographyGallery({ photographs }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const triggerRef = useRef(null);

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
    setSelectedId(photograph.id);
  }

  function closeViewer() {
    setSelectedId(null);
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
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((photo) => (
          <StaggerItem key={photo.id} as="li">
            <PhotographyCard photograph={photo} onSelect={openPhoto} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <AnimatePresence>
        {selected ? (
          <PhotographyViewer
            photograph={selected}
            onClose={closeViewer}
            onPrevious={showPrevious}
            onNext={showNext}
            hasPrevious={selectedIndex > 0}
            hasNext={selectedIndex < visible.length - 1}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
