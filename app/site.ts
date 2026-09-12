export const sitePath = process.env.GITHUB_ACTIONS === "true" ? "/vr-vlog-website" : "";
export const siteHref = (path = "/") => `${sitePath}${path}`;
export const freeAccessParagraphs = [
  "VR Vlogは現在、撮影・編集・保存を含む、提供中の全機能を広告なし・無料でご利用いただけます。",
  "今後、広告の導入や、撮影・保存などの継続利用に買い切り購入が必要になるなど、提供条件を変更する場合があります。変更する場合は、対象となる利用者・機能・料金・開始日を事前にお知らせします。",
  "現在の無料提供は、将来にわたる全機能の無料利用を保証するものではありません。購入操作を行わない限り、料金が発生することはありません。",
] as const;
