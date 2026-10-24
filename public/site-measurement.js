/* Website-only measurement. Collection also requires the approved region Worker flag. */
(() => {
  'use strict';
  const origin = 'https://vrvlog.fun';
  if (location.origin !== origin || window.VRVlogMeasurement) return;
  const measurementId = 'G-P5NNKTYS39';
  const preferenceKey = 'vrvlog.website.analytics';
  const groups = { '/': 'home', '/exporter/': 'exporter', '/guide/': 'guide', '/support/': 'support' };
  const group = groups[location.pathname];
  let active = false;
  let stopped = false;
  let pageSent = false;
  let generation = 0;
  const videos = new WeakMap();

  function disabled() {
    try {
      return stopped || navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'
        || window.doNotTrack === '1' || localStorage.getItem(preferenceKey) === 'off';
    } catch (_) { return true; }
  }

  function status(message) {
    const node = document.querySelector('[data-analytics-status]');
    if (node) node.textContent = message;
  }

  function stop() {
    stopped = true;
    active = false;
    generation += 1;
    window['ga-disable-' + measurementId] = true;
    // Drop any not-yet-consumed commands if the tag is still loading.
    if (Array.isArray(window.dataLayer)) window.dataLayer.length = 0;
    try {
      for (const raw of document.cookie.split(';')) {
        const name = raw.trim().split('=')[0];
        if (!/^_ga(?:_[A-Z0-9]+)?$/.test(name)) continue;
        for (const domain of ['', '; Domain=vrvlog.fun', '; Domain=.vrvlog.fun']) {
          document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' + domain;
        }
      }
    } catch (_) { /* Cookie restrictions must not prevent disabling measurement. */ }
    try {
      localStorage.setItem(preferenceKey, 'off');
      status('このブラウザーのアクセス解析を停止しました。');
    } catch (_) {
      status('このページの解析を停止しました。ブラウザーの保存制限により、停止設定は保存できませんでした。');
    }
  }

  function resume() {
    try {
      localStorage.removeItem(preferenceKey);
      status('停止設定を解除しました。対象地域で次にページを開いたときに適用されます。');
    } catch (_) { status('設定を変更できませんでした。解析は停止したままです。'); }
    // Resuming never enables collection in this document or overrides DNT/GPC.
  }

  window.VRVlogMeasurement = Object.freeze({ stop, resume });
  window.addEventListener('storage', event => {
    if (event.key === preferenceKey && event.newValue === 'off') stop();
  });
  document.addEventListener('visibilitychange', () => {
    // A resumed preference applies to future documents; an already stopped tab
    // must not write the old preference back when its visibility changes.
    if (!stopped && disabled()) stop();
  });

  document.addEventListener('click', event => {
    const action = event.target.closest && event.target.closest('[data-analytics-action]');
    if (action) {
      if (action.dataset.analyticsAction === 'stop') stop();
      if (action.dataset.analyticsAction === 'resume') resume();
    }
  });

  if (!group || disabled() || document.prerendering) return;

  function send(name, parameters) {
    if (!active || disabled()) return;
    window.gtag('event', name, {
      send_to: measurementId, page_group: group, page_title: group,
      page_location: origin + location.pathname, page_referrer: '', ...parameters
    });
  }

  function destination(anchor) {
    try {
      const url = new URL(anchor.href, location.href);
      if (url.username || url.password || url.port) return null;
      if (url.protocol === 'https:') {
        if (url.hostname === 'apps.apple.com' && /\/id6789953414$/.test(url.pathname)) return 'ios_store';
        if (url.origin + url.pathname === 'https://groups.google.com/g/vrvlog-android-test') return 'android_group';
        if (url.origin + url.pathname === 'https://play.google.com/apps/testing/com.mitsuya0077.facemaskvtuber') return 'android_test';
        if (url.origin === origin && url.pathname === '/exporter/') return 'exporter';
        if (url.origin === origin && url.pathname === '/guide/') return 'guide';
      }
      if (url.protocol === 'vcc:' && url.hostname === 'vpm' && url.pathname === '/addRepo'
          && url.searchParams.getAll('url').length === 1
          && url.searchParams.get('url') === origin + '/exporter/index.json') return 'vpm_add';
    } catch (_) { /* Malformed or unrelated link. */ }
    return null;
  }

  function click(event) {
    if (event.isTrusted === false || event.defaultPrevented
        || (event.type === 'click' ? event.button !== 0 : event.button !== 1)) return;
    const anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;
    const target = destination(anchor);
    if (!target) return;
    const placement = anchor.closest('footer') ? 'footer' : anchor.closest('header,nav') ? 'nav'
      : anchor.closest('.hero') ? 'hero' : 'body';
    send('acquisition_click', { destination: target, placement });
  }
  document.addEventListener('click', click);
  document.addEventListener('auxclick', click);

  function video(event) {
    const target = event.target;
    if (group !== 'guide' || target.tagName !== 'VIDEO' || event.isTrusted === false || !active || disabled()) return;
    let state = videos.get(target);
    if (!state) { state = { started: false, milestones: new Set() }; videos.set(target, state); }
    if (!state.started && (event.type === 'playing'
        || (event.type === 'timeupdate' && target.paused === false && target.played.length > 0))) {
      state.started = true;
      send('guide_video_start', { video_id: 'getting_started' });
    }
    if (!state.started || !Number.isFinite(target.duration) || target.duration <= 0) return;
    let played = 0;
    for (let i = 0; i < target.played.length; i += 1) {
      played += Math.max(0, target.played.end(i) - target.played.start(i));
    }
    for (const percent of [25, 50, 75, 100]) {
      if (played / target.duration >= percent / 100 - 0.001 && !state.milestones.has(percent)) {
        state.milestones.add(percent);
        send('guide_video_progress', { video_id: 'getting_started', percent });
      }
    }
  }
  document.addEventListener('playing', video, true);
  document.addEventListener('timeupdate', video, true);
  document.addEventListener('ended', video, true);

  async function json(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer',
        cache: 'no-store', redirect: 'error', signal: controller.signal });
      if (!response.ok || (response.headers.get('Content-Type') || '').split(';')[0] !== 'application/json') return null;
      const text = await response.text();
      return text.length <= 2048 ? JSON.parse(text) : null;
    } finally { clearTimeout(timer); }
  }

  async function start() {
    const attempt = generation;
    try {
      const config = await json(origin + '/site-measurement-config.json');
      if (!config || config.enabled !== true || config.measurement_id !== measurementId
          || typeof config.eligibility_url !== 'string' || disabled()) return;
      const endpoint = new URL(config.eligibility_url);
      if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.port
          || endpoint.search || endpoint.hash || endpoint.pathname !== '/region'
          || !/^vrvlog-web-region\.[a-z0-9-]+\.workers\.dev$/.test(endpoint.hostname)) return;
      const eligibility = await json(endpoint.href);
      if (!eligibility || eligibility.measurement !== 'jp' || disabled() || attempt !== generation) return;
      // Do not start if this browser cannot persist a subsequent opt-out.
      localStorage.setItem(preferenceKey + '.check', '1');
      localStorage.removeItem(preferenceKey + '.check');
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('js', new Date());
      window.gtag('config', measurementId, { send_page_view: false, page_referrer: '',
        page_location: origin + location.pathname, page_title: group,
        ignore_referrer: true, campaign_id: 'not_collected', campaign_source: 'not_collected',
        campaign_medium: 'not_collected', campaign_name: 'not_collected',
        campaign_term: 'not_collected', campaign_content: 'not_collected',
        cookie_expires: 63072000, cookie_update: true,
        allow_google_signals: false, allow_ad_personalization_signals: false,
        ads_data_redaction: true, url_passthrough: false });
      const tag = document.createElement('script');
      tag.async = true;
      tag.referrerPolicy = 'no-referrer';
      tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
      tag.onload = () => {
        if (disabled() || attempt !== generation) return;
        active = true;
        if (!pageSent) { pageSent = true; send('page_view', {}); }
      };
      tag.onerror = () => { active = false; };
      document.head.appendChild(tag);
    } catch (_) { /* Missing configuration or connectivity leaves measurement off. */ }
  }
  start();
})();
