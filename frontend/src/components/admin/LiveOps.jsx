import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HiOutlineBolt, HiOutlineClock, HiOutlineMapPin } from 'react-icons/hi2';
import io from 'socket.io-client';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LiveOps = ({ ordersList }) => {
    const [driverLocations, setDriverLocations] = useState({});
    const position = [6.02, 37.55];

    useEffect(() => {
        const socket = io(SOCKET_URL);

        // Join rooms for all active orders to track their drivers
        ordersList.forEach(order => {
            if (order.status === 'picked_up' || order.status === 'out_for_delivery') {
                socket.emit('join_order', order._id);
            }
        });

        socket.on('driver_location_changed', (data) => {
            // data = { orderId, coordinates: { lat, lng } }
            setDriverLocations(prev => ({
                ...prev,
                [data.orderId]: data.coordinates
            }));
        });

        return () => socket.disconnect();
    }, [ordersList]);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Dispatch Center</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Live telemetry via WebSocket</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sockets Connected</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden relative h-[600px]">
                    <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Real Driver Markers */}
                        {Object.entries(driverLocations).map(([orderId, coords]) => (
                            <Marker key={orderId} position={[coords.lat, coords.lng]}>
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-black text-slate-900 uppercase text-[10px]">Driver on Mission</p>
                                        <p className="text-xs text-slate-500 mt-1">Order #{orderId.slice(-4)}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Static Order Pickups (Optional) */}
                        {ordersList.filter(o => o.status === 'preparing').map(order => (
                            <Marker key={order._id} position={[6.021 + (Math.random()*0.01), 37.551 + (Math.random()*0.01)]} opacity={0.6}>
                                <Popup>Preparing at Restaurant</Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                    <div className="absolute inset-0 pointer-events-none border-[12px] border-white rounded-[3rem] z-[1001]"></div>
                </div>

                <div className="lg:col-span-1 space-y-6 overflow-y-auto max-h-[600px] no-scrollbar pr-2">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Live Dispatch Feed</h4>
                    {ordersList.map(order => (
                        <div key={order._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-orange-500 transition-all cursor-pointer">
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-400">
                                <HiOutlineClock /> Active Pipeline
                            </div>
                            <h5 className="font-black text-slate-900 mt-2">Order #{order._id.slice(-4)}</h5>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] font-black text-orange-500 uppercase">{order.status}</span>
                                {driverLocations[order._id] && <span className="text-[8px] font-black text-emerald-500 animate-pulse">GPS ACTIVE</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveOps;
