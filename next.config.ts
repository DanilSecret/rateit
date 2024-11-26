import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.mds.yandex.net",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
