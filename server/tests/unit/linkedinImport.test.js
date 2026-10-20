import { describe, expect, it } from "vitest";
import {
  buildLinkedInImport,
  parseCsv,
  parseLinkedInDate,
} from "../../src/db/linkedin-import.js";

describe("parseCsv", () => {
  it("handles quotes, doubled quotes, newlines in fields, and a BOM", () => {
    const text =
      '﻿Name,Description\r\n"Club, Inc.","Said ""hi""\nthen left"\r\nPlain,\r\n';
    expect(parseCsv(text)).toEqual([
      { Name: "Club, Inc.", Description: 'Said "hi"\nthen left' },
      { Name: "Plain", Description: "" },
    ]);
  });
});

describe("parseLinkedInDate", () => {
  it.each([
    ["Nov 2024", "2024-11"],
    ["2020", "2020"],
    ["", undefined],
    ["sometime", undefined],
  ])("%s → %s", (input, output) => {
    expect(parseLinkedInDate(input)).toBe(output);
  });
});

const CONTENT = {
  organizations: [
    { id: "kaggle", name: "Kaggle" },
    { id: "metropolitan-university", name: "Metropolitan University" },
    {
      id: "photo-society",
      name: "Metropolitan University Photographic Society",
    },
    { id: "red-crescent-youth-rcy", name: "Red Crescent Youth (RCY)" },
  ],
  certifications: [
    { id: "kaggle-pandas", title: "Pandas" },
    { id: "edge", title: "Python Programming & Basic Data Science" },
    { id: "ws", title: "Photography Workshop 2023" },
    {
      id: "patrol",
      title: "Patrol Leader Course, 5th National Power & Energy Camp",
    },
  ],
  education: [
    {
      id: "bsc",
      organizationId: "metropolitan-university",
      degree: "BSc",
      start: "2022",
    },
    {
      id: "hsc",
      organizationId: "abu-abbas-collage",
      degree: "Higher Secondary School Certificate (HSC)",
      start: "2019",
    },
  ],
  experience: [
    {
      id: "rcy",
      organizationId: "red-crescent-youth-rcy",
      roles: [{ title: "Volunteer", start: "2019" }],
    },
  ],
};

const FILES = {
  "Certifications.csv": [
    "Name,Url,Authority,Started On,Finished On,License Number",
    "Pandas,,Kaggle,Apr 2025,,",
    "Python Programming and Basic Data Science,,SUST,Dec 2024,,",
    "Photography Wrokshop 2023,,Metropolitan University Photography Society,2023,,",
    "Patrol Leader Course,,Ministry,Dec 2016,,1038",
    "Photography Basics,https://example.com/c,MuktoPaath,2020,,",
    "Undated Course,,Somewhere,,,",
  ].join("\n"),
  "Education.csv": [
    "School Name,Start Date,End Date,Notes,Degree Name,Activities",
    "Metropolitan University Bangladesh,Jul 2022,Jul 2026,,Bachelor of science,",
    '"Abu Abbas College , Netrokuna",Jun 2019,Dec 2021,,Higher Secondary School Certificate,',
    "Takerghat School,Jan 2009,Jan 2019,,Secondary School Certificate,",
  ].join("\n"),
  "Organizations.csv": [
    "Name,Description,Position,Started On,Finished On",
    '"Regional Cooperation Association - RCA",A social organization,Treasurer (2022 - 2025),Jul 2019,',
    "Tahirpur Development Society,,Science and IT Secretary,Dec 2024,",
  ].join("\n"),
  "Volunteering.csv": [
    "Company Name,Role,Cause,Started On,Finished On,Description",
    "Bangladesh Red Crescent Society (BDRCS),R.C.Y Volunteer,socialServices,Jul 2019,Jun 2021,",
  ].join("\n"),
};

describe("buildLinkedInImport", () => {
  const { candidates, skipped } = buildLinkedInImport(FILES, CONTENT);
  const byLabel = (label) =>
    candidates.find((candidate) => candidate.label.startsWith(label));

  it("recognises what's already on the site despite rewording and typos", () => {
    expect(byLabel("Pandas").exists).toBe(true);
    expect(byLabel("Python Programming").exists).toBe(true);
    expect(byLabel("Photography Wrokshop").exists).toBe(true);
    expect(byLabel("Patrol Leader").exists).toBe(true);
    expect(byLabel("Bachelor of science").exists).toBe(true);
    expect(byLabel("Higher Secondary").exists).toBe(true);
    expect(byLabel("R.C.Y Volunteer").exists).toBe(true);
  });

  it("maps new certifications with a new organization", () => {
    const cert = byLabel("Photography Basics");
    expect(cert.exists).toBe(false);
    expect(cert.newOrganization).toEqual({
      id: "muktopaath",
      name: "MuktoPaath",
    });
    expect(cert.item).toEqual({
      id: "photography-basics",
      title: "Photography Basics",
      organizationId: "muktopaath",
      kind: "certification",
      status: "completed",
      issued: "2020",
      credentialUrl: "https://example.com/c",
    });
  });

  it("takes role years from the title and marks open roles current", () => {
    const rca = byLabel("Treasurer");
    expect(rca.item.category).toBe("leadership");
    expect(rca.item.roles).toEqual([
      {
        title: "Treasurer",
        start: "2022",
        end: "2025",
        description: "A social organization",
      },
    ]);
    expect(byLabel("Science and IT Secretary").item.roles[0]).toEqual({
      title: "Science and IT Secretary",
      start: "2024-12",
      current: true,
    });
  });

  it("adds new schools with their dates", () => {
    const ssc = byLabel("Secondary School Certificate");
    expect(ssc.exists).toBe(false);
    expect(ssc.item).toMatchObject({ start: "2009-01", end: "2019-01" });
  });

  it("skips certifications without a date instead of guessing", () => {
    expect(skipped).toEqual([
      expect.objectContaining({
        label: "Undated Course",
        reason: "No issue date in LinkedIn.",
      }),
    ]);
  });

  it("gives a usable id to titles in other scripts", () => {
    const { candidates: bengali } = buildLinkedInImport(
      {
        "Certifications.csv":
          "Name,Url,Authority,Started On,Finished On,License Number\n৫ম আঞ্চলিক স্কাউট সমাবেশ,,Bangladesh Scouts,Jan 2018,,",
      },
      {
        organizations: [{ id: "bangladesh-scouts", name: "Bangladesh Scouts" }],
      },
    );
    expect(bengali[0].item.id).toBe("bangladesh-scouts-2018-01");
    expect(bengali[0].newOrganization).toBeNull();
  });
});
