import React from "react";

const GradientBackground = ({ children, className = "" }) => (
  <div
    className={`relative min-h-screen bg-background overflow-hidden selection:bg-accent/30 ${className}`}
  >
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-orange-200/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-amber-100/30 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

export default GradientBackground;
