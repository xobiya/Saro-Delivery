import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to handle map centering and bounds
const MapBounds = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);

    return null;
};

const MapView = ({ pickup, dropoff }) => {
    // Default Arba Minch coordinates if none provided
    const defaultCenter = [6.02, 37.55];

    const points = [];
    if (pickup?.coordinates?.lat) points.push([pickup.coordinates.lat, pickup.coordinates.lng]);
    if (dropoff?.coordinates?.lat) points.push([dropoff.coordinates.lat, dropoff.coordinates.lng]);

    return (
        <div style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {pickup?.coordinates?.lat && (
                    <Marker position={[pickup.coordinates.lat, pickup.coordinates.lng]}>
                        <Popup>Pickup: {pickup.address}</Popup>
                    </Marker>
                )}

                {dropoff?.coordinates?.lat && (
                    <Marker position={[dropoff.coordinates.lat, dropoff.coordinates.lng]}>
                        <Popup>Drop-off: {dropoff.address}</Popup>
                    </Marker>
                )}

                {points.length > 0 && <MapBounds points={points} />}
            </MapContainer>
        </div>
    );
};

export default MapView;
