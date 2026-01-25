# Advanced Gamification

## Status: Gebouwd maar te complex voor MVP (geparkeerd)

## Wat is gebouwd:

De volledige gamification laag met 7 secties in loyalty.html:

### 1. Punten Saldo ✅ BEHOUDEN in MVP
Groot glowing getal met logo, prominente display.

### 2. Rang Voortgang ✅ BEHOUDEN in MVP (vereenvoudigd)
Rang systeem met voortgang naar volgende niveau.

### 3. Wekelijkse Missies ❌ VERWIJDERD
- Beoordelingen geven (2/3 progress)
- Foto uploaden (0/1 progress)
- 7 dagen actief (met dagenteller)
- Elke missie met beloning (bonus punten)

### 4. Beloningen Shop ❌ VERWIJDERD
- 5% Kortingscode (50 punten)
- 10% Kortingscode (100 punten)
- Gratis Gazon Advies (150 punten)
- Premium Features (200 punten)
- Productbundel Korting (250 punten)

Elke beloning met:
- Icon
- Beschrijving
- Puntenkosten
- "Inwisselen" button
- Stock indicator

### 5. Badges Collectie ❌ VERWIJDERD
15 badges met unlock voorwaarden:
- **Eerste Foto** 📸 (upload 1e foto)
- **Eerste Beoordeling** ⭐ (geef 1e beoordeling)
- **Social Star** 🌟 (10 beoordelingen)
- **Influencer** 💫 (50 beoordelingen)
- **Kalender Export** 📅 (export bemestingsplan)
- **Trouw** 💚 (7 dagen actief)
- **Toegewijd** 🔥 (30 dagen actief)
- **Legende** 👑 (365 dagen actief)
- **Challenge Deelnemer** 🏅 (deel 1e foto)
- **Challenge Ster** 🌠 (5 foto's gedeeld)
- **Top Rated** ⭐⭐⭐⭐⭐ (foto met 5 sterren)
- **Punten Jager** 💰 (100 punten)
- **Punten Expert** 💎 (500 punten)
- **Groene Duim** 🌿 (rank 3)
- **Gazon Master** 🏆 (rank 5)

Elke badge met:
- Icon (emoji)
- Naam
- Beschrijving
- Unlock voorwaarde
- Locked/unlocked state
- Unlock animatie

### 6. Statistieken Dashboard ❌ VERWIJDERD
- Totaal verdiende punten (met grafiek)
- Gedeelde foto's counter
- Gegeven beoordelingen counter
- Dagen actief streak
- Challenge ranking positie

### 7. Punten Geschiedenis ❌ VERWIJDERD
Timeline van recente transacties:
- Datum/tijd
- Actie (Schema geëxporteerd, Foto gedeeld, etc.)
- Punten (+50, +25, etc.)
- Icon per actie type
- Scrollbare lijst

## Waarom geparkeerd:

### Complexiteit
- 549 regels code → 209 regels (60% reductie)
- Veel state management
- Veel UI componenten
- Veel mogelijke bugs

### User Experience
- Kan overwhelming zijn voor nieuwe gebruikers
- Te veel te leren in één keer
- Focus weg van kernfunctie (kalender)

### Maintenance
- Veel code om te onderhouden
- Rewards shop vereist product integratie
- Badges vereist tracking systeem
- Statistieken vereist database/analytics

### MVP Filosofie
Start simpel, leer van gebruikers, voeg toe wat nodig is.

## Wat BEHOUDEN in MVP:

✅ **Punten Saldo** - Groot glowing getal
✅ **Rang Systeem** - 4 rangen (Starter → Master)
✅ **Voortgang Bar** - Naar volgende rang
✅ **"Hoe verdien je punten?" lijst** - Clear instructies
✅ **Rangsysteem Overzicht** - Alle 4 rangen uitgelegd

## Bestanden:

- `loyalty-full.html` - Volledige versie met alle 7 secties
- (JavaScript was inline, geen aparte bestanden)

## Om te reactiveren:

### Optie A: Alles in één keer
1. Kopieer `loyalty-full.html` terug naar `src/pages/loyalty.html`
2. Test alle functionaliteit
3. Koppel reward systeem aan backend
4. Implementeer badge tracking

### Optie B: Gefaseerd (aanbevolen)
**Fase 1:** Missies toevoegen
- Wekelijkse missies met progress tracking
- Simpel: 3 missies, geen complex systeem

**Fase 2:** Badges
- Start met 5 basis badges
- Unlock animaties
- Visueel voldoening

**Fase 3:** Rewards
- Kortingscodes die echt werken
- Integratie met webshop
- Email/SMS met code

**Fase 4:** Statistieken & Geschiedenis
- Analytics dashboard
- Grafiek van vooruitgang
- Export functionaliteit

## Technische implementatie notes:

### State Management
Alle gamification data moet worden bijgehouden:
```javascript
{
  userId: string,
  points: number,
  rank: number,
  badges: string[], // unlocked badge IDs
  missions: {
    weekly: [
      { id: string, progress: number, target: number, reward: number }
    ]
  },
  history: [
    { date: DateTime, action: string, points: number }
  ]
}
```

### Rewards System
Vereist backend:
- Generate unique codes
- Track redeemed codes
- Prevent fraud
- Email integration

### Badge System
Vereist event tracking:
- Photo upload → trigger check
- Rating given → trigger check
- Streak count → trigger check
- Emit unlock events

### Database
localStorage volstaat voor MVP maar later cloud sync:
- User progress
- Leaderboards
- Rewards inventory

## Prioriteit: Laag (post-MVP)

Focus eerst op:
1. Calendar export functie (punten systeem basis)
2. Challenge photo sharing (community)
3. Push notifications (retention)

Dan pas gamification uitbreiden.

## User Feedback Triggers:

Voeg gamification toe ALS:
- Gebruikers vragen om meer engagement
- Retention daalt (need incentive)
- Community is actief (badges motiveren)
- Webshop integratie klaar is (rewards meaningful)

Niet toevoegen ALS:
- Gebruikers vinden basis al complex
- Retention is goed zonder
- Te veel bugs in kern functionaliteit
- Team te klein voor maintenance

## Inspiratie & Best Practices:

**Goede voorbeelden:**
- Duolingo (streaks, badges, leaderboards)
- Strava (challenges, achievements)
- Nike Run Club (milestones, trophies)

**Anti-patterns te vermijden:**
- Te veel pop-ups
- Pay-to-win mechanics
- Verplichte social sharing
- Misleading progress bars
