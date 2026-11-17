#!/usr/bin/env bash
# Builds the CrazyGames upload as ONE self-contained index.html (styles, scripts and fonts inlined),
# so the upload works no matter how the files are selected or dragged into the portal.
# Outputs: crazygames-upload/index.html and gilded-midnight-crazygames.zip (index.html at the zip root).
set -euo pipefail
cd "$(dirname "$0")"

OUT=crazygames-upload
ZIP=gilded-midnight-crazygames.zip

# Clear only what this script itself produces.
if [ -d "$OUT" ]; then find "$OUT" -mindepth 1 -delete; fi
mkdir -p "$OUT"

python3 - "$OUT/index.html" <<'EOF'
import base64, os, re, sys
out = sys.argv[1]
html = open('index.html', encoding='utf-8').read()

# 1. stylesheet → inline <style>, with every font embedded as a data: URI
css = open('css/style.css', encoding='utf-8').read()
def font(m):
    path = os.path.normpath(os.path.join('css', m.group(1)))
    data = base64.b64encode(open(path, 'rb').read()).decode()
    return "url('data:font/woff2;base64," + data + "')"
css, nfonts = re.subn(r"url\('(\.\./fonts/[^']+\.woff2)'\)", font, css)
if nfonts != 4: sys.exit(f'expected 4 fonts, embedded {nfonts}')
if '</style' in css.lower(): sys.exit('stylesheet contains </style')
html, n = re.subn(r'<link rel="stylesheet" href="css/style.css">', lambda m: '<style>\n' + css + '\n</style>', html)
if n != 1: sys.exit('stylesheet link not found')

# 2. font preload hint is no longer needed
html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)

# 3. sanity on the page markup: only the local scripts (inlined next) may reference files;
#    the SDK tag stays external, as CrazyGames requires its URL
left = [r for r in re.findall(r'(?:src|href)="(?!https?:|data:)([^"]+)"', html) if not re.fullmatch(r'js/[^"]+\.js', r)]
if left: sys.exit('still references local files: ' + ', '.join(left))
if '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>' not in html:
    sys.exit('CrazyGames SDK v3 script tag missing')

# 4. local scripts → inline <script>
def script(m):
    js = open(m.group(1), encoding='utf-8').read()
    if '</script' in js.lower(): sys.exit(m.group(1) + ' contains </script')
    return '<script>\n/* ' + m.group(1) + ' */\n' + js + '\n</script>'
html, nscripts = re.subn(r'<script src="(js/[^"]+\.js)"></script>', script, html)
if nscripts != 9: sys.exit(f'expected 9 scripts, inlined {nscripts}')


# 5. font licences travel inside the file
lic = '\n'.join(open('fonts/' + f, encoding='utf-8').read() for f in sorted(os.listdir('fonts')) if f.startswith('OFL-'))
html = html.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!--\nFonts: Limelight, Poiret One, Josefin Sans — SIL Open Font License 1.1\n' + lic.replace('--', '- -') + '\n-->', 1)

open(out, 'w', encoding='utf-8').write(html)
print(f'inlined 1 stylesheet, {nfonts} fonts, {nscripts} scripts')
EOF

rm -f "$ZIP"
python3 - "$OUT/index.html" "$ZIP" <<'EOF'
import sys, zipfile
src, zpath = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    info = zipfile.ZipInfo('index.html', date_time=(2026, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    z.writestr(info, open(src, 'rb').read())
EOF

echo "Built $OUT/index.html ($(du -h "$OUT/index.html" | cut -f1)) and $ZIP ($(du -h "$ZIP" | cut -f1))"
