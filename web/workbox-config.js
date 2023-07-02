/**
 * @type {import('workbox-build').GenerateSWOptions}
 */
module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,svg,css,html,json}"],
  swDest: "dist/service-worker.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  globIgnores: ["service-worker.js"],
  sourcemap: false,
  clientsClaim: true,
  skipWaiting: true,
};
