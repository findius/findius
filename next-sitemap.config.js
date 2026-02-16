/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://findius.io",
  generateRobotsTxt: true,
  exclude: ["/suche", "/api/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/suche", "/api/"],
      },
    ],
  },
};
