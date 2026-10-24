export function AnalyticsSettings() {
  return <aside className="analytics-settings" aria-labelledby="analytics-settings-title">
    <h3 id="analytics-settings-title">アクセス解析の設定</h3>
    <p>このブラウザーの解析を停止・再開できます。閲覧・導入には影響しません。</p>
    <div className="analytics-settings-actions">
      <button type="button" data-analytics-action="stop">解析を停止する</button>
      <button type="button" data-analytics-action="resume">停止設定を解除する</button>
    </div>
    <p data-analytics-status="" role="status" aria-live="polite">
      設定は任意です。閲覧時に操作を求める画面は出しません。
    </p>
    <noscript><p>JavaScriptが無効なため、このブラウザーではアクセス解析を行いません。</p></noscript>
  </aside>;
}
