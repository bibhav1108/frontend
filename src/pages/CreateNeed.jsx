import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CreateNeed = () => {
  const navigate = useNavigate();

  const [type, setType] = useState("FOOD");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!type || !description || !quantity || !pickupAddress) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/needs", {
        type,
        description,
        quantity,
        pickup_address: pickupAddress,
        urgency,
        pickup_deadline: deadline || null,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create need");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6">
        {/* TITLE */}
        <h2 className="text-lg font-semibold mb-5 text-[#191c1e]">
          Create Relief Need
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TYPE */}
          <select
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="FOOD">Food</option>
            <option value="WATER">Water</option>
            <option value="KIT">Kit</option>
            <option value="BLANKET">Blanket</option>
            <option value="MEDICAL">Medical</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="OTHER">Other</option>
          </select>

          {/* DESCRIPTION */}
          <textarea
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Describe the need"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* QUANTITY */}
          <input
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="e.g. 50 packets"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          {/* ADDRESS */}
          <textarea
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Pickup address"
            rows={2}
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
          />

          {/* URGENCY */}
          <select
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="LOW">Low urgency</option>
            <option value="MEDIUM">Medium urgency</option>
            <option value="HIGH">High urgency</option>
          </select>

          {/* DEADLINE */}
          <input
            type="datetime-local"
            className="w-full rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          {/* ERROR */}
          {error && <div className="text-sm text-red-500">{error}</div>}

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
          >
            {loading ? "Creating..." : "Create Need"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNeed;
