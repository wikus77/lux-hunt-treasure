# MAP LEGACY CLEAN SWEEP REPORT
**Generated**: 2025-01-11  
**Branch**: chore/map-clean-sweep-maptile3d  
**Goal**: Remove Leaflet legacy architecture, keep only MapLibre+MapTiler

---

## 🎯 EXECUTIVE SUMMARY

The M1SSION map has been migrated from **Leaflet** to **MapLibre GL + MapTiler Cloud**.  
Current routing (`/map`) already points to the new MapLibre-based component via:
- `/map` → `Map.tsx` → `NewMapPage.tsx` → `MapSection.tsx` → **`MapContainerMapLibre.tsx`** ✅

**Legacy Leaflet components are no longer in the active rendering path** and can be safely removed.

---

## 📋 FILES INVENTORY

### ❌ REMOVE - Legacy Leaflet Map Infrastructure

#### Core Leaflet Map Files
- `src/pages/map/MapContainer.tsx` - OLD Leaflet container (replaced by MapContainerMapLibre)
- `src/pages/map/MapContent.tsx` - Leaflet-specific content wrapper
- `src/pages/map/MapLogicProvider.tsx` - Leaflet icon setup and logic
- `src/components/map/MapContainer.tsx` - Duplicate Leaflet container

#### Leaflet Component Wrappers
- `src/components/map/safe/SafeCircle.tsx` - react-leaflet Circle wrapper
- `src/components/map/safe/SafeMarker.tsx` - react-leaflet Marker wrapper
- `src/components/map/MapContent.tsx` - Leaflet-specific content
- `src/components/map/MapEventHandler.tsx` - Leaflet event handler
- `src/components/map/MapZoomControls.tsx` - Leaflet zoom controls
- `src/components/map/utils/mapContainerUtils.ts` - Leaflet utilities

#### Legacy Terrain/Portal Layers
- `src/lib/terrain/TerrainLayer.legacy.ts` - Old terrain implementation
- `src/lib/terrain/TerrainLayer.ts` - Leaflet terrain layer
- `src/map/terrain/enableTerrain.ts` - Leaflet terrain enabler
- `src/lib/portals/PortalLayer.ts` - Leaflet portal layer
- `src/features/living-map/components/PortalsLayer.tsx` - Leaflet imperative layer

#### Leaflet Layer Implementations
- `src/lib/layers/AgentsLayer.ts` - Leaflet agents layer
- `src/lib/layers/EventsLayer.ts` - Leaflet events layer
- `src/lib/layers/ZonesLayer.ts` - Leaflet zones layer

#### Leaflet CSS Files
- `src/pages/map/components/leaflet-fixes.css` - Leaflet iOS fixes
- `src/pages/map/components/map-visual-fixes.css` - Leaflet visual overrides
- `src/components/map/leaflet-fixes.css` - Core Leaflet fixes
- `src/styles/leaflet-fixes.css` - Global Leaflet fixes

#### Deprecated Map Dock/Portal CSS
- `src/styles/portal-container.css` - Old portal styling (superseded by map-dock.css)
- `src/styles/terrain.css` - Old terrain styling (if exists)

---

### ✅ KEEP - Active MapLibre+MapTiler Infrastructure

#### Core MapLibre Files
- `src/pages/map/MapContainerMapLibre.tsx` ✅ **ACTIVE MAP COMPONENT**
- `src/config/maptiler.ts` ✅ **MapTiler config & key resolver**
- `src/styles/maplibre-tron.css` ✅ **MapLibre Tron theme**

#### Active Page Structure
- `src/pages/Map.tsx` ✅ Entry point
- `src/pages/NewMapPage.tsx` ✅ Main map page
- `src/pages/MapPage.tsx` ✅ Alternative entry (if used)
- `src/pages/map/components/MapSection.tsx` ✅ Section wrapper
- `src/pages/map/components/MapPageLayout.tsx` ✅ Layout
- `src/pages/map/components/MapLoadingFallback.tsx` ✅ Loading state

#### Map UI Components (Framework-agnostic)
- `src/pages/map/components/MapControls.tsx` ✅ Control buttons
- `src/pages/map/components/MapDock.tsx` ✅ Unified dock
- `src/pages/map/components/MapLayerToggle.tsx` ✅ Layer controls
- `src/pages/map/NotesSection.tsx` ✅ Notes sidebar
- `src/pages/map/HelpDialog.tsx` ✅ Help modal
- `src/pages/map/SearchAreasSection.tsx` ✅ Search areas
- `src/pages/map/MapPointsSection.tsx` ✅ Points list

#### Buzz/Map Business Logic (DON'T TOUCH)
- `src/hooks/useBuzzMapLogic.ts` ✅ Buzz areas logic
- `src/hooks/map/useBuzzMapPricing.ts` ✅ Pricing logic
- `src/pages/map/hooks/*` ✅ All map hooks
- `src/pages/map/components/BuzzButton.tsx` ✅ Buzz button
- `src/pages/map/components/BuzzMapAreas.tsx` ✅ Buzz areas renderer

#### Active Styling
- `src/styles/map-dock.css` ✅ Unified dock styles
- `src/pages/map/components/ItalyRegionsStyles.css` ✅ Italy regions

---

## 📊 SIZE DELTA ESTIMATION

**Files to Remove**: ~35 files  
**Estimated Size Reduction**: ~150KB (code + CSS)  
**Dependency Reduction**: All `react-leaflet` and `leaflet` imports removed from active rendering path

---

## 🔍 IMPORT ANALYSIS

### Leaflet Imports Found (47 files)
Most are in **non-active paths** or **Intel sub-modules** that have isolated maps:
- `src/components/intelligence/*` - Intel module uses separate Leaflet maps ✅ KEEP (isolated)
- `src/components/admin/QRInlineMap.tsx` - Admin QR map ✅ KEEP (isolated)
- Main `/map` route - **Already migrated to MapLibre** ✅

---

## ⚠️ SAFETY CHECKS

### Will NOT Touch:
- ❌ UnifiedHeader.tsx
- ❌ BottomNavigation.tsx  
- ❌ Buzz/Buzz Map logic
- ❌ Push notifications (SW/VAPID/FCM)
- ❌ Stripe/payments
- ❌ Norah chat
- ❌ Geolocation hooks
- ❌ Routing (WouterRoutes.tsx)

### Intelligence Module Exception:
The Intel module (`/intelligence/*` routes) uses **separate Leaflet maps** for specialized tools:
- GeoRadarTool
- FinalShotPage
- CoordinateSelector

These are **isolated from main map** and will remain Leaflet-based for now.

---

## 🎯 CLEANUP ACTIONS

1. ✅ Remove old Leaflet MapContainer implementations
2. ✅ Remove Leaflet-specific CSS files
3. ✅ Remove legacy terrain/portal Leaflet layers
4. ✅ Keep MapLibre+MapTiler files
5. ✅ Keep Intel module Leaflet maps (isolated)
6. ✅ Verify no broken imports after cleanup

---

## 📈 FINAL TREE STRUCTURE

```
src/pages/map/
├── MapContainerMapLibre.tsx          ✅ ACTIVE (MapTiler+MapLibre)
├── components/
│   ├── MapSection.tsx                ✅ ACTIVE (lazy loads MapLibre)
│   ├── MapPageLayout.tsx             ✅ Layout
│   ├── MapControls.tsx               ✅ UI controls
│   ├── MapDock.tsx                   ✅ Unified dock
│   ├── BuzzButton.tsx                ✅ Buzz logic
│   └── MapLoadingFallback.tsx        ✅ Loading
├── hooks/                            ✅ All hooks kept
│   ├── useNewMapPage.ts
│   ├── usePricingLogic.ts
│   └── ...
└── NotesSection.tsx                  ✅ Sidebar

src/config/
└── maptiler.ts                       ✅ MapTiler config

src/styles/
└── maplibre-tron.css                 ✅ MapLibre theme
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] No broken imports after cleanup
- [ ] `/map` route loads MapLibre version
- [ ] 3D terrain toggle functional
- [ ] Buzz button operational
- [ ] Markers/presence layers render
- [ ] Intel module maps still work (Leaflet isolated)
- [ ] No console errors
- [ ] Build succeeds

---

**Status**: Ready for execution  
**Risk Level**: LOW (inactive code removal only)

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
