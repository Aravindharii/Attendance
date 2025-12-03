"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LocationMap({ location, title = "Location", showAccuracy = true }) {
    if (!location || !location.latitude || !location.longitude) {
        return (
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No location data available</p>
            </div>
        );
    }

    const position = [location.latitude, location.longitude];
    const accuracy = location.accuracy || 0;

    return (
        <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <MapContainer
                center={position}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        <div className="text-sm">
                            <p className="font-semibold">{title}</p>
                            <p className="text-xs text-gray-600">
                                Lat: {location.latitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-gray-600">
                                Lng: {location.longitude.toFixed(6)}
                            </p>
                            {accuracy > 0 && (
                                <p className="text-xs text-gray-600">
                                    Accuracy: ±{Math.round(accuracy)}m
                                </p>
                            )}
                            {location.timestamp && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(location.timestamp).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </Popup>
                </Marker>
                {showAccuracy && accuracy > 0 && (
                    <Circle
                        center={position}
                        radius={accuracy}
                        pathOptions={{
                            color: '#3b82f6',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.1
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
