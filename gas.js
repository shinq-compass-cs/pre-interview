/**
 * 事前問診ヒアリングフォーム受信用 GAS WebApp
 *
 * デプロイ手順：
 *   1. Apps Scriptプロジェクトにこのファイルを貼り付ける
 *   2. SHEET_ID を対象のスプレッドシートIDに書き換える
 *   3. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *      実行ユーザー：自分 / アクセス：全員
 *   4. 発行されたURLを form.html の GAS_URL に貼り付ける
 */

const SHEET_ID = "ここにIDを貼る";
const SHEET_NAME = "回答";

// ヘッダー定義（列順）
const HEADERS = [
  "タイムスタンプ",
  "院名",
  "Q1：事前問診の実施有無",
  "Q2：理由または方法",
  "Q3：困っていること",
  "Q4：期待・メリット",
  "Q5：懸念・ハードル",
  "Q6：自由記述"
];

/**
 * POST受信
 */
function doPost(e) {
  try {
    // form.htmlはtext/plainで送ってくるのでe.postData.contentsをパース
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // シートが無ければ作成
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // ヘッダー未設定なら1行目に書き込み
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    }

    // 書き込み行
    const row = [
      new Date(),
      data.clinicName || "",
      data.q1 || "",
      data.q2 || "",
      data.q3 || "",
      data.q4 || "",
      data.q5 || "",
      data.q6 || ""
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 動作確認用（ブラウザで直接開いたとき）
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "alive" }))
    .setMimeType(ContentService.MimeType.JSON);
}
