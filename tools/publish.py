#!/usr/bin/env python3
"""把選定的風格打包成可以直接上傳主機的網站根目錄。

用法（在專案根目錄執行）：
  python tools/publish.py --style a-notice --domain https://www.example.com.tw
  python tools/publish.py --style a-notice --domain https://www.example.com.tw \
      --ga G-XXXXXXXXXX --search-console <驗證碼> --out dist

做的事：
  1. 把該風格的 6 個頁面（含 404、隱私權政策，如果有的話）和 style.css/style.js 複製到輸出資料夾的根目錄
  2. 複製 shared/，並把頁面與 CSS 裡的 ../shared/ 改成 shared/
  3. 在 content.js 寫入正式網域、GA4 評估 ID、Search Console 驗證碼，並關掉風格切換列
     （site.js 只有在這些值存在時才會輸出 canonical、og:url、GA4）
  4. 產生 robots.txt 與 sitemap.xml
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "about.html", "services.html", "projects.html", "project.html", "contact.html"]
OPTIONAL_PAGES = ["404.html", "privacy.html"]
NO_INDEX = {"404.html"}


def load_site():
    src = (ROOT / "shared" / "content.js").read_text(encoding="utf-8")
    m = re.search(r"(.*?window\.SITE\s*=\s*)(\{.*\})(\s*;\s*)$", src, re.S)
    if not m:
        sys.exit("shared/content.js：找不到 window.SITE = {...};")
    return m.group(1), json.loads(m.group(2)), m.group(3)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--style", required=True, help="風格資料夾，例如 a-notice")
    ap.add_argument("--domain", required=True, help="正式網址，例如 https://www.example.com.tw")
    ap.add_argument("--out", default="dist", help="輸出資料夾（預設 dist）")
    ap.add_argument("--ga", default=None, help="GA4 評估 ID，例如 G-XXXXXXXXXX")
    ap.add_argument("--search-console", default=None, help="Search Console 的 google-site-verification 驗證碼")
    args = ap.parse_args()

    style_dir = ROOT / args.style
    if not style_dir.is_dir():
        sys.exit(f"找不到風格資料夾：{args.style}")
    domain = args.domain.rstrip("/")
    if not domain.startswith("https://"):
        sys.exit("--domain 請用 https:// 開頭的正式網址")

    out = ROOT / args.out
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    # 1) 頁面與樣式
    copied = []
    for name in PAGES + OPTIONAL_PAGES + ["style.css", "style.js"]:
        src = style_dir / name
        if not src.is_file():
            if name in PAGES:
                sys.exit(f"缺少必要檔案：{args.style}/{name}")
            continue
        text = src.read_text(encoding="utf-8").replace("../shared/", "shared/")
        (out / name).write_text(text, encoding="utf-8")
        copied.append(name)

    # 2) 共用資源
    shutil.copytree(ROOT / "shared", out / "shared")

    # 3) 寫入網域與分析設定
    head, site, tail = load_site()
    site["meta"]["siteUrl"] = domain
    site["meta"]["showStyleSwitcher"] = False
    if args.ga:
        site["meta"]["gaId"] = args.ga
    if args.search_console:
        site["meta"]["searchConsole"] = args.search_console
    (out / "shared" / "content.js").write_text(
        head + json.dumps(site, ensure_ascii=False, indent=2) + tail, encoding="utf-8")

    # 4) robots.txt 與 sitemap.xml
    (out / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {domain}/sitemap.xml\n", encoding="utf-8")

    lastmod = site["meta"].get("updated", "")
    urls = []
    for name in copied:
        if name in NO_INDEX or not name.endswith(".html"):
            continue
        if name == "project.html":
            for p in site["projects"]:
                urls.append((f"{domain}/project.html?id={p['id']}", "0.6"))
        elif name == "index.html":
            urls.append((f"{domain}/", "1.0"))
        else:
            urls.append((f"{domain}/{name}", "0.8"))

    body = "".join(
        f"  <url>\n    <loc>{loc}</loc>\n" + (f"    <lastmod>{lastmod}</lastmod>\n" if lastmod else "")
        + f"    <priority>{pri}</priority>\n  </url>\n" for loc, pri in urls)
    (out / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n",
        encoding="utf-8")

    print(f"已輸出到 {out}")
    print(f"  頁面：{', '.join(copied)}")
    print(f"  sitemap：{len(urls)} 筆")
    print(f"  網域：{domain}｜GA4：{site['meta']['gaId'] or '未設定'}｜Search Console：{'已設定' if site['meta']['searchConsole'] else '未設定'}")
    missing = [p for p in OPTIONAL_PAGES if p not in copied]
    if missing:
        print(f"  提醒：{args.style} 還沒有 {', '.join(missing)}")


if __name__ == "__main__":
    main()
