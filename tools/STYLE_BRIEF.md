# 營造業官網骨架：風格建置規格（給建置代理）

客戶（虛構示範）：範例營造股份有限公司，台中市的丙等綜合營造業。
客戶群以 B2B 為主：廠房業主、建設公司、加油站業者。客戶對風格只給了四個字：「簡單大方」。
網站的任務是讓潛在業主相信這是一家合法、可靠的承造廠商，看到實績，然後來電或留言。

四種風格由四個代理同時建置，各自負責一個資料夾。你只負責指派給你的那一個。
下面第 4 節列出全部四種風格，是為了讓你知道其他三種長什麼樣，避免風格互相靠近。

---

## 1. 硬性規則

1. **只能建立或修改自己的風格資料夾**（`<專案根目錄>/<dir>/`）。不要改 `shared\`、`tools\`、其他風格資料夾、根目錄 `index.html`。
   如果覺得共用層需要調整，不要自己改，寫在最後的回報裡。
2. **必要檔案**：`index.html`、`about.html`、`services.html`、`projects.html`、`project.html`、`contact.html`、`style.css`。
   `style.js` 可以選擇性加入，限用於本風格專屬的互動；要用一般 script，在 site.js 之後以 defer 載入。
3. **技術限制**
   - 不用建置工具、npm、框架、ES module（`type="module"` 在 file:// 會壞）、fetch。雙擊 HTML 就要能正常顯示。
   - 唯一允許的外部資源是 Google Fonts CSS。
4. **每頁 `<head>` 的載入順序固定**：
   Google Fonts → `../shared/base.css` → `style.css` → `<script src="../shared/content.js" defer>` → `<script src="../shared/site.js" defer>` →（`style.js` defer）
   - `<html lang="zh-Hant-TW" data-style="<id>">`
   - favicon：`../shared/img/favicon-32x32.png`、`../shared/img/apple-touch-icon.png`
5. **內容一律來自 `shared/content.js` 的綁定**
   - 公司名稱（內文）、電話、傳真、Email、地址、統編、登記證號、負責人、業主名稱、案件資料都不能寫死在 HTML 裡。被綁定的元素保持空白。
   - 可以直接寫的靜態文字：`<title>`、`<meta name="description">`、區塊標題、按鈕和 UI 文字、英文小標。
6. **不能杜撰事實**
   - 禁止：年資、完工件數、獎項、ISO、保固、團隊人數、「第一／最大／頂尖」、客戶見證、合作夥伴 Logo、印章或官方戳記圖案、圖庫照片。
   - 缺的內容保留為綁定欄位，site.js 會自動顯示「待補」或「暫擬」標籤。
7. **照片**：目前沒有任何照片。每個圖片位置都用帶 `data-illus` 的元素，site.js 會畫上線稿並加說明。照片不能用 `<img>`。
8. **Logo**：`../shared/img/logo-mark.png`（512×512，透明底）是示範用標誌：深藍、深綠、紅三道上升量體加棕色基線，高解析版是 `logo-mark@2x.png`。
   - 在深色或綠色底上改用白色版：`filter: brightness(0) invert(1)`。
   - Logo 旁邊用 HTML 文字排字標：`company.shortName` 加上 `company.shortNameEn`。
9. **無障礙**
   - 語意區塊用 `header`／`nav`／`main id="main"`／`footer`，每頁一個 h1。
   - 第一個可聚焦元素是 `<a class="skip-link" href="#main">跳到主要內容</a>`。
   - `:focus-visible` 要看得見，內文色彩對比達 AA。
   - 表單 label 要綁定到對應欄位。
   - 選單開關是 `<button data-nav-toggle aria-controls="…">`。
10. **響應式**：375、768、1280、1920px 都要看起來是刻意設計過的，375px 不能出現水平捲軸。只有明確設計成橫向捲動的元件可以例外。
11. **結構標記要反映真實內容**。服務項目沒有先後順序，不要加 01／02／03 這類裝飾性編號。完工年份是真的時間序，可以拿來用。
12. **不要用瀏覽器或預覽工具**，瀏覽器面板是共用的，視覺檢查由主持人統一做。
    完成前在專案根目錄執行 `python tools/check.py <dir>`，直到 0 個錯誤；也要處理提醒。
13. 動手寫 CSS 前，先載入 `anthropic-skills:frontend-design` skill 取得設計品質指引。
    **第 4 節的調色盤、字體、版面概念和招牌元素已經定案**，你負責把它做精緻，不要改換方向。

## 2. 綁定 API（完整說明見 `shared/site.js` 檔頭）

```html
<span data-bind="company.phone"></span>
<a data-attr="href:company.phoneHref" data-bind="company.phone"></a>
<p data-bind="company.slogan" data-join="　"></p>              <!-- 陣列用 data-join 串接 -->

<template data-each="projects" data-where="featured=true" data-limit="3">
  <article data-attr="data-type:item.type">
    <figure data-attr="data-illus:item.illus; data-ph-label:item.name"></figure>
    <h3><a data-attr="href:item.$href" data-bind="item.name"></a></h3>
    <p><span data-bind="item.location"></span>・<span data-bind="item.year"></span></p>
  </article>
</template>

<template data-each="services">                                <!-- 迴圈可以巢狀 -->
  <section data-attr="id:item.id">
    <h2 data-bind="item.name"></h2>
    <ul><template data-each="item.$projects"><li data-bind="item.name"></li></template></ul>
  </section>
</template>

<div data-if="project.owner">…</div>                             <!-- 值是空的就移除 -->
<figure data-illus="crane" data-ph-label="工地照片待補｜橫式 1920px 以上"></figure>
```

- **路徑**：沒有前綴的從 `window.SITE` 開始；`item.` 是目前迴圈的項目；`project.` 只能用在 project.html。
- **site.js 自動產生的欄位**
  - 案件：`$href`、`$gallery`（4 張照片佔位，每項有 illus、label）、`$prev`、`$next`、`$others`
  - 服務：`$href`（services.html#id）、`$projects`、`$count`
  - 其他：`$year`（今年）
- **導覽**：`[data-nav]` 裡的連結會自動加上 `aria-current="page"`。`<button data-nav-toggle>` 會切換 `html.nav-open`；捲動後 html 會加上 `is-scrolled`。
- **實績篩選**：`<div data-filter-group="#project-list">` 裡放 `<button data-filter="*">全部</button>`，其他按鈕用 `<template data-each="projectTypes"><button type="button" data-attr="data-filter:item" data-bind="item"></button></template>` 產生。清單項目要帶 `data-type`，筆數用 `<span data-filter-count>` 顯示。
- **表單**：`<form data-demo-form>` 裡放 `<p data-form-status hidden>`。
- **地圖**：`<iframe data-map>`（src 由 site.js 設定）；`<a data-map-link>` 在 Google 地圖開啟。
- **進場動畫**：`data-reveal`，只用在少數刻意的地方。
- **佔位線稿種類**：`factory`、`station`、`house`、`crane`、`building`、`document`。
- **可覆寫的 CSS 變數**
  - 佔位：`--ph-bg`、`--ph-fg`、`--ph-art`、`--ph-stroke`、`--ph-ratio`、`--ph-label`
  - 標籤：`--note-missing-text`、`--note-missing-bg`、`--note-missing-fg`、`--note-draft-bg`、`--note-draft-fg`
  - 聚焦框：`--focus`
- **style.js**：可以用 `window.YS`（site、ctx、resolve、textOf、isEmpty、hydrate、decorate、art）。自己產生的元素如果帶 data-illus 或 data-reveal，要呼叫 `YS.decorate(元素)`。
- **提案展示用的風格切換列**會自動固定在左下角（高約 38px），不要讓重要內容被它蓋住。

## 3. 資訊架構（四種風格內容相同，呈現方式不同）

**每一頁都有**
- **Header**
  - Logo 加字標，連到 index.html
  - `[data-nav]`：首頁、關於我們、服務項目、工程實績、聯絡我們
  - 手機版選單按鈕
  - 聯絡入口：電話連結 `company.phoneHref`，和／或「工程洽詢」連到 contact.html
- **Footer**
  - company.name、company.nameEn
  - 營造業登記證 company.license、統一編號 company.taxId
  - 地址、電話、傳真、Email（mailto）、營業時間
  - 導覽連結
  - © `$year` company.name

**index.html 首頁**
1. **Hero**
   - h1 = `company.slogan`（安全 品質 技術 服務，客戶自己的標語）
   - 副標：company.name、company.grade、company.city
   - CTA：「看工程實績」→ projects.html；「工程洽詢」→ contact.html
2. **公司概況**：`facts`（label、value、unit）
3. **關於我們摘要**：`copy.intro`，連到 about.html
4. **服務項目**：`services`（name、en、desc、$count 件實績、illus），各自連到 $href
5. **精選實績**：`projects` 加 `data-where="featured=true"`
   - 每件：佔位圖、typeFull、name、location、year
   - 另附連到 projects.html 的連結
6. **CTA**：`copy.ctaTitle`、`copy.ctaText`、電話、「工程洽詢」按鈕

**about.html 關於我們**
1. 頁首
2. **公司簡介**：`copy.intro`、`copy.philosophy`，加形象照佔位（`data-illus="building"`，說明「公司／團隊形象照待補」）
3. **經營理念**：`values`（title、en、desc）
4. **公司資料表**：公司名稱、英文名稱、統一編號、成立年份、資本額、營造業登記證、營造業等級、負責人、公司地址
5. **證照**：`certificates`（title、detail、illus）

**services.html 服務項目**
1. 頁首，加上 `copy.servicesLead`
2. **每項服務**
   - 錨點 id 用 `item.id`
   - name、en、desc、佔位圖
   - 相關實績（`item.$projects`：name、location、year，連到 $href）
3. CTA

**projects.html 工程實績**
1. 頁首，加上 `copy.projectsLead`
2. 篩選（全部＋projectTypes）與筆數
3. **`#project-list`**
   - 每件：`data-type`、佔位圖、typeFull、name、location、year、scale
   - 連到 $href

**project.html 案件內頁**（`<body data-page="project">`，網址 `?id=p01`）
1. 麵包屑：工程實績 / project.name
2. h1 project.name，類型標籤 project.typeFull
3. **規格表**：工程類型、工程地點、完工年份、規模 project.scale、業主 project.owner
4. 案件說明 project.summary
5. **照片區**：`project.$gallery`（`data-attr="data-illus:item.illus; data-ph-label:item.label"`）
6. 上一件／下一件：project.$prev、project.$next（name、$href）
7. CTA

**contact.html 聯絡我們**
1. 頁首，加上 `copy.contactLead`
2. **聯絡資訊**：地址（加 `a[data-map-link]`「在 Google 地圖開啟」）、電話、傳真、Email、營業時間
3. **表單** `<form data-demo-form>`
   - 姓名（必填，name="name"）
   - 聯絡電話（必填，type=tel）
   - Email（type=email）
   - 工程類型：select，第一個選項是空值「請選擇」，其餘用 `form.types` 產生
   - 需求說明（必填，textarea）
   - 送出按鈕、`[data-form-status]`、小字 `form.note`
4. **地圖**：`<iframe data-map>`，容器要有固定比例

---

## 4. 四種風格（已定案）

### A · 告示牌 `a-notice`：穩重可信
- **取材**：台灣每個工地都有的施工告示牌。白底板面、深藍外框、立在兩支柱上，一行一行列出承造資訊。業主一看就知道這是合法、負責任的營造廠。
- **色彩**
  - 告示藍 `#1B2A4A`：外框、header 底線、標題
  - 板面白 `#FFFFFF`
  - 鋁框灰 `#D5DAE1`：分隔線、框線
  - 霧面灰 `#F1F3F6`：交錯區塊底色、ph-bg
  - 墨色 `#151C27`：內文
  - 印泥紅 `#E2001A`：只用在板面標題前的小紅方塊、目前頁面底線、CTA hover
- **字體**
  - 「LXGW WenKai TC」700：楷書是公文和告示的語氣，只用在 h1 標語、板面標題與列名、頁面 h1
  - 其他文字用「Noto Sans TC」400/500/700
  - 數字用 tabular-nums
- **版面**
  - Header 白底加告示藍底線
  - Hero 左右兩欄：左邊楷書 h1 標語、公司名稱／等級／地區、兩個 CTA；右邊是招牌元素
  - Hero 下方接滿版工地照片佔位（crane）
  - 服務項目排成三欄，每欄頂端一條告示藍線
  - 實績卡片做成迷你告示牌：佔位圖、深藍標題列（楷書案件名稱），下面列出地點、完工、規模
  - CTA 是告示藍色帶，電話放大；footer 告示藍
- **招牌元素**：hero 的「承造廠商」告示牌，用 HTML/CSS 製作
  - 深藍厚外框，楷書標題「承 造 廠 商」
  - 表格列：公司名稱／營造業登記證／營造業等級／負責人／公司地址／聯絡電話，全部綁定
  - 板子下方兩支柱子立在地面線上
  - 手機版隱藏柱子，板面改為滿寬
  - 不要印章圖案

### B · 施工圖 `b-drawing`：精準專業
- **取材**：施工圖圖紙，包含圖框、標題欄（工程名稱／圖名／比例／日期／承造人）、立面圖、尺寸線、樓層線（1F…4F、GL）。
- **色彩**
  - 圖紙 `#FAFBFC`：頁面底色
  - 圖線藍 `#2F4A7A`：線稿、尺寸線、標註
  - 深藍 `#1B2A4A`：標題、內文
  - 淡格 `#DCE3EC`：框線；ph-bg `#EEF2F6`
  - 修訂紅 `#E2001A`：只用在剖面符號、樓層記號這類小標註
  - 工程綠 `#00593F`：主要按鈕
- **字體**
  - 「Noto Sans TC」500/700 標題（字距 .04em）、400 內文
  - 「IBM Plex Mono」400/500：尺寸數字、樓層記號、標題欄欄位、篩選鈕、規格欄名
- **版面**
  - 桌機版每頁包在圖框裡：內縮 12–20px、1px 框線
  - Footer 就是標題欄，格子包含：承造人 company.name、營造業登記證、地址、電話、圖名（該頁名稱，靜態文字）、更新日期 `meta.updated`
  - 區塊標題前用剖面符號（圓圈加橫線），裡面放英文區塊名，不用數字
  - 實績頁的清單做成圖說表：工程名稱／類型／地點／完工／規模
  - 聯絡表單排成表格，欄名用等寬字
  - 留白要大方，不要做成密排多欄的報紙版面
- **招牌元素**：首頁 hero 下方的「實績立面圖」，由 style.js 用 SITE.projects 產生 SVG
  - 所有案件共用一條 GL 地面線，由左到右依完工年份排列
  - 建物高度依 `floors` 等比、寬度依 `area` 開根號後限制範圍
  - `floors`／`area` 是 null 的案件（p05）用虛線畫，標註「規模待補」
  - 左側標 1F–4F 樓層記號，每棟下方用等寬字標 district 和 year
  - 每棟建物都是連到案件內頁的連結，hover／focus 時變成工程綠
  - 手機版要能看：用 viewBox 縮放，或放在自己的橫向捲動容器裡
  - 在 project.html 可以只畫單棟立面

### C · 清水模 `c-concrete`：簡約大方
- **取材**：清水模。模板接縫（900×1800mm，也就是 1:2 的板）和規律排列的穿牆螺桿孔（P-cone 孔）；木模板是冷色裡唯一的暖色。
- **色彩**
  - 清水灰 `#D6D6D2`：模板面
  - 淺清水 `#EBEBE8`：頁面底色
  - 接縫灰 `#B9B9B4`：接縫、分隔線
  - 石墨 `#26292B`：標題、內文
  - 中灰 `#5E6264`：次要文字
  - 模板木 `#6B4A3A`：Logo 的棕色，用在連結、聚焦框、少量點綴
- **字體**
  - 「Noto Sans TC」300：大型展示字，細字重、寬字距 .12em
  - 「Noto Sans TC」400/500：內文
  - 「Jost」300/500：英文和數字（年份、資本額、英文小標）
- **版面**
  - 非常疏朗，一個區塊只講一件事；文字寬度上限約 34em，邊界大
  - Header 透明，壓在底色上，選單用純文字
  - 服務項目是三塊並排的直式模板
  - 實績用大尺寸左右交錯排列：3:2 佔位圖加文字欄，年份用 Jost
  - 公司概況用安靜的定義清單；footer 是一條清水灰色帶
- **招牌元素**：hero 是滿版的清水模牆
  - CSS grid 排出 1:2 模板，1px 接縫，每塊板六個螺桿孔（radial-gradient）
  - 四個標語字一板一字，像澆鑄在牆裡
  - 做法：字色比板面略深，下方加 1px 亮邊，效果必須非常含蓄
  - 公司名稱小字放在牆下方
  - 螺桿孔圖案其他地方只能節制地重複一次，例如區塊分隔的四個點
- **避免預設風格**：不用米色底、不用襯線展示字、不用赤陶色；棕色只能少量使用

### D · 工地圍籬 `d-hoarding`：醒目大器
- **取材**：台灣工地的印刷鋼板圍籬。一片片浪板相連、滿版品牌色、巨大標語，公司名稱和電話印得很大，讓路人看得到。
- **色彩**
  - 圍籬綠 `#00593F`：Logo 的綠色，用在 hero 圍籬板和 footer
  - 深綠 `#00432F`：相間的板、hover
  - 浪板白 `#F6F7F5`：頁面底色、白色板
  - 淺綠灰 `#E2EAE5`：區塊底色、ph-bg
  - 墨綠黑 `#0F1A15`：內文
  - 標語紅 `#E2001A`：Logo 的紅色，只用在電話數字和主要 CTA
- **字體**
  - 「Noto Sans TC」900：巨大標語、h1、h2，圍籬印刷就是這種字重
  - 「Noto Sans TC」400/500：內文
  - 「Big Shoulders Display」800：數字和英文（電話、年份、英文小標），這是城市標誌用字
- **版面**
  - Header 白底，下緣一條綠色帶
  - 服務項目是大面積淡綠色塊；實績用兩欄大卡片、粗體字
  - CTA 是滿寬的圍籬色帶，再印一次電話；footer 綠色
- **招牌元素**：hero 是一整排圍籬板
  - 四片綠色浪板各印一個標語字：用 repeating-linear-gradient 做直向浪紋、板間接縫、底部細地基帶
  - 第五片是白板，印 Logo、範例營造和紅色大電話
  - 桌機版一整排；平板兩排；手機版做成可橫向捲動的 scroll-snap 圍籬（像沿著圍籬走），要有看得出來的滑動提示
  - CTA 色帶再呼應一次這個元素
- **避免預設風格**：底色是亮的，不做深色主題；綠是品牌色，紅只用在電話和 CTA

---

## 5. 最後回報（300 字以內）
- 建立了哪些檔案
- 風格如何落實：版面、字體、色彩決策，最多 8 點
- `python tools/check.py <dir>` 的結果
- 對共用層的問題或需求
