import { useEffect, useState } from "react";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [conflictId, setConflictId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "kilogram",
    category: "OTHERS",
  });

  const fetchInventory = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await API.get("/inventory/");
      setItems(res.data || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(true);
  }, []);

  const getAvailable = (i) => i.quantity - i.reserved_quantity;

  const filtered = items.filter((i) => {
    if (filter !== "ALL" && i.category !== filter) return false;
    if (search && !i.item_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = items.reduce((a, b) => a + Number(b.quantity), 0);
  const reserved = items.reduce((a, b) => a + Number(b.reserved_quantity), 0);

  const inventorySkeletonLayout = [
    { type: 'grid', cols: 3, item: { type: 'rect', height: 140 } },
    { type: 'row', className: "justify-between items-end", cols: [
        { type: 'stack', items: [ { type: 'text', width: 220, height: 32 }, { type: 'text', width: 300, height: 48, className: "mt-4" } ] },
        { type: 'rect', width: 140, height: 56, className: "rounded-2xl" }
    ]},
    { type: 'row', cols: Array(4).fill({ type: 'rect', width: 80, height: 32, className: "rounded-full" }) },
    { type: 'stack', gap: 4, items: Array(6).fill({ type: 'rect', height: 72, className: "rounded-2xl" }) }
  ];

  const handleUpdateQuantity = async (id, newQuantity) => {
    const finalQuantity = Math.max(0, Number(newQuantity));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: finalQuantity } : item,
      ),
    );

    try {
      await API.patch(`/inventory/${id}`, { quantity: finalQuantity });
      fetchInventory(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Update failed";
      setConflictId(id);
      setTimeout(() => setConflictId(null), 3000);
      if (err?.response?.status === 400) addToast(msg, "error");
      fetchInventory(false);
    }
    setEditingId(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.item_name || !newItem.quantity || !newItem.unit) {
      setFormError("Please add the details to initiate");
      return;
    }
    setFormError("");
    setAdding(true);
    try {
      await API.post("/inventory/", { ...newItem, quantity: parseFloat(newItem.quantity) });
      setShowForm(false);
      fetchInventory(false);
      setNewItem({ item_name: "", quantity: "", unit: "kilogram", category: "OTHERS" });
      addToast("Item added to inventory! 📦", "success");
    } catch {
      setFormError("Failed to add item. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await API.delete(`/inventory/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchInventory(false);
      addToast("Item removed permanently. ✨", "success");
    } catch (err) {
      setDeleteError(err?.response?.data?.detail || "Deletion failed.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="mt-10"><SkeletonStructure layout={inventorySkeletonLayout} /></div>;
  }

  return (
    <div className="space-y-10 selection:bg-primary/10">
      {/* 🔹 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard label="Total Units" value={total} icon="inventory_2" delay="100ms" />
        <MetricCard label="Reserved Count" value={reserved} icon="lock" delay="200ms" />
        <MetricCard label="Net Available" value={total - reserved} icon="check_circle" highlight delay="300ms" />
      </div>

      {/* 🔹 HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 animate-fadeIn pb-2">
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Stock Management</p>
            <h1 className="text-4xl font-outfit font-black text-on_surface tracking-tight">NGO Inventory</h1>
          </div>
          <ActionInput placeholder="Filter inventory by name..." value={search} onChange={setSearch} className="max-w-md" />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-primaryGradient text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined font-black">add</span>
          Add New Stock Item
        </motion.button>
      </div>

      {/* 🔹 CATEGORY FILTERS */}
      <div className="flex gap-2 flex-wrap animate-fadeIn" style={{ animationDelay: '400ms' }}>
        {["ALL", "FOOD", "MEDICAL", "WATER", "OTHERS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface_high hover:bg-surface_highest text-on_surface_variant"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🔹 INVENTORY TABLE */}
      <ContentSection title="Current Stock Levels" icon="database" delay="500ms">
        <div className="bg-surface_high/30 rounded-2xl overflow-hidden border border-white">
          <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on_surface_variant border-b border-white opacity-60">
            <div className="col-span-2">Resource Name</div>
            <div>Category</div>
            <div className="text-center">Total</div>
            <div className="text-center">Reserved</div>
            <div className="text-center">Available</div>
            <div className="text-right">Manage</div>
          </div>

          <div className="divide-y divide-white/40">
            {filtered.map((i, idx) => {
              const available = getAvailable(i);
              const isLow = available < i.quantity * 0.2;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={i.id}
                  className="flex flex-col md:grid md:grid-cols-7 gap-4 px-6 py-5 md:py-4 md:items-center hover:bg-white/30 transition-all group"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        isLow ? "bg-error/10 text-error animate-pulse" : "bg-primary/5 text-primary"
                    }`}>
                        {i.item_name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-on_surface">{i.item_name}</p>
                        {isLow && <p className="text-[10px] font-black uppercase text-error tracking-[0.1em]">Critically Low</p>}
                    </div>
                  </div>

                  <div>
                     <span className="text-[10px] font-black font-outfit px-3 py-1 bg-surface_highest text-on_surface_variant rounded-lg uppercase tracking-wider">
                      {i.category}
                    </span>
                  </div>

                  <div className="text-center">
                    {editingId === i.id ? (
                      <input
                        autoFocus
                        type="number"
                        className="w-20 px-2 py-1 bg-white rounded-lg outline-none border-2 border-primary/20 text-center font-bold text-sm"
                        value={editValue}
                        onBlur={() => handleUpdateQuantity(i.id, editValue)}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateQuantity(i.id, editValue);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <span className="font-bold text-on_surface">{i.quantity}</span>
                    )}
                  </div>

                  <div className={`text-center font-bold transition-all ${conflictId === i.id ? "text-error scale-125" : "opacity-60"}`}>
                    {i.reserved_quantity}
                  </div>

                  <div className={`text-center font-black ${isLow ? "text-error" : "text-primary"}`}>
                    {available} <span className="text-[10px] opacity-40 font-bold ml-0.5">{i.unit}</span>
                  </div>

                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(i.id); setEditValue(i.quantity); }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] font-black">edit_square</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(i)}
                      className="p-2 hover:bg-error/10 text-error rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] font-black">delete</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-12 text-center text-on_surface_variant flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl opacity-20">inventory_2</span>
                <p className="font-bold opacity-40 uppercase text-xs tracking-[0.2em]">No inventory items match your search</p>
              </div>
            )}
          </div>
        </div>
      </ContentSection>

      {/* 🔹 ADD ITEM MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-surface_lowest/80 backdrop-blur-md" onClick={() => setShowForm(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-primary/5">
              <h2 className="text-3xl font-outfit font-black text-on_surface mb-6 tracking-tight">Register New Stock</h2>

              <form onSubmit={handleAddItem} className="space-y-6">
                <ActionInput label="Item Identity" type="text" placeholder="e.g. Paracetamol, Rice Bags..." value={newItem.item_name} onChange={(v) => setNewItem({ ...newItem, item_name: v })} />

                <div className="grid grid-cols-2 gap-4">
                  <ActionInput label="Quantity" type="number" placeholder="0.00" value={newItem.quantity} onChange={(v) => setNewItem({ ...newItem, quantity: v })} />
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant ml-1">Unit</label>
                    <select className="px-5 py-3 rounded-2xl bg-surface_high border-2 border-transparent focus:border-primary/20 outline-none text-sm font-medium" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                      <option value="kilogram">Kilograms (kg)</option>
                      <option value="litre">Litres (L)</option>
                      <option value="piece">Pieces (pcs)</option>
                      <option value="box">Boxes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant ml-1 mb-2 block">Resource Category</label>
                  <div className="flex gap-2 flex-wrap">
                    {["FOOD", "MEDICAL", "WATER", "OTHERS"].map((cat) => (
                      <button key={cat} type="button" onClick={() => setNewItem({ ...newItem, category: cat })} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newItem.category === cat ? "bg-primary text-white" : "bg-surface_high hover:bg-surface_highest"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && <p className="text-error text-[10px] font-black uppercase bg-error/5 p-3 rounded-xl border border-error/10">{formError}</p>}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-4 rounded-2xl bg-surface_high font-bold hover:bg-surface_highest transition-all uppercase text-xs tracking-widest">Discard</button>
                  <button type="submit" disabled={adding} className="flex-1 px-4 py-4 rounded-2xl bg-primaryGradient text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-50 uppercase text-xs tracking-widest">
                    {adding ? "Initializing..." : "Confirm Addition"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔹 DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-error/10 backdrop-blur-md" onClick={() => setDeleteTarget(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-error/5 text-center">
              <div className="w-20 h-20 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl font-black">delete_forever</span>
              </div>
              <h2 className="text-2xl font-outfit font-black text-on_surface mb-2">Sanitize Stock?</h2>
              <p className="text-sm text-on_surface_variant mb-8 font-medium">Permanently remove <b className="text-on_surface">{deleteTarget.item_name}</b> from the operational inventory?</p>

              {deleteError && <div className="p-3 mb-6 rounded-xl bg-error/10 text-error text-[10px] font-black uppercase">{deleteError}</div>}

              <div className="flex gap-4">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-4 rounded-2xl bg-surface_high font-bold hover:bg-surface_highest transition-all uppercase text-xs tracking-widest">Keep It</button>
                <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 px-4 py-4 rounded-2xl bg-error text-white font-bold shadow-lg shadow-error/20 transition-all hover:bg-red-600 disabled:opacity-50 uppercase text-xs tracking-widest">
                  {deleting ? "Purging..." : "Confirm Purge"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
