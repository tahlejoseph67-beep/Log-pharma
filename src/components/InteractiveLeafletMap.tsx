import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Compass, Navigation, Info, Clock, AlertCircle } from 'lucide-react';

// Dynamic Leaflet asset loader helper
const loadLeafletAssets = (callback: () => void) => {
  if ((window as any).L) {
    callback();
    return;
  }

  // Inject Leaflet CSS
  let link = document.getElementById('leaflet-css') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  // Inject Leaflet JS
  let script = document.getElementById('leaflet-js') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      callback();
    };
    document.body.appendChild(script);
  } else {
    const checkInterval = setInterval(() => {
      if ((window as any).L) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
  }
};

interface MapProps {
  mode: 'admin' | 'public';
  initialLat?: number;
  initialLng?: number;
  pharmacyName?: string;
  pharmacyAddress?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export const InteractiveLeafletMap: React.FC<MapProps> = ({
  mode,
  initialLat = 48.8675,
  initialLng = 2.3638,
  pharmacyName = "PHARMACIE",
  pharmacyAddress = "",
  onLocationSelect,
}) => {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentCoords, setCurrentCoords] = useState({ lat: initialLat, lng: initialLng });
  
  // Route / public mode states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    steps: Array<{ instruction: string; distance: string }>;
  } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [travelMode, setTravelMode] = useState<'walking' | 'driving'>('walking');

  // Load Leaflet Assets on Mount
  useEffect(() => {
    loadLeafletAssets(() => {
      setLeafletLoaded(true);
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Clean up previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Workaround for Leaflet default icon path issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Custom Red Pin for Pharmacy
    const pharmacyIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-emerald.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Custom Blue Pin for Patient/User
    const userIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Initialize Map Instance
    const map = L.map(mapContainerRef.current).setView([currentCoords.lat, currentCoords.lng], 13);
    mapInstanceRef.current = map;

    // Add Tile Layer (OpenStreetMap CartoDB Positron for cleaner design matching our theme)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CartoDB',
      maxZoom: 20,
    }).addTo(map);

    // Mode specific behavior
    if (mode === 'admin') {
      // Admin Selector Map: One draggable marker for our pharmacy
      const marker = L.marker([currentCoords.lat, currentCoords.lng], {
        draggable: true,
        icon: pharmacyIcon
      }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup(`<strong>${pharmacyName}</strong><br/>Faites glisser ce marqueur pour définir l'emplacement de votre officine.`).openPopup();

      // Drag event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCurrentCoords({ lat: position.lat, lng: position.lng });
        if (onLocationSelect) {
          onLocationSelect(position.lat, position.lng);
        }
      });

      // Click event on map to reposition marker
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCurrentCoords({ lat, lng });
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      });
    } else {
      // Public view mode: Show pharmacy as fixed marker
      const marker = L.marker([initialLat, initialLng], {
        icon: pharmacyIcon
      }).addTo(map);
      markerRef.current = marker;
      marker.bindPopup(`<strong>${pharmacyName}</strong><br/>${pharmacyAddress}`).openPopup();

      // Trigger automatic User Geolocation
      getUserGeolocation(L, map, userIcon);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, mode, initialLat, initialLng, pharmacyName]);

  // Geolocation trigger
  const getUserGeolocation = (L: any, map: any, userIcon: any) => {
    if (!navigator.geolocation) {
      // Fallback
      setFallbackUserLocation(L, map, userIcon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const uLoc = { lat: userLat, lng: userLng };
        setUserLocation(uLoc);
        
        // Add User Marker
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userMarker = L.marker([userLat, userLng], {
          icon: userIcon
        }).addTo(map);
        userMarker.bindPopup(`<strong>Votre position actuelle</strong>`).openPopup();
        userMarkerRef.current = userMarker;

        // Auto-fit bounds to show both markers
        const bounds = L.latLngBounds([
          [userLat, userLng],
          [initialLat, initialLng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

        // Calculate Route Itinerary
        fetchOSRMRoute(userLat, userLng, initialLat, initialLng, map, L);
      },
      (error) => {
        console.warn("Geolocation failed/denied, using fallback", error);
        setFallbackUserLocation(L, map, userIcon);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const setFallbackUserLocation = (L: any, map: any, userIcon: any) => {
    // Generate fallback coordinate slightly offset from pharmacy (e.g. 1.2km away)
    const userLat = initialLat + 0.008;
    const userLng = initialLng - 0.012;
    const uLoc = { lat: userLat, lng: userLng };
    setUserLocation(uLoc);

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userMarker = L.marker([userLat, userLng], {
      icon: userIcon
    }).addTo(map);
    userMarker.bindPopup(`<strong>Point de départ patient (Simulation)</strong><br/>Géolocalisation inactive`).openPopup();
    userMarkerRef.current = userMarker;

    const bounds = L.latLngBounds([
      [userLat, userLng],
      [initialLat, initialLng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    fetchOSRMRoute(userLat, userLng, initialLat, initialLng, map, L);
  };

  // Fetch Route from OSRM
  const fetchOSRMRoute = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    map: any,
    L: any
  ) => {
    setRouteLoading(true);
    try {
      const type = travelMode === 'walking' ? 'foot' : 'car';
      const url = `https://router.project-osrm.org/route/v1/${type}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur de routage');
      
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('Aucun itinéraire trouvé');
      }

      const route = data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.round(route.duration / 60);

      // Extract steps instructions
      const stepsList: Array<{ instruction: string; distance: string }> = [];
      if (route.legs && route.legs[0] && route.legs[0].steps) {
        route.legs[0].steps.forEach((step: any) => {
          let inst = step.maneuver.type;
          if (step.name) {
            inst = `${translateManeuver(step.maneuver.modifier || '')} sur ${step.name}`;
          } else {
            inst = translateManeuver(step.maneuver.type);
          }
          const stepDist = step.distance > 1000 
            ? `${(step.distance / 1000).toFixed(1)} km` 
            : `${Math.round(step.distance)} m`;
          stepsList.push({ instruction: inst, distance: stepDist });
        });
      }

      setRouteInfo({
        distance: `${distanceKm} km`,
        duration: `${durationMin} min`,
        steps: stepsList.length > 0 ? stepsList : [
          { instruction: "Suivre la route principale vers l'officine", distance: `${distanceKm} km` }
        ]
      });

      // Draw Route Polyline
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
      }

      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      const polyline = L.polyline(coordinates, {
        color: travelMode === 'walking' ? '#059669' : '#3b82f6', // Emerald for walking, Blue for driving
        weight: 6,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routePolylineRef.current = polyline;
    } catch (err) {
      console.error('OSRM API Error:', err);
    } finally {
      setRouteLoading(false);
    }
  };

  // Re-fetch route if travelMode changes
  useEffect(() => {
    if (mode === 'public' && userLocation && mapInstanceRef.current && leafletLoaded) {
      const L = (window as any).L;
      fetchOSRMRoute(userLocation.lat, userLocation.lng, initialLat, initialLng, mapInstanceRef.current, L);
    }
  }, [travelMode]);

  // Translate routing instructions to French
  const translateManeuver = (maneuver: string): string => {
    const table: Record<string, string> = {
      'turn': 'Tourner',
      'sharp right': 'Tourner brusquement à droite',
      'right': 'Tourner à droite',
      'slight right': 'Prendre légèrement à droite',
      'sharp left': 'Tourner brusquement à gauche',
      'left': 'Tourner à gauche',
      'slight left': 'Prendre légèrement à gauche',
      'straight': 'Continuer tout droit',
      'merge': 'Rejoindre la voie',
      'fork': 'Prendre la bifurcation',
      'roundabout': 'Entrer dans le rond-point',
      'exit roundabout': 'Sortir du rond-point',
      'arrive': 'Arrivée à destination',
      'depart': 'Départ',
      'uturn': 'Faire demi-tour'
    };
    return table[maneuver.toLowerCase()] || 'Continuer';
  };

  // Handle Nominatim Address Search (Admin mode)
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'fr' }
      });
      if (!res.ok) throw new Error('La recherche a échoué');
      
      const results = await res.json();
      if (!results || results.length === 0) {
        throw new Error('Aucun résultat trouvé pour cette adresse. Essayez de taper des termes plus précis.');
      }

      const { lat, lon, display_name } = results[0];
      const numLat = parseFloat(lat);
      const numLng = parseFloat(lon);

      // Update State & trigger callback
      setCurrentCoords({ lat: numLat, lng: numLng });
      if (onLocationSelect) {
        onLocationSelect(numLat, numLng);
      }

      // Move marker and center map
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([numLat, numLng]);
        mapInstanceRef.current.setView([numLat, numLng], 15);
        markerRef.current.bindPopup(`<strong>${pharmacyName}</strong><br/>${display_name}`).openPopup();
      }
    } catch (err: any) {
      setSearchError(err.message || 'Une erreur est survenue.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Trigger browser's native location search as fallback
  const handleUseCurrentLocationAdmin = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        if (onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.setView([latitude, longitude], 15);
          markerRef.current.bindPopup(`<strong>Votre Position Actuelle</strong><br/>Définie comme emplacement de l'officine.`).openPopup();
        }
      },
      () => {
        alert("Impossible d'accéder à votre position actuelle.");
      }
    );
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-5">
      {/* Map Content Column */}
      <div className="flex-1 space-y-4">
        {mode === 'admin' && (
          <div className="space-y-3">
            <form onSubmit={handleAddressSearch} className="flex gap-2">
              <input 
                type="text"
                placeholder="Rechercher une adresse sur la carte (ex: 12 Rue de la Paix, Paris)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
              <button 
                type="submit"
                disabled={searchLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {searchLoading ? 'Recherche...' : <><Search size={14} /> Rechercher</>}
              </button>
              <button 
                type="button"
                onClick={handleUseCurrentLocationAdmin}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-center cursor-pointer"
                title="Utiliser ma position GPS"
              >
                <Compass size={14} />
              </button>
            </form>

            {searchError && (
              <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {searchError}
              </p>
            )}

            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
              <Info size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Instructions d'emplacement :</strong> Tapez une adresse ci-dessus pour centrer la carte OU double-cliquez directement sur la carte pour poser l'officine. Vous pouvez également glisser le marqueur vert. Les coordonnées seront automatiquement sauvegardées pour le public.
              </span>
            </div>
          </div>
        )}

        {mode === 'public' && (
          <div className="flex items-center justify-between gap-4 bg-slate-100 border border-slate-200 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Navigation size={15} className="text-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">Mode Itinéraire Patient</span>
            </div>
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
              <button 
                type="button"
                onClick={() => setTravelMode('walking')}
                className={`px-3 py-1 rounded-md transition-all ${travelMode === 'walking' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🚶 À pied
              </button>
              <button 
                type="button"
                onClick={() => setTravelMode('driving')}
                className={`px-3 py-1 rounded-md transition-all ${travelMode === 'driving' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🚗 En Voiture
              </button>
            </div>
          </div>
        )}

        {/* Map Rendering Div */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-[320px] sm:h-[380px] lg:h-[440px] rounded-2xl border border-slate-200/60 shadow-3xs relative overflow-hidden bg-slate-50"
          style={{ minHeight: '320px' }}
        />

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>{leafletLoaded ? '🟢 Carte interactive chargée' : '🔄 Chargement de la carte...'}</span>
          <span>Latitude : {currentCoords.lat.toFixed(6)} | Longitude : {currentCoords.lng.toFixed(6)}</span>
        </div>
      </div>

      {/* Public Route Steps Sidebar */}
      {mode === 'public' && routeInfo && (
        <div className="w-full md:w-[280px] lg:w-[320px] bg-white border rounded-2xl p-4 space-y-4 shadow-3xs flex flex-col justify-between max-h-[500px] overflow-y-auto">
          <div className="space-y-3.5">
            <h4 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
              <span>📋 Fiche Itinéraire</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                {travelMode === 'walking' ? 'Piéton' : 'Automobile'}
              </span>
            </h4>

            {/* Quick stats card */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 border p-3 rounded-xl text-center">
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Distance</span>
                <span className="text-sm font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-emerald-500" />
                  {routeInfo.distance}
                </span>
              </div>
              <div className="border-l">
                <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Temps estimé</span>
                <span className="text-sm font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                  <Clock size={12} className="text-emerald-500" />
                  {routeInfo.duration}
                </span>
              </div>
            </div>

            {/* Steps text layout */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Étapes détaillées :</p>
              <div className="divide-y text-xs text-slate-700">
                {routeInfo.steps.map((step, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-start gap-2">
                    <span className="font-medium text-slate-800 leading-snug">
                      <span className="text-slate-400 font-bold mr-1.5">{idx + 1}.</span>
                      {step.instruction}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 font-semibold">{step.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-100/60 text-[10px] font-medium leading-relaxed">
            🌿 <strong>Proximité :</strong> Cet itinéraire en temps réel vous est fourni par notre réseau d'officines connectées pour faciliter vos déplacements d'urgence médicale.
          </div>
        </div>
      )}
    </div>
  );
};
