import React, { useState, useEffect } from "react";
import { Calendar, Users, Monitor, Globe } from "lucide-react";
import GradientBackground from "../components/background/GradientBackground";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "../components/navigation/Navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/chatbot/Chatbot";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HackathonDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { username, userId } = useAuth();

  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/hackathons/${id}`,
          { withCredentials: true }
        );

        setHackathonData(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load hackathon");
        navigate("/dashboard/hackathons");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHackathon();
  }, [id, navigate]);

  // ---------------- BUTTON VISIBILITY LOGIC ----------------
  useEffect(() => {
    if (!hackathonData || !username) return;

    const registrationClosed =
      new Date(hackathonData?.registrationDates?.end) < new Date();

    const alreadyRequested =
      hackathonData?.requestsToJoin?.includes(username);

    const isCreator = hackathonData?.createdBy === username;

    const teamFull =
      hackathonData?.teamSize?.max === hackathonData?.currentTeamSize;

    if (!registrationClosed && !alreadyRequested && !isCreator && !teamFull) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [hackathonData, username]);

  // ---------------- JOIN REQUEST ----------------
  const handleJoin = async () => {
    try {
      await axios.post(
        `${API_BASE}/request`,
        {
          hackathonId: hackathonData?.id,
          hackathonTitle: hackathonData?.title,
          createdBy: hackathonData?.createdBy,
          requestedBy: username,
          status: "pending",
        },
        { withCredentials: true }
      );

      toast.success("Request sent successfully!");
      setVisible(false);
    } catch (error) {
      console.error("Join request failed:", error);
      toast.error("Failed to send request");
    }
  };

  // ---------------- CHAT ----------------
  const handleChatNow = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/v1/personal_chat/create_or_get_personal_chat/${userId}/${hackathonData?.createdById}`,
        {},
        { withCredentials: true }
      );

      navigate(`/dashboard/chat?leader=${hackathonData?.createdBy}`);
    } catch {
      toast.error("Unable to open chat");
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <GradientBackground>
        <div className="min-h-screen flex items-center justify-center text-white text-2xl">
          Loading Hackathon Details...
        </div>
      </GradientBackground>
    );
  }

  if (!hackathonData) return null;

  return (
    <GradientBackground>
      <ToastContainer />
      <Navigation />

      <div className="min-h-screen container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 max-w-6xl pt-24">

        {/* LEFT SIDE */}
        <div className="md:w-2/3 p-8 glass-card rounded-3xl">
          <img
            src={hackathonData?.logo}
            alt="Hackathon"
            className="w-full h-96 object-cover rounded-2xl mb-6"
          />

          <h3 className="text-2xl font-bold mb-4">About</h3>
          <p className="whitespace-pre-line">
            {hackathonData?.about}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-1/3 p-8 glass-card rounded-3xl space-y-6">

          <div>
            <h2 className="text-3xl font-bold">
              {hackathonData?.title}
            </h2>
            <p>{hackathonData?.organization}</p>
          </div>

          {/* Uploaded By */}
          <div className="flex items-center space-x-4">
            <Link to={`/dashboard/profile/${hackathonData?.createdBy}`}>
              <img
                src={`https://github.com/${hackathonData?.createdBy}.png`}
                alt="Creator"
                className="h-12 w-12 rounded-full"
              />
            </Link>

            <div>
              <p className="text-sm">Uploaded By</p>
              <p className="font-semibold">
                {hackathonData?.createdBy}
              </p>
            </div>

            {username !== hackathonData?.createdBy && (
              <button
                onClick={handleChatNow}
                className="ml-auto px-4 py-2 bg-orange-500 text-white rounded-xl"
              >
                Chat Now
              </button>
            )}
          </div>

          {/* Registration Dates */}
          <div>
            <p className="font-bold">Registration Period</p>
            <p>
              {new Date(hackathonData?.registrationDates?.start).toLocaleDateString()}
              {" - "}
              {new Date(hackathonData?.registrationDates?.end).toLocaleDateString()}
            </p>
          </div>

          {/* Team Info */}
          <div>
            <p className="font-bold">
              Team Size: {hackathonData?.teamSize?.min} - {hackathonData?.teamSize?.max}
            </p>
            <p>Joined: {hackathonData?.currentTeamSize}</p>
          </div>

          {/* Mode & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Monitor />
              <p>{hackathonData?.mode}</p>
            </div>
            <div>
              <Globe />
              <p>{hackathonData?.location}</p>
            </div>
          </div>

          {/* Team Members */}
          {hackathonData?.acceptedUsers?.length > 0 && (
            <div>
              <p className="font-bold">Team Members</p>
              {hackathonData.acceptedUsers.map((user) => (
                <div key={user}>{user}</div>
              ))}
            </div>
          )}

          {/* Join Button */}
          {visible && (
            <button
              onClick={handleJoin}
              className="w-full py-3 bg-green-500 text-white rounded-xl"
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
