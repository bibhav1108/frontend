import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Dashboard = () => {
  const [needs, setNeeds] = useState([]);

  // 🔥 Load needs from backend
  const loadNeeds = async () => {
    try {
      const res = await API.get("/needs");
      setNeeds(res.data || []);
    } catch (err) {
      console.error("Failed to load needs", err);
    }
  };

  useEffect(() => {
    loadNeeds();

    const interval = setInterval(loadNeeds, 5000);

    return () => clearInterval(interval);
  }, []);

  // default center (Lucknow)
  const center = [26.8467, 80.9462];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="h-[500px] w-full rounded-xl overflow-hidden shadow">
        <MapContainer center={center} zoom={6} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {needs.map((need) => {
            // TEMP: fake coords (until backend stores location)
            const lat = 24 + Math.random() * 6;
            const lng = 78 + Math.random() * 6;

            return (
              <Marker key={need.id} position={[lat, lng]}>
                <Popup>
                  <strong>{need.type}</strong>
                  <br />
                  {need.quantity}
                  <br />
                  {need.pickup_address}
                  <br />
                  Status: {need.status}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </Layout>
  );
};

export default Dashboard;
