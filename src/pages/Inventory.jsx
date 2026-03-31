import { useEffect, useState } from "react";
import API from "../services/api";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "",
    category: "OTHERS",
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inventory/");
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getAvailable = (i) => i.quantity - i.reserved_quantity;

  const filtered = items.filter((i) => {
    if (filter !== "ALL" && i.category !== filter) return false;
    if (search && !i.item_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = items.reduce((a, b) => a + b.quantity, 0);
  const reserved = items.reduce((a, b) => a + b.reserved_quantity, 0);

  const adjustQuantity = async (id, current, change) => {
    await API.patch(`/inventory/${id}`, {
      quantity: current + change,
    });
    fetchInventory();
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAdding(true);

    await API.post("/inventory/", {
      ...newItem,
      quantity: parseFloat(newItem.quantity),
    });

    setShowForm(false);
    fetchInventory();
    setAdding(false);
  };

  return (
    <div className="space-y-8">
      {/* 🔥 HERO */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Units" value={total} />
        <StatCard label="Reserved" value={reserved} />
        <StatCard label="Available" value={total - reserved} highlight />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory HQ</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-5 py-2 rounded-lg"
        >
          + Add Item
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "FOOD", "MEDICAL", "WATER", "OTHERS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${
              filter === f ? "bg-primary text-white" : "bg-surface_high"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search inventory..."
        className="w-full max-w-md px-4 py-3 rounded-lg bg-surface_high"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* GRID */}
      {loading ? (
        <div className="text-center p-10">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((i) => {
            const available = getAvailable(i);
            const low = available < i.quantity * 0.2;

            return (
              <div
                key={i.id}
                className="bg-surface_high p-5 rounded-xl space-y-4"
              >
                {/* HEADER */}
                <div className="flex justify-between">
                  <h3 className="font-bold">{i.item_name}</h3>

                  <span className="text-xs bg-surface px-2 py-1 rounded">
                    {i.category}
                  </span>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 text-center">
                  <MiniStat label="Total" value={i.quantity} />
                  <MiniStat label="Reserved" value={i.reserved_quantity} />
                  <MiniStat label="Available" value={available} />
                </div>

                {/* LOW STOCK */}
                {low && (
                  <div className="text-xs text-red-500 font-semibold">
                    ⚠ Low Stock
                  </div>
                )}

                {/* CONTROLS */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => adjustQuantity(i.id, i.quantity, -1)}
                    className="px-3 py-1 bg-surface rounded"
                  >
                    −
                  </button>

                  <span className="font-bold">{i.quantity}</span>

                  <button
                    onClick={() => adjustQuantity(i.id, i.quantity, 1)}
                    className="px-3 py-1 bg-primary text-white rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-surface_lowest p-6 rounded-xl w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">Add Item</h2>

            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                placeholder="Item"
                className="w-full px-3 py-2 rounded bg-surface_high"
                onChange={(e) =>
                  setNewItem({ ...newItem, item_name: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Qty"
                  className="px-3 py-2 rounded bg-surface_high"
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                />

                <input
                  placeholder="Unit"
                  className="px-3 py-2 rounded bg-surface_high"
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                />
              </div>

              <button className="w-full py-2 bg-primary text-white rounded">
                {adding ? "Adding..." : "Add Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, highlight }) => (
  <div
    className={`p-5 rounded-xl ${
      highlight ? "bg-primary text-white" : "bg-surface_high"
    }`}
  >
    <p className="text-xs">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div>
    <p className="text-xs text-on_surface_variant">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

export default Inventory;
