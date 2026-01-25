# Toekomstige Features

Deze map bevat code en documentatie voor features die we later willen toevoegen.

## Waarom deze map?

**MVP Filosofie**: Start simpel, leer van gebruikers, voeg toe wat nodig is.

We hebben bewust gekozen om de app te strippen tot de kernfuncties. Alle extra features zijn hier gedocumenteerd zodat we ze later snel kunnen oppakken als ze nodig blijken.

## Geparkeerde Features

| Feature | Status | Code | Prioriteit | Reden Geparkeerd |
|---------|--------|------|-----------|------------------|
| **Gazon AI** | Code aanwezig, bugs | ✅ photo-analysis.html | 🔴 Hoog | Resultaten tonen niet (bug), moet gefixt |
| **FAB Button** | Code aanwezig, bugs | ✅ fab.css, fab.js | 🟢 Laag | Niet aanklikbaar, bottom nav werkt prima |
| **Barcode Scanner** | Alleen docs | ❌ Nog te bouwen | 🟡 Medium | Coole feature, maar niet essentieel |
| **Gazon Dagboek** | Alleen docs | ❌ Nog te bouwen | 🟡 Medium | Nice to have, geen MVP must |
| **Advanced Gamification** | Code aanwezig | ✅ loyalty-full.html | 🟢 Laag | Te complex, MVP is simpeler |

## Wat zit er in de MVP?

### ✅ Werkende Pagina's:
1. **Login** - Eenvoudige naam/plaats invoer
2. **Home** - Scorecard met punten, rang, badges, tips
3. **Kalender** - Bemestingsschema generator + export
4. **Punten** - Simpel: saldo, rang, "hoe verdien je punten?"
5. **Challenge** - Foto's bekijken en beoordelen
6. **Settings** - Profiel en instellingen

### ✅ Kernfunctionaliteit:
- Bemestingsschema genereren op basis van startdatum
- Schema exporteren naar kalender (verdien 50 punten!)
- Punten en rang systeem (4 rangen)
- Bottom navigation (geen FAB)
- Dark mode only

### ❌ NIET in MVP:
- Gazon AI foto analyse
- FAB (Floating Action Button)
- Barcode scanner
- Gazon dagboek
- Complexe gamification (missies, badges shop, rewards)
- Light mode toggle
- Push notifications (komt later)

## Wanneer Features Oppakken?

### Na App Store Launch:

**Week 1-2: Stabilisatie**
- Bugs fixen uit gebruikersfeedback
- Performance optimalisatie
- Crash reports analyseren

**Week 3-4: Eerste Uitbreiding**
Gebaseerd op feedback:
- Als gebruikers vragen naar foto analyse → Fix Gazon AI
- Als engagement laag is → Advanced Gamification
- Als users producten noemen → Barcode Scanner
- Als users progressie willen zien → Gazon Dagboek

### Decision Framework:

**Implementeer een feature ALS:**
- [ ] Gebruikers vragen er expliciet naar (min. 3x)
- [ ] Het lost een duidelijk probleem op
- [ ] We hebben resources (tijd, skills)
- [ ] Het past bij MVP visie
- [ ] Maintenance is haalbaar

**Skip een feature ALS:**
- [ ] Gebruikers zijn er niet in geïnteresseerd
- [ ] Basis functionaliteit heeft bugs
- [ ] Te complex voor team size
- [ ] Beperkte toegevoegde waarde

## Feature Roadmap (indicatief)

```
MVP Launch
   │
   ├─ Week 2: Bug fixes & polish
   │
   ├─ Week 4: Analytics & monitoring
   │
   ├─ Week 6: Push notifications
   │
   ├─ Week 8: Feature #1 (user voted)
   │           ↓
   │    ┌──────┴──────┐
   │    │             │
   │   Gazon AI    Challenge
   │   (most       Uitbreiding
   │   requested)
   │
   └─ Week 12: Feature #2 (user voted)
              ↓
       ┌──────┴──────┐
       │             │
     Barcode      Dagboek
     Scanner      + Stats
```

## Development Guidelines

### Voor het reactiveren van een feature:

1. **Lees de README** in de feature folder
2. **Check dependencies** - zijn vereiste features klaar?
3. **Test op schone branch** - niet direct in main
4. **Mobile first** - test op echte device, niet alleen browser
5. **Performance** - meet impact op load tijd
6. **Accessibility** - werkt het voor iedereen?
7. **Documentation** - update de README als iets changed

### Code Kwaliteit:

**Voor nieuwe features:**
- Write tests (unit + integration)
- Mobile responsive
- Error handling
- Loading states
- Empty states
- Offline support (indien relevant)

**Voor bestaande features:**
- Fix bekend bugs eerst
- Refactor indien nodig
- Update docs
- Test edge cases

## Contact & Feedback

**Issues/Bugs:** GitHub Issues
**Feature Requests:** GitHub Discussions
**Direct contact:** [Your contact info]

## Inspiratie

Voorbeelden van goede gefaseerde launches:

- **Instagram**: Started als photo sharing only
- **Twitter**: Started met 140 chars, no images
- **Slack**: Started als game company tool
- **Notion**: Started als note-taking only

Ze werden pas complex nadat de basis bewezen was.

---

**Remember**: De beste feature is één die gebruikers echt gebruiken.

Een simpele werkende app is beter dan een complexe kapotte app.
