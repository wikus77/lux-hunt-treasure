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

  setData(agents: Agent[], currentUser?: { lat: number; lng: number; name: string }) {
    this.group.clearLayers();
    
    // Add current user marker (red pulsing)
    if (currentUser) {
      const userIcon = L.divIcon({
        html: '<div class="m1-agent-dot m1-agent-dot--me" data-layer="agents" data-agent="me"></div>',
        className: 'm1-agent-wrapper',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const userMarker = L.marker([currentUser.lat, currentUser.lng], {
        icon: userIcon,
        pane: 'm1-agents',
        bubblingMouseEvents: false,
      });

      userMarker.bindTooltip(currentUser.name || 'Me', {
        direction: 'top',
        offset: L.point(0, -8),
        className: 'm1-portal-tooltip',
        permanent: false,
      });

      this.group.addLayer(userMarker);
    }
    
    // Add other agents (smaller red dots)
    agents.forEach((agent) => {
      const icon = L.divIcon({
        html: '<div class="m1-agent-dot" data-layer="agents" data-agent="other"></div>',
        className: 'm1-agent-wrapper',
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });

      const marker = L.marker([agent.lat, agent.lng], {
        icon,
        pane: 'm1-agents',
        bubblingMouseEvents: false,
      });

      marker.bindTooltip(`Agent • ${agent.name}`, {
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
