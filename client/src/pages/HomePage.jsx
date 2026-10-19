import { Mail } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { PageHeader } from "../components/layout/PageHeader";
import { ButtonLink } from "../components/ui/ButtonLink";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { ProfileBanner } from "../features/profile/ProfileBanner";
import { ProfileIntro } from "../features/profile/ProfileIntro";
import { ProfileTabs } from "../features/profile/ProfileTabs";
import { ResumeTab } from "../features/profile/ResumeTab";
import { WorkTab } from "../features/profile/WorkTab";
import { ShareProfileButton } from "../features/profile/ShareProfileButton";
import { profile } from "../data/profile";
import { githubSnapshot } from "../data/github";
import { assetManifest } from "../generated/asset-manifest";

const PROFILE_TABS = [
  { id: "resume", label: "Resume", panel: <ResumeTab /> },
  { id: "work", label: "Work", panel: <WorkTab /> },
];

export function HomePage() {
  usePageMeta(PAGE_META["/"]);
  const portrait = assetManifest.profile.portraitSquare;

  return (
    <>
      <PageHeader
        actions={
          <>
            <ShareProfileButton />
            <ButtonLink
              to="/contact"
              leadingIcon={<Mail size={16} />}
              className="max-sm:px-3"
            >
              <span className="max-sm:sr-only">Get in touch</span>
            </ButtonLink>
          </>
        }
      >
        <ImageWithFallback
          src={portrait.src}
          fallbackSrc={portrait.fallback}
          alt=""
          width={42}
          height={42}
          className="size-9 shrink-0 rounded-full border border-(--color-border) object-cover sm:size-[2.625rem]"
        />
        <div className="min-w-0">
          <p className="truncate text-[1.0625rem] font-semibold tracking-[-0.01em] text-(--color-text-primary)">
            {profile.name}
          </p>
          {githubSnapshot.publicRepos > 0 ? (
            <p className="truncate text-[0.8125rem] text-(--color-text-muted)">
              {githubSnapshot.publicRepos} public repositories on GitHub
            </p>
          ) : null}
        </div>
      </PageHeader>
      <ProfileBanner />
      <ProfileIntro />
      <ProfileTabs label="Profile sections" tabs={PROFILE_TABS} />
    </>
  );
}
