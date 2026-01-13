import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { debounce } from "lodash";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const Navbar = ({ hackathons, setFilteredHackathons }) => {
  const [titleSearch, setTitleSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const debouncedSearch = useCallback(
    debounce((titleQuery, cityQuery) => {
      const filtered = hackathons.filter((hackathon) => {
        const matchesTitle = hackathon.title
          .toLowerCase()
          .includes(titleQuery.toLowerCase());
        const matchesCity = hackathon.location
          .toLowerCase()
          .includes(cityQuery.toLowerCase());
        return matchesTitle && matchesCity;
      });

      setFilteredHackathons(filtered);
    }, 300),
    [hackathons]
  );

  const handleTitleSearchChange = (e) => {
    const query = e.target.value;
    setTitleSearch(query);
    debouncedSearch(query, citySearch);
  };

  const handleCitySearchChange = (e) => {
    const query = e.target.value;
    setCitySearch(query);
    debouncedSearch(titleSearch, query);
  };

  return (
    <nav className="glass shadow-sm pt-4 pb-4 flex justify-between items-center text-text-main px-6 rounded-2xl mx-4 mt-4">
      <div className="w-1/2 flex space-x-4">
        {/* Search by Title */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Title..."
            value={titleSearch}
            onChange={handleTitleSearchChange}
            className="w-full pl-10 pr-3 py-2 bg-white/50 border border-border/50 text-text-main rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-text-muted transition-all duration-300"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
        </div>

        {/* Search by City */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by City..."
            value={citySearch}
            onChange={handleCitySearchChange}
            className="w-full pl-10 pr-3 py-2 bg-white/50 border border-border/50 text-text-main rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-text-muted transition-all duration-300"
          />
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Link to="/dashboard/hackathons/add">
          <button className="px-5 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent/80 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
            Add Hackathon
          </button>
        </Link>
        <Link to="/dashboard/hackathons/requests">
          <button className="px-5 py-2.5 bg-white text-text-main font-medium rounded-xl border border-border hover:border-accent hover:text-accent shadow-sm hover:shadow-md transition-all duration-300">
            Requests Received
          </button>
        </Link>
        <Link to="/dashboard/hackathons/requests/status">
          <button className="px-5 py-2.5 bg-white text-text-main font-medium rounded-xl border border-border hover:border-accent hover:text-accent shadow-sm hover:shadow-md transition-all duration-300">
            Your Status
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
