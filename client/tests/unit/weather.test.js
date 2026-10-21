import { describe, expect, it } from "vitest";
import {
  createWeather,
  particleCount,
  stepWeather,
} from "../../src/features/seasons/weather";
import { SEASON_OPTIONS } from "../../src/features/preferences/appearance-options";

const SEASONS = SEASON_OPTIONS.map((season) => season.id);

describe("season weather", () => {
  it("has weather for every season, and none for anything else", () => {
    for (const season of SEASONS) {
      expect(particleCount(season, 1440, 600), season).toBeGreaterThan(0);
    }
    expect(particleCount("darkroom", 1440, 600)).toBe(0);
  });

  it("gives a phone fewer particles, and caps a big screen", () => {
    for (const season of SEASONS) {
      const phone = particleCount(season, 375, 540);
      const desktop = particleCount(season, 1440, 600);
      expect(phone, season).toBeLessThan(desktop);
      expect(particleCount(season, 4000, 2000), season).toBe(
        particleCount(season, 8000, 4000),
      );
    }
  });

  it("keeps every particle near the canvas however long it runs", () => {
    for (const season of SEASONS) {
      const weather = createWeather(season, 800, 500);
      const count = weather.particles.length;
      for (let step = 0; step < 2000; step += 1) stepWeather(weather, 3);
      expect(weather.particles).toHaveLength(count);
      for (const particle of weather.particles) {
        expect(particle.x, season).toBeGreaterThanOrEqual(-40);
        expect(particle.x, season).toBeLessThanOrEqual(840);
        expect(particle.y, season).toBeGreaterThanOrEqual(-40);
        expect(particle.y, season).toBeLessThanOrEqual(540);
      }
    }
  });

  it("flashes lightning only in summer, and rarely", () => {
    const summer = createWeather("grishma", 800, 500);
    let flashes = 0;
    // One minute at 60 fps.
    for (let step = 0; step < 3600; step += 1) {
      if (stepWeather(summer, 1)) flashes += 1;
    }
    expect(flashes).toBeGreaterThanOrEqual(2);
    expect(flashes).toBeLessThanOrEqual(8);

    const winter = createWeather("sheet", 800, 500);
    for (let step = 0; step < 3600; step += 1) {
      expect(stepWeather(winter, 1)).toBe(false);
    }
  });
});
