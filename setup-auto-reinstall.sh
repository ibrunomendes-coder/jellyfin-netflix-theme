#!/bin/bash
# Configura reinstalação automática do tema após atualizações do Jellyfin

echo "=== Configurando reinstalação automática ==="

# Verifica se é root
if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo ./setup-auto-reinstall.sh"
    exit 1
fi

# Cria diretório de hooks
mkdir -p /etc/pacman.d/hooks

# Cria o hook
cat > /etc/pacman.d/hooks/jellyfin-theme.hook << 'EOF'
[Trigger]
Operation = Upgrade
Type = Package
Target = jellyfin-web

[Action]
Description = Reaplicando tema Netflix do Jellyfin...
When = PostTransaction
Exec = /home/ibrunomendes/jellyfin-hero/install.sh
EOF

echo ""
echo "Hook criado em /etc/pacman.d/hooks/jellyfin-theme.hook"
echo ""
echo "Agora, sempre que o jellyfin-web for atualizado,"
echo "o tema será reaplicado automaticamente!"
