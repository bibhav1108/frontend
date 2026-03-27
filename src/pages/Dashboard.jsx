import { useEffect, useState } from "react";
import API from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Dashboard = () => {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  // 🔹 LOAD NEEDS
  const loadNeeds = async () => {
    try {
      const res = await API.get("/needs");
      setNeeds(res.data || []);
    } catch (err) {
      console.error("Failed to load needs", err);
    }
  };

  // 🔹 LOAD VOLUNTEERS (REAL)
  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers/");
      setVolunteers(res.data || []);
    } catch (err) {
      console.error("Failed to load volunteers", err);
    }
  };

  useEffect(() => {
    loadNeeds();
    loadVolunteers();

    const interval = setInterval(() => {
      loadNeeds();
      loadVolunteers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const center = [26.8467, 80.9462];

  return (
    <div className="p-6 space-y-8">
      {/* 🔹 HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Live Dispatch & Resource Map</h2>

        <div className="flex gap-2">
          <span className="text-xs px-3 py-1 bg-white rounded-full shadow border">
            🔵 Surplus Alerts
          </span>
          <span className="text-xs px-3 py-1 bg-white rounded-full shadow border">
            🟢 Volunteers
          </span>
        </div>
      </div>

      {/* 🔹 MAP + ACTIVITY */}
      <div className="grid grid-cols-12 gap-6">
        {/* 🗺️ MAP */}
        <div className="col-span-12 lg:col-span-8">
          <div className="h-[450px] rounded-2xl overflow-hidden border bg-white shadow-sm">
            <MapContainer center={center} zoom={6} className="h-full w-full">
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {needs.map((need) => {
                const lat = 24 + Math.random() * 6;
                const lng = 78 + Math.random() * 6;

                return (
                  <Marker key={need.id} position={[lat, lng]}>
                    <Popup>
                      <strong>{need.type}</strong>
                      <br />
                      Qty: {need.quantity}
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
        </div>

        {/* 📜 ACTIVITY FEED */}
        <div className="col-span-12 lg:col-span-4 space-y-4 max-h-[450px] overflow-y-auto pr-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Recent Events</h3>
            <button className="text-xs text-indigo-600 font-semibold hover:underline">
              View All
            </button>
          </div>

          {needs.slice(0, 6).map((need) => (
            <div
              key={need.id}
              className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition"
            >
              <p className="text-[10px] font-bold text-blue-600 uppercase">
                New Need
              </p>

              <p className="text-sm mt-1 font-medium">
                {need.type} — {need.quantity}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                📍 {need.pickup_address}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 TABLE + VOLUNTEERS */}
      <div className="grid grid-cols-12 gap-6">
        {/* 📊 TABLE */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <h2 className="text-xl font-semibold">Needs Management</h2>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Need</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {needs.map((need) => (
                  <tr key={need.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      #{need.id}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {need.type}
                      <p className="text-xs text-gray-400">
                        📍 {need.pickup_address}
                      </p>
                    </td>

                    <td className="px-6 py-4">{need.quantity}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          need.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : need.status === "dispatched"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {need.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600">
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🧠 REAL VOLUNTEERS */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <h2 className="text-xl font-semibold">Volunteer Performance</h2>

          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
            {volunteers
              .sort(
                (a, b) =>
                  b.completions -
                  b.no_shows * 2 -
                  (a.completions - a.no_shows * 2),
              )
              .slice(0, 5)
              .map((v) => {
                const score = v.completions - v.no_shows * 2;
                const progress = Math.min(
                  (v.completions / (v.completions + 5)) * 100,
                  100,
                );

                return (
                  <div key={v.id}>
                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{v.name}</p>

                        <p className="text-xs text-gray-400">
                          {v.completions} completed • {v.no_shows} no-shows
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          v.trust_tier === "PLATINUM"
                            ? "bg-purple-100 text-purple-600"
                            : v.trust_tier === "GOLD"
                              ? "bg-yellow-100 text-yellow-600"
                              : v.trust_tier === "SILVER"
                                ? "bg-gray-200 text-gray-600"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {v.trust_tier}
                      </span>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-3 w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    {/* SCORE */}
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Performance</span>
                      <span>{score}</span>
                    </div>
                  </div>
                );
              })}

            {volunteers.length === 0 && (
              <p className="text-sm text-gray-400 text-center">
                No volunteers yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
