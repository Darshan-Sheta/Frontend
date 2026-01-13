import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HackathonRequestCard = ({ id, hackathonTitle, requestedBy, hackathonId, requestedAt, status }) => {
  const [statusx, setStatusx] = useState(status);

  // Define styles based on status
  const getStatusStyles = () => {
    switch (statusx) {
      case "pending":
        return {
          border: "border-yellow-500",
          icon: <FaClock className="text-yellow-500 text-lg" />,
          text: "text-yellow-400",
          bg: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "accepted":
        return {
          border: "border-green-500",
          icon: <FaCheckCircle className="text-green-500 text-lg" />,
          text: "text-green-400",
          bg: "bg-green-600 hover:bg-green-700",
        };
      case "rejected":
        return {
          border: "border-red-500",
          icon: <FaTimesCircle className="text-red-500 text-lg" />,
          text: "text-red-400",
          bg: "bg-red-600 hover:bg-red-700",
        };
      default:
        return {
          border: "border-blue-500",
          icon: <FaClock className="text-blue-500 text-lg" />,
          text: "text-blue-400",
          bg: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const { border, icon, text, bg } = getStatusStyles();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAccept = async () => {
    try {
      await axios.put(`${API_BASE}/request/${id}/accepted`, {
        withCredentials: true, // <-- This sends cookies!
      });
      setStatusx("accepted");
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(`${API_BASE}/request/${id}/rejected`, {
        withCredentials: true, // <-- This sends cookies!
      });
      setStatusx("rejected");
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  return (
    <div
      className={`relative glass-card border border-white/40 shadow-lg p-6 rounded-2xl text-text-main transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group overflow-hidden ${border}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Header: Profile & Status Icon */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/profile/${requestedBy}`}>
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
              <img
                src={`https://github.com/${requestedBy}.png`}
                alt={requestedBy}
                className="h-14 w-14 rounded-full border-2 border-white shadow-sm object-cover relative z-10"
              />
            </div>
          </Link>
          <div>
            <h3 className="text-lg font-bold text-text-main leading-tight">{requestedBy}</h3>
            <p className="text-sm text-text-muted">requested to join</p>
          </div>
        </div>
        <div className={`p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm ${text}`}>
          {icon}
        </div>
      </div>

      {/* Hackathon Title */}
      <div className="mt-5 mb-4 relative z-10">
        <Link to={`/dashboard/hackathons/${hackathonId}`} className="block group/title">
          <h4 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-main to-gray-600 group-hover/title:text-accent transition-all duration-300">
            {hackathonTitle}
          </h4>
        </Link>
      </div>

      {/* Status & Timestamp */}
      <div className="relative z-10 flex flex-wrap gap-4 text-sm mt-2 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-muted uppercase tracking-wider text-xs">Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${border.replace('border-', 'border-opacity-30 border-')} ${text.replace('text-', 'bg-opacity-10 bg-')} ${text}`}>
            {statusx}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-muted uppercase tracking-wider text-xs">Requested At</span>
          <span className="text-text-main font-medium">{formatDate(requestedAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {statusx === "pending" && (
        <div className="mt-6 flex gap-3 relative z-10">
          <button
            onClick={handleAccept}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-bold text-sm tracking-wide"
          >
            Accept Request
          </button>
          <button
            onClick={handleReject}
            className="flex-1 py-2.5 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm tracking-wide"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default HackathonRequestCard;
