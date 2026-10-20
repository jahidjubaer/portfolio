import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Camera } from "lucide-react";
import { ExternalSiteCard } from "../../src/features/showcase/ExternalSiteCard";
import { socialProfiles } from "../../src/data/profile";
import snapshot from "../../src/generated/content.json";

describe("ExternalSiteCard", () => {
  it("is one link to the original site, with how much is shown here", () => {
    render(
      <ExternalSiteCard
        href="https://jahid-thecapturecrew.blogspot.com"
        label="The Capture Crew"
        description="The full photo journal."
        icon={Camera}
        count={{ shown: 6, total: 33, noun: "photos" }}
      />,
    );
    const link = screen.getByRole("link", {
      name: /See everything on The Capture Crew/,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://jahid-thecapturecrew.blogspot.com",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveTextContent(
      "Showing 6 of 33 photos · jahid-thecapturecrew.blogspot.com",
    );
  });

  it("leaves out the count when everything is shown", () => {
    render(
      <ExternalSiteCard
        href="https://example.com"
        label="Example"
        icon={Camera}
        count={{ shown: 3, total: 3, noun: "posts" }}
      />,
    );
    expect(screen.getByRole("link")).not.toHaveTextContent("Showing");
  });
});

describe("socialProfiles", () => {
  it("leaves out profiles hidden in the admin", () => {
    const stored = snapshot.profile.socialProfiles;
    const hidden = stored.filter((social) => social.hidden);
    for (const social of hidden) {
      expect(socialProfiles.map((entry) => entry.id)).not.toContain(social.id);
    }
    expect(socialProfiles).toHaveLength(stored.length - hidden.length);
  });
});
