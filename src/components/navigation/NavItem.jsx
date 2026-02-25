import React from "react";
import { Link } from "react-router-dom";

const NavItem = ({ to, children, icon, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
  >
    <span className="text-xl">{icon}</span>
    {children}
  </Link>
);

export default NavItem;
