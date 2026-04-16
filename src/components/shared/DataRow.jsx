import React from 'react';

const DataRow = ({ 
    label, 
    value, 
    description, 
    status, 
    action, 
    icon, 
    type = "status" // "status" or "info"
}) => {
    if (type === "info") {
        return (
            <div className="group">
                <p className="text-[10px] text-on_surface_variant uppercase font-black tracking-widest leading-none mb-1">{label}</p>
                <div className="flex justify-between items-center">
                    <p className={description ? "text-lg font-outfit font-bold text-on_surface" : "text-sm font-bold text-on_surface"}>
                        {value || "-"}
                    </p>
                    {action}
                </div>
                {description && <p className="text-xs text-on_surface_variant mt-1 opacity-60">{description}</p>}
            </div>
        );
    }

    return (
        <div className="flex justify-between text-sm items-center p-4 bg-surface_high/30 rounded-2xl border border-white group transition-all hover:bg-surface_high/50">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status !== undefined ? (status ? "bg-green-500/10" : "bg-error/5") : "bg-primary/5"}`}>
                    <span className={`material-symbols-outlined text-xl ${status !== undefined ? (status ? "text-green-500" : "text-error/40") : "text-primary"}`}>
                        {icon || (status !== undefined ? (status ? "check_circle" : "pending") : "info")}
                    </span>
                </div>
                <div>
                    <p className="font-bold text-on_surface tracking-tight leading-none mb-1">{label}</p>
                    {description && <p className="text-[10px] text-on_surface_variant font-medium opacity-60 leading-none">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {status !== undefined && (
                    <div className={`flex items-center justify-center p-1 rounded-full border-2 transition-all ${
                        status ? "border-green-500/20 bg-green-500/10 text-green-500" : "border-error/20 bg-error/5 text-error"
                    }`}>
                        <span className="material-symbols-outlined text-sm font-black">
                            {status ? "done" : "close"}
                        </span>
                    </div>
                )}
                {action}
            </div>
        </div>
    );
};

export default DataRow;
