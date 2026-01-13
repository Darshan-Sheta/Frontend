import React, { useState, useEffect } from "react";
import { Calendar, Users, MapPin, Monitor, Globe } from "lucide-react";
import GradientBackground from "../components/background/GradientBackground";
import { useParams } from "react-router-dom";
import Navigation from "../components/navigation/Navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/chatbot/Chatbot";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HackathonDetailsPage = () => {
  const navigate = useNavigate();
  const { username, userId } = useAuth();
  // useEffect(() => {
  //   // Get the username from localStorage or from a global state if stored after login
  //   // const username = localStorage.getItem("username"); // or from context or redux

  //   if (!username) {
  //     // If no username found in localStorage, redirect to login
  //     navigate("/login");
  //   }
  // }, [navigate]);

  const { id } = useParams();
  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestObject, setRequestObject] = useState({});
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(true);
  // const username = localStorage.getItem("username");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        const start = Date.now();
        const response = await axios.get(
          `${API_BASE}/api/hackathons/${id}`, {
          withCredentials: true, // <-- This sends cookies!
        }
        );
        const end = Date.now();
        console.log("API call took " + (end - start) + " milliseconds");
        setHackathonData(response.data);
        setRequestObject({
          hackathonId: response.data.id,
          hackathonTitle: response.data.title,
          createdBy: response.data.createdBy,
          requestedBy: username,
          status: "pending",
        });
        setLoading(false);
        setSuccess(true);
      } catch (err) {
        setError(err.message);
        console.log("Error fetching hackathon data:", err);

        navigate("/dashboard");
        setLoading(false);
      }
    };
    fetchHackathonData();
  }, [id, username]);

  useEffect(() => {
    if (text === "send") {
      handleJoin();
    }
    if (success === true) {
      if (new Date(hackathonData.registrationDates.end) < new Date()) {
        setVisible(false);
      }
    }
    if (success === true && hackathonData.requestsToJoin.includes(username)) {
      setVisible(false);
    }
    if (requestObject.createdBy === username) {
      setVisible(false);
    }
    if (success === true && hackathonData.teamSize.max === hackathonData.currentTeamSize) {
      setVisible(false);
    }
  }, [text, success]);


  const handleChatNow = async () => {
    try {
      // const currentUserId = localStorage.getItem("userId");
      const member2Id = hackathonData.createdById;
      const leader = hackathonData.createdBy;
      console.log(member2Id);
      const response = await axios.post(
        `${API_BASE}/api/v1/personal_chat/create_or_get_personal_chat/${userId}/${member2Id}`,
        {}, // or your data
        {
          withCredentials: true,
        }
      );
      navigate('/dashboard/chat?leader=' + leader);
      console.log(response);
    }
    catch (error) {
      console.log("Unable to Create or Fetch the Personal Chat.");
    }

  };
  const handleJoin = async () => {
    try {
      await axios.post(`${API_BASE}/request`, requestObject, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // <-- This line enables cookies!
      });
      toast.success("Request sent successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  if (loading)
    return (
      <GradientBackground>
        <div className="min-h-screen flex items-center justify-center text-white">
          <div className="animate-pulse text-2xl">
            Loading Hackathon Details...
          </div>
        </div>
      </GradientBackground>
    );

  if (error)
    return (
      <GradientBackground>
        <div className="min-h-screen flex items-center justify-center text-red-400">
          <div className="text-2xl">Error: {error}</div>
        </div>
      </GradientBackground>
    );

  return (
    <GradientBackground>
      <ToastContainer /> {/* Add this line */}
      <Navigation />
      <div className="min-h-screen container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 max-w-6xl p-4 pt-24">
        {/* Details Section */}
        <div className="md:w-2/3 p-8 glass-card border border-white/40 shadow-xl rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="h-80 md:h-96 flex items-center justify-center rounded-2xl overflow-hidden mb-8 shadow-sm border border-black/5 relative group">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10"></div>
            <img
              src={hackathonData.logo}
              alt="Hackathon Visual"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <h3 className="text-2xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">
            About the Hackathon
          </h3>
          <p className="text-text-main leading-relaxed whitespace-pre-line text-lg font-light tracking-wide">
            {hackathonData.about}
          </p>
        </div>

        {/* Sidebar */}
        <div className="md:w-1/3 p-8 glass-card border border-white/40 shadow-xl rounded-3xl space-y-8 self-start sticky top-24 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>

          {/* Hackathon Title & Organization */}
          <div>
            <h2 className="text-4xl font-display font-bold mb-2 text-text-main tracking-tight">
              {hackathonData.title}
            </h2>
            <p className="text-text-muted text-lg font-medium">
              {hackathonData.organization}
            </p>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/40 border border-white/50 shadow-sm">
            <Link to={`/dashboard/profile/${hackathonData.createdBy}`}>
              <img
                src={`https://github.com/${hackathonData.createdBy}.png`}
                alt="Uploaded by"
                className="h-12 w-12 rounded-full border-2 border-white shadow-sm hover:scale-105 transition-transform"
              />
            </Link>
            <div>
              <p className="font-bold text-text-main text-sm uppercase tracking-wider text-xs text-accent">Uploaded By</p>
              <p className="text-text-main font-semibold capitalize">{hackathonData.createdBy}</p>
            </div>

            {username !== hackathonData.createdBy && (
              <button
                className="ml-auto px-5 py-2 bg-gradient-to-r from-accent to-orange-400 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-sm font-bold"
                onClick={() => {
                  handleChatNow()
                }}
              >
                Chat Now
              </button>
            )}
          </div>


          {/* Dates Section */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4 group">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors">
                <Calendar size={22} />
              </div>
              <div>
                <p className="font-bold text-text-main text-sm">Registration Period</p>
                <p className="text-text-muted text-sm mt-0.5">
                  {new Date(
                    hackathonData.registrationDates.start
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    hackathonData.registrationDates.end
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            {hackathonData.hackathonDates && (
              <div className="flex items-start space-x-4 group">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-500 group-hover:bg-purple-100 transition-colors">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="font-bold text-text-main text-sm">Hackathon Dates</p>
                  <p className="text-text-muted text-sm mt-0.5">
                    {new Date(
                      hackathonData.hackathonDates.start
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      hackathonData.hackathonDates.end
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Team Information */}
          <div className="space-y-6 border-t border-border/30 pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 rounded-full bg-accent/10 text-accent">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-text-main text-sm">Team Size</p>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">{hackathonData.teamSize.min}-{hackathonData.teamSize.max} Members</span>
                </div>
                {/* Progress bar visual for fun */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: `${(hackathonData.currentTeamSize / hackathonData.teamSize.max) * 100}%` }}></div>
                </div>
                <p className="text-right text-xs text-text-muted mt-1">{hackathonData.currentTeamSize} Joined</p>
              </div>
            </div>
          </div>

          {/* Mode & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 p-4 rounded-2xl border border-white/50 text-center">
              <Monitor className="text-green-500 mx-auto mb-2" size={24} />
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Mode</p>
              <p className="text-text-main font-semibold capitalize">{hackathonData.mode}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl border border-white/50 text-center">
              <Globe className="text-indigo-500 mx-auto mb-2" size={24} />
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Location</p>
              <p className="text-text-main font-semibold capitalize truncate">
                {hackathonData.location}
              </p>
            </div>
          </div>

          {/* Team Members */}
          {hackathonData.acceptedUsers.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2 pb-2">
                <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Team Members</p>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {hackathonData.acceptedUsers.map((user) => (
                  <div className="flex items-center space-x-3 p-2 hover:bg-white/50 rounded-xl transition-colors" key={user}>
                    <Link to={`/dashboard/profile/${user}`}>
                      <img
                        src={`https://github.com/${user}.png`}
                        alt={`${user}'s profile`}
                        className="h-8 w-8 rounded-full border border-white shadow-sm"
                      />
                    </Link>
                    <p className="text-text-main font-medium text-sm capitalize">{user}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visible && (
            <button
              onClick={() => {
                setText("send");
                setVisible(false);
              }}
              className="w-full py-4 bg-gradient-to-r from-accent to-orange-400 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-bold text-lg tracking-wide mt-4"
            >
              Join Now 🚀
            </button>
          )}
        </div>
      </div>
      <Chatbot />
    </GradientBackground>
  );
};

export default HackathonDetailsPage;
