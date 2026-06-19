// Served from a GitHub Pages project repo, so assets live under /Website.
// (When the custom domain is live, switch basePath back to "" and restore CNAME.)
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGithubActions ? "/Website" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  // Exposed to the client so plain <a href> links to files in public/ can be
  // prefixed with the deploy subpath (basePath is not applied to raw strings).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
