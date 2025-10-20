import L from 'leaflet';

interface Agent {
  id: string;
  name?: string;
  agent_code: string;
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

  setData(agents: Agent[], currentUserId?: string) {
    this.group.clearLayers();
    
    // Render all agents
    agents.forEach((agent) => {
      const isMe = currentUserId && agent.id === currentUserId;
      
      const icon = L.divIcon({
        html: `<div class="m1-agent-dot ${isMe ? 'm1-agent-dot--me' : ''}" data-layer="agents" data-agent="${isMe ? 'me' : 'other'}"></div>`,
        className: 'm1-agent-wrapper',
        iconSize: isMe ? [12, 12] : [8, 8],
        iconAnchor: isMe ? [6, 6] : [4, 4],
      });

      const marker = L.marker([agent.lat, agent.lng], {
        icon,
        pane: 'm1-agents',
        bubblingMouseEvents: false,
      });

      // Tooltip shows agent code (e.g., "You — AG-X0197" or "AG-X0197")
      const tooltipText = isMe 
        ? `You — ${agent.agent_code}`
        : agent.agent_code;

      marker.bindTooltip(tooltipText, {
        direction: 'top',
        offset: L.point(0, -8),
        className: 'm1-portal-tooltip',
        permanent: false,
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
