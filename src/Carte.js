import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// Fix des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône rouge pour l'exercice 1
const iconeProche = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

// Exercice 2 : Composant pour centrer la carte
function CentrerPosition({ position }) {
    const map = useMap();
    return position ? (
        <button className="btn-centrer" onClick={() => map.setView(position, 15)}>
            Centrer sur moi
        </button>
    ) : null;
}

function calculerDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Carte() {
    const [arrets, setArrets] = useState([]);
    const [pos, setPos] = useState(null);
    const [proche, setProche] = useState(null);
    const [top3, setTop3] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/arrets").then(r => r.json()).then(setArrets);
        navigator.geolocation.getCurrentPosition(p => setPos([p.coords.latitude, p.coords.longitude]));
    }, []);

    useEffect(() => {
        if (pos && arrets.length > 0) {
            const avecDist = arrets.map(a => ({ ...a, d: calculerDistance(pos[0], pos[1], a.lat, a.lon) }));
            const tries = [...avecDist].sort((a, b) => a.d - b.d);
            setProche(tries[0]);
            setTop3(tries.slice(0, 3)); // Exercice 3 : Top 3
        }
    }, [pos, arrets]);

    return (
        <div className="carte-container">
            <h2 className="carte-titre">Carte des arrêts</h2>
            {proche && <p className="arret-proche">Plus proche : {proche.nom} ({proche.d.toFixed(1)} km)</p>}
            
            <MapContainer center={[14.6928, -17.4467]} zoom={13} className="carte">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <CentrerPosition position={pos} />
                
                {arrets.map(a => (
                    <Marker key={a.id} position={[a.lat, a.lon]} icon={proche?.id === a.id ? iconeProche : L.Icon.Default.instance}>
                        <Popup>{a.nom}<br/>Lignes : {a.lignes.join(", ")}</Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="top3">
                <h4>Top 3 des arrêts les plus proches :</h4>
                <ul>{top3.map(a => <li key={a.id}>{a.nom} ({a.d.toFixed(1)} km)</li>)}</ul>
            </div>
        </div>
    );
}

export default Carte;