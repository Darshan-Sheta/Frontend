import React, { useState, useEffect, use } from "react";
import { Calendar, Upload, Globe, Plus, Trash2, Sparkles } from "lucide-react";
import Navigation from "../navigation/Navigation";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Input = ({ label, error, ...props }) => (
  <div className="w-full group">
    {label && (
      <label className="block text-sm font-medium text-text-main mb-1">
        {label}
      </label>
    )}
    <input
      className={`w-full px-4 py-3 bg-white/50 border ${error ? "border-red-500" : "border-border"
        } rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-text-main placeholder-text-muted/50 transition-all hover:bg-white/80`}
      {...props}
    />
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
      className={`w-full px-4 py-3 bg-white/50 border ${error ? "border-red-500" : "border-border"
        } rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-text-main placeholder-text-muted/50 transition-all hover:bg-white/80`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const Select = ({ label, error, options, ...props }) => (
  <div className="w-full group">
    {label && (
      <label className="block text-sm font-medium text-text-main mb-1">
        {label}
      </label>
    )}
    <select
      className={`w-full px-4 py-3 bg-white/50 border ${error ? "border-red-500" : "border-border"
        } rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-text-main transition-all hover:bg-white/80`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const RadioGroup = ({ label, options, value, onChange, error, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-text-main mb-2">
        {label}
      </label>
    )}
    <div className="flex space-x-6">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            className="w-5 h-5 text-accent border-border focus:ring-accent"
            {...props}
          />
          <span className="text-text-main group-hover:text-accent transition-colors">{option.label}</span>
        </label>
      ))}
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center space-x-4 mb-6">
    {[...Array(totalSteps)].map((_, index) => (
      <React.Fragment key={index}>
        <span
          className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${index + 1 <= currentStep
            ? "bg-accent text-white shadow-lg shadow-accent/20"
            : "bg-surface border border-border text-text-muted"
            }`}
        >
          {index + 1}
        </span>
        {index < totalSteps - 1 && <div className={`h-1 flex-1 rounded-full ${index + 1 < currentStep ? "bg-accent" : "bg-border"}`} />}
      </React.Fragment>
    ))}
  </div>
);

const HackathonRegistrationForm = () => {
  const { userId, username } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    logo: null,
    title: "",
    organization: "",
    theme: "",
    location: "",
    mode: "online",
    about: "",
    teamSize: { min: 1, max: 4 },
    registrationDates: {
      start: "",
      end: "",
    },
    hackathonDates: {
      start: "",
      end: "",
    },
    techStacks: [],
    createdBy: username,
    createdById: userId,
  });

  const [formErrors, setFormErrors] = useState({});

  // GenAI Integration
  const [genAiPrompt, setGenAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDetails = async () => {
    if (!genAiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API_BASE}/api/hackathons/generate-details`, {
        description: genAiPrompt
      });
      const data = response.data;

      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        organization: data.organization || prev.organization,
        theme: data.theme || prev.theme,
        location: data.location || prev.location,
        mode: (data.mode && data.mode.toLowerCase() === 'offline') ? 'offline' : 'online',
        about: data.about || prev.about,
        teamSize: data.teamSize || prev.teamSize,
        techStacks: [...new Set([...prev.techStacks, ...(data.techStacks || [])])],
        registrationDates: {
          start: data.registrationDates?.start?.replace(" ", "T")?.slice(0, 16) || prev.registrationDates.start,
          end: data.registrationDates?.end?.replace(" ", "T")?.slice(0, 16) || prev.registrationDates.end
        },
        hackathonDates: {
          start: data.hackathonDates?.start?.replace(" ", "T")?.slice(0, 16) || prev.hackathonDates.start,
          end: data.hackathonDates?.end?.replace(" ", "T")?.slice(0, 16) || prev.hackathonDates.end
        }
      }));
      setSuccess(false); // Reset generic success just in case
    } catch (err) {
      console.error("GenAI Error", err);
      setError("Failed to auto-fill details. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const allTechStackOptions = [
    { value: "", label: "Select Technology" },
    { value: "Spring Boot", label: "Spring Boot" },
    { value: "React", label: "React" },
    { value: "Express", label: "Express" },
    { value: "Next.js", label: "Next.js" },
    { value: "Vue.js", label: "Vue.js" },
    { value: "Nuxt.js", label: "Nuxt.js" },
    { value: "NestJS", label: "NestJS" },
    { value: "Angular", label: "Angular" },
    { value: "Svelte", label: "Svelte" },
    { value: "Remix", label: "Remix" },
    { value: "Flask", label: "Flask" },
    { value: "Django", label: "Django" },
    { value: "FastAPI", label: "FastAPI" },
    { value: "Laravel", label: "Laravel" },
    { value: "Ruby on Rails", label: "Ruby on Rails" },
    { value: "Gin", label: "Gin" },
    { value: "Actix Web", label: "Actix Web" },
    { value: "Rocket", label: "Rocket" },
    { value: "Vapor", label: "Vapor" },
    { value: "Flutter", label: "Flutter" },
    { value: "ASP.NET Core", label: "ASP.NET Core" },
  ];

  const getAvailableOptions = (currentIndex) => {
    const selectedTechs = formData.techStacks.filter(
      (_, index) => index !== currentIndex && _ !== ""
    );
    return allTechStackOptions.filter(
      (option) =>
        option.value === "" || !selectedTechs.includes(option.value)
    );
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.organization.trim())
      errors.organization = "Organization is required";
    if (!formData.about.trim()) errors.about = "Description is required";
    if (formData.techStacks.length === 0)
      errors.techStacks = "At least one tech stack is required";
    formData.techStacks.forEach((tech, index) => {
      if (!tech) errors[`techStack${index}`] = "Technology is required";
    });
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.registrationDates.start)
      errors.RegStartDate = "Start date is required";
    if (!formData.registrationDates.end)
      errors.RegEndDate = "End date is required";
    if (!formData.hackathonDates.start)
      errors.HackStartDate = "Start date is required";
    if (!formData.hackathonDates.end)
      errors.HackEndDate = "End date is required";
    if (new Date(formData.registrationDates.start) <= new Date()) {
      errors.RegStartDate = "Start date must be in the future";
    }
    if (new Date(formData.registrationDates.end) <= new Date()) {
      errors.RegEndDate = "End date must be in the future";
    }
    if (
      new Date(formData.registrationDates.end) <=
      new Date(formData.registrationDates.start)
    ) {
      errors.RegEndDate = "End date must be greater than start date";
    }
    if (new Date(formData.hackathonDates.start) <= new Date()) {
      errors.HackStartDate = "Start date must be in the future";
    }
    if (new Date(formData.hackathonDates.end) <= new Date()) {
      errors.HackEndDate = "End date must be in the future";
    }
    if (
      new Date(formData.hackathonDates.end) <=
      new Date(formData.hackathonDates.start)
    ) {
      errors.HackEndDate = "End date must be greater than start date";
    }
    if (
      new Date(formData.hackathonDates.start) <=
      new Date(formData.registrationDates.end)
    ) {
      errors.HackStartDate =
        "Hackathon start date must be after registration end date";
    }
    return errors;
  };

  const handleInputChange = (field, value, index) => {
    if (field === "techStack") {
      const newTechStacks = [...formData.techStacks];
      newTechStacks[index] = value;
      setFormData((prev) => ({
        ...prev,
        techStacks: newTechStacks,
      }));
      setFormErrors((prev) => ({
        ...prev,
        [`techStack${index}`]: undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const addTechStack = () => {
    const availableOptions = allTechStackOptions.filter(
      (option) =>
        option.value === "" || !formData.techStacks.includes(option.value)
    );
    if (availableOptions.length <= 1) {
      setFormErrors((prev) => ({
        ...prev,
        techStacks: "No more technologies available to add",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      techStacks: [...prev.techStacks, ""],
    }));
    setFormErrors((prev) => ({
      ...prev,
      techStacks: undefined,
    }));
  };

  const removeTechStack = (index) => {
    setFormData((prev) => ({
      ...prev,
      techStacks: prev.techStacks.filter((_, i) => i !== index),
    }));
    setFormErrors((prev) => ({
      ...prev,
      [`techStack${index}`]: undefined,
      techStacks: undefined,
    }));
  };

  const handleNext = () => {
    const errors = validateStep1();
    if (Object.keys(errors).length === 0) {
      setStep(2);
      setFormErrors({});
    } else {
      setFormErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitFormData = new FormData();
      if (formData.logo) {
        submitFormData.append("logo", formData.logo);
      }
      const dataWithoutLogo = {
        ...formData,
        logo: null,
        registrationDates: {
          start: formData.registrationDates.start.replace("T", " ") + ":00",
          end: formData.registrationDates.end.replace("T", " ") + ":00",
        },
        hackathonDates: {
          start: formData.hackathonDates.start.replace("T", " ") + ":00",
          end: formData.hackathonDates.end.replace("T", " ") + ":00",
        },
      };
      submitFormData.append("data", JSON.stringify(dataWithoutLogo));

      const response = await axios.post(
        `${API_BASE}/api/hackathons`,
        submitFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // <-- This line enables cookies!
        }
      );

      setSuccess(true);
      navigate("/dashboard/hackathons");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create hackathon");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) {
        setFormErrors((prev) => ({
          ...prev,
          logo: "File size must be less than 1MB",
        }));
        return;
      }
      if (!file.type.match("image.*")) {
        setFormErrors((prev) => ({
          ...prev,
          logo: "Please upload an image file",
        }));
        return;
      }
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
      setFormErrors((prev) => ({
        ...prev,
        logo: undefined,
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 border-b border-border/50">
              <StepIndicator currentStep={step} totalSteps={2} />
              <h2 className="text-3xl font-display font-bold text-text-main">
                {step === 1 ? "Basic Details" : "Registration Details"}
              </h2>
              <p className="mt-2 text-text-muted">
                {step === 1
                  ? "Fill in the basic information about your hackathon"
                  : "Configure registration settings and requirements"}
              </p>
            </div>
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-600 font-medium">
                    Hackathon created successfully!
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8">
                {step === 1 ? (
                  <>
                    {/* Gen AI Section */}
                    <div className="bg-gradient-to-r from-accent/5 to-orange-400/5 p-6 rounded-2xl border border-accent/20 mb-8">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <h3 className="text-lg font-semibold text-text-main">Magic Auto-fill</h3>
                      </div>
                      <p className="text-sm text-text-muted mb-4">
                        Paste your hackathon announcement or description here, and our AI will fill out the form for you.
                      </p>
                      <div className="relative">
                        <textarea
                          value={genAiPrompt}
                          onChange={(e) => setGenAiPrompt(e.target.value)}
                          placeholder="e.g. 'HackTheFuture 2024 organized by TechCorp. Theme is AI for Good. Happening online from March 1st to 3rd. Teams of 2-4. Tech stack: Python, React, TensorFlow.'"
                          className="w-full px-4 py-3 bg-white/50 border border-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[100px] pr-32"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateDetails}
                          disabled={isGenerating || !genAiPrompt.trim()}
                          className="absolute bottom-3 right-3 px-4 py-2 bg-gradient-to-r from-accent to-orange-400 text-white font-medium rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                        >
                          {isGenerating ? (
                            <span className="animate-spin">⌛</span>
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          {isGenerating ? "Generating..." : "Auto-fill"}
                        </button>
                      </div>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-medium text-text-main mb-2">
                        Hackathon Logo
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-xl bg-surface/50 hover:bg-surface transition-colors">
                        <div className="space-y-1 text-center">
                          {previewUrl ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-64 w-96 object-cover rounded-lg mb-4 shadow-md"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(previewUrl);
                                  setPreviewUrl(null);
                                  setFormData((prev) => ({
                                    ...prev,
                                    logo: null,
                                  }));
                                }}
                                className="text-sm font-medium text-red-500 hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="mx-auto h-12 w-12 text-text-muted" />
                              <div className="flex text-sm text-text-muted">
                                <label className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent/80">
                                  <span>Upload a file</span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    onChange={handleLogoUpload}
                                    accept="image/*"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-text-muted/70">
                                PNG, JPG, GIF up to 1MB
                              </p>
                            </>
                          )}
                          {formErrors.logo && (
                            <p className="mt-1 text-sm text-red-500">
                              {formErrors.logo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Input
                      label="Hackathon Title"
                      placeholder="Enter hackathon title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      error={formErrors.title}
                    />
                    <Input
                      label="Organization"
                      placeholder="Enter organization name"
                      value={formData.organization}
                      onChange={(e) =>
                        handleInputChange("organization", e.target.value)
                      }
                      error={formErrors.organization}
                    />
                    <Input
                      label="Theme"
                      placeholder="Enter hackathon theme"
                      value={formData.theme}
                      onChange={(e) =>
                        handleInputChange("theme", e.target.value)
                      }
                    />
                    <Input
                      label="Location"
                      placeholder="Enter hackathon Location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                    <RadioGroup
                      label="Mode of Event"
                      options={[
                        { value: "online", label: "Online" },
                        { value: "offline", label: "Offline" },
                      ]}
                      value={formData.mode}
                      onChange={(e) =>
                        handleInputChange("mode", e.target.value)
                      }
                    />
                    <Textarea
                      label="About Hackathon"
                      placeholder="Describe your hackathon, including rules, eligibility, and format"
                      value={formData.about}
                      onChange={(e) =>
                        handleInputChange("about", e.target.value)
                      }
                      rows={6}
                      error={formErrors.about}
                    />
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-text-main">
                        Tech Stacks
                      </label>
                      {formErrors.techStacks && (
                        <p className="text-sm text-red-500">
                          {formErrors.techStacks}
                        </p>
                      )}
                      {formData.techStacks.map((tech, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex-1">
                            <Select
                              label={`Tech Stack ${index + 1}`}
                              options={getAvailableOptions(index)}
                              value={tech}
                              onChange={(e) =>
                                handleInputChange("techStack", e.target.value, index)
                              }
                              error={formErrors[`techStack${index}`]}
                            />
                          </div>
                          {formData.techStacks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTechStack(index)}
                              className="p-3 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all self-end mb-1"
                              title="Remove Tech Stack"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTechStack}
                        className="flex items-center px-4 py-2 border border-dashed border-accent text-accent hover:bg-accent/10 rounded-lg transition-all"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Tech Stack
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-3.5 bg-gradient-to-r from-accent to-orange-400 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                      disabled={loading}
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-main">
                        Team Size (min)
                      </label>
                      <div className="flex space-x-4 items-end">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={formData.teamSize.min}
                          onChange={(e) =>
                            handleInputChange("teamSize", {
                              ...formData.teamSize,
                              min: parseInt(e.target.value),
                            })
                          }
                          className="w-24 bg-white"
                          min="1"
                          error={formErrors.teamSizeMin}
                        />
                        <div className="pb-3 text-text-muted font-medium">to</div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-text-main mb-1">Team Size (max)</label>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={formData.teamSize.max}
                            onChange={(e) =>
                              handleInputChange("teamSize", {
                                ...formData.teamSize,
                                max: parseInt(e.target.value),
                              })
                            }
                            className="w-24 bg-white"
                            min={formData.teamSize.min}
                            error={formErrors.teamSizeMax}
                          />
                        </div>

                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Input
                        label="Registration Start Date"
                        type="datetime-local"
                        value={formData.registrationDates.start}
                        onChange={(e) =>
                          handleInputChange("registrationDates", {
                            ...formData.registrationDates,
                            start: e.target.value,
                          })
                        }
                        error={formErrors.RegStartDate}
                      />
                      <Input
                        label="Registration End Date"
                        type="datetime-local"
                        value={formData.registrationDates.end}
                        onChange={(e) =>
                          handleInputChange("registrationDates", {
                            ...formData.registrationDates,
                            end: e.target.value,
                          })
                        }
                        error={formErrors.RegEndDate}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Input
                        label="Hackathon Start Date"
                        type="datetime-local"
                        value={formData.hackathonDates.start}
                        onChange={(e) =>
                          handleInputChange("hackathonDates", {
                            ...formData.hackathonDates,
                            start: e.target.value,
                          })
                        }
                        error={formErrors.HackStartDate}
                      />
                      <Input
                        label="Hackathon End Date"
                        type="datetime-local"
                        value={formData.hackathonDates.end}
                        onChange={(e) =>
                          handleInputChange("hackathonDates", {
                            ...formData.hackathonDates,
                            end: e.target.value,
                          })
                        }
                        error={formErrors.HackEndDate}
                      />
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 py-3.5 bg-transparent hover:bg-surface text-text-muted border border-border rounded-xl transition-all font-medium"
                        disabled={loading}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-3.5 bg-gradient-to-r from-accent to-orange-400 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Hackathon"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonRegistrationForm;