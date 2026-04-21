import React from 'react';

const ActionInput = ({ label, value, onChange, placeholder, type = "text", maxLength, className = "", bgClassName = "bg-surface_high", icon }) => (
  <div className={`flex flex-col gap-1.5 group ${className}`}>
    {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant ml-1 group-focus-within:text-primary transition-colors">
            {label}
        </label>
    )}
    <div className="relative">
      {icon && (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-on_surface_variant/40 group-focus-within:text-primary transition-colors">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-12 pr-5' : 'px-5'} py-2.5 rounded-2xl ${bgClassName} border-2 border-transparent focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium`}
      />
    </div>
  </div>
);

export default ActionInput;
