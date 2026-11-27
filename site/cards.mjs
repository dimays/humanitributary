// The link-preview card (docs/adr/0034-brand-assets.md): the picture a shared link to the page shows in a message, a
// feed or a search result. 1200×630, the size every preview takes: the timeline itself, drawn by the page from a real
// release (the braided branches across all of history on the page's log scale), under the mark, the name, one line
// and the domain, on the page's light background.
//
//   node site/cards.mjs                                  build the page from var/releases/latest/content.json, write site/brand/og-image.png
//   node site/cards.mjs --from-json <content.json>       from another snapshot (a release's content.json)
//   node site/cards.mjs --explore                        also write each era's view to var/cards/, to choose a better one
//
// It needs Node and a Chrome on the machine (CHROME=… names another), and nothing else: Node's own WebSocket drives
// Chrome's DevTools protocol. The name and the domain come from config/settings.py (SITE_NAME, PUBLIC_SITE_URL),
// read with `uv run python`. Run it after a big content wave or a change to how the page draws, look at the card
// (var/cards/card-small.png shows it at half size), and commit site/brand/og-image.png: a static file, so a preview
// never waits on a render. `make card` runs it.

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SITE = join(ROOT, 'site');
const OUT = join(SITE, 'brand', 'og-image.png');
const SCRATCH = join(ROOT, 'var', 'cards');
const W = 1200, H = 630;
const TAGLINE = 'All of history, cited, from the Big Bang to this week.';
// The view the card shows: the page's own era (its key, as the page's ERAS have them; "0" is all of time), in a
// window of this many CSS pixels, drawn at 2x and placed in the card at 1:1 so the labels stay the page's size.
// `scroll`: how far down the lanes to start, in CSS pixels (past the cosmos and life lanes, to the peoples and states).
const VIEW = { era: '3', scroll: 1135, width: 1120, height: 428 }; // Ancient: Egypt, Phoenicia, Babylon, Greece, Rome

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const snapshot = opt('--from-json', join(ROOT, 'var', 'releases', 'latest', 'content.json'));
const explore = args.includes('--explore');

// ---------- a headless Chrome on the DevTools protocol ----------
const CHROMES = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);

async function launch() {
  const bin = CHROMES.find((p) => existsSync(p));
  if (!bin) throw new Error('No Chrome found: set CHROME to its path.');
  const dir = mkdtempSync(join(tmpdir(), 'ht-cards-'));
  const proc = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('Chrome didn’t start in 20s')), 20000);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); resolve(m[1]); } });
    proc.on('exit', (code) => reject(new Error(`Chrome exited (${code})`)));
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const waiting = new Map(), listeners = new Set();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && waiting.has(msg.id)) {
      const { resolve, reject } = waiting.get(msg.id); waiting.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else for (const fn of listeners) fn(msg);
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const n = ++id; waiting.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params, sessionId }));
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => send(method, params, sessionId);
  await s('Page.enable'); await s('Runtime.enable');
  const page = {
    async size(width, height, scale = 1) {
      await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
      await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
    },
    async goto(url) {
      const done = new Promise((resolve) => { const fn = (m) => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') { listeners.delete(fn); resolve(); } }; listeners.add(fn); });
      await s('Page.navigate', { url }); await done;
    },
    async run(fn, ...a) {
      const r = await s('Runtime.evaluate', { expression: `(${fn})(...${JSON.stringify(a)})`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    wait: (ms) => new Promise((r) => setTimeout(r, ms)),
    async shot(clip) {
      const { data } = await s('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
      return Buffer.from(data, 'base64');
    },
  };
  return { page, async close() { try { await send('Browser.close'); } catch { /* gone */ } ws.close(); proc.kill(); try { rmSync(dir, { recursive: true, force: true }); } catch { /* a lock file lingering */ } } };
}

// ---------- in the page ----------

// The timeline alone: no header, overview, hints, buttons or side panel; then the era's view, at once.
function curate(era, scroll) {
  const css = document.createElement('style');
  css.textContent = 'header, #overview, .hint, .zoombox, #panel, #tip { display: none !important; }';
  document.head.append(css);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  window.dispatchEvent(new KeyboardEvent('keydown', { key: era }));
  window.dispatchEvent(new Event('resize'));
  return new Promise((r) => setTimeout(() => {
    if (scroll) document.getElementById('tl').dispatchEvent(new WheelEvent('wheel', { deltaY: scroll, bubbles: true, cancelable: true }));
    setTimeout(() => r(true), 700);
  }, 1200));
}

// The card, over a blank page: the mark, the name, the line and the domain above the timeline's picture.
function compose({ art, mark, name, line, domain, w, h, vw, vh }) {
  document.documentElement.style.cssText = 'margin:0;background:#f6f5f1';
  document.body.style.cssText = 'margin:0';
  document.body.innerHTML = `
  <div id="card" style="position:relative;width:${w}px;height:${h}px;overflow:hidden;background:#f6f5f1;color:#1c1c1e;
       font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
    <div style="position:absolute;left:44px;top:36px;right:44px;display:flex;align-items:center;gap:22px">
      <img src="${mark}" width="84" height="84" style="flex:none;border-radius:19px">
      <div style="min-width:0;flex:1">
        <div style="font-weight:700;font-size:66px;line-height:1;letter-spacing:-.02em">${name}</div>
        <div style="margin-top:12px;font-weight:500;font-size:29px;line-height:1.15;color:#46464c">${line}</div>
      </div>
    </div>
    <div style="position:absolute;left:${(w - vw) / 2}px;top:${h - vh - 30}px;width:${vw}px;height:${vh}px;border-radius:16px;overflow:hidden;
         background:#fff;border:1px solid #e2e0d8;box-shadow:0 1px 2px rgba(0,0,0,.06),0 14px 36px rgba(0,0,0,.10)">
      <img src="${art}" style="display:block;width:${vw}px;height:${vh}px">
      <div style="position:absolute;right:14px;bottom:12px;padding:6px 12px;border-radius:9px;background:rgba(28,29,33,.86);color:#fff;
           font-weight:600;font-size:19px;letter-spacing:.01em">${domain}</div>
    </div>
  </div>`;
  return Promise.all([...document.images].map((i) => i.decode())).then(() => true);
}

// ---------- main ----------

function settings() {
  const code = 'import json,os,sys; sys.path.insert(0, "."); os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings"); '
    + 'from django.conf import settings as s; from urllib.parse import urlparse; '
    + 'print(json.dumps({"name": s.SITE_NAME, "domain": urlparse(s.PUBLIC_SITE_URL).hostname}))';
  return JSON.parse(execFileSync('uv', ['run', 'python', '-c', code], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').pop());
}

if (!existsSync(snapshot)) throw new Error(`no snapshot at ${snapshot}: run \`make release-pull\`, or pass --from-json <content.json>`);
const { name, domain } = settings();
const pageFile = join(SITE, '.cards-page.html'); // beside images/ and outlines.js, which it loads (gitignored)
execFileSync('node', [join(SITE, 'build.mjs'), '--from-json', snapshot, '--out', pageFile], { stdio: ['ignore', 'ignore', 'inherit'] });
const svg = readFileSync(join(SITE, 'brand', 'favicon.svg'), 'utf8').replace(/@media[^}]*}[^}]*}/, ''); // the light-tab colors
const mark = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
mkdirSync(SCRATCH, { recursive: true });
const browser = await launch();
try {
  const { page } = browser;
  const views = explore ? ['0', '3', '4', '5', '6', '7'].flatMap((e) => [0, 400, 800, 1200, 1600].map((y) => [e, y])) : [[VIEW.era, VIEW.scroll]];
  let art = null;
  for (const [era, scroll] of views) {
    await page.size(VIEW.width, VIEW.height, 2);
    await page.goto(`file://${pageFile}`);
    await page.run(curate, era, scroll);
    const png = await page.shot({ x: 0, y: 0, width: VIEW.width, height: VIEW.height });
    if (explore) writeFileSync(join(SCRATCH, `view-${era}-${scroll}.png`), png);
    if (era === VIEW.era && scroll === VIEW.scroll) art = png;
  }
  await page.size(W, H, 1);
  await page.goto('about:blank');
  await page.run(compose, { art: `data:image/png;base64,${art.toString('base64')}`, mark, name, line: TAGLINE, domain, w: W, h: H, vw: VIEW.width, vh: VIEW.height });
  writeFileSync(OUT, await page.shot({ x: 0, y: 0, width: W, height: H }));
  await page.size(W / 2, H / 2, 1);
  await page.run(() => { document.getElementById('card').style.cssText += ';transform:scale(.5);transform-origin:0 0'; return true; });
  writeFileSync(join(SCRATCH, 'card-small.png'), await page.shot({ x: 0, y: 0, width: W / 2, height: H / 2 }));
  console.log(`wrote site/brand/og-image.png (${W}×${H}) and var/cards/card-small.png`);
} finally {
  await browser.close();
  rmSync(pageFile, { force: true });
}
