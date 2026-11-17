#!/usr/bin/env bash
# Builds the CrazyGames upload: crazygames-upload/ (folder) and gilded-midnight-crazygames.zip.
# index.html sits at the root of both, as the CrazyGames developer portal expects.
set -euo pipefail
cd "$(dirname "$0")"

OUT=crazygames-upload
ZIP=gilded-midnight-crazygames.zip

# Clear only the files this script itself produces.
if [ -d "$OUT" ]; then find "$OUT" -mindepth 1 -delete; fi
mkdir -p "$OUT/css" "$OUT/js" "$OUT/fonts"

cp index.html "$OUT/"
cp css/style.css "$OUT/css/"
cp js/core.js js/data.js js/art.js js/scenes.js js/gen.js js/audio.js js/mini.js js/game.js js/case.js "$OUT/js/"
cp fonts/*.woff2 fonts/OFL-*.txt "$OUT/fonts/"

# Every file index.html / style.css references must be present.
python3 - "$OUT" <<'EOF'
import re, sys, os
out = sys.argv[1]
html = open(os.path.join(out, 'index.html')).read()
css = open(os.path.join(out, 'css/style.css')).read()
refs = re.findall(r'(?:src|href)="(?!https?:)([^"]+)"', html)
refs += ['css/' + u for u in re.findall(r"url\('(\.\./fonts/[^']+)'\)", css)]
missing = [r for r in refs if not os.path.isfile(os.path.normpath(os.path.join(out, r)))]
if missing: sys.exit('missing files: ' + ', '.join(missing))
if 'sdk.crazygames.com/crazygames-sdk-v3.js' not in html: sys.exit('CrazyGames SDK v3 script tag missing')
print('references ok:', len(refs))
EOF

rm -f "$ZIP"
python3 - "$OUT" "$ZIP" <<'EOF'
import os, sys, zipfile
src, zpath = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for root, _, files in sorted(os.walk(src)):
        for f in sorted(files):
            full = os.path.join(root, f)
            arc = os.path.relpath(full, src)            # index.html at the zip root
            info = zipfile.ZipInfo(arc, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, open(full, 'rb').read())
EOF

echo "Built $OUT/ ($(find "$OUT" -type f | wc -l) files, $(du -sh "$OUT" | cut -f1)) and $ZIP ($(du -h "$ZIP" | cut -f1))"
