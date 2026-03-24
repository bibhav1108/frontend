import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const Volunteers = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [volunteers, setVolunteers] = useState([]);

  const navigate = useNavigate();

  // ✅ LOAD from localStorage (ONLY ONCE)
  useEffect(() => {
    const loadVolunteers = () => {
      const stored = localStorage.getItem("volunteers");
      if (stored) {
        setVolunteers(JSON.parse(stored));
      }
    };

    loadVolunteers();

    window.addEventListener("focus", loadVolunteers);

    return () => {
      window.removeEventListener("focus", loadVolunteers);
    };
  }, []);

  // ✅ ADD volunteer (correct + synced)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !phone || !area) {
      alert("Fill all fields");
      return;
    }

    const newVolunteer = {
      id: Date.now(),
      name,
      phone,
      area,
      status: "Available",
      verified: false,
    };

    setVolunteers((prev) => {
      const updated = [...prev, newVolunteer];

      // 🔥 SAVE immediately (correct way)
      localStorage.setItem("volunteers", JSON.stringify(updated));

      return updated;
    });

    setName("");
    setPhone("");
    setArea("");
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Volunteers</h2>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 max-w-md">
        <h3 className="font-semibold mb-3">Register Volunteer</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full mb-3 p-2 border rounded"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />

          <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add Volunteer
          </button>
        </form>
      </div>

      {/* List */}
      {volunteers.length === 0 ? (
        <p className="text-gray-500">No volunteers yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteers.map((v) => (
            <div
              key={v.id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold">{v.name}</h3>
              <p className="text-gray-500">{v.phone}</p>
              <p className="text-gray-500">{v.area}</p>

              <span className="text-sm text-green-600 mt-2 inline-block">
                {v.status}
              </span>

              {/* VERIFY BUTTON */}
              {v.verified ? (
                <button
                  disabled
                  className="mt-3 w-full bg-gray-300 text-gray-600 p-2 rounded"
                >
                  Verified ✅
                </button>
              ) : (
                <button
                  className="mt-3 w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
                  onClick={() =>
                    navigate("/verify", { state: { volunteerId: v.id } })
                  }
                >
                  Verify
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Volunteers;
