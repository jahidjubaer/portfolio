/**
 * GitHub facts for the right rail ("Recently on GitHub"), the profile
 * stats, and project cards (language, last update). Same shape as the
 * `github` key of the API's content snapshot (server
 * `getGitHubSnapshot`), which the admin's GitHub sync keeps current. Until
 * the R7 build reads that snapshot, this is a copy captured from the
 * public GitHub API on 2026-10-19.
 *
 * Follower and star counts are deliberately not shown on the site — they
 * are still low and would weaken rather than support the profile.
 *
 * @typedef {{ name: string, url: string, language: string | null, stars: number, homepage: string | null, pushedAt: string }} RepoCard
 */
export const githubSnapshot = {
  username: "jahidjubaer",
  profileUrl: "https://github.com/jahidjubaer",
  repositoriesUrl: "https://github.com/jahidjubaer?tab=repositories",
  publicRepos: 37,
  syncedAt: "2026-10-19T06:45:00Z",
  /** @type {RepoCard[]} newest push first; forks and archived repos left out */
  recentRepos: [
    {
      name: "portfolio",
      url: "https://github.com/jahidjubaer/portfolio",
      language: "JavaScript",
      stars: 0,
      homepage: "https://portfolio-rouge-ten-75d2q3rm0r.vercel.app",
      pushedAt: "2026-10-18T17:21:00Z",
    },
    {
      name: "sarabo-doc",
      url: "https://github.com/jahidjubaer/sarabo-doc",
      language: "TeX",
      stars: 0,
      homepage: null,
      pushedAt: "2026-10-18T10:29:15Z",
    },
    {
      name: "sarabo-client",
      url: "https://github.com/jahidjubaer/sarabo-client",
      language: "JavaScript",
      stars: 0,
      homepage: "https://sarabo-client-six.vercel.app",
      pushedAt: "2026-10-18T09:02:07Z",
    },
  ],
  /** @type {Record<string, RepoCard>} repos that projects link to, by lower-cased name */
  repos: {
    "sarabo-client": {
      name: "sarabo-client",
      url: "https://github.com/jahidjubaer/sarabo-client",
      language: "JavaScript",
      stars: 0,
      homepage: "https://sarabo-client-six.vercel.app",
      pushedAt: "2026-10-18T09:02:07Z",
    },
    "sarabo-server": {
      name: "sarabo-server",
      url: "https://github.com/jahidjubaer/sarabo-server",
      language: "JavaScript",
      stars: 0,
      homepage: "https://sarabo-server.vercel.app",
      pushedAt: "2026-10-16T10:19:57Z",
    },
    "hsc-ict-creck-client": {
      name: "hsc-ict-creck-client",
      url: "https://github.com/jahidjubaer/hsc-ict-creck-client",
      language: "JavaScript",
      stars: 0,
      homepage: "https://hsc-ict-creck-client.vercel.app",
      pushedAt: "2026-10-03T18:51:35Z",
    },
    "hsc-ict-creck-server": {
      name: "hsc-ict-creck-server",
      url: "https://github.com/jahidjubaer/hsc-ict-creck-server",
      language: "JavaScript",
      stars: 0,
      homepage: "https://hsc-ict-creck-server.vercel.app",
      pushedAt: "2026-10-03T16:53:26Z",
    },
  },
};
