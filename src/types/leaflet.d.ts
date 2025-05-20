
import * as L from 'leaflet';

declare module 'react-leaflet' {
  interface CircleProps extends L.CircleOptions {
    center: L.LatLngExpression;
    radius: number;
  }
}
