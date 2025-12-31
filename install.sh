#!/bin/bash
# Instalador do Netflix Theme para Jellyfin (Hero + Cards)

JELLYFIN_WEB="/usr/share/jellyfin/web"
HERO_DIR="$(dirname "$0")"

echo "=== Instalador Netflix Theme Jellyfin ==="
echo ""

# Verifica se é root
if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo ./install.sh"
    exit 1
fi

# Verifica diretório Jellyfin
if [ ! -d "$JELLYFIN_WEB" ]; then
    echo "Diretório Jellyfin não encontrado: $JELLYFIN_WEB"
    exit 1
fi

# Backup do index.html
echo "[1/5] Criando backup do index.html..."
cp "$JELLYFIN_WEB/index.html" "$JELLYFIN_WEB/index.html.backup.$(date +%Y%m%d%H%M%S)"

# Copia arquivos
echo "[2/5] Copiando arquivos..."
cp "$HERO_DIR/hero.css" "$JELLYFIN_WEB/"
cp "$HERO_DIR/hero.js" "$JELLYFIN_WEB/"
cp "$HERO_DIR/cards.css" "$JELLYFIN_WEB/"
cp "$HERO_DIR/cards.js" "$JELLYFIN_WEB/"

# Modifica index.html usando Python (mais seguro que sed)
echo "[3/5] Atualizando index.html..."
python3 << 'PYTHON_SCRIPT'
import re

index_path = "/usr/share/jellyfin/web/index.html"

with open(index_path, 'r') as f:
    content = f.read()

# Remove referências antigas se existirem
content = re.sub(r'<link rel="stylesheet" href="hero\.css">\n?', '', content)
content = re.sub(r'<link rel="stylesheet" href="cards\.css">\n?', '', content)
content = re.sub(r'<script src="hero\.js"></script>\n?', '', content)
content = re.sub(r'<script src="cards\.js"></script>\n?', '', content)

# Adiciona CSS antes do </head>
css_inject = '    <link rel="stylesheet" href="hero.css">\n    <link rel="stylesheet" href="cards.css">\n</head>'
content = content.replace('</head>', css_inject)

# Adiciona JS antes do </body>
js_inject = '    <script src="hero.js"></script>\n    <script src="cards.js"></script>\n</body>'
content = content.replace('</body>', js_inject)

with open(index_path, 'w') as f:
    f.write(content)

print("    - index.html atualizado com sucesso")
PYTHON_SCRIPT

# Ajusta permissões
echo "[4/5] Ajustando permissões..."
chmod 644 "$JELLYFIN_WEB/hero.css"
chmod 644 "$JELLYFIN_WEB/hero.js"
chmod 644 "$JELLYFIN_WEB/cards.css"
chmod 644 "$JELLYFIN_WEB/cards.js"

echo "[5/5] Verificando instalação..."
if grep -q "hero.js" "$JELLYFIN_WEB/index.html" && grep -q "cards.js" "$JELLYFIN_WEB/index.html"; then
    echo "    - Verificação OK!"
else
    echo "    - ERRO: Falha na verificação"
    exit 1
fi

echo ""
echo "=== Instalação concluída! ==="
echo ""
echo "Reinicie o Jellyfin:"
echo "  sudo systemctl restart jellyfin"
echo ""
echo "Depois, faça Ctrl+Shift+R no navegador."
