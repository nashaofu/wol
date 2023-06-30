#!/usr/bin/env ash

# https://stackoverflow.com/a/9893727
set -e

case $TARGETARCH in
"amd64")
  target="x86_64-unknown-linux-musl"
  ;;
"arm64")
  target="aarch64-unknown-linux-musl"
  ;;
*)
  echo "unsupported architecture"
  exit 1
  ;;
esac

mkdir wol

wget https://github.com/nashaofu/wol/releases/latest/download/wol-${target}.zip
unzip wol-${target}.zip
mv wol-${target}/wol wol/wol
chmod +x wol/wol
