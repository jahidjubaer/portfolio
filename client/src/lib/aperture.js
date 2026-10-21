/*
 * Aperture geometry shared by the theme switch and the opening
 * animation: a six-bladed aperture opens as a hexagon.
 */

/**
 * A hexagon (the opening of a six-bladed aperture) as a CSS polygon,
 * centred on (x, y), turned by `rotation` radians.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} rotation
 */
export function hexagonPolygon(x, y, radius, rotation = 0) {
  const points = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = rotation + (Math.PI / 3) * i;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(`${px.toFixed(1)}px ${py.toFixed(1)}px`);
  }
  return `polygon(${points.join(", ")})`;
}

/**
 * The sheet's clip-path at `progress` (0 closed, 1 open): the full screen
 * with a hexagonal hole cut out of its centre, turning as it widens like
 * aperture blades. One evenodd polygon (screen outline, then the hole),
 * so every step has the same points and Motion can tween between them.
 * @param {number} progress
 * @param {number} width
 * @param {number} height
 */
export function apertureClip(progress, width, height) {
  const x = width / 2;
  const y = height / 2;
  // Wide enough that the hexagon's flat sides clear the corners.
  const radius = (Math.hypot(x, y) / Math.cos(Math.PI / 6)) * progress;
  const hole = hexagonPolygon(x, y, radius, (Math.PI / 3) * progress)
    .slice("polygon(".length, -1)
    .split(", ");
  const outline = ["0px 0px", `${width}px 0px`, `${width}px ${height}px`];
  return `polygon(evenodd, ${[
    ...outline,
    `0px ${height}px`,
    "0px 0px",
    ...hole,
    hole[0],
    "0px 0px",
  ].join(", ")})`;
}
