// components/RouteControl.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';


export default function RouteControl({ start, end }) {
  const map = useMap();  // obtenemos el mapa de React‑Leaflet

  useEffect(() => {
    if (!map) return;

    
    const plan = L.Routing.plan(
      [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      {
        addWaypoints: false,
        draggableWaypoints: false,
        closeButton:true,
        show: false,            
        createMarker: () => null 
      }
    );

    const control = L.Routing.control({
      plan,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [{ color: 'purple', weight: 4 }]
      },
      fitSelectedRoutes: true,
      showAlternatives: true
    }).addTo(map);

    return () => map.removeControl(control);
  }, [map, start, end]);

  return null;
}
