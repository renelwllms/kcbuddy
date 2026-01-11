import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const templatePath = path.join(distDir, "index.html");

const baseUrl = (process.env.SITE_URL || "https://kcbuddy.edgepoint.co.nz").replace(/\/+$/, "");
const now = new Date().toISOString();

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KCBuddy",
  alternateName: "KiwiChore Buddy",
  applicationCategory: "FamilyApplication",
  operatingSystem: "Web",
  description:
    "KCBuddy is a family chore management web app that helps parents assign chores, review photo proof, and reward kids while tracking goals.",
  audience: {
    "@type": "Audience",
    audienceType: "Families and parents",
  },
  url: baseUrl ? `${baseUrl}/` : "https://kcbuddy.edgepoint.co.nz/",
  featureList: [
    "Family accounts",
    "Kid profiles",
    "Custom chores and rewards",
    "Photo approvals",
    "Goal tracking",
    "Weekly summaries",
    "Kid-friendly personalization",
  ],
  publisher: {
    "@type": "Organization",
    name: "Edgepoint Limited",
    url: "https://edgepoint.co.nz/",
  },
};

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does KCBuddy work?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Parents create chores with reward amounts, kids submit completed chores, and parents approve to grant rewards and update progress.",
      },
    },
    {
      "@type": "Question",
      name: "Who is KCBuddy for?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "KCBuddy is for families who want an easy way to manage chores, teach responsibility, and motivate kids with rewards and goals.",
      },
    },
    {
      "@type": "Question",
      name: "Can multiple children use one family account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Each child can have its own profile, so chores and progress are tracked per kid.",
      },
    },
    {
      "@type": "Question",
      name: "How do photo approvals work?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Kids submit a photo with a completed chore, and parents approve or reject it before any reward is granted.",
      },
    },
    {
      "@type": "Question",
      name: "Can I set different reward amounts per chore?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Each chore can have its own reward amount, and you can adjust rewards at any time.",
      },
    },
    {
      "@type": "Question",
      name: "Does KCBuddy support goal tracking?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Kids can set goals and track progress as chores are approved and rewards accumulate.",
      },
    },
    {
      "@type": "Question",
      name: "What devices can we use for KCBuddy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KCBuddy is web-based, so it works on phones, tablets, and computers with a modern browser.",
      },
    },
    {
      "@type": "Question",
      name: "How do we get started with KCBuddy?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Create a family workspace, add kid profiles, create chores and rewards, and start submitting and approving chores.",
      },
    },
  ],
};

const featuresFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    ...homeFaqSchema.mainEntity,
    {
      "@type": "Question",
      name: "Do parents and kids have separate access?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. Parents manage chores and approvals, while kids see their assigned chores, submissions, and goal progress.",
      },
    },
    {
      "@type": "Question",
      name: "Can multiple parents or caregivers manage the same family?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A family can have multiple parent logins so caregivers can share chores and approvals.",
      },
    },
    {
      "@type": "Question",
      name: "Can I view weekly progress or summaries?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. Parents can view weekly totals and pending approvals to quickly see what’s completed and what needs review.",
      },
    },
    {
      "@type": "Question",
      name: "Is KCBuddy safe for kids to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "KCBuddy uses family and profile access controls so kids only see their own chores and progress within their family workspace.",
      },
    },
  ],
};

const routes = [
  {
    path: "/",
    title: "KCBuddy | Chores, rewards, and savings goals for Kiwi families",
    description:
      "KCBuddy helps parents assign meaningful chores, approve photo proof, and reward progress toward savings goals.",
    schemas: [softwareApplicationSchema, homeFaqSchema],
  },
  {
    path: "/features",
    title: "KCBuddy Features | Chores, rewards, photo approvals, and goals",
    description:
      "Explore KCBuddy features like family accounts, custom chore rewards, photo approvals, goal tracking, and weekly summaries.",
    schemas: [softwareApplicationSchema, featuresFaqSchema],
  },
  {
    path: "/about",
    title: "About KCBuddy and Edgepoint",
    description:
      "Learn about Edgepoint and the team behind KCBuddy, including their focus on reliable IT services and family-friendly software.",
    schemas: [],
  },
  {
    path: "/contact",
    title: "Contact Edgepoint | KCBuddy Support",
    description:
      "Get in touch with Edgepoint for IT support and KCBuddy help. Find Auckland and Palmerston North office details.",
    schemas: [],
  },
];

const rootPattern = /<div id="root">[\s\S]*?<\/div>/;

function routeUrl(routePath) {
  if (!baseUrl) {
    return routePath;
  }
  return routePath === "/" ? `${baseUrl}/` : `${baseUrl}${routePath}`;
}

function buildMetaTags({ title, description, path: routePath, schemas }) {
  const canonical = routeUrl(routePath);
  const schemaTags = (schemas || [])
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join("\n    ");
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonical}">`,
    schemaTags,
  ];
  return tags.filter(Boolean).join("\n    ");
}

async function writeHtmlFile(outPath, html) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, html, "utf8");
}

export async function run() {
  const baseTemplate = await fs.readFile(templatePath, "utf8");
  const vite = await createServer({
    root: __dirname,
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  const { default: App } = await vite.ssrLoadModule("/src/app/MarketingApp.jsx");

  try {
    await Promise.all(
      routes.map(async (route) => {
        const element = React.createElement(
          StaticRouter,
          { location: route.path },
          React.createElement(App)
        );
        const markup = renderToString(element);
        const metaBlock = buildMetaTags(route);
        const withMeta = baseTemplate.replace(/<title>[\s\S]*?<\/title>/, metaBlock);
        const html = withMeta.replace(rootPattern, `<div id="root">${markup}</div>`);
        const targetPath =
          route.path === "/" ? path.join(distDir, "index.html") : path.join(distDir, route.path, "index.html");

        await writeHtmlFile(targetPath, html);
      })
    );

    const appIndex = baseTemplate.replace(rootPattern, '<div id="root">Loading KCBuddy...</div>');
    await writeHtmlFile(path.join(distDir, "app", "index.html"), appIndex);

    const sitemapEntries = routes
      .map((route) => {
        const loc = routeUrl(route.path);
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`;
      })
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
    const robots = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;

    await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
    await fs.writeFile(path.join(distDir, "robots.txt"), robots, "utf8");
  } finally {
    await vite.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Prerender failed:", error);
    process.exit(1);
  });
}
