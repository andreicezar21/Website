const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = "Website";
const basePath = isGithubActions ? `/${repoName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
};

export default nextConfig;
