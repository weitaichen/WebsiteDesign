# 營造業官網骨架（四種風格提案）

中小型營造公司的官網頁面骨架：同一份內容做成四種視覺風格，讓業主挑選方向。

> **示範資料皆為虛構**：「範例營造股份有限公司」、統一編號、登記證號、電話、地址、業主與工程實績都是示範用的假資料，Logo 也是示範用標誌。
> 站台預設 `noindex`，不會被搜尋引擎收錄。

## 怎麼看

直接用瀏覽器開啟 `index.html`（風格總覽），點縮圖進入任一風格。
每個風格頁面的左下角都有切換列，可以停在同一頁直接比較四種風格。

要用本機伺服器預覽時，在專案根目錄執行：

```bash
python tools/serve.py
```

再開啟 `http://localhost:8765`。這個伺服器會要求瀏覽器不要快取，修改 `shared/content.js` 或圖片後，重新整理就能看到最新內容。

| 風格 | 資料夾 | 取材 |
|---|---|---|
| A 告示牌：穩重可信 | `a-notice/` | 工地施工告示牌，楷書標題、深藍框 |
| B 施工圖：精準專業 | `b-drawing/` | 施工圖的圖框、標題欄，依樓層數畫出的實績立面圖 |
| C 清水模：簡約大方 | `c-concrete/` | 清水模的模板接縫與螺桿孔，大量留白 |
| D 工地圍籬：醒目大器 | `d-hoarding/` | 綠色浪板圍籬、巨大標語與電話；手機版可以橫向滑動 |

每個風格都有這些頁面：
- 首頁 `index.html`
- 關於我們 `about.html`
- 服務項目 `services.html`
- 工程實績 `projects.html`
- 案件內頁 `project.html?id=p01`
- 聯絡我們 `contact.html`（表單附個資同意勾選）
- 隱私權政策 `privacy.html`（草稿）
- 找不到頁面 `404.html`

## 部署到 Vercel

純靜態網站，不需要建置：
- Framework Preset 選 **Other**
- Build Command 留空
- Output Directory 用專案根目錄

部署後根網址就是風格總覽頁。

## 結構

```
index.html            風格總覽（提案展示用）
shared/content.js     唯一的內容來源：公司資料、服務、實績、表單選項、SEO 與示範站設定
shared/site.js        共用行為：填入內容、選單、篩選、照片佔位、表單示意、地圖、SEO 標籤、GA4、風格切換列
shared/base.css       reset、照片佔位、待補／暫擬標籤、簡單頁面、風格切換列
shared/img/           示範標誌、網站小圖示、社群分享縮圖 og-cover.png
a-notice/ … d-hoarding/   各風格的頁面、style.css（B、D 另有 style.js）
tools/check.py        檢查工具：必要檔案、綁定路徑、站內連結、寫死的公司資料
tools/publish.py      把選定的風格打包成正式站（寫入網域、GA4，產生 robots.txt、sitemap.xml）
tools/og-cover.html   社群分享縮圖的來源頁（1200×630）
tools/serve.py        本機預覽伺服器（不快取，改完重新整理就看得到）
tools/smoke.html      site.js 的冒煙測試，用瀏覽器開啟後顯示「全部通過」
tools/STYLE_BRIEF.md  四種風格的設計規格與綁定規則
```

純 HTML/CSS/JS，沒有套件相依；字型使用 Google Fonts。

## 換成真實客戶資料

**只要改 `shared/content.js`**，所有風格會一起更新。文字欄位有三種寫法：

```js
"phone": "(04) 0000-0000"                                          // 已確認：直接顯示
"intro": { "text": "…", "status": "draft", "note": "資料來源說明" }   // 暫擬：顯示「暫擬」標籤
"scale": { "text": null, "status": "missing", "note": "規模（樓層／面積）" }  // 待補：顯示「待補」標籤
```

- 客戶補上正式內容後，把物件改回純字串，或填上 `text` 並拿掉 `status`，標籤就會消失。
- 實績規模除了 `scale` 文字，也要填 `floors`（樓層數）和 `area`（面積㎡），風格 B 的立面圖才會畫實線。
- 地圖用 `company.mapQuery` 定位，沒有設定時用公司地址。
- 換 Logo：替換 `shared/img/` 的 `logo-mark.png`（512×512 透明底）、`logo-mark@2x.png` 與小圖示。再用 1200×630 視窗截圖 `tools/og-cover.html`，產生新的 `og-cover.png`。
- 真實客戶網站要移除 `meta.demoNotice` 和 `meta.noindex`，提案結束後把 `meta.showStyleSwitcher` 設成 `false`。

修改後在專案根目錄執行檢查：

```bash
python tools/check.py
```

## SEO 與分析

`site.js` 會依 `content.js` 自動輸出：

| 項目 | 何時輸出 |
|---|---|
| og:title、og:description、og:site_name、og:locale、twitter:card | 一律輸出 |
| 結構化資料 GeneralContractor（名稱、統編、地址、電話、營業時間、服務） | 一律輸出 |
| canonical、og:url、og:image、麵包屑結構化資料 | 設定 `meta.siteUrl` 之後 |
| GA4（含「送出表單」「點電話」兩個事件） | 設定 `meta.gaId` 之後 |
| Search Console 驗證標籤 | 設定 `meta.searchConsole` 之後 |
| `robots: noindex, nofollow` | `meta.noindex` 為 `true` 時（示範站預設） |

## 正式上線打包

客戶選定風格後：

```bash
python tools/publish.py --style a-notice --domain https://www.正式網域.com.tw --ga G-XXXXXXXXXX --search-console 驗證碼
```

會在 `dist/` 產生可以直接上傳主機的網站根目錄：
- 該風格的頁面，並把 `../shared/` 改成 `shared/`
- 寫入網域、GA4、Search Console 驗證碼，並關掉風格切換列
- `robots.txt` 與 `sitemap.xml`（排除 404 頁）

上傳後：到 Search Console 提交 `sitemap.xml`，並用 Google 的「複合式搜尋結果測試」檢查結構化資料。

## 個資法

- 聯絡表單有必勾的同意選項，連到隱私權政策頁。
- `privacy.html` 是依《個人資料保護法》第八條告知事項寫的**草稿**，內容包括：蒐集目的、資料類別、利用期間／地區／對象／方式、當事人權利、不提供的影響、資料安全、Cookie 與網站分析、聯絡方式。
- 用於真實客戶前要確認：保存期限、委外的表單或寄信服務（若在境外要改寫第三點），必要時請法律顧問過目。
- 目前表單是版型示意，送出不會寄信；正式站要接寄信服務。
