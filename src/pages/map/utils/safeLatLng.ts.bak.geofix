// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
export interface LatLng {
  lat: number;
  lng: number;
}

export function isLatLng(v: any): v is LatLng {
  return !!v && Number.isFinite(v.lat) && Number.isFinite(v.lng);
}

export function safeLatLng(e: any): LatLng | null {
  try {
    const ll = e?.latlng;
    if (ll && Number.isFinite(ll.lat) && Number.isFinite(ll.lng)) {
      return { lat: ll.lat, lng: ll.lng };
    }
  } catch {}
  return null;
}
