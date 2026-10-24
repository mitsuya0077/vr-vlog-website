export function AnalyticsSettings() {
  return <details className="analytics-settings">
    <summary>アクセス解析の設定（任意）</summary>
    <div className="analytics-settings-content">
      <p>このブラウザーのアクセス解析を停止・停止解除できます。閲覧や導入には影響しません。</p>
      <div className="analytics-settings-actions">
        <button type="button" data-analytics-action="stop">解析を停止する</button>
        <button type="button" data-analytics-action="resume">停止設定を解除する</button>
      </div>
      <p data-analytics-status="" role="status" aria-live="polite">
        設定の変更は任意です。
      </p>
      <noscript><p>JavaScriptが無効なため、このブラウザーではアクセス解析を行いません。</p></noscript>
    </div>
  </details>;
}
