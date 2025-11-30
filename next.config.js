/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['bookwise.world'],
    },
    experimental: {
        serverComponentsExternalPackages: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
    },
    async headers() {
        return [
            {
                source: "/api/public/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "https://bookwise.world" },
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
}

module.exports = nextConfig
