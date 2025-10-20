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
    
    // Create dedicated pane for portals - same level as markers
    let pane = map.getPane('m1-portals');
    if (!pane) {
      pane = map.createPane('m1-portals');
      if (pane) {
        pane.style.zIndex = '600'; // Above markers (600) but below popups (700)
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
      // M1SSION design: cyan glowing dot with pulse
      const icon = L.divIcon({
        html: '<div class="m1-portal-dot" data-layer="portals"></div>',
        className: 'm1-portal-wrapper',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([portal.lat, portal.lng], {
        icon,
        pane: 'm1-portals',
        bubblingMouseEvents: false,
      });

      // Tooltip on hover
      marker.bindTooltip(portal.name, {
        direction: 'top',
        offset: L.point(0, -8),
        opacity: 1,
        permanent: false,
        className: 'm1-portal-tooltip',
      });

      // Click event with focus action
      marker.on('click', () => {
        try {
          // Emit portal click event
          window.dispatchEvent(
            new CustomEvent('M1_PORTAL_CLICK', {
              detail: { 
                id: portal.id, 
                name: portal.name,
                lat: portal.lat,
                lng: portal.lng
              },
            })
          );
          
          // Emit portal focus for pan/zoom
          window.dispatchEvent(
            new CustomEvent('M1_PORTAL_FOCUS', {
              detail: { 
                id: portal.id, 
                name: portal.name,
                lat: portal.lat,
                lng: portal.lng
              },
            })
          );
          
          console.info('[M1] Portal clicked & focused:', portal.name, portal.id);
        } catch (err) {
          console.error('[M1] Portal click error:', err);
        }
      });

      this.group.addLayer(marker);
    });
  }
  
  getCount(): number {
    let count = 0;
    this.group.eachLayer(() => count++);
    return count;
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
