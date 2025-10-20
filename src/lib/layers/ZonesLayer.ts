import L from 'leaflet';

interface Zone {
  id: string;
  name: string;
  coordinates: [number, number][];
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

  setData(zones: Zone[]) {
    this.group.clearLayers();
    
    zones.forEach((zone) => {
      const polygon = L.polygon(zone.coordinates, {
        color: '#00e5ff',
        fillColor: '#00e5ff',
        fillOpacity: 0.1,
        weight: 2,
        opacity: 0.6,
        pane: 'm1-zones',
      });

      polygon.bindTooltip(zone.name, {
        direction: 'center',
        className: 'm1-portal-tooltip',
        sticky: true,
      });

      this.group.addLayer(polygon);
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
