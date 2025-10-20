import L from 'leaflet';

interface Portal {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export class PortalLayer {
  private group: L.LayerGroup;
  private map: L.Map | null = null;
  private pane: HTMLElement | null = null;

  constructor() {
    this.group = L.layerGroup();
  }

  mount(map: L.Map) {
    this.map = map;
    
    // Create dedicated pane for portals
    let pane = map.getPane('m1-portals');
    if (!pane) {
      pane = map.createPane('m1-portals');
      if (pane) {
        pane.style.zIndex = '450';
        pane.style.pointerEvents = 'auto';
        pane.setAttribute('data-layer', 'portals');
      }
    }
    this.pane = pane;
    
    this.group.addTo(map);
  }

  setData(portals: Portal[]) {
    this.group.clearLayers();
    
    portals.forEach((portal) => {
      // Create custom DivIcon for portal
      const icon = L.divIcon({
        html: `
          <div class="m1-portal-pin" data-layer="portals">
            <div class="portal-inner"></div>
            <div class="portal-label">${portal.name}</div>
          </div>
        `,
        className: 'portal-marker-wrapper',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([portal.lat, portal.lng], {
        icon,
        pane: 'm1-portals',
        bubblingMouseEvents: true,
      });

      // Tooltip
      marker.bindTooltip(portal.name, {
        direction: 'top',
        offset: L.point(0, -20),
        opacity: 1,
        permanent: false,
        className: 'portal-tooltip',
      });

      // Click event
      marker.on('click', () => {
        try {
          window.dispatchEvent(
            new CustomEvent('M1_PORTAL_CLICK', {
              detail: { id: portal.id, name: portal.name },
            })
          );
          console.info('[M1] Portal clicked:', portal.name, portal.id);
        } catch (err) {
          console.error('[M1] Portal click error:', err);
        }
      });

      this.group.addLayer(marker);
    });
  }

  show() {
    if (this.map && !this.map.hasLayer(this.group)) {
      this.group.addTo(this.map);
    }
    if (this.pane) {
      this.pane.style.display = '';
      this.pane.classList.remove('is-hidden');
    }
  }

  hide() {
    if (this.map && this.map.hasLayer(this.group)) {
      this.map.removeLayer(this.group);
    }
    if (this.pane) {
      this.pane.style.display = 'none';
      this.pane.classList.add('is-hidden');
    }
  }

  destroy() {
    this.group.clearLayers();
    if (this.map && this.map.hasLayer(this.group)) {
      this.map.removeLayer(this.group);
    }
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
