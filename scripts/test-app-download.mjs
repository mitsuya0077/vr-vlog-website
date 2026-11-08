import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { downloadUrl, storeForDevice, stores } from '../public/app-download.mjs';

const browserSource = readFileSync(new URL('../public/app-download.mjs', import.meta.url), 'utf8')
  .replace(/^export /gm, '');

function mobilePage(userAgent, landing = false) {
  const links = Array.from({ length: 3 }, () => ({ href: '/download/' }));
  const redirects = [];
  vm.runInNewContext(browserSource, {
    navigator: { userAgent },
    location: { replace: url => redirects.push(url) },
    document: {
      querySelector: () => landing ? {} : null,
      querySelectorAll: () => links,
      createElement: () => { throw new Error('A smartphone must not create a QR dialog'); },
    },
  });
  return { links, redirects };
}

test('smartphones go to the existing store listing', () => {
  assert.equal(storeForDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), stores.ios);
  assert.equal(storeForDevice('Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)'), stores.ios);
  assert.equal(storeForDevice('Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile Safari/537.36'), stores.android);
});

test('desktop, iPad and unrecognized devices retain the store choice', () => {
  for (const agent of [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (X11; Linux x86_64)',
    'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)',
    '',
  ]) assert.equal(storeForDevice(agent), null, agent);
});

test('shared download URL and direct stores use the canonical destinations', () => {
  assert.equal(downloadUrl, 'https://vrvlog.fun/download/');
  assert.equal(stores.ios, 'https://apps.apple.com/jp/app/vr-vlog/id6789953414');
  assert.equal(stores.android, 'https://play.google.com/store/apps/details?id=com.mitsuya0077.facemaskvtuber');
});

test('the actual browser entry point sends all smartphone CTAs directly to the store', () => {
  for (const [agent, store] of [['iPhone', stores.ios], ['Android', stores.android]]) {
    const { links, redirects } = mobilePage(agent);
    assert.deepEqual(links.map(link => link.href), [store, store, store]);
    assert.deepEqual(redirects, []);
  }
});

test('the actual QR landing page redirects a smartphone to its store', () => {
  for (const [agent, store] of [['iPhone', stores.ios], ['Android', stores.android]]) {
    assert.deepEqual(mobilePage(agent, true).redirects, [store]);
  }
});
