# 🚢 Deployment Guide

Complete deployment instructies voor de Gazon App PWA.

## Deployment Opties

### 1. GitHub Pages (Aanbevolen voor Demo)

**Voordelen:**
- ✅ Gratis hosting
- ✅ Automatische HTTPS
- ✅ Directe GitHub integratie
- ✅ Geen build proces nodig

**Stappen:**

1. **Push code naar GitHub**
   ```bash
   git add .
   git commit -m "Initial PWA setup"
   git push origin main
   ```

2. **Activeer GitHub Pages**
   - Ga naar repository Settings
   - Scroll naar "Pages" sectie
   - Source: Deploy from branch
   - Branch: `main` / `(root)`
   - Click Save

3. **Wacht op deployment**
   - GitHub Actions voert deployment uit
   - URL: `https://[username].github.io/De-Gazon-App/`

4. **Test de deployed app**
   - Open de URL in verschillende browsers
   - Test PWA installatie
   - Controleer Service Worker in DevTools

**Custom Domain (Optioneel):**

```bash
# Voeg CNAME file toe aan root
echo "gazonapp.nl" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

Configureer DNS:
```
Type: CNAME
Name: www
Value: [username].github.io
```

---

### 2. Netlify

**Voordelen:**
- ✅ Automatische deploys bij push
- ✅ Instant rollbacks
- ✅ Branch previews
- ✅ Form handling
- ✅ Serverless functions support

**Stappen:**

1. **Maak Netlify account**
   - Ga naar [netlify.com](https://netlify.com)
   - Sign up met GitHub

2. **Nieuwe site aanmaken**
   - Click "Add new site" → "Import from Git"
   - Selecteer GitHub repository
   - Configureer build settings:
     ```
     Build command: (leeg)
     Publish directory: /
     ```

3. **Deploy settings**
   ```toml
   # netlify.toml (optioneel)
   [build]
     publish = "."

   [[headers]]
     for = "/manifest.json"
     [headers.values]
       Content-Type = "application/manifest+json"

   [[headers]]
     for = "/service-worker.js"
     [headers.values]
       Service-Worker-Allowed = "/"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Custom Domain**
   - Domain settings → Add custom domain
   - Volg DNS configuratie instructies
   - Netlify handelt SSL certificaat automatisch af

**CLI Deployment:**

```bash
# Installeer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

### 3. Vercel

**Voordelen:**
- ✅ Edge network (super snel)
- ✅ Automatische optimalisaties
- ✅ Serverless functions
- ✅ Great developer experience

**Stappen:**

1. **Installeer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # Login
   vercel login

   # Deploy naar production
   vercel --prod
   ```

3. **Vercel Dashboard**
   - Import GitHub repository
   - Framework Preset: Other
   - Build Command: (leeg)
   - Output Directory: ./
   - Install Command: (leeg)

**Configuration File:**

```json
{
  "version": 2,
  "public": true,
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

### 4. Firebase Hosting

**Voordelen:**
- ✅ Google infrastructure
- ✅ Eenvoudige setup
- ✅ Goede analytics integratie
- ✅ Custom domain support

**Stappen:**

1. **Installeer Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project aanmaken**
   ```bash
   firebase login
   firebase init hosting
   ```

   Configuratie:
   - Public directory: `.` (root)
   - Single-page app: No
   - GitHub Actions: Yes (optioneel)

3. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

**firebase.json:**

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Service-Worker-Allowed",
            "value": "/"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

---

### 5. Cloudflare Pages

**Voordelen:**
- ✅ Gratis unlimited bandwidth
- ✅ Cloudflare CDN
- ✅ Great performance
- ✅ Web analytics included

**Stappen:**

1. **Via Dashboard**
   - Ga naar [pages.cloudflare.com](https://pages.cloudflare.com)
   - Connect GitHub account
   - Selecteer repository
   - Build settings:
     - Build command: (leeg)
     - Build output directory: /

2. **Custom headers (_headers file):**
   ```
   /service-worker.js
     Service-Worker-Allowed: /

   /*.js
     Cache-Control: public, max-age=31536000, immutable

   /*.css
     Cache-Control: public, max-age=31536000, immutable
   ```

---

## Pre-Deployment Checklist

### ✅ Essentials

- [ ] Service Worker versie verhoogd
- [ ] Alle paths zijn relatief of absolute (geen localhost)
- [ ] Icons zijn toegevoegd (minimaal 192x192 en 512x512)
- [ ] Manifest.json is compleet
- [ ] Meta tags zijn ingesteld
- [ ] Console errors zijn opgelost
- [ ] PWA test passed (Lighthouse)

### ✅ SEO & Meta Tags

```html
<!-- Zorg dat deze aanwezig zijn in index.html -->
<meta name="description" content="...">
<meta name="keywords" content="gazon, gazononderhoud, bemesting, ...">
<meta property="og:title" content="de Gazon App">
<meta property="og:description" content="...">
<meta property="og:image" content="/src/assets/icons/icon-512x512.png">
<meta property="og:url" content="https://gazonapp.nl">
<meta name="twitter:card" content="summary_large_image">
```

### ✅ Performance

- [ ] Images zijn gecomprimeerd
- [ ] CSS is geminified (optioneel)
- [ ] JavaScript is geminified (optioneel)
- [ ] Unused code is verwijderd
- [ ] Lighthouse score > 90

### ✅ PWA Requirements

```bash
# Test met Lighthouse
npx lighthouse https://your-url.com --view

# Check PWA criteria:
# ✅ Registers a service worker
# ✅ Responds with 200 when offline
# ✅ Has a web app manifest
# ✅ Configured for a custom splash screen
# ✅ Sets a theme color
# ✅ Content sized correctly for viewport
# ✅ Has a <meta name="viewport"> tag
```

---

## Post-Deployment Testing

### Browser Testing

Test op minimaal:
- Chrome (Desktop & Mobile)
- Safari (Desktop & iOS)
- Firefox (Desktop)
- Edge (Desktop)

### PWA Features Testing

```javascript
// Test checklist per platform:

// Android Chrome
- [ ] Installatie prompt verschijnt
- [ ] App installeert correct
- [ ] Splash screen werkt
- [ ] Theme color correct
- [ ] Shortcuts werken
- [ ] Offline functionaliteit

// iOS Safari
- [ ] "Add to Home Screen" werkt
- [ ] Icon verschijnt correct
- [ ] App opent in standalone mode
- [ ] Status bar styling correct

// Desktop
- [ ] Installatie prompt
- [ ] Window sizing correct
- [ ] Standalone mode werkt
```

### Performance Testing

```bash
# PageSpeed Insights
https://pagespeed.web.dev/

# WebPageTest
https://www.webpagetest.org/

# Test metrics:
- First Contentful Paint < 1.8s
- Speed Index < 3.4s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.8s
- Total Blocking Time < 200ms
- Cumulative Layout Shift < 0.1
```

---

## CI/CD Setup (GitHub Actions)

### Automatische deployment bij push

**.github/workflows/deploy.yml:**

```yaml
name: Deploy PWA

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
```

### Met Lighthouse CI

```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://[username].github.io/De-Gazon-App/
    uploadArtifacts: true
```

---

## Monitoring Setup

### Google Analytics

```html
<!-- Voeg toe aan index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking (Sentry)

```javascript
// Voeg toe aan app.js
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

---

## Troubleshooting

### Service Worker niet geupdate

```javascript
// Force update via console
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  })
  .then(() => location.reload());
```

### Manifest niet herkend

- Check Content-Type header: `application/manifest+json`
- Valideer manifest: https://manifest-validator.appspot.com/
- Check browser console voor errors

### Icons niet geladen

- Gebruik absolute paths: `/src/assets/icons/icon.png`
- Check bestandsgrootte (niet te groot)
- Zorg voor correcte image formaten

### HTTPS vereist

PWA features werken alleen met HTTPS:
- Gebruik hosting met automatic SSL
- Test lokaal: `localhost` werkt ook zonder HTTPS

---

## Rollback Procedure

### GitHub Pages

```bash
git revert HEAD
git push origin main
```

### Netlify

- Dashboard → Deploys → Click op vorige deploy → "Publish deploy"

### Vercel

```bash
vercel rollback [deployment-url]
```

---

## Costs Overview

| Platform | Hosting | Bandwidth | Custom Domain | SSL |
|----------|---------|-----------|---------------|-----|
| GitHub Pages | Free | 100GB/month | Free | Free |
| Netlify | Free | 100GB/month | Free | Free |
| Vercel | Free | 100GB/month | Free | Free |
| Firebase | Free | 10GB/month | Free | Free |
| Cloudflare | Free | Unlimited | Free | Free |

**Conclusie:** Voor deze PWA zijn alle opties gratis geschikt! 🎉

---

**Next Steps na Deployment:**

1. Monitor performance metrics
2. Setup analytics
3. Test op echte devices
4. Gather user feedback
5. Plan next features
