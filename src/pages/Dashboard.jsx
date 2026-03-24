import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Dashboard = () => {
  const [needs, setNeeds] = useState([]);

  useEffect(() => {
    const loadNeeds = () => {
      const stored = localStorage.getItem("needs");
      if (stored) {
        setNeeds(JSON.parse(stored));
      }
    };

    loadNeeds();
    window.addEventListener("focus", loadNeeds);

    return () => {
      window.removeEventListener("focus", loadNeeds);
    };
  }, []);

  const notifications = needs.slice(0, 5);

  // default center (India)
  const center = [26.8467, 80.9462]; // Lucknow

  return (
    <Layout notifications={notifications}>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="h-[500px] w-full rounded-xl overflow-hidden shadow">
        <MapContainer center={center} zoom={6} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {needs.map((need) => {
            // TEMP: random coords (until you store real ones)
            const lat = 20 + Math.random() * 10;
            const lng = 75 + Math.random() * 10;

            return (
              <Marker key={need.id} position={[lat, lng]}>
                <Popup>
                  <strong>{need.title}</strong>
                  <br />
                  {need.location}
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
