import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import regionWorker from '../measurement/region-worker.mjs';

const source = readFileSync(new URL('../public/site-measurement.js', import.meta.url), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
const enabled = { enabled: true, measurement_id: 'G-P5NNKTYS39',
  eligibility_url: 'https://vrvlog-web-region.fixture.workers.dev/region' };
const response = value => ({ ok: true, headers: { get: () => 'application/json' },
  text: async () => JSON.stringify(value) });

async function fixture(options = {}) {
  const listeners = new Map(), windowListeners = new Map(), tags = [], requests = [];
  const storage = new Map(options.stopped ? [['vrvlog.website.analytics', 'off']] : []);
  const status = { textContent: '' };
  const document = { cookie: '', prerendering: false,
    querySelector: () => status,
    addEventListener: (name, cb) => listeners.set(name, [...(listeners.get(name) || []), cb]),
    createElement: () => ({}), head: { appendChild: tag => { tags.push(tag); queueMicrotask(() => tag.onload()); } } };
  const window = { addEventListener: (name, cb) => windowListeners.set(name, cb) };
  const context = vm.createContext({ window, document, location: new URL(options.url || 'https://vrvlog.fun/?email=DO_NOT_SEND#SECRET'),
    navigator: { globalPrivacyControl: options.gpc, doNotTrack: options.dnt },
    localStorage: { getItem: key => { if (options.storageBlocked) throw Error('blocked'); return storage.get(key) || null; },
      setItem: (key, value) => { if (options.storageFull) throw Error('quota'); storage.set(key, value); },
      removeItem: key => storage.delete(key) },
    fetch: async (url, init) => {
      requests.push({ url, init });
      if (requests.length === 1) return response(Object.hasOwn(options, 'config') ? options.config : enabled);
      if (options.eligibility) return options.eligibility;
      if (options.offline) throw Error('offline');
      return response({ measurement: options.region || 'jp' });
    }, URL, AbortController, setTimeout, clearTimeout, queueMicrotask });
  vm.runInContext(source, context);
  await flush();
  const emit = (type, target, extra = {}) => {
    const event = { type, target, isTrusted: true, button: 0, defaultPrevented: false, ...extra };
    for (const cb of listeners.get(type) || []) cb(event);
    return event;
  };
  const events = () => Array.from(window.dataLayer || [], a => Array.from(a)).filter(a => a[0] === 'event')
    .map(a => JSON.parse(JSON.stringify({ name: a[1], parameters: a[2] })));
  return { window, document, tags, requests, storage, status, context, emit, events, windowListeners };
}

test('no tag or region request when configuration is disabled, browser opts out, or page is outside scope', async () => {
  for (const options of [{ config: { ...enabled, enabled: false } }, { config: null }, { config: {} }, { stopped: true }, { gpc: true },
    { dnt: '1' }, { storageBlocked: true }, { storageFull: true }, { url: 'https://vrvlog.fun/privacy/' },
    { url: 'https://unrelated.invalid/' }]) {
    const f = await fixture(options);
    assert.equal(f.tags.length, 0);
    assert.equal(f.events().length, 0);
    if (!options.storageFull) assert.ok(f.requests.length <= 1);
    if (options.url === 'https://unrelated.invalid/') assert.equal(f.window.VRVlogMeasurement, undefined);
  }
});

test('non-Japan, unknown, malformed and unavailable eligibility never load Google', async () => {
  for (const options of [{ region: 'off' }, { region: 'unknown' }, { region: 'JP' }, { offline: true },
    { config: { ...enabled, eligibility_url: 'https://untrusted.invalid/region' } },
    { config: { ...enabled, eligibility_url: enabled.eligibility_url + '?token=SECRET' } },
    { config: { ...enabled, measurement_id: 'G-OTHER' } }]) {
    const f = await fixture(options);
    assert.equal(f.tags.length, 0);
  }
});

test('eligible Japan document sends one canonical view and keeps advertising denied', async () => {
  const f = await fixture();
  assert.equal(f.tags.length, 1);
  assert.equal(f.tags[0].referrerPolicy, 'no-referrer');
  assert.equal(f.tags[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-P5NNKTYS39');
  assert.deepEqual(f.events(), [{ name: 'page_view', parameters: { send_to: 'G-P5NNKTYS39',
    page_group: 'home', page_title: 'home', page_location: 'https://vrvlog.fun/', page_referrer: '' } }]);
  const consent = Array.from(f.window.dataLayer[0])[2];
  assert.equal(consent.ad_storage, 'denied');
  assert.equal(consent.ad_user_data, 'denied');
  assert.equal(consent.ad_personalization, 'denied');
  for (const request of f.requests) {
    assert.equal(request.init.credentials, 'omit');
    assert.equal(request.init.referrerPolicy, 'no-referrer');
  }
  vm.runInContext(source, f.context);
  await flush();
  assert.equal(f.tags.length, 1);
  assert.equal(f.events().length, 1);
});

const anchor = (href, placement = '') => ({ href,
  closest: selector => selector === 'a[href]' ? anchor(href, placement)
    : (selector === placement ? {} : null) });

test('link measurement sends fixed labels, preserves modified navigation, and ignores wrong destinations', async () => {
  const f = await fixture();
  const click = f.emit('click', anchor('https://apps.apple.com/jp/app/vr-vlog/id6789953414?email=DO_NOT_SEND'), { metaKey: true });
  assert.equal(click.defaultPrevented, false);
  f.emit('auxclick', anchor('vcc://vpm/addRepo?url=https%3A%2F%2Fvrvlog.fun%2Fexporter%2Findex.json'), { button: 1 });
  f.emit('click', anchor('https://apps.apple.com/jp/app/other/id123'));
  f.emit('click', anchor('vcc://vpm/addRepo?url=https%3A%2F%2Funtrusted.invalid%2Findex.json'));
  f.emit('click', anchor('https://vrvlog.fun/guide/'), { isTrusted: false });
  assert.deepEqual(f.events().map(e => e.name), ['page_view', 'acquisition_click', 'acquisition_click']);
  assert.deepEqual(f.events().slice(1).map(e => e.parameters.destination), ['ios_store', 'vpm_add']);
  assert.ok(!JSON.stringify(f.events()).includes('DO_NOT_SEND'));
});

test('stop cancels pending eligibility and disables later events across tabs', async () => {
  let resolve;
  const f = await fixture({ eligibility: new Promise(r => { resolve = r; }) });
  f.window.VRVlogMeasurement.stop();
  resolve(response({ measurement: 'jp' }));
  await flush();
  assert.equal(f.tags.length, 0);
  assert.equal(f.storage.get('vrvlog.website.analytics'), 'off');
  const active = await fixture();
  active.windowListeners.get('storage')({ key: 'vrvlog.website.analytics', newValue: 'off' });
  active.emit('click', anchor('https://vrvlog.fun/guide/'));
  assert.equal(active.window['ga-disable-G-P5NNKTYS39'], true);
  assert.equal(active.events().length, 0);
  active.window.VRVlogMeasurement.resume();
  active.emit('click', anchor('https://vrvlog.fun/guide/'));
  assert.equal(active.events().length, 0);
});

test('returning with a newly enabled tracking refusal stops the loaded tag', async () => {
  const f = await fixture();
  vm.runInContext("navigator.doNotTrack = '1'", f.context);
  f.emit('visibilitychange', {});
  assert.equal(f.window['ga-disable-G-P5NNKTYS39'], true);
  assert.equal(f.storage.get('vrvlog.website.analytics'), 'off');
  f.emit('click', anchor('https://vrvlog.fun/guide/'));
  assert.equal(f.events().length, 0);
});

test('video progress uses played coverage, not seek position, and each milestone is emitted once', async () => {
  const f = await fixture({ url: 'https://vrvlog.fun/guide/' });
  let coverage = 0;
  const video = { tagName: 'VIDEO', duration: 100, currentTime: 99,
    played: { length: 1, start: () => 0, end: () => coverage } };
  f.emit('playing', video);
  coverage = 10;
  f.emit('timeupdate', video);
  assert.equal(f.events().filter(e => e.name === 'guide_video_progress').length, 0);
  coverage = 50;
  f.emit('timeupdate', video);
  f.emit('timeupdate', video);
  coverage = 100;
  f.emit('ended', video);
  assert.equal(f.events().filter(e => e.name === 'guide_video_start').length, 1);
  assert.deepEqual(f.events().filter(e => e.name === 'guide_video_progress').map(e => e.parameters.percent), [25, 50, 75, 100]);
});

test('video already playing when eligibility finishes is measured from the first eligible playback update', async () => {
  let resolve;
  const f = await fixture({ url: 'https://vrvlog.fun/guide/', eligibility: new Promise(r => { resolve = r; }) });
  const video = { tagName: 'VIDEO', duration: 100, paused: false,
    played: { length: 1, start: () => 0, end: () => 10 } };
  f.emit('playing', video);
  assert.equal(f.events().length, 0);
  resolve(response({ measurement: 'jp' }));
  await flush();
  f.emit('timeupdate', video);
  f.emit('timeupdate', video);
  assert.equal(f.events().filter(e => e.name === 'guide_video_start').length, 1);
  assert.equal(f.events().filter(e => e.name === 'guide_video_progress').length, 0);
});

test('region endpoint trusts only Cloudflare country, returns no identifiers, and is not cacheable', async () => {
  for (const country of ['JP', 'FR', 'XX', undefined]) {
    const request = new Request('https://worker.invalid/region', { headers: { Origin: 'https://vrvlog.fun', 'CF-IPCountry': 'JP' } });
    Object.defineProperty(request, 'cf', { value: { country } });
    const r = regionWorker.fetch(request, { MEASUREMENT_ENABLED: 'true' });
    assert.deepEqual(await r.json(), { measurement: country === 'JP' ? 'jp' : 'off' });
    assert.equal(r.headers.get('Cache-Control'), 'no-store');
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://vrvlog.fun');
  }
  assert.equal(regionWorker.fetch(new Request('https://worker.invalid/region')).status, 403);
  assert.equal(regionWorker.fetch(new Request('https://worker.invalid/region?email=SECRET', { headers: { Origin: 'https://vrvlog.fun' } })).status, 404);
});

test('region deployment remains off until its exact enable flag is set', async () => {
  const request = new Request('https://worker.invalid/region', { headers: { Origin: 'https://vrvlog.fun' } });
  Object.defineProperty(request, 'cf', { value: { country: 'JP' } });
  for (const value of [undefined, false, true, 'false', 'TRUE']) {
    const r = regionWorker.fetch(request, { MEASUREMENT_ENABLED: value });
    assert.deepEqual(await r.json(), { measurement: 'off' });
  }
});


test('privacy controls work through the published action attributes without starting analytics', async () => {
  const f = await fixture({ url: 'https://vrvlog.fun/privacy/' });
  const control = action => ({ closest: selector => selector === '[data-analytics-action]'
    ? { dataset: { analyticsAction: action } } : null });
  f.emit('click', control('stop'));
  assert.equal(f.storage.get('vrvlog.website.analytics'), 'off');
  assert.match(f.status.textContent, /停止しました/);
  f.emit('click', control('resume'));
  assert.equal(f.storage.has('vrvlog.website.analytics'), false);
  assert.match(f.status.textContent, /次にページを開いた/);
  f.emit('visibilitychange', {});
  assert.equal(f.storage.has('vrvlog.website.analytics'), false);
  assert.match(f.status.textContent, /次にページを開いた/);
  assert.equal(f.tags.length, 0);
  assert.equal(f.requests.length, 0);
});
