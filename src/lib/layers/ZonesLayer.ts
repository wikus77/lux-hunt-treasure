import L from 'leaflet';

interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export class ZonesLayer {
  private group: L.LayerGroup;
  private map: L.Map | null = null;
  private pane: HTMLElement | null = null;

  constructor() {
    this.group = L.layerGroup();
  }

  mount(map: L.Map) {
    this.map = map;
    
    // Create dedicated pane for zones
    let pane = map.getPane('m1-zones');
    if (!pane) {
      pane = map.createPane('m1-zones');
      if (pane) {
        pane.style.zIndex = '400'; // Below markers
        pane.style.pointerEvents = 'auto';
        pane.setAttribute('data-layer', 'zones');
      }
    }
    this.pane = pane;
    
    this.group.addTo(map);
  }

  setData(zones: Array<{ id: string; name: string; lat: number; lng: number; radius: number }>) {
    this.group.clearLayers();
    
    zones.forEach((zone) => {
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: '#00e5ff',
        fillColor: '#00e5ff',
        fillOpacity: 0.08,
        weight: 2,
        opacity: 0.5,
        pane: 'm1-zones',
        className: 'm1-zone-circle',
      });

      circle.bindTooltip(zone.name, {
        direction: 'center',
        className: 'm1-portal-tooltip',
        sticky: true,
      });

      this.group.addLayer(circle);
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
  
  getCount(): number {
    let count = 0;
    this.group.eachLayer(() => count++);
    return count;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
