export const downloadUrl = 'https://vrvlog.fun/download/';
export const stores = Object.freeze({
  ios: 'https://apps.apple.com/jp/app/vr-vlog/id6789953414',
  android: 'https://play.google.com/store/apps/details?id=com.mitsuya0077.facemaskvtuber',
});

// 告知のリンクの印（/download/?c=x-20261128-group など）。docs/download-campaign.md
// App Store のキャンペーン（ct）は30文字まで。形の違う印は使わず、印の無いリンクとして扱う。
export const campaignPattern = /^[a-z0-9][a-z0-9_-]{0,29}$/;
// サイトの中のボタン（トップ・メニュー）から来た人の印。
export const siteCampaign = 'site';
// App Store Connect のプロバイダトークン（キャンペーンのリンクの pt。秘密ではない）。
// App Store Connect でキャンペーンのリンクを1回作ると分かる。Apple は pt と ct を組で使う前提なので、
// 未設定の間は iOS の印が数えられない（docs/download-campaign.md）。
export const appleProviderToken = '';

export function campaignFrom(search) {
  let value = null;
  try {
    value = new URLSearchParams(search || '').get('c');
  } catch (_) {
    return null;
  }
  return value && campaignPattern.test(value) ? value : null;
}

// ストアのリンクに印を付ける。印が無ければ元のリンクのまま。
export function taggedStore(store, campaign) {
  if (!campaign || !campaignPattern.test(campaign)) return store;
  const url = new URL(store);
  if (store === stores.ios) {
    if (appleProviderToken) url.searchParams.set('pt', appleProviderToken);
    url.searchParams.set('ct', campaign);
    url.searchParams.set('mt', '8');
  } else if (store === stores.android) {
    url.searchParams.set('referrer', new URLSearchParams({
      utm_source: campaign.split('-')[0],
      utm_medium: 'vrvlog_download',
      utm_campaign: campaign,
    }).toString());
  } else {
    return store;
  }
  return url.toString();
}

export function storeForDevice(userAgent) {
  if (/iPhone|iPod/i.test(userAgent)) return stores.ios;
  if (/Android/i.test(userAgent)) return stores.android;
  return null;
}

function initialize() {
  const landing = document.querySelector('[data-app-download-page]');
  // ダウンロードのページは来たリンクの印を、サイトのほかのページはサイトの印を引き継ぐ。
  const campaign = campaignFrom(location.search) || (landing ? null : siteCampaign);
  const device = storeForDevice(navigator.userAgent || '');
  const store = device && taggedStore(device, campaign);
  if (landing && store) {
    location.replace(store);
    return;
  }

  // ページに書かれたストアのリンク（トップのバッジ、ダウンロードのページのボタン）にも同じ印を付ける。
  for (const link of document.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (href === stores.ios || href === stores.android) link.href = taggedStore(href, campaign);
  }

  const triggers = document.querySelectorAll('[data-app-download]');
  for (const trigger of triggers) trigger.href = store || '/download/';
  if (store || !triggers.length || typeof HTMLDialogElement === 'undefined'
      || typeof HTMLDialogElement.prototype.showModal !== 'function') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'app-download-dialog';
  dialog.setAttribute('aria-labelledby', 'app-download-title');
  dialog.setAttribute('aria-describedby', 'app-download-description');
  dialog.innerHTML = `
    <button type="button" class="app-download-close" aria-label="閉じる" autofocus>×</button>
    <h2 id="app-download-title">スマホでダウンロード</h2>
    <p id="app-download-description">スマホのカメラでQRコードを読み取り、表示されたリンクを開いてください。</p>
    <img class="app-download-qr" src="/images/app-download-qr.svg" width="168" height="168" alt="VR Vlogのダウンロード案内を開くQRコード"/>
    <p class="app-download-platforms">iPhone・Android対応</p>
    <div class="app-download-copy-row">
      <input aria-label="スマホで開くURL" type="text" readonly value="${downloadUrl}"/>
      <button type="button" class="app-download-copy">コピー</button>
    </div>
    <p class="app-download-status" role="status" aria-live="polite"></p>
    <p class="app-download-store-label">または、ストアでアプリを見る</p>
    <div class="app-download-stores">
      <a href="${taggedStore(stores.ios, campaign).replaceAll('&', '&amp;')}">App Store ↗</a>
      <a href="${taggedStore(stores.android, campaign).replaceAll('&', '&amp;')}">Google Play ↗</a>
    </div>`;
  document.body.append(dialog);

  const closeButton = dialog.querySelector('.app-download-close');
  const copyButton = dialog.querySelector('.app-download-copy');
  const address = dialog.querySelector('input');
  const status = dialog.querySelector('[role="status"]');
  let opener = null;
  let previousOverflow = '';
  let generation = 0;

  for (const trigger of triggers) {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey
          || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (dialog.open) return;
      opener = trigger;
      status.textContent = '';
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  }

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    generation += 1;
    copyButton.disabled = false;
    document.body.style.overflow = previousOverflow;
    const target = opener?.getClientRects().length ? opener : document.querySelector('.menu-button');
    target?.focus({ preventScroll: true });
  });

  address.addEventListener('click', () => address.select());
  copyButton.addEventListener('click', async () => {
    const operation = generation;
    copyButton.disabled = true;
    try {
      await navigator.clipboard.writeText(downloadUrl);
      if (operation === generation && dialog.open) status.textContent = 'URLをコピーしました。';
    } catch (_) {
      if (operation === generation && dialog.open) {
        status.textContent = 'コピーできませんでした。URLを選択してコピーしてください。';
        address.focus();
        address.select();
      }
    } finally {
      if (operation === generation) copyButton.disabled = false;
    }
  });
}

if (typeof document !== 'undefined') initialize();
