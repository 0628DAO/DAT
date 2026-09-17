#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const siteUrl = (process.env.WP_SITE_URL || "https://0628dao.xyz").replace(/\/$/, "");
const username = process.env.WP_USERNAME;
const applicationPassword = process.env.WP_APPLICATION_PASSWORD;
const pageId = process.env.WP_HOME_PAGE_ID || "7";
const apply = process.argv.includes("--apply");

if (!username || !applicationPassword) {
  console.error("WP_USERNAME and WP_APPLICATION_PASSWORD are required.");
  process.exit(1);
}

const sourcePath = resolve(import.meta.dirname, "index.html");
const source = await readFile(sourcePath, "utf8");
const styles = source.match(/<style>([\s\S]*?)<\/style>/i)?.[1];
const body = source.match(/<body>([\s\S]*?)<\/body>/i)?.[1];

if (!styles || !body) {
  throw new Error("Could not extract the stylesheet and page body from website/index.html.");
}

const wordpressOverrides = `
<style>
html, body { margin: 0 !important; padding: 0 !important; background: #050b13 !important; }
body.home .site-header, body.home #site-header, body.home .site-footer,
body.home #site-footer, body.home .page-header, body.home .entry-title,
body.home .breadcrumb, body.home .vk-mobile-nav-menu-btn,
body.home .vk-mobile-nav { display: none !important; }
body.home .site-body, body.home .site-content, body.home #content,
body.home .content-area, body.home .site-main, body.home main,
body.home article, body.home .entry-content {
  width: 100% !important; max-width: none !important; margin: 0 !important;
  padding: 0 !important;
}
.dao-wordpress-root { width: 100vw; margin-left: calc(50% - 50vw); }
</style>`;

const pageContent = `<div class="dao-wordpress-root"><style>${styles}</style>${body}</div>${wordpressOverrides}`;
const authorization = `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString("base64")}`;

async function api(path, options = {}) {
  const response = await fetch(`${siteUrl}/wp-json${path}`, {
    ...options,
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = text; }

  if (!response.ok) {
    throw new Error(`WordPress API ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  }
  return payload;
}

const current = await api(`/wp/v2/pages/${pageId}?context=edit`);
console.log(`Connected to ${siteUrl}`);
console.log(`Home page: #${current.id} (${current.status})`);
console.log(`Current title: ${current.title?.raw || current.title?.rendered || "Untitled"}`);

if (!apply) {
  console.log("Dry run complete. Re-run with --apply to update the public website.");
  process.exit(0);
}

const updatedPage = await api(`/wp/v2/pages/${pageId}`, {
  method: "POST",
  body: JSON.stringify({
    title: "0628DAO",
    slug: "home",
    content: pageContent,
    status: "publish",
  }),
});

const updatedSettings = await api("/wp/v2/settings", {
  method: "POST",
  body: JSON.stringify({
    title: "0628DAO",
    description: "Open infrastructure for AI-agent economies.",
  }),
});

console.log(`Published page: ${updatedPage.link}`);
console.log(`Site title: ${updatedSettings.title}`);
console.log("WordPress deployment completed.");
