# Barcode Scanner

## Status: Nog niet gebouwd

## Concept:
- Gebruiker scant barcode van gazonproduct (mest, graszaad, etc.)
- App herkent product en toont productinfo
- Voegt product toe aan gebruikersprofiel
- Integreert met bemestingskalender
- Verdient GazonPunten (+10 per scan)

## Use cases:

### 1. Product informatie
Scan barcode → zie product details:
- Naam en merk
- Type (gazonmest, graszaad, mos bestrijding, etc.)
- NPK waarden (voor mest)
- Dosering advies
- Wanneer gebruiken (seizoen)

### 2. Kalender integratie
Product gescand → automatisch:
- "Wanneer heb je dit toegepast?"
- Datum selecteren
- Voegt toe aan kalender
- Plant volgende toepassing

### 3. Product geschiedenis
- Overzicht van alle gescande producten
- Wanneer gebruikt
- Hoeveel m² behandeld
- Kosten tracking

## Technische aanpak:

### Libraries:
**Optie 1: QuaggaJS**
- Populair, goed onderhouden
- Ondersteunt EAN-13, UPC, etc.
- `npm install quagga`

**Optie 2: ZXing**
- Browser-based, geen build step
- CDN beschikbaar
- Cross-platform

**Optie 3: Native HTML5 BarcodeDetector API**
- Nieuwste, maar beperkte browser support
- Toekomstbestendig
- Fallback nodig voor oudere browsers

### Product database:

**Optie A: Eigen database**
Pros:
- Volledige controle
- Privacy-vriendelijk
- Offline mogelijk

Cons:
- Handmatig onderhoud
- Moet alle producten verzamelen

**Optie B: API koppeling**
Services zoals:
- Open Food Facts API
- Barcode Lookup API
- UPC Database

Pros:
- Altijd up-to-date
- Veel producten

Cons:
- Internet vereist
- Mogelijk niet alle gazonproducten

**Aanbeveling:** Start met eigen database (top 50 producten), later API als fallback.

## Benodigde stappen:

### Fase 1: Scanner opzetten (1 week)
1. Kies barcode library (QuaggaJS recommended)
2. Bouw scan interface
3. Test met verschillende barcodes
4. Camera toegang + permissies

### Fase 2: Product database (1 week)
1. Verzamel top 50 gazonproducten
2. Maak database structuur
3. Vul met product data
4. API endpoints maken

### Fase 3: Integraties (1 week)
1. Koppel aan kalender
2. Koppel aan punten systeem
3. Product geschiedenis weergave
4. Settings: mijn producten

### Fase 4: Polish (paar dagen)
1. Error handling
2. Feedback voor unknown barcodes
3. Manual product entry fallback
4. Tips per product

## Database structuur:

```javascript
{
  "barcode": "8712423001234",
  "name": "DCM Gazonmest Plus",
  "brand": "DCM",
  "category": "gazonmest",
  "npk": "7-3-6",
  "dosage": "50-70g/m²",
  "frequency": "2-4x per jaar",
  "seasons": ["voorjaar", "zomer", "najaar"],
  "application_method": "strooien",
  "points": 10
}
```

## UI Flow:

```
[Scan Barcode Button]
  ↓
[Camera View + Scan Frame]
  ↓
[Barcode Recognized!]
  ↓
[Product Card]
- Naam
- Foto
- NPK waarden
- Advies
  ↓
[Acties]
- [Toevoegen aan Kalender]
- [Bekijk Product Details]
- [Scan Another]
```

## Geschatte tijd: 2-3 weken

## Prioriteit: Medium
Feature heeft toegevoegde waarde maar is niet essentieel voor MVP.

## Afhankelijkheden:
- Werkende kalender functie ✅
- Product database (moet gebouwd)
- API voor product info (optioneel)
