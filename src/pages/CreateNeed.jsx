import { useState } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const CreateNeed = () => {
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [address, setAddress] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [deadline, setDeadline] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!type || !quantity || !address || !deadline) {
      alert("Fill all fields");
      return;
    }

    const newNeed = {
      id: Date.now(),
      type,
      quantity,
      address,
      urgency,
      deadline,
      status: "Open",
      createdAt: Date.now(),
    };

    const stored = JSON.parse(localStorage.getItem("needs")) || [];
    const updated = [newNeed, ...stored];

    localStorage.setItem("needs", JSON.stringify(updated));

    alert("Need created!");
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="flex justify-center">
        <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-6">Create Need</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Type of Need
              </label>
              <input
                className="w-full p-2 border rounded"
                placeholder="e.g. Food, Clothes"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                className="w-full p-2 border rounded"
                placeholder="e.g. 50 meals"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pickup Address
              </label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Urgency Level
              </label>
              <select
                className="w-full p-2 border rounded"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pickup Deadline
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={deadline || ""}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
              Create Need
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateNeed;
