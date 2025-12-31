#!/bin/bash
# Desinstalador do Netflix Theme para Jellyfin

JELLYFIN_WEB="/usr/share/jellyfin/web"

echo "=== Desinstalador Netflix Theme Jellyfin ==="
echo ""

# Verifica se é root
if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo ./uninstall.sh"
    exit 1
fi

# Remove arquivos
echo "[1/3] Removendo arquivos..."
rm -f "$JELLYFIN_WEB/hero.css"
rm -f "$JELLYFIN_WEB/hero.js"
rm -f "$JELLYFIN_WEB/cards.css"
rm -f "$JELLYFIN_WEB/cards.js"

# Remove referências do index.html
echo "[2/3] Limpando index.html..."
sed -i '/hero\.css/d' "$JELLYFIN_WEB/index.html"
sed -i '/hero\.js/d' "$JELLYFIN_WEB/index.html"
sed -i '/cards\.css/d' "$JELLYFIN_WEB/index.html"
sed -i '/cards\.js/d' "$JELLYFIN_WEB/index.html"

echo "[3/3] Concluído!"
echo ""
echo "Reinicie o Jellyfin:"
echo "  sudo systemctl restart jellyfin"
