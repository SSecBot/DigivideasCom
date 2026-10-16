#!/usr/bin/env bash
# Safe update for the live server (VPS / Node hosting), run from the project folder:
#   bash scripts/guncelle.sh
# 1) backs up ALL current data first (content, inquiries, analytics, CRM, uploads, PDFs)
# 2) pulls the new code and rebuilds; the data/ folder itself is never touched
# If any step fails the script stops, and the backup is already in data/backups.
set -euo pipefail

echo "==> 1/4 Mevcut veriler yedekleniyor"
node scripts/backup-data.mjs guncelleme-oncesi

echo "==> 2/4 Yeni kod indiriliyor"
git pull --ff-only origin main

echo "==> 3/4 Paketler kuruluyor ve site derleniyor"
pnpm install --frozen-lockfile
pnpm build

echo "==> 4/4 Site yeniden başlatılıyor"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart digivideas
else
  echo "pm2 bulunamadı: uygulamayı barındırma panelinizden yeniden başlatın."
fi
echo "Güncelleme tamamlandı. Yedekler: data/backups/"
