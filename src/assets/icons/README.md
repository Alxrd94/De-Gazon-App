# App Icons

## Required Icons

Voor een complete PWA implementatie zijn de volgende iconen nodig:

### App Icons (PNG formaat)
- `icon-72x72.png` - 72x72px
- `icon-96x96.png` - 96x96px
- `icon-128x128.png` - 128x128px
- `icon-144x144.png` - 144x144px
- `icon-152x152.png` - 152x152px
- `icon-192x192.png` - 192x192px (standaard Android)
- `icon-384x384.png` - 384x384px
- `icon-512x512.png` - 512x512px (Android splash screen)

### Shortcut Icons
- `shortcut-camera.png` - 96x96px (voor foto analyse shortcut)
- `shortcut-calendar.png` - 96x96px (voor bemestingsplanner shortcut)
- `shortcut-star.png` - 96x96px (voor GazonPunten shortcut)

## Design Richtlijnen

### Kleurenschema
- Primair: #2E7D32 (Gazon groen)
- Secundair: #FFA000 (Oranje accent)
- Achtergrond: #FFFFFF (Wit)

### Icon Design
- Gebruik een eenvoudig, herkenbaar gazon/gras symbool
- Zorg voor voldoende padding (10-15% van totale grootte)
- Gebruik flat design met subtiele schaduwen
- Zorg dat het icon goed zichtbaar is op verschillende achtergronden

### Maskable Icons
De icons van 192x192 en 512x512 moeten ook als "maskable" werken:
- Safe zone: centraal 40% van de icon (80% diameter cirkel)
- Belangrijke elementen binnen deze zone plaatsen
- Volledige icon moet zich uitstrekken tot de randen

## Tools voor Icon Generatie

### Online Tools
- [Favicon.io](https://favicon.io/) - Gratis favicon generator
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - CLI tool voor PWA icons
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Uitgebreide favicon generator

### CLI Commando (met PWA Asset Generator)
```bash
npx pwa-asset-generator logo.svg ./src/assets/icons \
  --background "#2E7D32" \
  --maskable true \
  --type png \
  --quality 100
```

## Tijdelijke Placeholder

Momenteel wordt een SVG placeholder gebruikt. Vervang deze met professionele PNG icons voordat je de app in productie neemt.

### Quick Fix met ImageMagick
Als je ImageMagick hebt geïnstalleerd:

```bash
# Maak een eenvoudig groen vierkant als basis
convert -size 512x512 xc:"#2E7D32" base.png

# Voeg tekst toe
convert base.png -gravity center -pointsize 200 -fill white \
  -annotate +0+0 "🌱" icon-512x512.png

# Resize voor andere formaten
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 72x72 icon-72x72.png
```

## Voor Capacitor Conversie

Bij conversie naar native apps met Capacitor heb je ook nodig:
- iOS: `icon.png` (1024x1024px)
- Android: Verschillende densiteiten (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

Deze kunnen automatisch gegenereerd worden met:
```bash
npx capacitor-assets generate --iconBackgroundColor '#2E7D32'
```
