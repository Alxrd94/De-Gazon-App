# Gazon Dagboek

## Status: Nog niet gebouwd

## Concept:
Een visueel dagboek van je gazon door het jaar heen. Maak foto's, voeg notities toe, zie je vooruitgang en leer van je acties.

## Kernfunctionaliteit:

### 1. Foto Timeline
- Upload foto van je gazon
- Automatische datum/tijd
- Sorteer chronologisch
- Grid en lijst weergave
- Voor/na vergelijking slider

### 2. Entry Details
Per foto kun je toevoegen:
- **Notities** - Vrije tekst
- **Tags** - Bemest, Gemaaid, Gezaaid, Verticuteert, etc.
- **Weer** - Automatisch ophalen (temp, zon/regen)
- **Locatie** - Welk deel van je tuin (optioneel)
- **Producten gebruikt** - Link naar barcode scanner
- **Gevoel** - Tevreden/Neutraal/Zorgen emoji

### 3. Statistieken
- Totaal aantal foto's
- Meest gebruikte tags
- Acties per maand grafiek
- Weer correlatie met gazon kwaliteit
- "Je tuin 1 jaar geleden" reminder

### 4. Delen
- Deel in Challenge (publiek)
- Bewaar privé in dagboek
- Export naar PDF (jaarverslag)

## Use Cases:

### Use Case 1: Voorjaar opstarten
1. Maak foto van gazon (kaal na winter)
2. Tag: "Voor behandeling"
3. Notitie: "Veel mos, gele plekken"
4. 2 weken later: nieuwe foto na verticuteert
5. Tag: "Na verticuteert", "Gezaaid"
6. App toont voor/na vergelijking

### Use Case 2: Leren van fouten
1. Juli: gazon bruin
2. Notitie: "Te weinig water tijdens hittegolf"
3. Foto + tag: "Droogte schade"
4. Volgend jaar juli: app herinnert
5. "Vorig jaar had je hier problemen, denk aan water!"

### Use Case 3: Trots delen
1. Perfecte gazon foto in mei
2. Tag: "Beste resultaat"
3. Notitie: "Na behandeling met [product]"
4. Deel in Challenge voor punten
5. Andere gebruikers zien en liken

## Technische implementatie:

### Data opslag:

**Fase 1: LocalStorage**
```javascript
{
  "entries": [
    {
      "id": "uuid",
      "photo": "base64_string", // of blob URL
      "date": "2024-03-15T10:30:00",
      "notes": "Eerste bemesting van het seizoen",
      "tags": ["bemest", "voorjaar"],
      "weather": {
        "temp": 12,
        "condition": "partly_cloudy"
      },
      "shared": false
    }
  ]
}
```

**Fase 2: IndexedDB** (voor meer ruimte)
- LocalStorage = 5-10MB limiet
- IndexedDB = geen limiet (binnen reason)
- Betere performance met veel foto's

**Fase 3: Cloud sync** (optioneel)
- Backup in cloud
- Sync tussen devices
- Kost hosting

### Weer API:

**Gratis opties:**
- Open-Meteo API - 10,000 requests/dag gratis
- WeatherAPI.com - 1M requests/maand gratis
- OpenWeatherMap - 60 calls/min gratis

Auto-fetch op basis van:
- Datum van foto
- GPS locatie (optioneel)
- Of: selecteer weer handmatig

### UI Components:

1. **Timeline View**
```
┌─────────────────┐
│ [Maart 2024]    │
├─────────────────┤
│ ┌──┐ ┌──┐ ┌──┐ │
│ │📷│ │📷│ │📷│ │ (Grid van foto's)
│ └──┘ └──┘ └──┘ │
│   15   22   28  │
└─────────────────┘
```

2. **Entry Detail**
```
┌──────────────────┐
│ [Grote Foto]     │
├──────────────────┤
│ 📅 15 maart 2024 │
│ 🌤️ 12°C Bewolkt │
├──────────────────┤
│ [Bemest] [Voorjaar] │ (Tags)
├──────────────────┤
│ "Eerste bemesting" │ (Notities)
├──────────────────┤
│ [Bewerken] [Delen] [Verwijderen] │
└──────────────────┘
```

3. **Voor/Na Slider**
```
┌─────────────┐
│    [⟲]      │ (Draggable slider)
│   /    \    │
│  Foto Foto  │
│  Voor  Na   │
└─────────────┘
```

## Features per fase:

### MVP (Week 1-2):
- Foto uploaden
- Datum automatisch
- Simpele notitie
- Lijst weergave
- Lokale opslag (LocalStorage)

### Fase 2 (Week 3):
- Tags systeem
- Weer integratie
- Grid weergave
- Zoeken/filteren

### Fase 3 (Week 4):
- Voor/na vergelijking
- Statistieken dashboard
- Export naar PDF
- Delen in Challenge

### Future:
- Cloud sync
- Herinneringen ("1 jaar geleden")
- AI tips gebaseerd op foto's
- Community beste praktijken

## Database schema:

```javascript
// Entry
{
  id: string,
  userId: string,
  photoUrl: string,
  thumbnail: string, // Compressed voor performance
  date: DateTime,
  notes: string,
  tags: string[],
  weather: {
    temperature: number,
    condition: string,
    humidity: number
  },
  location: string?, // "Voortuin", "Achtertuin", etc.
  products: string[], // Product IDs
  shared: boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}

// Tag
{
  id: string,
  name: string,
  icon: string,
  color: string
}
```

## Geschatte tijd: 2-3 weken

## Prioriteit: Medium
Leuke feature met hoge engagement potentie, maar niet cruciaal voor MVP.

## Integraties:
- Challenge (delen van entries) 🔄
- Barcode Scanner (producten linking) 🔄
- Gazon AI (automatische beoordeling) 🔄
- Kalender (acties exporteren) 🔄

## Inspiratie:
- Instagram (foto timeline)
- Strava (activiteit tracking)
- Plant apps (Planta, PictureThis)
- Moleskine Journey (dagboek app)
