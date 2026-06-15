import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shortsCss = readFileSync(
  new URL("../src/styles/shorts.css", import.meta.url),
  "utf8"
);
const shortsPageSource = readFileSync(
  new URL("../src/pages/ShortsPage.tsx", import.meta.url),
  "utf8"
);
const indexHtml = readFileSync(
  new URL("../index.html", import.meta.url),
  "utf8"
);

// iOS Safari/WebKit does not composite an inline <video> nested inside a
// `position: fixed` ancestor — the video decodes and plays but never paints
// (black screen on iOS only). The shorts page wrapper must therefore not be
// position:fixed; it locks the viewport via html/body overflow + 100svh height.
test("shorts page wrapper is not position:fixed (breaks iOS <video> compositing)", () => {
  const pageRule = /\.shorts-page \{[\s\S]*?\}/.exec(shortsCss);
  assert.ok(pageRule, ".shorts-page rule should exist");
  assert.doesNotMatch(pageRule[0], /position:\s*fixed/);
  assert.match(pageRule[0], /position:\s*relative/);
  assert.match(pageRule[0], /height:\s*100svh/);
});

test("iPhone browser uses document scrolling and only explicit fullscreen", () => {
  assert.match(shortsPageSource, /function shouldUseDocumentScrollForShorts\(\)/);
  assert.match(shortsPageSource, /function isIPhoneBrowserShell\(\)/);
  assert.match(shortsPageSource, /root:\s*null/);
  assert.match(shortsPageSource, /supportsElementFullscreenAPI\(page\)/);
  assert.match(shortsPageSource, /setCanRequestFullscreen\(true\)/);
  assert.doesNotMatch(shortsPageSource, /showFullscreenButton/);
  assert.match(shortsPageSource, /aria-label=\{isFullscreen \? "退出全屏" : "进入全屏"\}/);
  assert.match(shortsPageSource, /function handleFullscreenButtonPointerDown/);
  assert.match(shortsPageSource, /onPointerDown=\{handleFullscreenButtonPointerDown\}/);
  assert.doesNotMatch(shortsPageSource, /onFirstPointer/);
  assert.doesNotMatch(shortsPageSource, /currentPage\.addEventListener\("pointerdown"/);
  assert.match(shortsCss, /html\.shorts-document-scroll[\s\S]*scroll-snap-type:\s*y mandatory/);
  assert.match(shortsCss, /\.shorts-page\.is-document-scroll \.shorts-feed[\s\S]*overflow-y:\s*visible/);
  assert.match(shortsCss, /\.shorts-page\.is-document-scroll \.shorts-header,[\s\S]*\.shorts-page\.is-document-scroll \.shorts-hud-toast[\s\S]*position:\s*fixed/);
});

test("app has standalone display metadata for iPhone home-screen launch", () => {
  assert.match(indexHtml, /<link rel="manifest" href="\/manifest\.webmanifest" \/>/);
  assert.match(indexHtml, /<meta name="apple-mobile-web-app-capable" content="yes" \/>/);
  assert.match(indexHtml, /<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" \/>/);
});
