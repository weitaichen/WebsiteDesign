#!/usr/bin/env python3
"""營造業官網骨架檢查工具

用法（在專案根目錄執行）：
  python tools/check.py              檢查全部風格
  python tools/check.py a-notice     只檢查指定的風格資料夾

檢查項目：
  錯誤  必要檔案、<html> 屬性、共用資源載入順序、站內連結、
        data-bind / data-attr / data-each / data-if 綁定路徑、data-illus 名稱
  提醒  寫死在 HTML 的公司資料（應改用 data-bind）、疑似杜撰的宣傳用語
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "about.html", "services.html", "projects.html", "project.html", "contact.html"]
NAV_TARGETS = {"index.html", "about.html", "services.html", "projects.html", "contact.html"}
ILLUS = {"factory", "station", "house", "crane", "building", "document"}
COLLECTIONS = ["projects", "services", "values", "facts", "certificates", "nav"]
DERIVED = {
    "projects": {"$no", "$href", "$gallery", "$prev", "$next", "$others"},
    "services": {"$no", "$href", "$projects", "$count"},
    "values": {"$no"}, "facts": {"$no"}, "certificates": {"$no"}, "nav": {"$no"},
}
GALLERY = {"$no", "illus", "label"}
HARDCODED = ["0000-0000", "0000-0001", "12345678", "X00000", "王○○", "範例路", "example.com",
             "○○科技", "○○石油", "○○建設", "△△建設", "○○貿易"]
CLAIMS = ["年經驗", "經驗豐富", "ISO", "獲獎", "得獎", "保固", "第一", "最大", "頂尖", "最專業",
          "Lorem", "lorem", "示範案場", "屏東", "高雄"]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
EXTERNAL = re.compile(r"^(https?:|mailto:|tel:|#|javascript:|data:)")


def load_site():
    src = (ROOT / "shared" / "content.js").read_text(encoding="utf-8")
    m = re.search(r"window\.SITE\s*=\s*(\{.*\})\s*;\s*$", src, re.S)
    if not m:
        sys.exit("shared/content.js：找不到 window.SITE = {...};")
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        sys.exit(f"shared/content.js：window.SITE 不是合法 JSON（第 {e.lineno} 行附近）：{e.msg}")


def item_keys(site, name):
    keys = set(DERIVED.get(name, set()))
    for x in site.get(name, []):
        if isinstance(x, dict):
            keys |= set(x)
    return keys


def dig(obj, parts):
    for part in parts:
        if isinstance(obj, dict) and part in obj:
            obj = obj[part]
        elif isinstance(obj, list) and part.isdigit() and int(part) < len(obj):
            obj = obj[int(part)]
        else:
            return KeyError
    return obj


def schema_of(site, each_path):
    """回傳 (名稱, 欄位集合)；純文字陣列回傳 (名稱, None)；無法判斷回傳 (名稱, set())。"""
    p = each_path.strip()
    for prefix in ("item.", "project."):
        if p.startswith(prefix):
            sub = p[len(prefix):]
            if sub in ("$projects", "$others"):
                return "projects", item_keys(site, "projects")
            if sub == "$gallery":
                return "$gallery", GALLERY
            return p, set()
    head = p.split(".")[0]
    if head in COLLECTIONS and "." not in p:
        return head, item_keys(site, head)
    val = dig(site, p.split("."))
    if isinstance(val, list):
        dicts = [x for x in val if isinstance(x, dict)]
        return (p, set().union(*[set(d) for d in dicts])) if dicts else (p, None)
    return p, set()


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []          # (tag, 是否 data-nav, 是否 data-each template)
        self.each = []          # 目前所在的 data-each 路徑堆疊
        self.binds = []         # (種類, 路徑, 堆疊, 行號)
        self.links = []         # (網址, 行號)
        self.assets = []
        self.html_attrs, self.body_attrs = {}, {}
        self.illus = []
        self.nav_depth = 0
        self.nav_hrefs = set()
        self.nav_template = False
        self.text = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        line = self.getpos()[0]
        if tag == "html":
            self.html_attrs = a
        elif tag == "body":
            self.body_attrs = a
        elif tag in ("script", "style"):
            self.skip += 1
        if tag == "link" and "stylesheet" in a.get("rel", ""):
            self.assets.append(a.get("href", ""))
        if tag == "script" and a.get("src"):
            self.assets.append(a["src"])

        parent_stack = list(self.each)
        is_each = tag == "template" and bool(a.get("data-each"))
        if tag not in VOID:
            self.tags.append((tag, "data-nav" in a, is_each))
            if "data-nav" in a:
                self.nav_depth += 1
            if is_each:
                self.each.append(a["data-each"])

        if self.nav_depth:
            if tag == "a" and a.get("href"):
                self.nav_hrefs.add(re.split(r"[?#]", a["href"])[0])
            if is_each and a["data-each"].strip() == "nav":
                self.nav_template = True

        if is_each:
            self.binds.append(("data-each", a["data-each"], parent_stack, line))
        for key in ("data-bind", "data-if", "data-unless"):
            if a.get(key):
                self.binds.append((key, a[key], list(self.each), line))
        if a.get("data-attr"):
            for pair in a["data-attr"].split(";"):
                if ":" in pair:
                    self.binds.append(("data-attr", pair.split(":", 1)[1], list(self.each), line))
        if a.get("data-illus"):
            self.illus.append((a["data-illus"], line))
        if "data-attr" not in a:
            for attr in ("href", "src"):
                if a.get(attr):
                    self.links.append((a[attr], line))

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
        for i in range(len(self.tags) - 1, -1, -1):
            if self.tags[i][0] == tag:
                for _, nav, each in self.tags[i:]:
                    if nav:
                        self.nav_depth -= 1
                    if each and self.each:
                        self.each.pop()
                del self.tags[i:]
                break

    def handle_data(self, data):
        if not self.skip and data.strip():
            self.text.append((data, self.getpos()[0]))


def check_path(site, kind, path, stack, where, page_file, errors):
    p = path.strip()
    parts = p.split(".")
    label = f"{where} {kind}=「{p}」"
    projects = item_keys(site, "projects")
    if parts[0] == "item":
        if not stack:
            errors.append(f"{label}：用了 item，但不在 <template data-each> 裡")
            return
        name, keys = schema_of(site, stack[-1])
        if keys is None:
            if len(parts) > 1:
                errors.append(f"{label}：{name} 的項目是純文字，只能寫 item")
        elif keys and len(parts) > 1 and parts[1] not in keys:
            errors.append(f"{label}：{name} 的項目沒有欄位 {parts[1]}")
        elif len(parts) > 2 and parts[1] in ("$prev", "$next") and parts[2] not in projects:
            errors.append(f"{label}：案件沒有欄位 {parts[2]}")
        return
    if parts[0] == "project":
        if page_file != "project.html":
            errors.append(f"{label}：project.* 只能用在 project.html")
        if len(parts) > 1 and parts[1] not in projects:
            errors.append(f"{label}：案件沒有欄位 {parts[1]}")
        elif len(parts) > 2 and parts[1] in ("$prev", "$next") and parts[2] not in projects:
            errors.append(f"{label}：案件沒有欄位 {parts[2]}")
        return
    if p == "$year":
        return
    if dig(site, parts) is KeyError:
        errors.append(f"{label}：content.js 裡找不到這個路徑")


def check_style(site, style):
    d = ROOT / style["dir"]
    errors, warnings = [], []
    if not d.is_dir():
        return [f"{style['dir']}/：資料夾不存在"], warnings
    for f in PAGES + ["style.css"]:
        if not (d / f).is_file():
            errors.append(f"{style['dir']}/{f}：檔案不存在")
    order = ["../shared/base.css", "style.css", "../shared/content.js", "../shared/site.js"]
    for f in PAGES + [p for p in ("404.html", "privacy.html") if (d / p).is_file()]:
        path = d / f
        if not path.is_file():
            continue
        where = f"{style['dir']}/{f}"
        pg = Page()
        pg.feed(path.read_text(encoding="utf-8"))

        if pg.html_attrs.get("data-style") != style["id"]:
            errors.append(f"{where}：<html> 需要 data-style=\"{style['id']}\"")
        if not pg.html_attrs.get("lang", "").startswith("zh"):
            errors.append(f"{where}：<html lang> 應為 zh-Hant-TW")
        missing = [x for x in order if x not in pg.assets]
        if missing:
            errors.append(f"{where}：缺少共用資源 {missing}")
        elif [pg.assets.index(x) for x in order] != sorted(pg.assets.index(x) for x in order):
            errors.append(f"{where}：載入順序須為 base.css → style.css → content.js → site.js")
        if "style.js" in pg.assets and "../shared/site.js" in pg.assets \
                and pg.assets.index("style.js") < pg.assets.index("../shared/site.js"):
            errors.append(f"{where}：style.js 必須在 site.js 之後載入")
        if f == "project.html" and pg.body_attrs.get("data-page") != "project":
            errors.append(f"{where}：<body> 需要 data-page=\"project\"")
        if not pg.nav_template and not NAV_TARGETS <= pg.nav_hrefs:
            errors.append(f"{where}：[data-nav] 裡缺少連結 {sorted(NAV_TARGETS - pg.nav_hrefs)}")

        for kind, bpath, stack, line in pg.binds:
            check_path(site, kind, bpath, stack, f"{where}:{line}", f, errors)
        for name, line in pg.illus:
            if name not in ILLUS:
                errors.append(f"{where}:{line}：data-illus=\"{name}\" 不存在，可用 {sorted(ILLUS)}")
        for href, line in pg.links:
            if not href or EXTERNAL.match(href):
                continue
            target = (path.parent / re.split(r"[?#]", href)[0]).resolve()
            if not target.exists():
                errors.append(f"{where}:{line}：連結 {href} 指向不存在的檔案")
        for text, line in pg.text:
            for word in HARDCODED:
                if word in text:
                    warnings.append(f"{where}:{line}：內文寫死了「{word}」，請改用 data-bind")
            for word in CLAIMS:
                if word in text:
                    warnings.append(f"{where}:{line}：出現「{word}」，請確認不是杜撰的內容")
    return errors, warnings


def main():
    site = load_site()
    only = set(sys.argv[1:])
    styles = [s for s in site["meta"]["styles"] if not only or s["dir"] in only]
    if only and not styles:
        sys.exit(f"找不到風格資料夾：{', '.join(sorted(only))}")
    total = 0
    for s in styles:
        errors, warnings = check_style(site, s)
        print(f"== {s['dir']}（{s['name']}）：{len(errors)} 個錯誤、{len(warnings)} 個提醒")
        for e in errors:
            print("  ✗", e)
        for w in warnings:
            print("  !", w)
        total += len(errors)
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
