import L from 'leaflet';

interface Agent {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export class AgentsLayer {
  private group: L.LayerGroup;
  private map: L.Map | null = null;
  private pane: HTMLElement | null = null;

  constructor() {
    this.group = L.layerGroup();
  }

  mount(map: L.Map) {
    this.map = map;
    
    // Create dedicated pane for agents
    let pane = map.getPane('m1-agents');
    if (!pane) {
      pane = map.createPane('m1-agents');
      if (pane) {
        pane.style.zIndex = '620';
        pane.style.pointerEvents = 'auto';
        pane.setAttribute('data-layer', 'agents');
      }
    }
    this.pane = pane;
    
    this.group.addTo(map);
  }

  setData(agents: Agent[]) {
    this.group.clearLayers();
    
    agents.forEach((agent) => {
      const icon = L.divIcon({
        html: '<div class="m1-agent-dot" data-layer="agents"></div>',
        className: 'm1-agent-wrapper',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const marker = L.marker([agent.lat, agent.lng], {
        icon,
        pane: 'm1-agents',
        bubblingMouseEvents: false,
      });

      marker.bindTooltip(agent.name, {
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
