export const downloadUrl = 'https://vrvlog.fun/download/';
export const stores = Object.freeze({
  ios: 'https://apps.apple.com/jp/app/vr-vlog/id6789953414',
  android: 'https://play.google.com/store/apps/details?id=com.mitsuya0077.facemaskvtuber',
});

export function storeForDevice(userAgent) {
  if (/iPhone|iPod/i.test(userAgent)) return stores.ios;
  if (/Android/i.test(userAgent)) return stores.android;
  return null;
}

function initialize() {
  const store = storeForDevice(navigator.userAgent || '');
  const landing = document.querySelector('[data-app-download-page]');
  if (landing && store) {
    location.replace(store);
    return;
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
      <a href="${stores.ios}">App Store ↗</a>
      <a href="${stores.android}">Google Play ↗</a>
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
