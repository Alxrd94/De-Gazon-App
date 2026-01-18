# 🏗️ Architectuur Documentatie

## Overzicht

de Gazon App is gebouwd als een moderne Progressive Web App met een modulaire architectuur, gescheiden concerns en clean code principles.

## Technologie Stack

### Frontend
- **HTML5**: Semantische markup
- **CSS3**: Custom properties, Flexbox, Grid
- **JavaScript ES6+**: Modules, async/await, classes

### PWA Features
- **Service Worker**: Offline caching en app shell
- **Web App Manifest**: Installatie en app configuratie
- **LocalStorage**: Client-side data persistentie

## Architectuur Principes

### 1. Separation of Concerns

De applicatie is opgedeeld in duidelijke lagen:

```
├── Presentation Layer (HTML/CSS)
│   ├── Pages (src/pages/)
│   └── Styles (src/css/)
│
├── Business Logic Layer (JavaScript Modules)
│   ├── Feature Modules (photoAnalysis, fertilizerPlanner, loyalty)
│   └── Core Services (auth, storage, router)
│
└── Data Layer (LocalStorage)
    └── Storage Keys (STORAGE_KEYS)
```

### 2. Modular Design

Elke feature is een zelfstandige module:

- **auth.js**: Authenticatie logica
- **photoAnalysis.js**: Foto analyse functionaliteit
- **fertilizerPlanner.js**: Bemestingsplanning
- **loyalty.js**: Loyaliteitssysteem
- **router.js**: Client-side routing
- **storage.js**: Data persistentie

### 3. Mobile-First Responsive

- Basis styling voor mobiel (320px+)
- Breakpoints voor tablet (768px+)
- Desktop optimalisaties (1024px+)

## Component Structuur

### Router (router.js)

```javascript
class Router {
    routes: Map<name, {path, onLoad}>
    currentPage: string

    register(name, path, onLoad)
    navigate(name)
    setupNavigation()
}
```

**Verantwoordelijkheden:**
- Route registratie en management
- Page navigatie en transitions
- Dynamic content loading
- Navigation event delegation

### Auth (auth.js)

```javascript
class Auth {
    user: Object

    loginWithGoogle()
    logout()
    isAuthenticated()
    getUser()
    initializeWelcomeBonus()
}
```

**Verantwoordelijkheden:**
- Mock Google authenticatie
- Sessie management
- Gebruikersdata opslag
- Welcome bonus initialisatie

### Storage (storage.js)

```javascript
class Storage {
    static set(key, data)
    static get(key, defaultValue)
    static remove(key)
    static clear()
    static has(key)
}
```

**Verantwoordelijkheden:**
- LocalStorage abstractions
- Data serialization/deserialization
- Error handling voor storage operaties

### Photo Analysis (photoAnalysis.js)

```javascript
class PhotoAnalysis {
    currentPhoto: Object
    currentAnalysis: Object

    init()
    processPhoto(file)
    analyzePhoto()
    saveAnalysis()
}
```

**Verantwoordelijkheden:**
- Foto upload en compressie
- Mock AI analyse generatie
- Resultaten weergave
- Analyse opslag

### Fertilizer Planner (fertilizerPlanner.js)

```javascript
class FertilizerPlanner {
    config: Object
    selectedProducts: Set
    schedule: Array

    init()
    generateSchedule()
    exportToCalendar()
}
```

**Verantwoordelijkheden:**
- Schema configuratie
- Product selectie
- Kalender generatie
- ICS export

### Loyalty (loyalty.js)

```javascript
class LoyaltyManager {
    rewards: Array

    init()
    displayPoints()
    displayActivity()
    handleRewardRedeem()
}

// Helper functions
addPoints(type, points, description)
redeemReward(id, cost)
getTotalPoints()
```

**Verantwoordelijkheden:**
- Punten management
- Beloningen systeem
- Activiteiten tracking
- Punten display updates

## Data Flow

### 1. User Authentication Flow

```
User → Click Login Button
  → auth.loginWithGoogle()
  → Create Mock User
  → Storage.set(USER_DATA)
  → initializeWelcomeBonus()
  → addPoints('welcome_bonus', 25)
  → Router.navigate('home')
```

### 2. Photo Analysis Flow

```
User → Upload Photo
  → photoAnalysis.processPhoto()
  → compressImage()
  → Display Preview
  → User clicks Analyze
  → generateMockAnalysis()
  → Display Results
  → addPoints('photo_analysis', 10)
  → Optional: saveAnalysis()
```

### 3. Fertilizer Planning Flow

```
User → Configure Lawn
  → Select Products
  → Click Generate
  → createScheduleEvents()
  → calculateCosts()
  → Display Timeline
  → User clicks Export
  → downloadCalendar() (ICS)
  → addPoints('schedule_created', 15)
```

## State Management

### LocalStorage Schema

```javascript
{
  gazon_user_data: {
    id: string,
    name: string,
    email: string,
    picture: string,
    createdAt: ISO8601,
    lastLogin: ISO8601
  },

  gazon_loyalty_points: {
    total: number,
    history: [
      {
        id: string,
        type: string,
        points: number,
        description: string,
        date: ISO8601
      }
    ]
  },

  gazon_photo_analyses: [
    {
      id: string,
      photoUrl: string,
      analyzedAt: ISO8601,
      condition: string,
      rating: number,
      problems: string[],
      recommendations: string[],
      products: Object[]
    }
  ],

  gazon_fertilizer_schedules: [
    {
      id: string,
      createdAt: ISO8601,
      config: Object,
      events: Array
    }
  ]
}
```

## Service Worker Strategy

### Cache Strategy

```javascript
App Shell (cache-first)
├── HTML pages
├── CSS files
├── JavaScript modules
└── Essential icons

Dynamic Content (network-first)
├── API responses (future)
├── User uploaded photos
└── External resources
```

### Cache Versioning

```javascript
CACHE_VERSION = 'v1.0.0'
CACHE_NAME = `gazon-app-${CACHE_VERSION}`
RUNTIME_CACHE = `gazon-app-runtime-${CACHE_VERSION}`
```

**Update proces:**
1. Verhoog CACHE_VERSION
2. Service Worker update triggert
3. Oude caches worden verwijderd
4. Nieuwe cache wordt aangemaakt

## Performance Optimizations

### 1. Image Compression

```javascript
compressImage(file, maxWidth=1200, maxHeight=1200, quality=0.8)
```

- Canvas-based resizing
- JPEG compression
- Maximale afmetingen
- Quality control

### 2. Lazy Loading

```javascript
// Dynamische page loading
router.navigate(name)
  → fetch(route.path)
  → Update DOM
  → Execute onLoad callback
```

### 3. CSS Custom Properties

- Centraal design system
- Runtime theme updates mogelijk
- Reduced CSS size
- Better maintainability

## Security Considerations

### Current Implementation (Demo)

⚠️ **Niet production-ready:**
- Mock authenticatie (geen echte OAuth)
- Client-side data opslag
- Geen API beveiliging
- Geen data encryptie

### Production Recommendations

1. **Authentication**
   - Echte OAuth 2.0 implementatie
   - JWT tokens voor API calls
   - Secure HTTP-only cookies
   - CSRF protection

2. **Data Security**
   - HTTPS only
   - Server-side data opslag
   - Data encryptie at rest
   - Input validation en sanitization

3. **API Security**
   - Rate limiting
   - Authentication headers
   - CORS configuratie
   - API key management

## Scalability Path

### Phase 1: Current (Pure Frontend)
- LocalStorage voor data
- Mock API responses
- Client-side processing

### Phase 2: Backend Integration
- REST/GraphQL API
- Database (PostgreSQL/MongoDB)
- Authentication service
- File upload service (S3)

### Phase 3: Advanced Features
- Real AI integration
- Push notifications
- Background sync
- Real-time updates (WebSockets)

### Phase 4: Native Apps
- Capacitor integration
- Native features (camera, notifications)
- App store deployment
- Deep linking

## Testing Strategy

### Manual Testing
- Feature testing checklist
- Cross-browser testing
- Mobile device testing
- Offline scenario testing

### Future: Automated Testing

```javascript
// Unit tests (Jest)
test('auth.loginWithGoogle creates user', async () => {
  const user = await auth.loginWithGoogle();
  expect(user).toHaveProperty('id');
});

// Integration tests
test('photo analysis awards points', async () => {
  await photoAnalysis.analyzePhoto();
  expect(getTotalPoints()).toBeGreaterThan(0);
});

// E2E tests (Playwright/Cypress)
test('full user journey', async () => {
  await page.click('#google-login-btn');
  await page.click('[data-page="photo-analysis"]');
  // ... etc
});
```

## Monitoring & Analytics (Future)

### Aanbevolen Tools

- **Google Analytics**: User behavior tracking
- **Sentry**: Error monitoring
- **Lighthouse CI**: Performance monitoring
- **Web Vitals**: Core Web Vitals tracking

### Key Metrics

- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

## Deployment Architecture

```
GitHub Repository
    ↓
CI/CD Pipeline (GitHub Actions)
    ↓
Static Hosting (Netlify/Vercel/GitHub Pages)
    ↓
CDN Distribution
    ↓
End Users
```

## Future Architecture Considerations

### Microservices Approach

```
Frontend (PWA)
    ↓
API Gateway
    ↓
├── Auth Service
├── Photo Analysis Service (ML)
├── Scheduler Service
├── Loyalty Service
└── Notification Service
```

### Database Schema (Future)

```sql
users
├── id (PK)
├── email
├── name
├── created_at
└── last_login

loyalty_points
├── id (PK)
├── user_id (FK)
├── total_points
└── updated_at

point_transactions
├── id (PK)
├── user_id (FK)
├── type
├── points
├── description
└── created_at

photo_analyses
├── id (PK)
├── user_id (FK)
├── photo_url
├── analysis_result (JSON)
└── created_at

fertilizer_schedules
├── id (PK)
├── user_id (FK)
├── config (JSON)
├── events (JSON)
└── created_at
```

---

Deze architectuur biedt een solide basis voor de huidige demo applicatie en een duidelijk pad naar een volledig production-ready systeem.
