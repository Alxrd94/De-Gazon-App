# Floating Action Button (FAB)

## Status: Gebouwd maar buggy (geparkeerd)

## Wat het doet:
- Groene camera knop rechtsonder op elke pagina
- Bij klikken: menu opent met 3 opties
  - Gazon AI (navigeert naar foto analyse)
  - Challenge (navigeert naar challenge pagina)
  - Scanner (alert: komt binnenkort)

## Bekende bugs:
1. **Niet aanklikbaar op Home pagina** - pointer-events conflict
2. **Menu staat permanent open** op Kalender/Punten/Settings
3. **Bottom nav verdwijnt** op Challenge pagina na FAB toevoegen

## Wat is geprobeerd:
- Inline FAB code in elke pagina (70+ regels) → Buggy
- Centralized fab.css + fab.js → Nog steeds bugs
- Verschillende z-index configuraties
- pointer-events: none/auto combinaties
- 'active' vs 'open' class naming

## Waarom geparkeerd:
- Bottom navigation werkt prima zonder FAB
- Complexiteit niet waard voor MVP
- FAB is "nice to have", niet essentieel
- Bugs kosten te veel tijd om op te lossen

## Bestanden:
- `fab.css` - Styling (106 regels)
- `fab.js` - Logic met IIFE pattern (93 regels)
- `fab-html-snippet.html` - HTML template

## Technische details:

### CSS strategie:
```css
.fab-overlay { z-index: 9998; }
.fab-container { z-index: 9999; pointer-events: none; }
.fab-button { pointer-events: auto; }
```

### JavaScript strategie:
- IIFE voor scope isolation
- Event listeners (geen inline onclick)
- Router navigation (clicks nav buttons)
- DOM ready check

## Om te reactiveren:
1. **Fix pointer-events issues** op alle pagina's
2. **Test op ELKE pagina** individueel
3. **Fix z-index conflicten** met bottom nav
4. Verplaats files terug naar src/assets/
5. Voeg snippet toe aan alle pagina's
6. Test op mobiel (Android & iOS)

## Alternatieve aanpak:
- Web Component maken voor betere isolatie
- Shadow DOM voor style encapsulation
- Custom element `<gazon-fab></gazon-fab>`

## Prioriteit: Laag
Feature is niet essentieel voor MVP. Bottom navigation is voldoende.
