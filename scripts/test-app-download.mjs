import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { campaignFrom, downloadUrl, storeForDevice, stores, taggedStore } from '../public/app-download.mjs';

const browserSource = readFileSync(new URL('../public/app-download.mjs', import.meta.url), 'utf8')
  .replace(/^export /gm, '');

function anchor(href) {
  return { href, getAttribute: name => name === 'href' ? href : null };
}

function mobilePage(userAgent, landing = false, search = '') {
  const links = Array.from({ length: 3 }, () => ({ href: '/download/' }));
  const storeLinks = [anchor(stores.ios), anchor(stores.android), anchor('/support/')];
  const redirects = [];
  vm.runInNewContext(browserSource, {
    URL,
    URLSearchParams,
    navigator: { userAgent },
    location: { search, replace: url => redirects.push(url) },
    document: {
      querySelector: () => landing ? {} : null,
      querySelectorAll: selector => selector === 'a[href]' ? storeLinks : links,
      createElement: () => { throw new Error('A smartphone must not create a QR dialog'); },
    },
  });
  return { links, redirects, storeLinks };
}

function appleCampaign(url) {
  const parsed = new URL(url);
  return parsed.origin + parsed.pathname === stores.ios ? parsed.searchParams.get('ct') : undefined;
}

function playCampaign(url) {
  const parsed = new URL(url);
  if (parsed.origin + parsed.pathname + '?id=' + parsed.searchParams.get('id') !== stores.android) return undefined;
  return Object.fromEntries(new URLSearchParams(parsed.searchParams.get('referrer') || ''));
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

test('the actual browser entry point sends all smartphone CTAs directly to the store with the site mark', () => {
  for (const [agent, store] of [['iPhone', stores.ios], ['Android', stores.android]]) {
    const { links, redirects } = mobilePage(agent);
    const tagged = taggedStore(store, 'site');
    assert.notEqual(tagged, store);
    assert.deepEqual(links.map(link => link.href), [tagged, tagged, tagged]);
    assert.deepEqual(redirects, []);
  }
});

test('the actual QR landing page redirects a smartphone to its store unchanged without a mark', () => {
  for (const [agent, store] of [['iPhone', stores.ios], ['Android', stores.android]]) {
    assert.deepEqual(mobilePage(agent, true).redirects, [store]);
    assert.deepEqual(mobilePage(agent, true, '?c=Bad%20Mark').redirects, [store]);
  }
});

test('the landing page passes the announcement mark to the store', () => {
  const ios = mobilePage('iPhone', true, '?c=x-20261128-group').redirects;
  assert.equal(ios.length, 1);
  assert.equal(appleCampaign(ios[0]), 'x-20261128-group');
  assert.equal(new URL(ios[0]).searchParams.get('mt'), '8');
  const android = mobilePage('Android', true, '?c=discord-20261128-group').redirects;
  assert.deepEqual(playCampaign(android[0]),
    { utm_source: 'discord', utm_medium: 'vrvlog_download', utm_campaign: 'discord-20261128-group' });
});

test('store links written on desktop and iPad pages carry the mark, other links stay', () => {
  const { storeLinks } = mobilePage('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)', true, '?c=site-top');
  assert.equal(appleCampaign(storeLinks[0].href), 'site-top');
  assert.equal(playCampaign(storeLinks[1].href).utm_campaign, 'site-top');
  assert.equal(storeLinks[2].href, '/support/');
  const plain = mobilePage('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)', true).storeLinks;
  assert.deepEqual(plain.map(link => link.href), [stores.ios, stores.android, '/support/']);
});

test('only well-formed marks are used', () => {
  assert.equal(campaignFrom('?c=x-20261128-group'), 'x-20261128-group');
  assert.equal(campaignFrom('?utm_campaign=x&c=line_01'), 'line_01');
  assert.equal(campaignFrom('?c=' + 'a'.repeat(30)), 'a'.repeat(30));
  for (const search of ['', '?c=', '?c=X-Upper', '?c=-x', '?c=a%22onload%3D', '?c=' + 'a'.repeat(31)]) {
    assert.equal(campaignFrom(search), null, search);
  }
  assert.equal(taggedStore(stores.ios, null), stores.ios);
  assert.equal(taggedStore('https://example.com/', 'x'), 'https://example.com/');
  assert.equal(taggedStore(stores.ios, '"><script>'), stores.ios);
});
