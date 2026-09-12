import type { Metadata } from "next";
import { Subpage } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "プライバシーポリシー | VR Vlog",
  alternates: { canonical: "https://mitsuya0077.github.io/vr-vlog-website/privacy/" },
};

const privacyItems = [
  {
    title: "カメラ",
    text: "カメラ映像の表示と、顔・表情・頭部のトラッキングに使用します。",
  },
  {
    title: "マイク",
    text: "ユーザーが録画する際の音声収録に使用します。",
  },
  {
    title: "写真ライブラリ",
    text: "ユーザーが録画した動画を端末へ保存するために使用します。",
  },
  {
    title: "VRMファイル",
    text: "ユーザーが選択したアバターを表示するため、アプリ内のローカル領域へ保存します。",
  },
  {
    title: "設定情報",
    text: "選択したアバターや表示設定を、次回起動時に復元するため端末内へ保存します。",
  },
];

export default function PrivacyPage() {
  return <Subpage title="プライバシーポリシー">
    <p className="privacy-updated">最終更新日：2026年7月28日</p>
        <div className="privacy-panel">
          <p className="privacy-intro">
            VR
            Vlogは、機能提供に必要な範囲で端末のカメラ、マイク、写真ライブラリ、およびユーザーが選択したVRMファイルを使用します。
          </p>
          <dl className="privacy-list">
            {privacyItems.map((item) => (
              <div key={item.title}>
                <dt>{item.title}</dt>
                <dd>{item.text}</dd>
              </div>
            ))}
          </dl>
          <div className="privacy-details">
            <p>
              現行の開発版では、カメラ映像、音声、顔トラッキング情報、選択したローカルVRMファイルを開発者のサーバーへ送信しません。録画データは、ユーザーの操作により端末の写真ライブラリへ保存されます。
            </p>
            <p>
              アプリを削除すると、アプリ内に保存されたVRMファイルと設定は削除されます。写真ライブラリへ保存済みの動画は、ユーザーが写真アプリから削除できます。
            </p>
            <p>
              VRoid
              Hub連携機能の提供開始前に、公式SDK／APIを通じて取り扱う認証情報・モデル情報、その利用目的と保存方法を本ポリシーへ追記します。
            </p>
            <p>
              本ポリシーは、機能追加や法令・サービス要件の変更に応じて改定する場合があります。
            </p>
          </div>
        </div>
  </Subpage>;
}
