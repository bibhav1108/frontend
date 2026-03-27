import { useEffect, useState } from "react";
import API from "../services/api";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "",
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inventory/");
      setItems(res.data);
    } catch (err) {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setError("");

      await API.post("/inventory/", {
        ...newItem,
        quantity: parseFloat(newItem.quantity),
      });

      setNewItem({ item_name: "", quantity: "", unit: "" });
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.detail || "Error adding item");
    }
  };

  const handleUpdate = async (id, quantity) => {
    if (!quantity) return;

    try {
      await API.patch(`/inventory/${id}`, {
        quantity: parseFloat(quantity),
      });

      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ERROR */}
      {error && (
        <div className="rounded-xl bg-red-100 text-red-600 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* ADD ITEM */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <h2 className="text-sm font-semibold mb-4">Add Item</h2>

        <form
          onSubmit={handleAddItem}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <input
            className="rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Item name"
            value={newItem.item_name}
            onChange={(e) =>
              setNewItem({ ...newItem, item_name: e.target.value })
            }
            required
          />

          <input
            type="number"
            className="rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: e.target.value })
            }
            required
          />

          <input
            className="rounded-xl bg-[#f2f4f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Unit (kg, pcs)"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            required
          />

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold shadow-md hover:opacity-90 active:scale-[0.98]"
          >
            Add
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <h2 className="text-sm font-semibold mb-4">Inventory</h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">No items yet</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-sm border border-white/50"
              >
                {/* ITEM INFO */}
                <div>
                  <p className="text-sm font-medium text-[#191c1e]">
                    {item.item_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} {item.unit}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-2 md:mt-0">
                  <input
                    type="number"
                    placeholder="Update"
                    className="w-24 rounded-lg bg-[#f2f4f7] px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-300"
                    onBlur={(e) => handleUpdate(item.id, e.target.value)}
                  />

                  <button
                    onClick={() => fetchInventory()}
                    className="rounded-lg bg-slate-200 px-3 text-sm hover:bg-slate-300"
                  >
                    ↻
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
