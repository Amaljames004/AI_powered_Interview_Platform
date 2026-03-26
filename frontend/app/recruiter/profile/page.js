"use client";
import { useEffect, useState } from "react";
import { FiHome, FiGlobe, FiMapPin, FiClipboard, FiImage, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import api from "@/utils/axios";
import BackButton from "@/components/BackButton";

export default function CompanyProfileForm() {
  const [form, setForm] = useState({
    name: "",
    logo: "",
    industry: "",
    hiringPolicies: "",
    website: "",
    location: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Load profile if exists
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/company-profile");
        const { name, logo, industry, hiringPolicies, website, location } = res.data;
        setForm({ name, logo, industry, hiringPolicies, website, location });
      } catch (err) {
        console.warn("No existing profile found or fetch failed.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await api.post("/company-profile", form);
      setMessage({ 
        text: res.data.message || "Profile saved successfully!", 
        type: "success" 
      });
      setEditMode(false);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Error saving profile", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    // Optionally reload original data
    api.get("/company-profile")
      .then(res => {
        const { name, logo, industry, hiringPolicies, website, location } = res.data;
        setForm({ name, logo, industry, hiringPolicies, website, location });
      })
      .catch(console.error);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton href="/recruiter/dashboard" />
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FiHome className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Company Profile</h1>
              <p className="text-gray-600">
                {editMode ? "Edit your company details" : "View your company profile"}
              </p>
            </div>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <FiEdit2 /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <FiX /> Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white disabled:bg-blue-400"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck /> Save
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mx-6 mt-4 p-3 rounded-lg border ${
            message.type === "error" 
              ? "bg-red-50 border-red-200 text-red-700" 
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {message.text}
          </div>
        )}

        {/* View Mode */}
        {!editMode && (
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-6">
              {form.logo ? (
                <img 
                  src={form.logo} 
                  alt="Company logo" 
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                  <FiImage className="text-2xl" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{form.name || "Your Company"}</h2>
                {form.industry && <p className="text-gray-600">{form.industry}</p>}
                {form.location && (
                  <p className="text-gray-600 mt-1 flex items-center gap-1">
                    <FiMapPin /> {form.location}
                  </p>
                )}
              </div>
            </div>

            {form.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
                <a 
                  href={form.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FiGlobe /> {form.website}
                </a>
              </div>
            )}

            {form.hiringPolicies && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Hiring Policies</h3>
                <p className="text-gray-700 whitespace-pre-line">{form.hiringPolicies}</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {editMode && (
          <form id="profile-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="e.g. OpenAI Technologies"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="e.g. Software Development"
                />
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiImage /> Logo URL
              </label>
              <input
                type="url"
                name="logo"
                value={form.logo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
              {form.logo && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Logo Preview:</p>
                  <img 
                    src={form.logo} 
                    alt="Logo preview" 
                    className="w-16 h-16 rounded border border-gray-200 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Hiring Policies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FiClipboard /> Hiring Policies
              </label>
              <textarea
                name="hiringPolicies"
                value={form.hiringPolicies}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                placeholder="Describe your recruitment process and policies..."
                rows="4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FiGlobe /> Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="https://yourcompany.com"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FiMapPin /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}