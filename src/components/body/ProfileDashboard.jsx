import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUserFrameworks } from "../../apiEndpoints";

import ShimmerEffect from "../shimmer/ShimmerEffect";
import { useParams } from "react-router-dom";
import GitHubCard from "../profile/GitHubCard";
import LeetCodeCard from "../profile/LeetCodeCard";
import ProfileLeftColumn from "../profile/ProfileLeftColumn";
import GitJudgeProfile from "../profile/GitJudgeProfile";



import GradientBackground from "../background/GradientBackground";
import { FaGithub, FaLinkedin, FaInstagram, FaTrophy } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiLeetcode, SiCodechef, SiCodeforces } from "react-icons/si";
import ProfileCard from "../profile/ProfileCard";
import { FaGlobe, FaFileAlt, FaAward, FaCertificate } from "react-icons/fa";
import { use } from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const platformConfig = [
  {
    platform: "Portfolio",
    usernameKey: "portfolioUrl",
    icon: FaGlobe,
    baseUrl: "",
    bgColor: "bg-[#4CAF50]/10 backdrop-blur-md",
  },
  {
    platform: "Resume",
    usernameKey: "resumeUrl",
    icon: FaFileAlt,
    baseUrl: "",
    bgColor: "bg-[#FF5722]/10 backdrop-blur-md",
  },
  {
    platform: "LinkedIn",
    usernameKey: "linkedinurl",
    icon: FaLinkedin,
    baseUrl: "https://linkedin.com/in/",
    bgColor: "bg-[#0077b5]/10 backdrop-blur-md",
  },
  {
    platform: "Instagram",
    usernameKey: "instagramusername",
    icon: FaInstagram,
    baseUrl: "https://instagram.com/",
    bgColor: "bg-[#E1306C]/10 backdrop-blur-md",
  },
  {
    platform: "GitHub",
    usernameKey: "githubUsername",
    icon: FaGithub,
    baseUrl: "https://github.com/",
    bgColor: "bg-[#333]/10 backdrop-blur-md",
  },
  {
    platform: "Twitter",
    usernameKey: "twitterusername",
    icon: FaXTwitter,
    baseUrl: "https://x.com/",
    bgColor: "bg-[#000000]/10 backdrop-blur-md",
  },
  {
    platform: "LeetCode",
    usernameKey: "leetcodeUsername",
    icon: SiLeetcode,
    baseUrl: "https://leetcode.com/",
    bgColor: "bg-[#FFA116]/10 backdrop-blur-md",
  },
  {
    platform: "CodeChef",
    usernameKey: "codechefUsername",
    icon: SiCodechef,
    baseUrl: "https://codechef.com/users/",
    bgColor: "bg-[#5B4638]/10 backdrop-blur-md",
  },
  {
    platform: "Codeforces",
    usernameKey: "codeforcesUsername",
    icon: SiCodeforces,
    baseUrl: "https://codeforces.com/profile/",
    bgColor: "bg-[#1F8AC7]/10 backdrop-blur-md",
  },
];

const ProfileDashboard = () => {
  // New certifications data
  const certifications = [
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon",
      date: "2024",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQb5FKMJ9_7cNMn5hHolhZ3CtyrSXiVbyvNA&s",
      color: "text-orange-400",
    },
    {
      name: "TensorFlow Developer",
      issuer: "Google",
      date: "2023",
      icon: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg",
      color: "text-blue-400",
    },
    {
      name: "Meta Backend Developer",
      issuer: "Meta",
      date: "2023",
      icon: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png",
      color: "text-green-400",
    },
  ];

  const params = useParams();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({});
  const [githubData, setGithubData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [codechefData, setCodechefData] = useState(null);
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [frameworks, setFrameworks] = useState([]);

  const username = params.username;

  useEffect(() => {
    // Fetch user data
    axios
      .get(`${API_BASE}/api/users/${username}`, {
        withCredentials: true, // <-- This sends cookies!
      })
      .then((response) => {
        console.log(response.data);
        setUserData(response.data);
        setUserData({
          ...response.data,
        });
        setSuccess(true);
      })
      .catch(async (err) => {
        console.warn("First attempt failed, trying fallback...", err.message);
        // Fallback: If username has hyphens, try replacing them with spaces (common mismatch issue)
        if (username.includes("-")) {
          try {
            const fallbackUsername = username.replace(/-/g, " ");
            console.log(`Retrying with: ${fallbackUsername}`);
            const retryResponse = await axios.get(`${API_BASE}/api/users/${fallbackUsername}`, {
              withCredentials: true,
            });
            console.log("Fallback successful!", retryResponse.data);
            setUserData(retryResponse.data);
            setUserData(prev => ({ ...prev, ...retryResponse.data }));
            setSuccess(true);
            return; // Exit if success
          } catch (retryErr) {
            console.error("Fallback also failed:", retryErr);
          }
        }

        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to load profile data.");
      });
  }, [username]);

  // Fetch Frameworks
  useEffect(() => {
    async function loadFrameworks() {
      if (!username) return;
      const data = await getUserFrameworks(username);
      if (data && !data.error && typeof data === 'object') {
        const arr = Object.entries(data)
          .map(([name, val]) => ({ name, value: val }))
          .sort((a, b) => b.value - a.value);
        setFrameworks(arr);
      }
    }
    loadFrameworks();
  }, [username]);

  // Fetch platform data only when userData is successfully set
  useEffect(() => {
    if (success && userData.username) {
      // console.log("Updated userData:", userData);

      // Fetch GitHub data
      if (userData.githubUsername) {
        axios
          .get(`https://api.github.com/users/${userData.githubUsername}`)
          .then((response) => setGithubData(response.data))
          .catch((error) => {
            console.error("Error fetching GitHub data:", error);
            setGithubData({ failed: true });
          });
      } else {
        setGithubData({ failed: true });
      }

      // Fetch LeetCode data
      if (userData.leetcodeUsername) {
        axios
          .get(
            `https://leetcode-stats-api.herokuapp.com/${userData.leetcodeUsername}`
          )
          .then((response) => setLeetcodeData(response.data))
          .catch((error) => {
            console.error("Error fetching LeetCode data:", error);
            setLeetcodeData({ failed: true });
          });
      }

      // Fetch CodeChef data
      if (userData.codechefUsername) {
        axios
          .get(
            `${API_BASE}/api/users/codechef/${userData.codechefUsername}`
          )
          .then((response) => setCodechefData(response.data))
          .catch((error) => {
            console.error("Error fetching CodeChef data:", error);
            setCodechefData({ failed: true });
          });
      }

      // Fetch Codeforces data
      if (userData.codeforcesUsername) {
        axios
          .get(
            `${API_BASE}/api/users/codeforces/${userData.codeforcesUsername}`
          )
          .then((response) => setCodeforcesData(response.data))
          .catch((error) => {
            console.error("Error fetching Codeforces data:", error);
            setCodeforcesData({ failed: true });
          });
      }
    }
  }, [success, userData]);

  const ProfileSectionShimmer = () => (
    <div className="w-full md:w-[32rem] bg-black/40 backdrop-blur-md rounded-lg p-6 h-[500px] mx-auto">
      <ShimmerEffect className="w-full h-32 rounded-t-lg mb-4" />
      <ShimmerEffect className="w-40 h-40 rounded-full mx-auto mb-4" />
      <ShimmerEffect className="h-8 w-3/4 mx-auto mb-3 rounded" />
      <ShimmerEffect className="h-6 w-1/2 mx-auto mb-6 rounded" />
      <ShimmerEffect className="h-24 w-full rounded mb-4" />
    </div>
  );

  const CardShimmer = () => (
    <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 h-[400px]">
      <ShimmerEffect className="h-6 w-1/3 mb-4 rounded" />
      <ShimmerEffect className="h-40 w-full rounded mb-4" />
      <ShimmerEffect className="h-4 w-2/3 rounded mb-2" />
      <ShimmerEffect className="h-4 w-1/2 rounded" />
    </div>
  );

  const SocialCardShimmer = () => (
    <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 size-52 mt-10">
      <div className="flex flex-col items-center gap-3">
        <ShimmerEffect className="w-8 h-8 rounded-full" />
        <ShimmerEffect className="h-7 w-24 rounded" />
        <ShimmerEffect className="h-5 w-32 rounded" />
        <ShimmerEffect className="h-8 w-24 rounded-full mt-1" />
      </div>
    </div>
  );

  return (
    <GradientBackground className="min-h-screen text-text-main flex flex-col p-4 md:p-6 lg:p-8 pt-24 md:pt-28">

      {/* Main Layout Container: 2 Columns */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1600px] mx-auto w-full">

        {/* ==================== LEFT COLUMN (Sidebar) ==================== */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 ">
          {error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center">
              <h3 className="font-bold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          ) : !success ? (
            <ProfileSectionShimmer />
          ) : (
            <div className="sticky top-28 space-y-6">
              <ProfileLeftColumn
                userData={userData}
                githubData={githubData}
                codechefData={codechefData}
                frameworks={frameworks}
                platformConfig={platformConfig}
                username={username}
              />
            </div>
          )}
        </div>


        {/* ==================== RIGHT COLUMN (Main Content) ==================== */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 my-10">

          {/* ROW 1: AI Analysis & LeetCode (Side-by-Side) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* AI Analysis / GitJudge (Left) */}
            <div className="flex flex-col gap-6">
              {!success ? (
                <CardShimmer />
              ) : (
                <div className="glass-card rounded-2xl p-6 h-full border border-white/10 flex flex-col justify-center">
                  {userData?.githubUsername ? (
                    <GitJudgeProfile username={userData.githubUsername} githubData={githubData} isSidebar={false} />
                  ) : (
                    <div className="text-center text-gray-500">AI Analysis Unavailable</div>
                  )}
                </div>
              )}
            </div>

            {/* LeetCode Stats Card (Right) */}
            <div className="flex flex-col gap-6 my-20">
              {!leetcodeData ? (
                <CardShimmer />
              ) : leetcodeData.failed ? (
                <div className="glass-card rounded-2xl p-6 flex items-center justify-center text-text-muted h-64 border border-white/10">
                  LeetCode Data Unavailable
                </div>
              ) : (
                <LeetCodeCard
                  platform="LeetCode Stats"
                  stats={[
                    {
                      label: "Acceptance Rate",
                      value: leetcodeData.acceptanceRate,
                    },
                    { label: "Ranking", value: leetcodeData.ranking },
                  ]}
                  imgUrl={`https://leetcard.jacoblin.cool/${userData.leetcodeUsername}?theme=light&font=inter&ext=heatmap`}
                />
              )}
            </div>
          </div>

          {/* ROW 2: GitHub Advanced Stats (Full Width) */}
          <div className="w-full">
            {!githubData ? (
              <CardShimmer />
            ) : (
              <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaGithub className="text-2xl" />
                  Contribution & Analysis
                </h3>
                <div className="flex flex-col gap-6">
                  <div className="w-full">
                    <img
                      src={`https://github-readme-activity-graph.vercel.app/graph?username=${userData.githubUsername}&theme=github&area=true&hide_border=true&bg_color=ffffff00&color=22272e&line=40c463&point=40c463`}
                      alt="GitHub Activity Graph"
                      className="w-full h-auto rounded-lg shadow-sm text-black"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* ROW 3: Coding GIF (Optional spacer/footer element) */}
          {!userData ? (
            <CardShimmer />
          ) : (
            <div className="glass-card rounded-2xl p-0 overflow-hidden shadow-2xl border border-white/10 opacity-60 hover:opacity-100 transition-opacity">
              <img
                src={
                  userData.gifUrl
                    ? userData.gifUrl
                    : "https://media.tenor.com/YZPnGuPeZv8AAAAd/coding.gif"
                }
                alt="Coding animation"
                className="w-full h-48 object-cover object-center"
              />
            </div>
          )}

        </div>

      </div>
    </GradientBackground>
  );
};

export default ProfileDashboard;