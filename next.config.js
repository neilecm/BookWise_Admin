/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['bookwise.world'],
    },
    experimental: {
        serverComponentsExternalPackages: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
    },
}

module.exports = nextConfig
