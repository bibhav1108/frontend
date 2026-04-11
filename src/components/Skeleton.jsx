const Skeleton = ({ className = "", variant = "default" }) => {
  const variants = {
    default: "rounded-xl",
    text: "rounded-md",
    circle: "rounded-full",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        ${variants[variant]}
        ${className}
        bg-white/[0.08]
        before:absolute before:inset-0
        before:bg-black/[0.08]
        before:content-['']
        border border-white/[0.06]
      `}
    >
      {/* shimmer */}
      <div
        className="
          absolute inset-0
          -translate-x-full
          animate-shimmer
          bg-gradient-to-r
          from-transparent
          via-white/[0.18]
          to-transparent
        "
      />
    </div>
  );
};

export default Skeleton;
