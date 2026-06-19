const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "Website";
const basePath = isGithubActions ? `/${repoName}` : "";

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
