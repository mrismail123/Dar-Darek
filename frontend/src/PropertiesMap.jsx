import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// حل مشكلة أيقونة الخريطة التي لا تظهر أحياناً في React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertiesMap({ properties }) {

    const position = [35.7595, -5.8340];

    return (
        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '15px' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            {properties?.map(property => (
                <Marker
                    key={property.id_property}
                    position={[property.latitude, property.longitude]}
                >
                    <Popup>
                        <div className="map-popup">
                            <h4 style={{ margin: 0 }}>{property.title}</h4>
                            <p style={{ color: '#00A9B5', fontWeight: 'bold' }}>{property.price_per_day} DH</p>
                            <a href={`/property-details/${property.id_property}`}>عرض التفاصيل</a>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};