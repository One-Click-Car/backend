# סקריפטים להעשרת מסד נתוני המכוניות

תיקייה זו מכילה סקריפטים להעשרת מסד הנתונים ב-Firebase עם מידע נוסף.

## 📁 מבנה התיקייה

```
scripts/
├── README.md                    # קובץ זה
├── enrich-safety.ts             # העשרת דירוגי בטיחות
├── enrich-specs.ts              # העשרת מפרט טכני
├── enrich-features.ts           # העשרת אבזור לכל גרסה
├── types/
│   └── car-types.ts             # טיפוסי TypeScript
├── sources/
│   ├── nhtsa.ts                 # API של NHTSA (ארה"ב)
│   └── euroncap.ts              # נתוני Euro NCAP
├── templates/
│   └── features-template.ts     # תבניות אבזור לפי רמת גימור
├── utils/
│   └── fuzzy-match.ts           # כלי התאמה בין שמות
└── output/                      # תוצאות dry-run (נוצר אוטומטית)
```

## 🚀 שימוש

### דרישות מקדימות

```bash
# התקנת dependencies
pnpm install
```

### הרצת הסקריפטים

כל הסקריפטים תומכים ב:
- `--dry-run` - הרצה ללא שינויים ב-Firebase
- `--make=BMW` - סינון ליצרן ספציפי

#### 1. העשרת דירוגי בטיחות

```bash
# בדיקה בלבד (dry run)
npx tsx scripts/enrich-safety.ts --dry-run

# העשרה אמיתית
npx tsx scripts/enrich-safety.ts

# רק BMW
npx tsx scripts/enrich-safety.ts --make=BMW
```

מקורות:
- **Euro NCAP** - דירוגי בטיחות אירופיים (רלוונטי לישראל)
- **NHTSA** - דירוגי בטיחות אמריקאיים (משלים)

#### 2. העשרת מפרט טכני

```bash
# בדיקה בלבד
npx tsx scripts/enrich-specs.ts --dry-run

# העשרה אמיתית
npx tsx scripts/enrich-specs.ts
```

מוסיף: מידות, משקל, נפח תא מטען, קיבולת סוללה (לחשמליים)

#### 3. העשרת אבזור

```bash
# בדיקה בלבד
npx tsx scripts/enrich-features.ts --dry-run

# העשרה אמיתית
npx tsx scripts/enrich-features.ts
```

מוסיף לכל גרסה:
- **נוחות**: חלונות חשמליים, מראות מתקפלות, מושבים מחוממים, גג שמש...
- **בטיחות**: כריות אוויר, חיישנים, מצלמות, מערכות ADAS...
- **מולטימדיה**: מסך, CarPlay/Android Auto, מערכת שמע...
- **נהיגה**: מצבי נהיגה, הנעה כפולה, מתלים אדפטיביים...
- **תאורה**: פנסי LED/Matrix, תאורת אווירה...

## 📊 מבנה הנתונים

### לפני ההעשרה

```json
{
  "BMW": {
    "M3": {
      "properties": { "קטגוריה": "ספורט", ... },
      "versions": [
        { "name": "...", "horsePower": 510, "enginVolume": "2993" }
      ],
      "years": [2024, 2023, ...]
    }
  }
}
```

### אחרי ההעשרה

```json
{
  "BMW": {
    "M3": {
      "properties": { ... },
      "versions": [
        {
          "name": "...",
          "horsePower": 510,
          "enginVolume": "2993",
          "trimLevel": "sport",
          "transmission": "automatic",
          "fuelType": "petrol",
          "features": {
            "comfort": { "electricWindows": "all", ... },
            "safety": { "airbags": 8, "blindSpotMonitor": true, ... },
            "infotainment": { "screenSize": 12.3, "appleCarPlay": true, ... },
            "driving": { "driveMode": ["Comfort", "Sport", "Sport+"], ... },
            "lighting": { "headlights": "LED Matrix", ... }
          }
        }
      ],
      "years": [2024, 2023, ...],
      "safety": {
        "euroNcapStars": 5,
        "adultOccupant": 97,
        "childOccupant": 87,
        ...
      },
      "specs": {
        "length": 4794,
        "width": 1903,
        "trunkVolume": 480,
        ...
      }
    }
  }
}
```

## 🔧 הוספת נתונים ידנית

### הוספת מפרט טכני לדגם חדש

ערוך את `scripts/enrich-specs.ts` והוסף ל-`KNOWN_SPECS`:

```typescript
'Toyota': {
  'קורולה': {
    length: 4630,
    width: 1780,
    height: 1435,
    wheelbase: 2700,
    curbWeight: 1370,
    trunkVolume: 471,
    fuelTankCapacity: 50,
    seats: 5,
    doors: 4,
  },
}
```

### הוספת דירוגי בטיחות

ערוך את `scripts/sources/euroncap.ts` והוסף ל-`ALL_EURONCAP_DATA`:

```typescript
{
  make: 'Toyota',
  model: 'Corolla',
  year: 2024,
  stars: 5,
  adultOccupant: 94,
  childOccupant: 87,
  pedestrian: 86,
  safetyAssist: 95,
  url: 'https://www.euroncap.com/...',
  vehicleClass: 'Small Family Car',
}
```

### התאמת רמות גימור ליצרן

ערוך את `scripts/templates/features-template.ts`:

```typescript
TRIM_LEVEL_MAPPINGS: {
  'Toyota': {
    'Luna': 'basic',
    'Terra': 'mid',
    'Sol': 'high',
    'Premium': 'luxury',
    'GR': 'sport',
  },
}
```

## ⚠️ חשוב

1. **תמיד הרץ עם `--dry-run` קודם** לבדוק מה ישתנה
2. **הנתונים מתווספים, לא מוחלפים** - שדות קיימים לא ייפגעו
3. **Rate Limiting** - הסקריפטים מכבדים את מגבלות ה-APIs
4. **נתוני האבזור הם הערכה** - מבוססים על רמת גימור, לא תמיד מדויקים 100%

## 📝 לוג שינויים

| תאריך | שינוי |
|-------|-------|
| 2026-02-27 | יצירת הסקריפטים הראשונית |
