#!/bin/zsh
cd "${0:A:h}"
for candidate in /Users/apple/.nvm/versions/node/v22.17.0/bin /Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin; do
  if [[ -x "$candidate/node" && -x "$candidate/npm" ]]; then
    export PATH="$candidate:$PATH"
    break
  fi
done
npm run dev -- --port 5180
