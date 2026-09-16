/*
 * 營造業官網骨架：共用內容資料，也是唯一的內容來源
 * ------------------------------------------------------------------
 * 四種風格的所有頁面都從這裡讀文字與實績。客戶補資料時只要改這個檔案，
 * 四種風格會一起更新。目前是示範用的虛構資料。
 *
 * 文字欄位可以是「字串」或「{ text, status, note }」物件：
 *   字串               客戶已在訪談表確認，直接顯示
 *   status: "draft"    依既有資料暫擬，頁面顯示「暫擬」標籤，note 說明來源
 *   status: "missing"  客戶尚未提供，頁面顯示「待補」標籤和 note
 *
 * 注意：window.SITE = 後面必須是合法 JSON（雙引號、不能有尾逗號、裡面不能寫註解），
 * tools/check.py 會直接解析它來檢查頁面綁定。
 */
window.SITE = {
  "meta": {
    "updated": "2026-09-14",
    "showStyleSwitcher": true,
    "demoNotice": "本網站為版型示範：公司名稱、聯絡資訊與工程實績皆為虛構資料。",
    "noindex": true,
    "siteUrl": null,
    "gaId": null,
    "searchConsole": null,
    "styles": [
      { "id": "a", "dir": "a-notice", "name": "告示牌", "tagline": "穩重可信" },
      { "id": "b", "dir": "b-drawing", "name": "施工圖", "tagline": "精準專業" },
      { "id": "c", "dir": "c-concrete", "name": "清水模", "tagline": "簡約大方" },
      { "id": "d", "dir": "d-hoarding", "name": "工地圍籬", "tagline": "醒目大器" }
    ]
  },

  "seo": {
    "ogImage": "shared/img/og-cover.png",
    "twitterCard": "summary_large_image",
    "locale": "zh_TW"
  },

  "company": {
    "name": "範例營造股份有限公司",
    "shortName": "範例營造",
    "nameEn": "EXAMPLE CONSTRUCTION CO., LTD.",
    "shortNameEn": "EXAMPLE CONSTRUCTION",
    "slogan": ["安全", "品質", "技術", "服務"],
    "founded": "2015",
    "capital": "新台幣 1,000 萬元",
    "taxId": "12345678",
    "license": "綜丙X字第X00000-000號",
    "grade": "丙等綜合營造業",
    "representative": "王○○",
    "address": "台中市西屯區範例路 100 號",
    "postalCode": "407",
    "mapQuery": "臺中市西屯區",
    "city": "台中市西屯區",
    "phone": "(04) 0000-0000",
    "phoneHref": "tel:+886400000000",
    "fax": "(04) 0000-0001",
    "email": "service@example.com",
    "emailHref": "mailto:service@example.com",
    "hours": "週一至週五 08:00–17:00",
    "hoursSchema": {
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    },
    "line": { "text": null, "status": "missing", "note": "LINE 官方帳號（選填）" },
    "facebook": { "text": null, "status": "missing", "note": "Facebook 粉專（選填）" }
  },

  "copy": {
    "intro": {
      "text": "範例營造股份有限公司成立於 2015 年，為丙等綜合營造業，資本額新台幣 1,000 萬元，立足台中市西屯區，承攬廠房、住宅與加油站等新建工程。",
      "status": "draft",
      "note": "依訪談表資料暫擬；正式公司簡介／經營理念（100–200 字）待客戶提供"
    },
    "philosophy": { "text": null, "status": "missing", "note": "經營理念說明（訪談表的公司簡介欄未填）" },
    "servicesLead": {
      "text": "依目前完成的工程整理出三類服務，正式項目與說明待確認。",
      "status": "draft",
      "note": "訪談表 ② 服務項目未填"
    },
    "projectsLead": "代表性工程實績，涵蓋廠房、住宅與加油站新建。",
    "contactLead": "工程洽詢、估價與合作，歡迎來電或填寫表單。",
    "ctaTitle": "有新建工程要規劃？",
    "ctaText": "來電或留言，說明工程類型、地點與規模。"
  },

  "facts": [
    { "label": "成立", "value": "2015", "unit": "年" },
    { "label": "資本額", "value": "1,000", "unit": "萬元" },
    { "label": "營造業等級", "value": "丙等", "unit": "綜合營造業" },
    { "label": "公司所在地", "value": "西屯", "unit": "台中市" }
  ],

  "values": [
    { "title": "安全", "en": "SAFETY", "desc": { "text": null, "status": "missing", "note": "「安全」的理念說明" } },
    { "title": "品質", "en": "QUALITY", "desc": { "text": null, "status": "missing", "note": "「品質」的理念說明" } },
    { "title": "技術", "en": "TECHNIQUE", "desc": { "text": null, "status": "missing", "note": "「技術」的理念說明" } },
    { "title": "服務", "en": "SERVICE", "desc": { "text": null, "status": "missing", "note": "「服務」的理念說明" } }
  ],

  "services": [
    {
      "id": "factory",
      "name": "廠房新建工程",
      "en": "FACTORY",
      "illus": "factory",
      "types": ["廠房"],
      "desc": {
        "text": "科技廠房與一般廠房新建，已完成西屯區科技廠房、大里區廠房等案件。",
        "status": "draft",
        "note": "依工程實績暫擬；服務說明（30–60 字）待客戶提供"
      }
    },
    {
      "id": "residential",
      "name": "住宅新建工程",
      "en": "RESIDENTIAL",
      "illus": "house",
      "types": ["住宅"],
      "desc": {
        "text": "住宅新建工程，已完成北屯區兩棟兩戶、太平區五棟五戶等住宅案件。",
        "status": "draft",
        "note": "依工程實績暫擬；服務說明（30–60 字）待客戶提供"
      }
    },
    {
      "id": "station",
      "name": "加油站新建工程",
      "en": "GAS STATION",
      "illus": "station",
      "types": ["加油站"],
      "desc": {
        "text": "加油站新建工程，已完成南屯區地上兩層加油站新建案。",
        "status": "draft",
        "note": "依工程實績暫擬；服務說明（30–60 字）待客戶提供"
      }
    }
  ],

  "projectTypes": ["廠房", "住宅", "加油站"],

  "projects": [
    {
      "id": "p01",
      "name": "西屯區科技廠房新建工程",
      "type": "廠房",
      "typeFull": "廠房／科技廠辦",
      "location": "台中市西屯區",
      "district": "西屯",
      "year": "2021",
      "floors": 4,
      "area": 1200,
      "scale": "地上四層／約 1,200㎡",
      "owner": "○○科技股份有限公司",
      "illus": "factory",
      "featured": true,
      "summary": { "text": null, "status": "missing", "note": "案件簡短說明（選填）" }
    },
    {
      "id": "p02",
      "name": "南屯區加油站新建工程",
      "type": "加油站",
      "typeFull": "加油站新建工程",
      "location": "台中市南屯區",
      "district": "南屯",
      "year": "2022",
      "floors": 2,
      "area": 600,
      "scale": "地上兩層／約 600㎡",
      "owner": "○○石油股份有限公司",
      "illus": "station",
      "featured": true,
      "summary": { "text": null, "status": "missing", "note": "案件簡短說明（選填）" }
    },
    {
      "id": "p03",
      "name": "北屯區住宅新建工程（兩棟兩戶）",
      "type": "住宅",
      "typeFull": "住宅新建工程",
      "location": "台中市北屯區",
      "district": "北屯",
      "year": "2022",
      "floors": 4,
      "area": 360,
      "scale": "地上四層・兩棟兩戶／約 360㎡",
      "owner": "○○建設有限公司",
      "illus": "house",
      "featured": true,
      "summary": { "text": null, "status": "missing", "note": "案件簡短說明（選填）" }
    },
    {
      "id": "p04",
      "name": "太平區住宅新建工程（五棟五戶）",
      "type": "住宅",
      "typeFull": "住宅新建工程",
      "location": "台中市太平區",
      "district": "太平",
      "year": "2023",
      "floors": 3,
      "area": 750,
      "scale": "地上三層・五棟五戶／約 750㎡",
      "owner": "△△建設有限公司",
      "illus": "house",
      "featured": false,
      "summary": { "text": null, "status": "missing", "note": "案件簡短說明（選填）" }
    },
    {
      "id": "p05",
      "name": "大里區廠房新建工程",
      "type": "廠房",
      "typeFull": "廠房／科技廠辦",
      "location": "台中市大里區",
      "district": "大里",
      "year": "2024",
      "floors": null,
      "area": null,
      "scale": { "text": null, "status": "missing", "note": "規模（樓層／面積）" },
      "owner": "○○貿易有限公司",
      "illus": "factory",
      "featured": false,
      "summary": { "text": null, "status": "missing", "note": "案件簡短說明（選填）" }
    }
  ],

  "certificates": [
    { "title": "營造業登記證", "detail": "綜丙X字第X00000-000號", "illus": "document" },
    { "title": "其他證照／獎項", "detail": { "text": null, "status": "missing", "note": "ISO、獎項等圖檔（選填）" }, "illus": "document" }
  ],

  "nav": [
    { "href": "index.html", "label": "首頁", "en": "HOME" },
    { "href": "about.html", "label": "關於我們", "en": "ABOUT" },
    { "href": "services.html", "label": "服務項目", "en": "SERVICES" },
    { "href": "projects.html", "label": "工程實績", "en": "PROJECTS" },
    { "href": "contact.html", "label": "聯絡我們", "en": "CONTACT" }
  ],

  "form": {
    "types": ["廠房新建工程", "住宅新建工程", "加油站新建工程", "其他"],
    "note": {
      "text": "表單欄位依訪談表範例暫定：姓名、電話、Email、工程類型、需求說明。",
      "status": "draft",
      "note": "訪談表 ④ 聯絡表單欄位未填"
    }
  }
};
