# Jellyfin Netflix Theme

Tema personalizado para Jellyfin inspirado na interface do Netflix, com hero banner animado e cards com hover suave.

![Hero Banner](https://img.shields.io/badge/Hero-Banner-E50914?style=flat-square)
![Responsive](https://img.shields.io/badge/Responsive-TV%20%7C%20Desktop%20%7C%20Mobile-00A4DC?style=flat-square)

## Funcionalidades

### Hero Banner
- Exibe filmes/séries recentes com imagem de backdrop
- Rotação automática a cada 10 segundos
- Efeito Ken Burns (zoom suave)
- Animações de entrada
- Barra de progresso
- Botões "Assistir" e "Mais Info"
- Responsivo (TV, tablet, mobile)

### Cards
- Hover suave (scale 1.08)
- Sombra no hover
- Barra de progresso vermelha estilo Netflix
- Otimizado para touch (mobile)
- Foco visível para navegação por controle (TV)

## Instalação

### Automática
```bash
git clone https://github.com/SEU_USUARIO/jellyfin-netflix-theme.git
cd jellyfin-netflix-theme
sudo ./install.sh
sudo systemctl restart jellyfin
```

### Manual
1. Copie os arquivos para `/usr/share/jellyfin/web/`:
```bash
sudo cp hero.css hero.js cards.css cards.js /usr/share/jellyfin/web/
```

2. Edite `/usr/share/jellyfin/web/index.html`:

No `</head>` adicione:
```html
<link rel="stylesheet" href="hero.css">
<link rel="stylesheet" href="cards.css">
```

No `</body>` adicione:
```html
<script src="hero.js"></script>
<script src="cards.js"></script>
```

3. Reinicie o Jellyfin:
```bash
sudo systemctl restart jellyfin
```

4. Limpe o cache do navegador: `Ctrl+Shift+R`

## Desinstalação

```bash
sudo ./uninstall.sh
sudo systemctl restart jellyfin
```

## Atualização Automática (Arch Linux)

Para reaplicar o tema automaticamente após atualizações do Jellyfin:

```bash
sudo ./setup-auto-reinstall.sh
```

Isso cria um hook do pacman que reaplica o tema quando o `jellyfin-web` é atualizado.

## Personalização

### Intervalo de Rotação do Hero
Em `hero.js`, linha 10:
```javascript
rotationInterval: 10000,  // milissegundos
```

### Quantidade de Itens no Hero
Em `hero.js`, linha 11:
```javascript
maxItems: 5,
```

### Intensidade do Hover nos Cards
Em `cards.css`:
```css
transform: scale(1.08) !important;  /* 1.0 = sem zoom */
```

## Estrutura de Arquivos

```
jellyfin-netflix-theme/
├── hero.css          # Estilos do hero banner
├── hero.js           # Lógica do hero (rotação, animações)
├── cards.css         # Estilos dos cards
├── cards.js          # (vazio - apenas CSS)
├── install.sh        # Script de instalação
├── uninstall.sh      # Script de desinstalação
├── setup-auto-reinstall.sh  # Configura reinstalação automática
└── README.md
```

## Requisitos

- Jellyfin Server 10.8+
- Filmes/séries com imagens de backdrop (fanart)

## Compatibilidade

- ✅ Desktop (Chrome, Firefox, Edge, Safari)
- ✅ Mobile (Android, iOS)
- ✅ TV (Jellyfin Media Player, Android TV)

## Troubleshooting

### Hero não aparece
- Verifique se há filmes/séries com imagem de backdrop
- Abra o console (F12) e procure por erros
- Verifique se está na página inicial

### Tela branca após instalação
```bash
sudo cp /usr/share/jellyfin/web/index.html.backup.* /usr/share/jellyfin/web/index.html
sudo systemctl restart jellyfin
```

## Licença

MIT License

## Créditos

Inspirado na interface do Netflix.
