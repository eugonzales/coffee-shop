import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UserLocation } from '../../types';
import './LocationPicker.css';

interface LocationPickerProps {
  value: UserLocation | null;
  onChange: (location: UserLocation | null) => void;
}

const DEFAULT_CENTER: L.LatLngExpression = [12.8797, 121.774];

const createMarker = (
  map: L.Map,
  point: L.LatLngExpression,
  onMove: (location: L.LatLng) => void,
) => {
  const marker = L.marker(point, {
    draggable: true,
    icon: L.divIcon({
      className: 'location-picker-marker',
      iconSize: [26, 34],
      iconAnchor: [13, 34],
    }),
  }).addTo(map);
  marker.on('dragend', () => onMove(marker.getLatLng()));
  return marker;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapElement.current) return;

    const map = L.map(mapElement.current, { scrollWheelZoom: false }).setView(DEFAULT_CENTER, 5);
    const publishLocation = (point: L.LatLng) => {
      setLocationError('');
      onChangeRef.current({ latitude: point.lat, longitude: point.lng });
    };
    const handleMapClick = (event: L.LeafletMouseEvent) => {
      const marker = markerRef.current ?? createMarker(map, event.latlng, publishLocation);
      markerRef.current = marker;
      marker.setLatLng(event.latlng);
      publishLocation(event.latlng);
    };

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    map.on('click', handleMapClick);
    mapRef.current = map;

    return () => {
      map.off('click', handleMapClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const point: L.LatLngExpression = [value.latitude, value.longitude];
    const marker = markerRef.current ?? createMarker(map, point, selected => {
      setLocationError('');
      onChangeRef.current({ latitude: selected.lat, longitude: selected.lng });
    });
    markerRef.current = marker;
    marker.setLatLng(point);
    map.setView(point, Math.max(map.getZoom(), 15), { animate: false });
  }, [value]);

  const useCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Location access is not available in this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({ latitude: coords.latitude, longitude: coords.longitude });
        setIsLocating(false);
      },
      error => {
        setLocationError(error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. You can still click the map to set a pin.'
          : 'Unable to get your location. You can still click the map to set a pin.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="location-picker">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">Click the map or drag the pin to your delivery location.</p>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 disabled:cursor-wait disabled:opacity-60"
        >
          <LocateFixed size={16} aria-hidden="true" />
          {isLocating ? 'Finding location…' : 'Use my current location'}
        </button>
      </div>
      <div
        ref={mapElement}
        className="location-picker-map"
        aria-label="Interactive map to select your delivery location"
      />
      {value && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
          <span>
            Pin: {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="font-semibold text-stone-700 underline underline-offset-2 hover:text-stone-950"
          >
            Clear pin
          </button>
        </div>
      )}
      {locationError && <p role="alert" className="text-sm text-red-700">{locationError}</p>}
    </div>
  );
};

export default LocationPicker;
