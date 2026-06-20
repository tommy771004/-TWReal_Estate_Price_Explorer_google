import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("deployment config preserves prerendered routes and text resources", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const headers = config.headers ?? [];

  assert.ok(headers.some((entry) => entry.source === "/llms.txt" &&
    entry.headers.some((header) => header.key === "Content-Type" && /text\/plain/.test(header.value))));
  assert.ok(headers.some((entry) => entry.source === "/sitemap.xml" &&
    entry.headers.some((header) => header.key === "Content-Type" && /application\/xml/.test(header.value))));
  assert.ok(config.routes.some((route) => route.handle === "filesystem"));
});

test("Search Console verification can be injected without hardcoding a token", async () => {
  const [template, viteConfig, envExample] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(template, /GOOGLE_SITE_VERIFICATION/);
  assert.match(viteConfig, /VITE_GOOGLE_SITE_VERIFICATION/);
  assert.match(viteConfig, /google-site-verification/);
  assert.match(envExample, /VITE_GOOGLE_SITE_VERIFICATION=""/);
  assert.doesNotMatch(template, /google-site-verification" content="[^_]/);
});

test("a live deployment verifier is available", async () => {
  const verifier = await readFile(new URL("./verify-seo-deployment.mjs", import.meta.url), "utf8");
  assert.match(verifier, /fetch/);
  assert.match(verifier, /sitemap\.xml/);
  assert.match(verifier, /llms\.txt/);
});
