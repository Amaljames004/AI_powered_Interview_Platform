'use client';
import api from "@/utils/axios";
import { useEffect, useState, useRef } from 'react';
import { 
  FaUser, 
  FaGithub, 
  FaLinkedin, 
  FaTimes, 
  FaPlus,
  FaFilePdf,
  FaFileWord,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaGlobe,
  FaGraduationCap,
  FaCode,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const tabs = [
  { key: 'personal', label: 'Personal Info', icon: <FaUser className="mr-2" /> },
  { key: 'education', label: 'Education', icon: <FaGraduationCap className="mr-2" /> },
  { key: 'skills', label: 'Skills', icon: <FaCode className="mr-2" /> },
  { key: 'resume', label: 'Resume & Links', icon: <FaFilePdf className="mr-2" /> },
  { key: 'address', label: 'Address', icon: <FaMapMarkerAlt className="mr-2" /> },
  { key: 'certifications', label: 'Certifications', icon: <FaFileWord className="mr-2" /> },
  { key: 'projects', label: 'Projects', icon: <FaGlobe className="mr-2" /> },
];

export default function AdvancedProfile() {
  const [candidate, setCandidate] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [error, setError] = useState(null);
  const skillInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/candidate/profile");
        setCandidate(res.data);
        setForm(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const updateField = (field, value, index = null, nestedField = null) => {
    setForm(prev => {
      if (index !== null && nestedField !== null) {
        const arr = [...(prev[field] || [])];
        arr[index] = { ...arr[index], [nestedField]: value };
        return { ...prev, [field]: arr };
      } else if (index !== null) {
        const arr = [...(prev[field] || [])];
        arr[index] = value;
        return { ...prev, [field]: arr };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillAdd = () => {
    const skill = skillInputRef.current.value.trim();
    if (!skill || (form.skills || []).includes(skill)) return;
    setForm(prev => ({ ...prev, skills: [...(prev.skills || []), skill] }));
    skillInputRef.current.value = '';
  };

  const handleSkillRemove = (skill) => {
    setForm(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s !== skill) }));
  };

  const addItem = (field, emptyItem) => {
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), emptyItem] }));
  };

  const removeItem = (field, index) => {
    setForm(prev => {
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put('/candidate/profile', form);
      setCandidate(data.candidate);
      setForm(data.candidate);
      setEditMode(false);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(candidate);
    setEditMode(false);
    setError(null);
  };

const handleResumeUpload = async (file) => {
  if (!file) return;
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const config = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      },
    };

    const res = await api.post("/candidate/upload/resume", formData, config);

    // Store extracted text in form for backend
    setForm((prev) => ({
      ...prev,
      resumeText: res.data.resumeText, // <-- this is the cleaned text from backend
      resumeUrl: res.data.url || prev.resumeUrl,
    }));

    setUploadProgress(0);
  } catch (err) {
    setError("Failed to upload or process resume");
    setUploadProgress(0);
  }
};


  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto p-6 mt-12 bg-red-50 border border-red-200 rounded-lg text-red-600">
      <h2 className="font-bold">Error Loading Profile</h2>
      <p>{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className=" text-black px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-gray-900 p-3 rounded-lg mr-4">
                <FaUser className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Candidate Profile</h1>
                <p className="text-gray-500">Manage your professional information</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => (editMode ? handleCancel() : setEditMode(true))}
                className={`px-5 py-2 rounded-lg font-medium transition ${
                  editMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-700 text-white'
                }`}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
              {editMode && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-4 font-medium text-sm flex items-center whitespace-nowrap border-b-2 ${
                  activeTab === key
                    ? 'border-black text-zinc-900'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Personal Info */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                label="Full Name" 
                name="fullName" 
                value={form.fullName} 
                onChange={handleInputChange} 
                disabled={!editMode}
                icon={<FaUser className="text-gray-400" />}
              />
              <InputField 
                label="Email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleInputChange} 
                disabled={!editMode}
              />
              <InputField 
                label="Phone Number" 
                name="phoneNumber" 
                value={form.phoneNumber} 
                onChange={handleInputChange} 
                disabled={!editMode}
              />
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''}
                onChange={handleInputChange}
                disabled={!editMode}
                icon={<FaCalendarAlt className="text-gray-400" />}
              />
              <SelectField
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleInputChange}
                options={['Male', 'Female', 'Other', 'Prefer not to say']}
                disabled={!editMode}
              />
            </div>
          )}

          {/* Education */}
          {activeTab === 'education' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                label="College/University" 
                name="college" 
                value={form.college} 
                onChange={handleInputChange} 
                disabled={!editMode}
                icon={<FaGraduationCap className="text-gray-400" />}
              />
              <InputField 
                label="Degree" 
                name="degree" 
                value={form.degree} 
                onChange={handleInputChange} 
                disabled={!editMode}
              />
              <InputField 
                label="Specialization" 
                name="specialization" 
                value={form.specialization || ''} 
                onChange={handleInputChange} 
                disabled={!editMode}
              />
              <InputField
                label="Graduation Year"
                name="graduationYear"
                type="number"
                min={1900}
                max={new Date().getFullYear() + 10}
                value={form.graduationYear}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <InputField
                label="Academic % or GPA"
                name="academicPercentage"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.academicPercentage}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <InputField 
                label="Backlogs (if any)" 
                name="backlogs" 
                type="number" 
                min={0} 
                value={form.backlogs} 
                onChange={handleInputChange} 
                disabled={!editMode}
              />
            </div>
          )}

          {/* Skills */}
          {activeTab === 'skills' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaCode className="mr-2 text-indigo-600" />
                  Technical Skills
                </h2>
                <p className="text-gray-600 mb-4">Add your technical skills and competencies</p>
                
                {editMode && (
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      ref={skillInputRef}
                      type="text"
                      placeholder="Add skill (e.g., React, Python)"
                      className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSkillAdd()}
                    />
                    <button
                      onClick={handleSkillAdd}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <FaPlus />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(form.skills || []).map((skill) => (
                    <div
                      key={skill}
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <span>{skill}</span>
                      {editMode && (
                        <button
                          onClick={() => handleSkillRemove(skill)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resume & Social Links */}
{activeTab === 'resume' && (
  <div className="space-y-8">

    {/* Resume Section */}
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaFilePdf className="mr-2 text-indigo-600" />
        Resume
      </h2>

      {form.resumeUrl ? (
        <div className="flex flex-col gap-4">
          <a
            href={form.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FaFilePdf className="mr-2 text-2xl" />
            <span>View Current Resume</span>
            <FaExternalLinkAlt className="ml-1 text-sm" />
          </a>

          {editMode && (
            <ResumeUpload
              currentUrl={form.resumeUrl}
              onUpload={handleResumeUpload}
              progress={uploadProgress}
            />
          )}

          {/* Show extracted text if available */}
          {form.resumeText && (
            <div className="mt-2 p-3 bg-gray-100 rounded max-h-48 overflow-auto text-sm text-gray-700">
              <strong>Extracted Resume Text:</strong>
              <p>{form.resumeText}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {editMode ? (
            <ResumeUpload
              onUpload={handleResumeUpload}
              progress={uploadProgress}
            />
          ) : (
            <p className="text-gray-500">No resume uploaded</p>
          )}
        </div>
      )}
    </div>

    {/* Online Presence Section */}
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaGlobe className="mr-2 text-indigo-600" />
        Online Presence
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SocialInput
          icon={<FaGithub className="text-gray-700" />}
          label="GitHub Profile"
          name="githubUrl"
          value={form.githubUrl || ''}
          onChange={handleInputChange}
          disabled={!editMode}
          placeholder="https://github.com/yourusername"
        />
        <SocialInput
          icon={<FaLinkedin className="text-blue-700" />}
          label="LinkedIn Profile"
          name="linkedinUrl"
          value={form.linkedinUrl || ''}
          onChange={handleInputChange}
          disabled={!editMode}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
    </div>
  </div>
)}


          {/* Address */}
          {activeTab === 'address' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Street Address"
                name="street"
                value={form.address?.street || ''}
                onChange={(e) => updateField('address', { ...form.address, street: e.target.value })}
                disabled={!editMode}
                icon={<FaMapMarkerAlt className="text-gray-400" />}
              />
              <InputField
                label="City"
                name="city"
                value={form.address?.city || ''}
                onChange={(e) => updateField('address', { ...form.address, city: e.target.value })}
                disabled={!editMode}
              />
              <InputField
                label="State/Province"
                name="state"
                value={form.address?.state || ''}
                onChange={(e) => updateField('address', { ...form.address, state: e.target.value })}
                disabled={!editMode}
              />
              <InputField
                label="Country"
                name="country"
                value={form.address?.country || ''}
                onChange={(e) => updateField('address', { ...form.address, country: e.target.value })}
                disabled={!editMode}
              />
              <InputField
                label="Postal/Zip Code"
                name="pincode"
                value={form.address?.pincode || ''}
                onChange={(e) => updateField('address', { ...form.address, pincode: e.target.value })}
                disabled={!editMode}
              />
            </div>
          )}

          {/* Certifications */}
          {activeTab === 'certifications' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaFileWord className="mr-2 text-indigo-600" />
                  Certifications
                </h2>
                {editMode && (
                  <button
                    onClick={() => addItem('certifications', {
                      name: '',
                      issuer: '',
                      issueDate: '',
                      expiryDate: '',
                      credentialId: '',
                      credentialUrl: '',
                    })}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus /> Add Certification
                  </button>
                )}
              </div>

              {(form.certifications || []).length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <FaFileWord className="mx-auto text-3xl text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No certifications added</h3>
                  <p className="text-gray-500 mb-4">Add your professional certifications here</p>
                  {editMode && (
                    <button
                      onClick={() => addItem('certifications', {
                        name: '',
                        issuer: '',
                        issueDate: '',
                        expiryDate: '',
                        credentialId: '',
                        credentialUrl: '',
                      })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add First Certification
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(form.certifications || []).map((cert, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-6 bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Certification Name"
                          name={`cert-name-${i}`}
                          value={cert.name}
                          onChange={(e) => updateField('certifications', e.target.value, i, 'name')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Issuing Organization"
                          name={`cert-issuer-${i}`}
                          value={cert.issuer}
                          onChange={(e) => updateField('certifications', e.target.value, i, 'issuer')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Issue Date"
                          name={`cert-issueDate-${i}`}
                          type="date"
                          value={cert.issueDate ? cert.issueDate.split('T')[0] : ''}
                          onChange={(e) => updateField('certifications', e.target.value, i, 'issueDate')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Expiry Date (if applicable)"
                          name={`cert-expiryDate-${i}`}
                          type="date"
                          value={cert.expiryDate ? cert.expiryDate.split('T')[0] : ''}
                          onChange={(e) => updateField('certifications', e.target.value, i, 'expiryDate')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Credential ID"
                          name={`cert-credentialId-${i}`}
                          value={cert.credentialId}
                          onChange={(e) => updateField('certifications', e.target.value, i, 'credentialId')}
                          disabled={!editMode}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Credential URL
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              name={`cert-credentialUrl-${i}`}
                              value={cert.credentialUrl || ''}
                              onChange={(e) => updateField('certifications', e.target.value, i, 'credentialUrl')}
                              disabled={!editMode}
                              className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                              placeholder="https://example.com/certificate"
                            />
                            {cert.credentialUrl && (
                              <a 
                                href={cert.credentialUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <FaExternalLinkAlt />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      {editMode && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => removeItem('certifications', i)}
                            className="text-red-600 hover:text-red-800 font-medium flex items-center"
                          >
                            <FaTimes className="mr-1" /> Remove Certification
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projects */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaGlobe className="mr-2 text-indigo-600" />
                  Projects
                </h2>
                {editMode && (
                  <button
                    onClick={() => addItem('projects', {
                      title: '',
                      description: '',
                      techStack: [],
                      projectUrl: '',
                      startDate: '',
                      endDate: '',
                      isCurrent: false,
                    })}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus /> Add Project
                  </button>
                )}
              </div>

              {(form.projects || []).length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <FaGlobe className="mx-auto text-3xl text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No projects added</h3>
                  <p className="text-gray-500 mb-4">Showcase your work by adding projects here</p>
                  {editMode && (
                    <button
                      onClick={() => addItem('projects', {
                        title: '',
                        description: '',
                        techStack: [],
                        projectUrl: '',
                        startDate: '',
                        endDate: '',
                        isCurrent: false,
                      })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add First Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {(form.projects || []).map((proj, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-6 bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Project Title"
                          name={`proj-title-${i}`}
                          value={proj.title}
                          onChange={(e) => updateField('projects', e.target.value, i, 'title')}
                          disabled={!editMode}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project URL
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              name={`proj-projectUrl-${i}`}
                              value={proj.projectUrl || ''}
                              onChange={(e) => updateField('projects', e.target.value, i, 'projectUrl')}
                              disabled={!editMode}
                              className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                              placeholder="https://example.com/project"
                            />
                            {proj.projectUrl && (
                              <a 
                                href={proj.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <FaExternalLinkAlt />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <InputField
                            label="Description"
                            name={`proj-description-${i}`}
                            value={proj.description}
                            onChange={(e) => updateField('projects', e.target.value, i, 'description')}
                            disabled={!editMode}
                            textarea
                          />
                        </div>
                        <div className="md:col-span-2">
                          <TagInput
                            label="Technologies Used"
                            tags={proj.techStack || []}
                            onChange={(tags) => updateField('projects', { ...proj, techStack: tags }, i)}
                            disabled={!editMode}
                          />
                        </div>
                        <InputField
                          label="Start Date"
                          name={`proj-startDate-${i}`}
                          type="date"
                          value={proj.startDate ? proj.startDate.split('T')[0] : ''}
                          onChange={(e) => updateField('projects', e.target.value, i, 'startDate')}
                          disabled={!editMode}
                        />
                        {!proj.isCurrent ? (
                          <InputField
                            label="End Date"
                            name={`proj-endDate-${i}`}
                            type="date"
                            value={proj.endDate ? proj.endDate.split('T')[0] : ''}
                            onChange={(e) => updateField('projects', e.target.value, i, 'endDate')}
                            disabled={!editMode}
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="text-gray-700">Ongoing Project</span>
                          </div>
                        )}
                        {editMode && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`proj-current-${i}`}
                              checked={proj.isCurrent || false}
                              onChange={(e) => updateField('projects', { ...proj, isCurrent: e.target.checked }, i)}
                              className="mr-2"
                            />
                            <label htmlFor={`proj-current-${i}`} className="text-gray-700">
                              Currently working on this project
                            </label>
                          </div>
                        )}
                      </div>
                      {editMode && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => removeItem('projects', i)}
                            className="text-red-600 hover:text-red-800 font-medium flex items-center"
                          >
                            <FaTimes className="mr-1" /> Remove Project
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// InputField component
function InputField({ label, name, value, onChange, disabled = false, type = 'text', min, max, step, textarea = false, icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        {textarea ? (
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            rows={4}
            className={`block w-full rounded-lg border border-gray-300 ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`block w-full rounded-lg border border-gray-300 ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100`}
          />
        )}
      </div>
    </div>
  );
}

// SelectField component
function SelectField({ label, name, value, onChange, options = [], disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
      >
        <option value="">Select an option</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// SocialInput component
function SocialInput({ icon, label, name, value, onChange, disabled, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex rounded-lg shadow-sm">
        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
          {icon}
        </span>
        <input
          type="url"
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-grow min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        />
      </div>
    </div>
  );
}

// ResumeUpload component
function ResumeUpload({ currentUrl, onUpload, progress }) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
    
    onUpload(file);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
      >
        <FaFilePdf /> Upload New Resume
      </button>
      
      {progress > 0 && progress < 100 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading: {progress}%</p>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">PDF or Word document, max 5MB</p>
    </div>
  );
}

// TagInput component
function TagInput({ label, tags, onChange, disabled }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const val = inputValue.trim();
    if (!val || tags.includes(val)) return;
    onChange([...tags, val]);
    setInputValue('');
  };

  const handleRemove = (tag) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="text-gray-500 hover:text-red-600"
              >
                <FaTimes size={12} />
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add technology (e.g., React)"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FaPlus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}