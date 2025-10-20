import L from 'leaflet';

interface Event {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export class EventsLayer {
  private group: L.LayerGroup;
  private map: L.Map | null = null;
  private pane: HTMLElement | null = null;

  constructor() {
    this.group = L.layerGroup();
  }

  mount(map: L.Map) {
    this.map = map;
    
    // Create dedicated pane for events
    let pane = map.getPane('m1-events');
    if (!pane) {
      pane = map.createPane('m1-events');
      if (pane) {
        pane.style.zIndex = '610';
        pane.style.pointerEvents = 'auto';
        pane.setAttribute('data-layer', 'events');
      }
    }
    this.pane = pane;
    
    this.group.addTo(map);
  }

  setData(events: Event[]) {
    this.group.clearLayers();
    
    events.forEach((event) => {
      const icon = L.divIcon({
        html: '<div class="m1-event-dot" data-layer="events"></div>',
        className: 'm1-event-wrapper',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([event.lat, event.lng], {
        icon,
        pane: 'm1-events',
        bubblingMouseEvents: false,
      });

      marker.bindTooltip(event.name, {
        direction: 'top',
        offset: L.point(0, -8),
        className: 'm1-portal-tooltip',
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
  
  getCount(): number {
    let count = 0;
    this.group.eachLayer(() => count++);
    return count;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
