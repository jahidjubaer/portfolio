/**
 * Each season's weather (docs/15 S2) as plain particle systems, drawn by
 * SeasonWeather.jsx on one canvas. `create` places the particles for a
 * canvas size, `step` moves them by `dt` (in 60 fps frames, so a slow
 * frame doesn't slow the weather), `draw` paints them. Particles that
 * leave the canvas come back on the other side, so the count never
 * changes.
 */

const TAU = Math.PI * 2;

/** Most particles at full size; a phone gets the share its area allows. */
const DENSITY = {
  grishma: { per: 16000, max: 70 },
  barsha: { per: 5200, max: 220 },
  sharat: { per: 26000, max: 42 },
  hemanta: { per: 22000, max: 48 },
  sheet: { per: 7000, max: 170 },
  basanta: { per: 24000, max: 46 },
};

/**
 * @param {string} season
 * @param {number} width
 * @param {number} height
 */
export function particleCount(season, width, height) {
  const density = DENSITY[season];
  if (!density) return 0;
  return Math.min(density.max, Math.round((width * height) / density.per));
}

const between = (random, low, high) => low + random() * (high - low);

function wrap(particle, width, height, margin) {
  if (particle.y > height + margin) {
    particle.y = -margin;
    particle.x = Math.random() * width;
  }
  if (particle.x > width + margin) particle.x = -margin;
  if (particle.x < -margin) particle.x = width + margin;
}

/* Snow: round flakes, near ones bigger and faster, swaying. */
function snowflake(random, width, height) {
  const depth = random();
  return {
    x: random() * width,
    y: random() * height,
    r: 1.3 + depth * 3.2,
    vy: 0.35 + depth * 0.9,
    sway: random() * TAU,
    swaySpeed: between(random, 0.01, 0.03),
    alpha: 0.55 + depth * 0.4,
  };
}

/* Rain: thin slanted streaks. */
function raindrop(random, width, height) {
  const depth = random();
  return {
    x: random() * width,
    y: random() * height,
    length: 9 + depth * 16,
    vy: 9 + depth * 8,
    vx: -1.6 - depth,
    alpha: 0.18 + depth * 0.32,
  };
}

/* Kash plumes, husks, petals, dust: things the air carries. */
function drifter(random, width, height, { fall, drift, size, spin }) {
  const depth = random();
  return {
    x: random() * width,
    y: random() * height,
    size: size[0] + depth * (size[1] - size[0]),
    vy: fall[0] + depth * (fall[1] - fall[0]),
    vx: drift[0] + depth * (drift[1] - drift[0]),
    sway: random() * TAU,
    swaySpeed: between(random, 0.008, 0.02),
    angle: random() * TAU,
    spin: between(random, -spin, spin),
    alpha: 0.45 + depth * 0.45,
  };
}

/* Slow banks of fog or mist, wide and soft. */
function bank(random, width, height) {
  return {
    x: random() * width,
    y: height * between(random, 0.15, 0.85),
    rx: width * between(random, 0.25, 0.5),
    ry: height * between(random, 0.08, 0.18),
    vx: between(random, 0.08, 0.25) * (random() < 0.5 ? -1 : 1),
    alpha: between(random, 0.12, 0.24),
  };
}

const DRIFTERS = {
  sharat: { fall: [0.05, 0.25], drift: [0.35, 0.9], size: [8, 14], spin: 0.01 },
  hemanta: { fall: [0.3, 0.75], drift: [0.1, 0.4], size: [2.5, 5], spin: 0.04 },
  basanta: { fall: [0.45, 1.1], drift: [0.15, 0.6], size: [4, 8], spin: 0.03 },
  grishma: { fall: [-0.15, 0.12], drift: [0.2, 0.6], size: [0.8, 2], spin: 0 },
};

const BANKS = { sheet: 4, hemanta: 3, sharat: 3 };

/**
 * @param {string} season
 * @param {number} width
 * @param {number} height
 * @param {() => number} [random]
 */
export function createWeather(season, width, height, random = Math.random) {
  const count = particleCount(season, width, height);
  const particles = [];
  for (let index = 0; index < count; index += 1) {
    if (season === "sheet") particles.push(snowflake(random, width, height));
    else if (season === "barsha")
      particles.push(raindrop(random, width, height));
    else particles.push(drifter(random, width, height, DRIFTERS[season]));
  }
  const banks = [];
  for (let index = 0; index < (BANKS[season] ?? 0); index += 1) {
    banks.push(bank(random, width, height));
  }
  return { season, width, height, particles, banks, flash: 0, nextFlash: 240 };
}

/**
 * @param {ReturnType<typeof createWeather>} weather
 * @param {number} dt
 * @param {() => number} [random]
 * @returns {boolean} true when lightning struck in this step
 */
export function stepWeather(weather, dt, random = Math.random) {
  const { season, width, height } = weather;
  for (const particle of weather.particles) {
    if (particle.sway !== undefined) particle.sway += particle.swaySpeed * dt;
    const sway = particle.sway === undefined ? 0 : Math.sin(particle.sway);
    particle.x += ((particle.vx ?? 0) + sway * 0.4) * dt;
    particle.y += particle.vy * dt;
    if (particle.angle !== undefined) particle.angle += particle.spin * dt;
    if (season === "grishma" && particle.y < -10) particle.y = height + 10;
    wrap(particle, width, height, 30);
  }
  for (const fog of weather.banks) {
    fog.x += fog.vx * dt;
    if (fog.x - fog.rx > width) fog.x = -fog.rx;
    if (fog.x + fog.rx < 0) fog.x = width + fog.rx;
  }
  // Grishma: a far flash now and then (every 8–20 s at 60 fps).
  if (season !== "grishma") return false;
  weather.flash = Math.max(0, weather.flash - 0.05 * dt);
  weather.nextFlash -= dt;
  if (weather.nextFlash > 0) return false;
  weather.nextFlash = between(random, 480, 1200);
  weather.flash = 1;
  return true;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<typeof createWeather>} weather
 * @param {{ light: boolean, accent: string, ink: string }} colors
 */
export function drawWeather(ctx, weather, colors) {
  const { season, width, height } = weather;
  ctx.clearRect(0, 0, width, height);

  for (const fog of weather.banks) {
    const glow = ctx.createRadialGradient(
      fog.x,
      fog.y,
      0,
      fog.x,
      fog.y,
      fog.rx,
    );
    const tone = colors.light ? "255, 255, 255" : "246, 239, 220";
    const alpha = colors.light ? fog.alpha * 2 : fog.alpha * 0.5;
    glow.addColorStop(0, `rgba(${tone}, ${alpha})`);
    glow.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.save();
    ctx.translate(fog.x, fog.y);
    ctx.scale(1, fog.ry / fog.rx);
    ctx.translate(-fog.x, -fog.y);
    ctx.fillStyle = glow;
    ctx.fillRect(fog.x - fog.rx, fog.y - fog.rx, fog.rx * 2, fog.rx * 2);
    ctx.restore();
  }

  if (season === "sheet") {
    // White flakes on a pale sky need a soft grey rim to show.
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(70, 90, 100, 0.55)";
    ctx.lineWidth = 0.8;
    for (const flake of weather.particles) {
      ctx.globalAlpha = flake.alpha;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.r, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  } else if (season === "barsha") {
    ctx.strokeStyle = colors.light ? "#3f6f8c" : "#cfeee0";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (const drop of weather.particles) {
      ctx.globalAlpha = drop.alpha;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      const scale = drop.length / drop.vy;
      ctx.lineTo(drop.x - drop.vx * scale, drop.y - drop.length);
      ctx.stroke();
    }
  } else if (season === "sharat") {
    // Kash: a little white plume, a shadowed tuft on the pale blue.
    for (const plume of weather.particles) {
      ctx.globalAlpha = plume.alpha;
      ctx.save();
      ctx.translate(plume.x, plume.y);
      ctx.rotate(plume.angle);
      ctx.strokeStyle = "rgba(60, 100, 140, 0.22)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, plume.size * 1.3);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      for (let fibre = 0; fibre < 7; fibre += 1) {
        const turn = -Math.PI / 2 + ((fibre - 3) / 3) * 0.9;
        ctx.moveTo(0, 0);
        ctx.ellipse(
          Math.cos(turn) * plume.size * 0.5,
          Math.sin(turn) * plume.size * 0.5,
          plume.size * 0.5,
          plume.size * 0.14,
          turn,
          0,
          TAU,
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  } else if (season === "basanta" || season === "hemanta") {
    // Shimul petals, or golden paddy husks.
    const fill = season === "basanta" ? "#e8472f" : "#e3b743";
    const rim = season === "basanta" ? "#b3261e" : "#a07a1c";
    for (const leaf of weather.particles) {
      ctx.globalAlpha = leaf.alpha;
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);
      // Tumbling: the petal's width shrinks and grows as it turns.
      ctx.scale(Math.max(0.25, Math.abs(Math.cos(leaf.sway))), 1);
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size * 0.55, leaf.size, 0, 0, TAU);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = rim;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    }
  } else if (season === "grishma") {
    ctx.fillStyle = colors.accent;
    for (const mote of weather.particles) {
      ctx.globalAlpha = mote.alpha * 0.5;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.size, 0, TAU);
      ctx.fill();
    }
    if (weather.flash > 0) {
      // Far off and faint: a glow over the top of the sky, no strobe.
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, `rgba(220, 230, 255, ${0.16 * weather.flash})`);
      sky.addColorStop(1, "rgba(220, 230, 255, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);
    }
  }
  ctx.globalAlpha = 1;
}
