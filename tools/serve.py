#!/usr/bin/env python3
"""本機預覽伺服器。

用法（在專案根目錄執行）：
  python tools/serve.py          開在 http://localhost:8765
  python tools/serve.py 9000     指定其他埠號

和 `python -m http.server` 相同，但每個回應都加上 Cache-Control: no-store，
避免瀏覽器沿用快取裡舊的 content.js 或圖片：改完資料，重新整理就能看到。
"""
import http.server
import sys
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"Serving {ROOT} at http://localhost:{PORT} (no-store)", flush=True)
        httpd.serve_forever()
