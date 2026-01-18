# 🌱 de Gazon App - Graszoden Expert

Een professionele Progressive Web App voor gazononderhoud en advies van Graszoden Expert.

## 📱 Features

### ✅ Geïmplementeerde Functionaliteiten

1. **Mock Google Login** (Demo)
   - Eenvoudige demo login voor ontwikkeling
   - Gebruikersdata opslag in LocalStorage
   - Automatische sessie management

2. **Foto Analyse met Gazon Advies**
   - Upload gazon foto's (drag & drop support)
   - Automatische beeldcompressie
   - Mock AI analyse met aanbevelingen
   - Product suggesties
   - Opslaan van analyse geschiedenis

3. **Bemestingsplanner**
   - Gazon configuratie (oppervlakte, type, grondsoort)
   - Product selectie
   - Automatische schema generatie
   - Kalender export (.ics bestand)
   - Kosten berekening

4. **GazonPunten Loyaliteitssysteem**
   - Punten verdienen bij activiteiten
   - Welkomstbonus voor nieuwe gebruikers
   - Beloningen inwisselen
   - Activiteiten geschiedenis
   - Real-time punten updates

5. **Progressive Web App (PWA)**
   - Installeerbaar op mobiel en desktop
   - Offline functionaliteit met Service Worker
   - App-achtige ervaring
   - Push notificaties ready (toekomstige feature)

## 🏗️ Project Structuur

```
De-Gazon-App/
├── index.html                 # Entry point
├── manifest.json             # PWA manifest
├── service-worker.js         # Service worker voor offline support
│
├── src/
│   ├── css/
│   │   ├── variables.css     # CSS custom properties (design tokens)
│   │   ├── reset.css         # Modern CSS reset
│   │   ├── main.css          # Hoofd layout en styling
│   │   └── components.css    # Component specifieke styles
│   │
│   ├── js/
│   │   ├── app.js                  # Main applicatie controller
│   │   ├── router.js               # Client-side routing
│   │   ├── auth.js                 # Authenticatie module
│   │   ├── storage.js              # LocalStorage helper
│   │   ├── utils.js                # Utility functies
│   │   ├── photoAnalysis.js        # Foto analyse module
│   │   ├── fertilizerPlanner.js    # Bemestingsplanner module
│   │   └── loyalty.js              # Loyaliteit module
│   │
│   ├── pages/
│   │   ├── login.html              # Login pagina
│   │   ├── home.html               # Home dashboard
│   │   ├── photo-analysis.html     # Foto analyse
│   │   ├── fertilizer-planner.html # Bemestingsplanner
│   │   └── loyalty.html            # GazonPunten overzicht
│   │
│   └── assets/
│       ├── icons/                  # App iconen (zie icons/README.md)
│       └── images/                 # Screenshots en afbeeldingen
│
└── docs/                     # Documentatie
    ├── ARCHITECTURE.md       # Architectuur documentatie
    ├── DEPLOYMENT.md         # Deployment instructies
    └── CAPACITOR.md          # Capacitor conversie guide
```

## 🚀 Aan de Slag

### Vereisten

- Moderne webbrowser (Chrome, Firefox, Safari, Edge)
- Optioneel: Lokale webserver voor development

### Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/Alxrd94/De-Gazon-App.git
   cd De-Gazon-App
   ```

2. **Start een lokale webserver**

   Met Python:
   ```bash
   python -m http.server 8000
   ```

   Met Node.js (http-server):
   ```bash
   npx http-server -p 8000
   ```

   Met PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open de app**
   ```
   http://localhost:8000
   ```

### Development Workflow

1. **Code wijzigingen**
   - HTML pagina's in `/src/pages/`
   - Styling in `/src/css/`
   - JavaScript modules in `/src/js/`

2. **Test de app**
   - Open browser DevTools (F12)
   - Check console voor errors
   - Test PWA features in Application tab

3. **Service Worker updates**
   - Verhoog `CACHE_VERSION` in `service-worker.js`
   - Hard refresh (Ctrl+Shift+R) om nieuwe SW te laden

## 🎨 Design System

### Kleuren

```css
--color-primary: #2E7D32        /* Gazon groen */
--color-primary-light: #4CAF50  /* Licht groen */
--color-primary-dark: #1B5E20   /* Donker groen */
--color-secondary: #FFA000      /* Oranje accent */
```

### Typography

```css
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'...
--font-size-base: 1rem (16px)
--font-weight-normal: 400
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Spacing Scale

```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
```

## 📦 PWA Features

### Installatie

De app kan geïnstalleerd worden op:
- **Android**: Chrome menu → "Toevoegen aan startscherm"
- **iOS**: Safari → Deel → "Zet op beginscherm"
- **Desktop**: Chrome → adresbalk → installatie icoon

### Offline Functionaliteit

- App shell wordt gecached voor offline gebruik
- Foto's kunnen offline geüpload worden (sync bij verbinding)
- LocalStorage voor data persistentie
- Service Worker met cache-first strategie

### App Shortcuts

Na installatie zijn er snelkoppelingen beschikbaar voor:
- 📸 Foto Analyse
- 📅 Bemestingsplanner
- ⭐ GazonPunten

## 🔧 Technische Details

### Browser Compatibiliteit

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

### LocalStorage Gebruik

```javascript
gazon_user_data              // Gebruikersgegevens
gazon_loyalty_points         // GazonPunten en geschiedenis
gazon_photo_analyses         // Opgeslagen analyses
gazon_fertilizer_schedules   // Bemestingsschema's
gazon_auth_token            // Authenticatie token
```

### API Endpoints (Toekomstig)

Momenteel gebruikt de app mock data. Voor productie integratie:

```javascript
// Voorbeeld API structuur
POST /api/auth/login          // Authenticatie
POST /api/photos/analyze      // Foto analyse
POST /api/schedules/create    // Schema opslaan
GET  /api/loyalty/points      // Punten ophalen
POST /api/loyalty/redeem      // Beloning inwisselen
```

## 🚢 Deployment

### GitHub Pages

1. Build is niet nodig (pure HTML/CSS/JS)
2. Push naar GitHub
3. Activeer GitHub Pages in repository settings
4. Kies branch: `main` en folder: `/` (root)

### Netlify

1. Connecteer repository
2. Build command: (leeg laten)
3. Publish directory: `/`
4. Deploy!

### Vercel

```bash
vercel --prod
```

Zie `docs/DEPLOYMENT.md` voor gedetailleerde instructies.

## 📱 Capacitor Conversie

Om de PWA om te zetten naar native iOS/Android apps:

```bash
# Installeer Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init "de Gazon App" "nl.gazonapp" --web-dir .

# Voeg platforms toe
npx cap add ios
npx cap add android

# Build en open
npx cap copy
npx cap open ios
npx cap open android
```

Zie `docs/CAPACITOR.md` voor complete guide.

## 🎯 Toekomstige Features

### Kort Termijn
- [ ] Echte Google OAuth integratie
- [ ] Backend API integratie
- [ ] Real-time weer data voor gazon tips
- [ ] Push notificaties voor onderhoudstaken
- [ ] Foto upload naar cloud storage

### Middellange Termijn
- [ ] AI-powered foto analyse (TensorFlow.js)
- [ ] Gazon gezondheidsmonitoring over tijd
- [ ] Sociale features (delen van tips)
- [ ] E-commerce integratie
- [ ] Expert chat functionaliteit

### Lange Termijn
- [ ] AR feature voor gazon visualisatie
- [ ] IoT sensor integratie
- [ ] Automatische bestel functie
- [ ] Multi-taal support
- [ ] Gamification uitbreidingen

## 🧪 Testing

### Handmatige Test Checklist

- [ ] Login flow werkt
- [ ] Foto upload en analyse
- [ ] Bemestingsschema genereren
- [ ] Kalender export downloadt .ics
- [ ] Punten worden toegekend
- [ ] Beloningen kunnen ingewisseld worden
- [ ] Offline functionaliteit werkt
- [ ] App kan geïnstalleerd worden
- [ ] Responsive op verschillende schermformaten
- [ ] Back/forward navigatie werkt

### Browser DevTools

```javascript
// Debug commands in console
window.GazonApp                    // App instance
localStorage.clear()               // Clear alle data
navigator.serviceWorker.getRegistrations() // Check SW
```

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License.

## 👥 Contact

**Graszoden Expert**
- Website: [www.graszodenexpert.nl](#)
- Email: info@graszodenexpert.nl
- Tel: +31 (0)12 345 6789

## 🙏 Acknowledgments

- Icons: Emoji's als placeholder (vervang met custom icons)
- Design: Mobile-first responsive design
- PWA: Modern service worker implementatie
- Architecture: Modular JavaScript met ES6 modules

---

**Gemaakt met 💚 voor gazon liefhebbers**
