import { photos } from "../generated/content.json";

/**
 * @typedef {{
 *   id: string,
 *   src: string,
 *   width: number,
 *   height: number,
 *   title: string | null,
 *   category: string,
 *   alt: string,
 * }} Photograph
 */

/**
 * Photographs for the Beyond gallery, edited in the admin panel (Photos)
 * and read from the published content snapshot, in the admin's order.
 * The album name is the gallery's filter category.
 * @param {Array<{ id: string, order: number, image: { url: string, width: number, height: number }, alt: string, caption?: string, album: string }>} list
 * @returns {Photograph[]}
 */
export function buildPhotographs(list = photos) {
  return [...list]
    .sort((a, b) => a.order - b.order)
    .map((photo) => ({
      id: photo.id,
      src: photo.image.url,
      width: photo.image.width,
      height: photo.image.height,
      title: photo.caption ?? null,
      category: photo.album,
      alt: photo.alt,
    }));
}

export const photographs = buildPhotographs();
