import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Mail,
  Building,
  Github,
  Code,
  FileCode,
  BookOpen,
  Linkedin,
  Twitter,
  Instagram,
  Film,
  Image,
  Sticker,
} from "lucide-react";
import Navigation from "../navigation/Navigation";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Reuse the Input component with icon support
const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="w-full group">
    {label && (
      <label className="block text-sm font-medium text-text-main mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-text-muted" />
        </div>
      )}
      <input
        className={`w-full ${Icon ? "pl-10" : "pl-3"
          } py-2 bg-white/50 border ${error ? "border-red-500" : "border-border"
          } rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-text-main placeholder-text-muted/50 transition-all hover:bg-white/80`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div className="w-full group">
    {label && (
      <label className="block text-sm font-medium text-text-main mb-1">
        {label}
      </label>
    )}
    <textarea
      className={`w-full px-3 py-2 bg-white/50 border ${error ? "border-red-500" : "border-border"
        } rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-text-main placeholder-text-muted/50 transition-all hover:bg-white/80`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const ProfileEditForm = () => {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    email: "",
    collegeName: "",
    githubUsername: "",
    leetcodeUsername: "",
    codechefUsername: "",
    bio: "",
    linkedinurl: "",
    twitterusername: "",
    instagramusername: "",
    portfolioUrl: "",
    resumeUrl: "",
    gifUrl: "",
    coverPhotoUrl: "",
    emoji: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/users/${username}`, {
          withCredentials: true, // <-- This sends cookies!
        });
        console.log(response.data);

        const profile = response.data;
        setFormData({
          username: "",
          displayName: profile.displayName || "",
          email: profile.email || "",
          collegeName: profile.collegeName || "",
          githubUsername: profile.githubUsername || "",
          leetcodeUsername: profile.leetcodeUsername || "",
          codechefUsername: profile.codechefUsername || "",
          bio: profile.bio || "",
          linkedinurl: profile.linkedinurl || "",
          twitterusername: profile.twitterusername || "",
          instagramusername: profile.instagramusername || "",
          resumeUrl: profile.resumeUrl || "",
          portfolioUrl: profile.portfolioUrl || "",
          gifUrl: profile.gifUrl || "",
          coverPhotoUrl: profile.coverPhotoUrl || "",
          emoji: profile.emoji || "",
        });
      } catch (err) {
        console.warn("First fetch failed, trying fallback...", err);
        if (username && username.includes("-")) {
          try {
            const fallbackUsername = username.replace(/-/g, " ");
            console.log(`Retrying with: ${fallbackUsername}`);
            const retryResponse = await axios.get(`${API_BASE}/api/users/${fallbackUsername}`, {
              withCredentials: true,
            });

            const profile = retryResponse.data;
            setFormData({
              username: "",
              displayName: profile.displayName || "",
              email: profile.email || "",
              collegeName: profile.collegeName || "",
              githubUsername: profile.githubUsername || "",
              leetcodeUsername: profile.leetcodeUsername || "",
              codechefUsername: profile.codechefUsername || "",
              bio: profile.bio || "",
              linkedinurl: profile.linkedinurl || "",
              twitterusername: profile.twitterusername || "",
              instagramusername: profile.instagramusername || "",
              resumeUrl: profile.resumeUrl || "",
              portfolioUrl: profile.portfolioUrl || "",
              gifUrl: profile.gifUrl || "",
              coverPhotoUrl: profile.coverPhotoUrl || "",
              emoji: profile.emoji || "",
            });
            return; // Success
          } catch (retryErr) {
            console.error("Fallback failed:", retryErr);
            setError(err.response?.data?.message || "Failed to fetch profile");
          }
        } else {
          setError(err.response?.data?.message || "Failed to fetch profile");
        }
      }
    };
    fetchProfile();
  }, []);

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // URL validations
    const urlRegex = /^https?:\/\/.+/;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.email && !emailRegex.test(formData.email))
      errors.email = "Please enter a valid email";

    if (formData.linkedinurl && !urlRegex.test(formData.linkedinurl))
      errors.linkedinurl = "Please enter a valid URL";

    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE}/api/users/${username}`,
        formData, // body
        {
          withCredentials: true, // correctly placed
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      setSuccess(true);
      // Optionally redirect or show success message
    } catch (err) {
      console.warn("Update failed, trying fallback...", err);
      // Fallback: If username has hyphens, check if replacing with spaces works
      if (err.response?.status === 404 && username && username.includes("-")) {
        try {
          const fallbackUsername = username.replace(/-/g, " ");
          console.log(`Retrying update with: ${fallbackUsername}`);

          await axios.put(
            `${API_BASE}/api/users/${fallbackUsername}`,
            formData,
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          setSuccess(true);
          return; // Success on fallback
        } catch (retryErr) {
          console.error("Fallback update failed:", retryErr);
          setError(retryErr.response?.data?.message || "Failed to update profile");
        }
      } else {
        setError(err.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto pt-32 pb-20 px-4">
        <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="p-8 border-b border-border/50">
            <h2 className="text-3xl font-display font-bold text-text-main">Edit Profile</h2>
            <p className="mt-2 text-text-muted">
              Update your profile information and social links
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-sm font-medium">Profile updated successfully!</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="Username"
                  icon={User}
                  placeholder="Enter new username (optional)"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  error={formErrors.username}
                />

                <Input
                  label="Password"
                  icon={Lock}
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  error={formErrors.password}
                />

                <Input
                  label="Display Name"
                  icon={User}
                  placeholder="Enter display name (optional)"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  error={formErrors.displayName}
                />

                <Input
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="Enter email (optional)"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={formErrors.email}
                />

                <Input
                  label="College Name"
                  icon={Building}
                  placeholder="Enter college name (optional)"
                  value={formData.collegeName}
                  onChange={(e) =>
                    handleInputChange("collegeName", e.target.value)
                  }
                  error={formErrors.collegeName}
                />

                <Input
                  label="GitHub Username"
                  icon={Github}
                  placeholder="Enter GitHub username (optional)"
                  value={formData.githubUsername}
                  onChange={(e) =>
                    handleInputChange("githubUsername", e.target.value)
                  }
                />

                <Input
                  label="LeetCode Username"
                  icon={Code}
                  placeholder="Enter LeetCode username (optional)"
                  value={formData.leetcodeUsername}
                  onChange={(e) =>
                    handleInputChange("leetcodeUsername", e.target.value)
                  }
                />

                <Input
                  label="CodeChef Username"
                  icon={FileCode}
                  placeholder="Enter CodeChef username (optional)"
                  value={formData.codechefUsername}
                  onChange={(e) =>
                    handleInputChange("codechefUsername", e.target.value)
                  }
                />

                <Input
                  label="LinkedIn URL"
                  icon={Linkedin}
                  placeholder="Enter LinkedIn profile URL (optional)"
                  value={formData.linkedinurl}
                  onChange={(e) =>
                    handleInputChange("linkedinurl", e.target.value)
                  }
                  error={formErrors.linkedinurl}
                />

                <Input
                  label="X (Twitter) Username"
                  icon={Twitter}
                  placeholder="Enter X username (optional)"
                  value={formData.twitterusername}
                  onChange={(e) =>
                    handleInputChange("twitterusername", e.target.value)
                  }
                />

                <Input
                  label="Instagram Username"
                  icon={Instagram}
                  placeholder="Enter Instagram username (optional)"
                  value={formData.instagramusername}
                  onChange={(e) =>
                    handleInputChange("instagramusername", e.target.value)
                  }
                />

                <Input
                  label="Resume URL"
                  icon={FileCode}
                  placeholder="Link to PDF (e.g., Google Drive / Dropbox)"
                  value={formData.resumeUrl}
                  onChange={(e) =>
                    handleInputChange("resumeUrl", e.target.value)
                  }
                  error={formErrors.resumeUrl}
                />

                <Input
                  label="Portfolio URL"
                  icon={Code}
                  placeholder="Your Personal Website / Portfolio"
                  value={formData.portfolioUrl}
                  onChange={(e) =>
                    handleInputChange("portfolioUrl", e.target.value)
                  }
                  error={formErrors.portfolioUrl}
                />

                <Input
                  label="GIF URL"
                  icon={Film}
                  placeholder="Direct .gif link (e.g., from Tenor/Imgur)"
                  value={formData.gifUrl}
                  onChange={(e) => handleInputChange("gifUrl", e.target.value)}
                  error={formErrors.gifUrl}
                />

                <Input
                  label="Cover Picture URL"
                  icon={Image}
                  placeholder="Image URL (e.g., Unsplash source)"
                  value={formData.coverPhotoUrl}
                  onChange={(e) =>
                    handleInputChange("coverPhotoUrl", e.target.value)
                  }
                  error={formErrors.coverPhotoUrl}
                />

                <Input
                  label="Emoji"
                  icon={Sticker}
                  placeholder="Pick an emoji (e.g., 👨‍💻, 🚀)"
                  value={formData.emoji}
                  onChange={(e) => handleInputChange("emoji", e.target.value)}
                  error={formErrors.emoji}
                />
              </div>

              <Textarea
                label="Bio"
                placeholder="Tell us about yourself (optional)"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={4}
              />

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-accent to-orange-400 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;
