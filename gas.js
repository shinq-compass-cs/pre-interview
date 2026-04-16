/**
 * 事前問診ヒアリングフォーム受信用 GAS WebApp
 *
 * Q1の回答により、書き込み先タブを振り分け：
 *   - 「はい（行っている）」 → 「導入中」タブ（7列）
 *   - 「いいえ（行っていない）」 → 「未導入」タブ（6列、Q3列なし）
 *
 * デプロイ手順：
 *   1. Apps Scriptプロジェクトに貼り付け
 *   2. SHEET_ID を対象のスプレッドシートIDに
 *   3. デプロイ → 新しいデプロイ → ウェブアプリ
 *      実行ユーザー：自分 / アクセス：全員
 */

const SHEET_ID = "1Efris-KIFPTL-vhVW7bHd_-PHep1dvbA3EtjTnAf3Q4";

const VAL_YES = "はい（行っている）";
const VAL_NO = "いいえ（行っていない）";

// タブ定義
const TABS = {
  yes: {
    name: "導入中",
    headers: [
      "タイムスタンプ",
      "院名",
      "Q2：どんな方法で行っているか",
      "Q3：導入メリット",
      "Q4：使っていて気になること",
      "Q5：自由記述"
    ],
    rowBuilder: (data) => [
      new Date(),
      data.clinicName || "",
      data.q2 || "",
      data.q3 || "",
      data.q4 || "",
      data.q5 || ""
    ]
  },
  no: {
    name: "未導入",
    headers: [
      "タイムスタンプ",
      "院名",
      "Q2：行っていない理由",
      "Q3：期待するメリット",
      "Q4：自由記述"
    ],
    rowBuilder: (data) => [
      new Date(),
      data.clinicName || "",
      data.q2 || "",
      data.q3 || "",
      data.q4 || ""
    ]
  }
};

/**
 * POST受信
 */
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Q1で振り分け
    let tab;
    if (data.q1 === VAL_YES) tab = TABS.yes;
    else if (data.q1 === VAL_NO) tab = TABS.no;
    else {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "invalid q1" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(tab.name);

    // タブが無ければ作成
    if (!sheet) {
      sheet = ss.insertSheet(tab.name);
    }

    // ヘッダー未設定なら1行目に書き込み
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, tab.headers.length).setValues([tab.headers]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(tab.rowBuilder(data));

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", tab: tab.name }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 動作確認用
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "alive" }))
    .setMimeType(ContentService.MimeType.JSON);
}
