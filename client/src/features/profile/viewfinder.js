/**
 * Timing shared by the profile's viewfinder banner and the portrait's
 * focus lock: the banner's focus point travels to the portrait over
 * INTRO_MS, and the portrait's corners close in as it arrives.
 */
export const INTRO_MS = 1100;

// Out-of-focus "bokeh" lights in the banner, as fractions of its size:
// x, y, radius (of the banner height), and tone (0 hi, 1 mid, 2 lo).
// Fixed, so the scene is identical on every load and in the prerender.
export const BOKEH = [
  [0.04, 0.3, 0.2, 2],
  [0.09, 0.72, 0.13, 1],
  [0.14, 0.18, 0.09, 0],
  [0.19, 0.55, 0.24, 2],
  [0.25, 0.86, 0.1, 1],
  [0.29, 0.28, 0.15, 1],
  [0.34, 0.66, 0.11, 0],
  [0.4, 0.14, 0.21, 2],
  [0.44, 0.48, 0.09, 1],
  [0.5, 0.24, 0.12, 0],
  [0.55, 0.62, 0.2, 2],
  [0.6, 0.12, 0.1, 1],
  [0.64, 0.42, 0.16, 1],
  [0.69, 0.8, 0.12, 0],
  [0.74, 0.26, 0.23, 2],
  [0.79, 0.58, 0.1, 0],
  [0.83, 0.16, 0.13, 1],
  [0.88, 0.7, 0.19, 2],
  [0.93, 0.36, 0.1, 0],
  [0.97, 0.82, 0.15, 1],
  [0.22, 0.38, 0.06, 0],
  [0.47, 0.8, 0.15, 1],
  [0.71, 0.55, 0.06, 0],
  [0.12, 0.92, 0.17, 2],
  [0.86, 0.94, 0.08, 1],
];
