// require('dotenv').config();

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

// module.exports = withBundleAnalyzer({
//   // productionBrowserSourceMaps: true,
//   env: {
//     ALGOLIA_URL: process.env.ALGOLIA_URL,
//     ALGOLIA_SEARCHAPPID: process.env.ALGOLIA_SEARCHAPPID,
//     ALGOLIA_SEARCHAPIKEY: process.env.ALGOLIA_SEARCHAPIKEY,
//     ALGOLIA_TEACHERINDEX: process.env.ALGOLIA_TEACHERINDEX,
//     ALGOLIA_TEACHERINDEX_SW: process.env.ALGOLIA_TEACHERINDEX_SW,
//     ALGOLIA_TEACHERINDEX_PAGE: process.env.ALGOLIA_TEACHERINDEX_PAGE,
//     ALGOLIA_TEACHERINDEX_EVTA: process.env.ALGOLIA_TEACHERINDEX_EVTA,
//     ALGOLIA_TEACHERINDEX_SITEMAP: process.env.ALGOLIA_TEACHERINDEX_SITEMAP,
//     ALGOLIA_TEACHERINDEX_INSTRUMENT: process.env.ALGOLIA_TEACHERINDEX_INSTRUMENT,
//     ALGOLIA_COURSEINDEX: process.env.ALGOLIA_COURSEINDEX,
//     ALGOLIA_RECOMMENDATION_INDEX: process.env.ALGOLIA_RECOMMENDATION_INDEX,
//     ALGOLIA_INSTRUMENTS: process.env.ALGOLIA_INSTRUMENTS,
//     ALGOLIA_TEACHERINDEX_INSTRUMENT: process.env.ALGOLIA_TEACHERINDEX_INSTRUMENT,
//     NEXT_PUBLIC_BUGSNAG_API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
//     MATCHSPACE_FORM_CONTACT: process.env.MATCHSPACE_FORM_CONTACT,
//     MATCHSPACE_CHECKOUT: process.env.MATCHSPACE_CHECKOUT,
//     MATCHSPACE_CONTACT: process.env.MATCHSPACE_CONTACT,
//     MATCHSPACE_GIFT: process.env.MATCHSPACE_GIFT,
//     COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
//     PABBLY_WAIT_URL: process.env.PABBLY_WAIT_URL,
//     PABBLY_SEARCH_URL: process.env.PABBLY_SEARCH_URL,
//     PABBLY_CALLBACK_URL: process.env.PABBLY_CALLBACK_URL,
//     PABBLY_CONTACT_LATER_URL: process.env.PABBLY_CONTACT_LATER_URL,
//     MATCHSPACE_FORM_ID_EN: process.env.MATCHSPACE_FORM_ID_EN,
//     MATCHSPACE_FORM_ID_DE: process.env.MATCHSPACE_FORM_ID_DE,
//     SITEMAP_URL: process.env.SITEMAP_URL,
//     GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
//     // GOOGLE_MAP_API: process.env.GOOGLE_MAP_API,
//     GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
//     MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
//     MATCHSPACE_PREPROD: process.env.MATCHSPACE_PREPROD,
//     MATCHSPACE_PROD: process.env.MATCHSPACE_PROD,
//     STORYBLOK_API_TOKEN: process.env.STORYBLOK_API_TOKEN,
//     STORYBLOK_VERSION: process.env.STORYBLOK_VERSION,
//   },
//   images: {
//     domains: [
//       'a.storyblok.com',
//       'images.selise.club',
//       'static.wixstatic.com',
//       'clapp.ams3.digitaloceanspaces.com',
//       'cnc-images.fra1.digitaloceanspaces.com',
//       'preiatmatchspace.s3.eu-west-3.amazonaws.com',
//       'cncprodgrifendor.fra1.digitaloceanspaces.com',
//       'mspproduction.s3.eu-west-3.amazonaws.com',
//       'd1qzgjer0zdepi.cloudfront.net',
//       's3.eu-west-3.amazonaws.com',
//       'mspstaging.s3.eu-west-3.amazonaws.com',
//       'dv2zl4fctjeos.cloudfront.net',
//       'mspstaging.s3.amazonaws.com',
//       'i.ytimg.com',
//       'i.vimeocdn.com',
//       'i0.wp.com',
//       'www.billboard.com',
//       'drive.google.com',
//       'drive.usercontent.google.com',
//       'matchspace-music.ch',
//       'www.youtube.com',
//       'img.youtube.com',
//       'url.to'
//     ],
//     deviceSizes: [600, 960, 1280, 1440, 1920],
//     formats: ['image/webp'],
//     minimumCacheTTL: 60,
//   },
//   staticPageGenerationTimeout: 10000,
//   reactStrictMode: true,
//   async rewrites() {
//     return [
//       {
//         source: '/robots.txt',
//         destination: '/api/robots',
//       },
//     ];
//   },
//   webpack(config) {
//     config.module.rules.push({
//       test: /\.svg$/i,
//       issuer: /\.[jt]sx?$/,
//       use: ['@svgr/webpack'],
//     });

//     return config;
//   },
// });

require('dotenv').config();
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  staticPageGenerationTimeout: 10000,

  // ✅ Environment variables
  env: {
    ALGOLIA_URL: process.env.ALGOLIA_URL,
    ALGOLIA_SEARCHAPPID: process.env.ALGOLIA_SEARCHAPPID,
    ALGOLIA_SEARCHAPIKEY: process.env.ALGOLIA_SEARCHAPIKEY,
    ALGOLIA_TEACHERINDEX: process.env.ALGOLIA_TEACHERINDEX,
    ALGOLIA_TEACHERINDEX_SW: process.env.ALGOLIA_TEACHERINDEX_SW,
    ALGOLIA_TEACHERINDEX_PAGE: process.env.ALGOLIA_TEACHERINDEX_PAGE,
    ALGOLIA_TEACHERINDEX_EVTA: process.env.ALGOLIA_TEACHERINDEX_EVTA,
    ALGOLIA_TEACHERINDEX_SITEMAP: process.env.ALGOLIA_TEACHERINDEX_SITEMAP,
    ALGOLIA_TEACHERINDEX_INSTRUMENT: process.env.ALGOLIA_TEACHERINDEX_INSTRUMENT,
    ALGOLIA_COURSEINDEX: process.env.ALGOLIA_COURSEINDEX,
    ALGOLIA_RECOMMENDATION_INDEX: process.env.ALGOLIA_RECOMMENDATION_INDEX,
    ALGOLIA_INSTRUMENTS: process.env.ALGOLIA_INSTRUMENTS,
    NEXT_PUBLIC_BUGSNAG_API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
    MATCHSPACE_FORM_CONTACT: process.env.MATCHSPACE_FORM_CONTACT,
    MATCHSPACE_CHECKOUT: process.env.MATCHSPACE_CHECKOUT,
    MATCHSPACE_CONTACT: process.env.MATCHSPACE_CONTACT,
    MATCHSPACE_GIFT: process.env.MATCHSPACE_GIFT,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    PABBLY_WAIT_URL: process.env.PABBLY_WAIT_URL,
    PABBLY_SEARCH_URL: process.env.PABBLY_SEARCH_URL,
    PABBLY_CALLBACK_URL: process.env.PABBLY_CALLBACK_URL,
    PABBLY_CONTACT_LATER_URL: process.env.PABBLY_CONTACT_LATER_URL,
    MATCHSPACE_FORM_ID_EN: process.env.MATCHSPACE_FORM_ID_EN,
    MATCHSPACE_FORM_ID_DE: process.env.MATCHSPACE_FORM_ID_DE,
    SITEMAP_URL: process.env.SITEMAP_URL,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
    MATCHSPACE_PREPROD: process.env.MATCHSPACE_PREPROD,
    MATCHSPACE_PROD: process.env.MATCHSPACE_PROD,
    STORYBLOK_API_TOKEN: process.env.STORYBLOK_API_TOKEN,
    STORYBLOK_VERSION: process.env.STORYBLOK_VERSION,
  },

  // ✅ Optimized Image Delivery
  images: {
    domains: [
      'a.storyblok.com',
      'images.selise.club',
      'static.wixstatic.com',
      'clapp.ams3.digitaloceanspaces.com',
      'cnc-images.fra1.digitaloceanspaces.com',
      'preiatmatchspace.s3.eu-west-3.amazonaws.com',
      'cncprodgrifendor.fra1.digitaloceanspaces.com',
      'mspproduction.s3.eu-west-3.amazonaws.com',
      'd1qzgjer0zdepi.cloudfront.net',
      's3.eu-west-3.amazonaws.com',
      'mspstaging.s3.eu-west-3.amazonaws.com',
      'dv2zl4fctjeos.cloudfront.net',
      'mspstaging.s3.amazonaws.com',
      'i.ytimg.com',
      'i.vimeocdn.com',
      'i0.wp.com',
      'www.billboard.com',
      'drive.google.com',
      'drive.usercontent.google.com',
      'matchspace-music.ch',
      'www.youtube.com',
      'img.youtube.com',
      'url.to',
      'music-solution.vercel.app',
    ],
    deviceSizes: [320, 600, 960, 1280, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'], // ✅ modern formats
    minimumCacheTTL: 60,
  },

  // ✅ Robots.txt rewrite
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },

  // ✅ Webpack config
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
