import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import { LegacyLinks } from "./components/LegacyLinks";
import { freeAccessParagraphs, siteHref, sitePath } from "./site";

function Screen({ file, alt, className = "", landscape = false, priority = false }: {
  file: string; alt: string; className?: string; landscape?: boolean; priority?: boolean;
}) {
  return <div className={`device ${className}`}><img src={siteHref(`/images/${file}`)} alt={alt}
    width={landscape ? 2048 : 945} height={landscape ? 945 : 2048}
    loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" /></div>;
}
function Credit() { return <span className="credit">©もち山金魚</span>; }

export default function Home() {
  return <div className="site" id="top"><a className="skip-link" href="#main-content">本文へ移動</a><LegacyLinks basePath={sitePath} /><SiteHeader />
    <main className="wrap" id="main-content">
      <section className="section hero" id="capture" aria-labelledby="hero-heading">
        <div className="hero-copy"><div className="eyebrow">iPhone用アプリ</div><h1 id="hero-heading">アバターで<br /><span>Vlogを撮る</span></h1>
          <p className="hero-lead">顔をアバターに置き換えて撮影するiPhoneアプリです。<br className="desktop-break" />服や背景は実写のまま、<br className="desktop-break" />表情や顔の向きがアバターに反映されます。<br className="desktop-break" />内カメラと外カメラを同時に撮れます。</p>
          <div className="launch-note"><span>公開初期は、全機能を広告なし・無料で。</span><a href="#free-access">提供条件</a></div>
          <div className="hero-actions">
            {/* Intentionally not a link: the app has not been released yet. */}
            <div className="store-badge"><img src={siteHref("/images/app-store-badge-ja.svg")} alt="App Storeからダウンロード" width={196} height={72} /></div>
            <a className="sub-link" href="#log">できることを見る <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <figure className="hero-figure"><Screen file="capture.webp?v=tokyo-bay-20260913" alt="東京湾岸の夜景とアバターを映した撮影画面" className="hero-device" priority /><figcaption><Credit /><span className="caption">撮影画面</span></figcaption></figure>
      </section>
      <section className="section review-section" id="log" aria-labelledby="log-heading">
        <div><span id="features" className="anchor" /><div className="tag">ログ</div><h2 id="log-heading">2秒ずつ撮って、<br />あとでつなぐ</h2>
          <p>「ログ」は、1回2秒の短い動画です。<br />撮ったあとにキャプションを入力して、<br className="desktop-break" />アプリに保存できます。</p></div>
        <figure><Screen file="log-review.webp" alt="キャプションを入力してログを保存する画面" className="landscape-device" landscape /><figcaption><span className="caption">ログ確認画面</span><Credit /></figcaption></figure>
      </section>
      <section className="section join-section" id="make-vlog" aria-labelledby="join-heading">
        <div className="join-copy"><div className="tag">ログをつなぐ</div><h2 id="join-heading">短い動画を撮るだけで、<br className="desktop-break" />かんたんに1本のVlogに</h2>
          <p>ごはんや散歩の途中に、2秒ずつ撮影。<br />使いたいログを選ぶと、撮影順につながって<br className="desktop-break" />1本のVlogができあがります。</p>
          <ul className="join-points"><li>ログごとにキャプションを入れる</li><li>隠したい部分にモザイクをかける</li><li>つないだ動画をアプリに保存する</li></ul>
          <p className="small">1本につなげられるのは最大30ログ・60秒。<br />完成動画の例は、5本のログをつないだ10秒の動画です。</p></div>
        <figure><div className="join-examples"><Screen file="log-join.webp" alt="料理とアバターが写ったログをつなぐ画面" className="join-device" /><div className="join-arrow" aria-hidden="true">→</div>
          <div className="output-example"><div className="output-heading">完成動画のイメージ</div><div className="movie">
            <img src={siteHref("/images/vlog-restaurant.webp")} alt="レストランの料理と、目を輝かせたアバター" width={720} height={1280} loading="lazy" decoding="async" /><span className="movie-caption">おいしそ～！</span><span className="duration">00:10</span></div><p>5ログ・10秒</p></div>
        </div><figcaption><Credit /></figcaption></figure>
      </section>
      <section className="section editing-section" id="editing" aria-labelledby="editing-heading">
        <div><div className="tag">動画の編集</div><h2 id="editing-heading">動画をカットして、<br />文字を入れる</h2><p>撮影した動画をアプリで編集できます。<br />文字の位置や大きさ、動画の色味も調整できます。</p>
          <dl className="editing-list"><div><dt>トリム</dt><dd>使いたい部分を残す</dd></div><div><dt>テキスト</dt><dd>文字を入れて、位置や大きさを調整</dd></div><div><dt>フィルタ</dt><dd>クリップごとに色味を変える</dd></div></dl></div>
        <figure><Screen file="video-editor.webp?v=scenery-20260913" alt="富士山・赤レンガ倉庫・五稜郭・レインボーブリッジと牛の景色に「すごい景色！」と文字を入れた動画編集画面" className="editor-device" /><figcaption><span className="caption">動画編集画面</span><Credit /></figcaption></figure>
      </section>
      <section className="section avatar-section" id="avatar" aria-labelledby="avatar-heading">
        <div><div className="tag">アバター</div><h2 id="avatar-heading">使うアバターを選ぶ</h2><dl className="avatar-methods">
          <div><dt>VRMファイル</dt><dd>iPhoneに保存したVRM 0.x / 1.0を読み込めます。</dd></div><div id="vroid-hub"><dt>VRoid Hub</dt><dd>自分が登録したモデルを選び、<br className="desktop-break" />利用条件を確認して使えます。</dd></div><div><dt>lilToon</dt><dd>専用の変換ツールでVRMに<br className="desktop-break" />書き出してから読み込みます。</dd></div></dl>
          <a className="exporter-link" href="https://mitsuya0077.github.io/VR-Vlog-lilToon-Exporter/">lilToon用の変換ツールを見る <span aria-hidden="true">→</span></a></div>
        <figure><div className="expressions-title">同じモデルで撮影した表情の例</div><div className="expressions">
          <img src={siteHref("/images/expression-neutral.webp")} alt="アバターの表情例1" width={386} height={515} loading="lazy" decoding="async" /><img src={siteHref("/images/expression-calm.webp")} alt="アバターの表情例2" width={386} height={515} loading="lazy" decoding="async" /><img src={siteHref("/images/expression-star.webp")} alt="目が輝くアバターの表情" width={386} height={515} loading="lazy" decoding="async" />
        </div><p className="expressions-copy">表情は撮影画面から切り替えられます。<br />使える表情はモデルによって異なります。</p><figcaption><Credit /></figcaption></figure>
      </section>
      <section className="section free-section" id="free-access" aria-labelledby="free-heading"><div className="tag">ご利用について</div><h2 id="free-heading">公開初期の無料提供について</h2><div className="free-copy">{freeAccessParagraphs.map((text, i) => <p className={i === 0 ? "free-lead" : undefined} key={text}>{text}</p>)}</div></section>
      <section className="section support" id="support" aria-labelledby="support-heading"><div><h2 id="support-heading">対応環境・サポート</h2><p>iOS 17以降・対応iPhone</p></div><nav className="support-links" aria-label="サポート"><a href={siteHref("/support/#requirements")}>対応環境</a><a href={siteHref("/support/#faq")}>よくある質問</a><a href={siteHref("/support/#contact")}>お問い合わせ</a></nav></section>
    </main><noscript><div className="legacy-fallback" id="privacy"><a href={siteHref("/privacy/")}>プライバシーポリシーを開く</a></div></noscript><SiteFooter />
  </div>;
}
