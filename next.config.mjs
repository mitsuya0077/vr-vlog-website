const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/vr-vlog-website" : "",
  assetPrefix: isGitHubPages ? "/vr-vlog-website/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
