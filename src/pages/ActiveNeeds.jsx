import { useEffect, useState } from "react";
import API from "../services/api";

const ActiveNeeds = () => {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVol, setSelectedVol] = useState({});
  const [filter, setFilter] = useState("ALL");

  const [otp, setOtp] = useState("");
  const [dispatchId, setDispatchId] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const loadNeeds = async () => {
    try {
      const res = await API.get("/marketplace/needs/");
      const filtered = (res.data || []).filter((n) => n.status !== "COMPLETED");
      setNeeds(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVolunteers = async () => {
    try {
      const res = await API.get("/volunteers");
      setVolunteers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatch = async (needId) => {
    const volunteerId = selectedVol[needId];
    if (!volunteerId) return alert("Select a volunteer");

    try {
      const res = await API.post("/marketplace/dispatches/", {
        marketplace_need_id: needId, // ✅ FIXED
        volunteer_id: Number(volunteerId),
      });

      // ✅ FIXED RESPONSE
      setDispatchId(res.data?.dispatch_id);

      alert("OTP sent to donor");

      loadNeeds();
    } catch (err) {
      console.error(err);
    }
  };

  const verifyOtp = async () => {
    if (!otp || !dispatchId) return;

    try {
      setVerifying(true);

      await API.post("/marketplace/dispatches/verify-otp", {
        dispatch_id: dispatchId,
        otp_code: otp, // ✅ FIXED
      });

      alert("Dispatch completed successfully");

      setOtp("");
      setDispatchId(null);

      loadNeeds();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Invalid OTP");
    } finally {
      setVerifying(false);
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

  const filteredNeeds = needs.filter((n) => {
    if (filter === "OPEN") return n.status === "OPEN";
    if (filter === "IN_PROGRESS") return n.status === "DISPATCHED";
    return true;
  });

  const urgencyBg = {
    LOW: "bg-blue-100",
    MEDIUM: "bg-yellow-100",
    HIGH: "bg-red-200",
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Active Needs</h1>
          <p className="text-sm text-slate-500">
            Manage and assign ongoing needs
          </p>
        </div>

        <div className="flex gap-2">
          {["ALL", "OPEN", "IN_PROGRESS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-full ${
                filter === f ? "bg-indigo-600 text-white" : "bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* OTP BOX */}
      {dispatchId && (
        <div className="bg-white p-4 rounded-xl shadow max-w-sm">
          <p className="text-sm mb-2 font-medium">Enter OTP from donor</p>

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2"
          />

          <button
            onClick={verifyOtp}
            disabled={verifying}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNeeds.map((n) => {
          const isOpen = n.status === "OPEN";

          return (
            <div key={n.id} className="p-4 rounded-xl shadow bg-white">
              <p className="font-semibold">{n.type}</p>
              <p className="text-sm">{n.description}</p>

              <select
                disabled={!isOpen}
                value={selectedVol[n.id] || ""}
                onChange={(e) =>
                  setSelectedVol((prev) => ({
                    ...prev,
                    [n.id]: e.target.value,
                  }))
                }
                className="mt-3 w-full border p-2"
              >
                <option value="">Select volunteer</option>
                {volunteers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>

              <button
                disabled={!isOpen}
                onClick={() => handleDispatch(n.id)}
                className="mt-3 w-full bg-indigo-600 text-white p-2 rounded"
              >
                Assign
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveNeeds;
