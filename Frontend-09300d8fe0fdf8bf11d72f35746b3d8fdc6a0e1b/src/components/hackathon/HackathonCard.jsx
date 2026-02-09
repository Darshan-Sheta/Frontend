import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaLaptopCode,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import React, { use } from "react";
import { useAuth } from "../../context/AuthContext";
const HackathonCard = ({
  id,
  title,
  organization,
  theme,
  registrationDates,
  hackathonDates,
  createdBy,
  location,
  logo,
  joinable,
  requestsToJoin,
  mode,
  currentTeamSize,
  teamSize,
  acceptedUsers,
  rejectedUsers,
  techStacks,
  type
}) => {
  const { username } = useAuth();
  // const username = localStorage.getItem("username");
  const hasRequested = requestsToJoin.includes(username);
  const isCreatedByUser = createdBy === username;
  const isRequestAccepted = acceptedUsers.includes(username);
  const isRequestRejected = rejectedUsers.includes(username);

  let buttonContent;
  let buttonStyle =
    "px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 transform shadow-lg";
  let linkTo = `/dashboard/hackathons/${id}`;

  if (
    joinable &&
    !isCreatedByUser &&
    !hasRequested &&
    !isRequestAccepted &&
    !isRequestRejected &&
    teamSize.max !== currentTeamSize
  ) {
    buttonContent = "Join Now 🚀";
    buttonStyle += " bg-accent hover:bg-accent/80 hover:scale-105";
  } else if (hasRequested && !isRequestAccepted && !isRequestRejected) {
    buttonContent = "Request Pending... ⏱️";
    buttonStyle += " bg-yellow-500";
  } else if (!isCreatedByUser && isRequestAccepted) {
    buttonContent = "Request Accepted! ✅";
    buttonStyle += " bg-green-500";
  } else if (!isCreatedByUser && isRequestRejected) {
    buttonContent = "Request Rejected! ❌";
    buttonStyle += " bg-red-500";
  } else if (!isCreatedByUser && teamSize.max === currentTeamSize) {
    buttonContent = "Hackathon Full! 🚫";
    buttonStyle += " bg-red-500";
  } else if (isCreatedByUser) {
    buttonContent = "View Details 📝";
    buttonStyle += " bg-accent hover:bg-accent/80 hover:scale-105";
  }

  if (type === "my-hackathons") {
    buttonContent = "AI Suggest 🤖";
    buttonStyle = "px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 transform shadow-lg bg-accent hover:bg-accent/80 hover:scale-105";
    linkTo = `/dashboard/hackathon-requests/${id}`;
  }

  return (
    <div className="relative bg-white border border-gray-200 shadow-lg p-0 rounded-2xl text-text-main transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col md:flex-row items-stretch overflow-hidden group">


      {/* Content */}
      <div className="relative z-10 flex-1 p-6 flex flex-col justify-center">
        {/* Title and Header */}
        <div className="mb-4">
          <h3 className="text-3xl font-display font-bold mb-2 text-text-main drop-shadow-sm tracking-wide">{title}</h3>
          <div className="h-1 w-20 bg-gradient-to-r from-accent to-orange-400 rounded-full"></div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="flex items-center text-text-muted drop-shadow-sm">
            <FaBuilding className="mr-3 text-blue-500 text-lg flex-shrink-0" />{" "}
            <span className="font-medium tracking-wide">Organization: <span className="text-text-main font-bold">{organization}</span></span>
          </p>
          <p className="flex items-center text-text-muted drop-shadow-sm">
            <FaLaptopCode className="mr-3 text-green-500 text-lg flex-shrink-0" />{" "}
            <span className="font-medium tracking-wide">Theme: <span className="text-text-main font-bold">{theme}</span></span>
          </p>

          <p className="flex items-center text-text-muted drop-shadow-sm">
            <FaCalendarAlt className="mr-3 text-blue-500 text-lg flex-shrink-0" />
            <span className="font-medium">
              Registration:{" "}
              <span className="text-text-main font-bold">
                {new Date(registrationDates.start).toLocaleDateString()} -{" "}
                {new Date(registrationDates.end).toLocaleDateString()}
              </span>
            </span>
          </p>

          {hackathonDates && (
            <p className="flex items-center text-text-muted drop-shadow-sm">
              <FaCalendarAlt className="mr-3 text-purple-500 text-lg flex-shrink-0" />
              <span className="font-medium">
                Hackathon:{" "}
                <span className="text-text-main font-bold">
                  {new Date(hackathonDates.start).toLocaleDateString()} -{" "}
                  {new Date(hackathonDates.end).toLocaleDateString()}
                </span>
              </span>
            </p>
          )}

          <p className="flex items-center text-text-muted drop-shadow-sm">
            <FaMapMarkerAlt className="mr-3 text-red-500 text-lg flex-shrink-0" />{" "}
            <span className="font-medium">
              {location} <span className="mx-2">•</span> Mode: <span className="uppercase font-bold tracking-wider text-xs bg-gray-100 text-text-main px-2 py-0.5 rounded">{mode}</span>
            </span>
          </p>

          <div className="flex items-center gap-6 mt-2">
            <p className="flex items-center text-text-muted text-xs">
              <FaUser className="mr-2 text-gray-400" />{" "}
              <span>{createdBy}</span>
            </p>

            <p className="flex items-center text-text-muted text-xs">
              <FaUser className="mr-2 text-gray-400" />{" "}
              <span>
                Team: {currentTeamSize}/{teamSize.max}
              </span>
            </p>
          </div>
        </div>

        {techStacks && techStacks.length > 0 && (
          <div className="mt-5">
            <p className="font-semibold mb-2 text-xs uppercase tracking-wider text-text-muted">Tech Stacks</p>
            <div className="flex flex-wrap gap-2">
              {techStacks.map((tech, index) => (
                <span
                  key={index}
                  className="bg-gray-100 border border-gray-200 text-text-main px-3 py-1 text-xs rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Join Now Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link to={linkTo}>
            <button className={`${buttonStyle} shadow-xl hover:shadow-2xl ring-1 ring-black/5`}>{buttonContent}</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default HackathonCard;
