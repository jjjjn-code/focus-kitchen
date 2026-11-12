#!/bin/sh
# Downloads generated dish images listed in art-src/urls.txt ("<name> <figma asset id>" per line)
# into art-src/<name>.png. Figma asset links expire after 7 days. Skips files already present.
cd "$(dirname "$0")/../art-src" || exit 1
while read -r name id; do
  [ -z "$name" ] && continue
  [ -s "$name.png" ] && continue
  curl -sS -f -L -m 60 -o "$name.png" "https://www.figma.com/api/mcp/asset/$id.png" && echo "fetched $name" || echo "FAILED $name"
done < urls.txt
