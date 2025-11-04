
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
  FaMapMarkerAlt,
  FaBriefcase
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const tabs = [
  { key: 'personal', label: 'Personal Info', icon: <FaUser className="mr-2" /> },
  { key: 'education', label: 'Education', icon: <FaGraduationCap className="mr-2" /> },
  { key: 'skills', label: 'Skills', icon: <FaCode className="mr-2" /> },
  { key: 'experience', label: 'Experience', icon: <FaBriefcase className="mr-2" /> },
  { key: 'resume', label: 'Resume & Links', icon: <FaFilePdf className="mr-2" /> },
  { key: 'address', label: 'Address', icon: <FaMapMarkerAlt className="mr-2" /> },
  { key: 'certifications', label: 'Certifications', icon: <FaFileWord className="mr-2" /> },
  { key: 'projects', label: 'Projects', icon: <FaGlobe className="mr-2" /> },
];

export default function AdvancedProfile() {
  const [candidate, setCandidate] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    education: [{
      institution: "",
      degree: "",
      specialization: "",
      startDate: "",
      endDate: "",
      graduationYear: "",
      academicPercentage: "",
      gpa: "",
      backlogs: 0,
    }],
    skills: [],
    experiences: [{
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrentJob: false,
      employmentType: "Full-time",
      description: "",
    }],
    certifications: [{
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    }],
    projects: [{
      title: "",
      description: "",
      techStack: [],
      projectUrl: "",
      githubRepo: "",
      startDate: "",
      endDate: "",
    }],
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    },
    willingToRelocate: false,
    noticePeriodDays: 0,
    expectedCTC: 0,
    currentCTC: 0,
    preferredLocations: [],
    jobTypePreference: "Full-time",
    remotePreference: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [error, setError] = useState(null);
  const skillInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/candidate/profile");
        const data = res.data;
        
        // Transform API data to match form structure
        const transformedData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          gender: data.gender || "",
          education: data.education?.map(edu => ({
            institution: edu.institution || "",
            degree: edu.degree || "",
            specialization: edu.specialization || "",
            startDate: edu.startDate ? edu.startDate.split('T')[0] : "",
            endDate: edu.endDate ? edu.endDate.split('T')[0] : "",
            graduationYear: edu.graduationYear || "",
            academicPercentage: edu.academicPercentage || "",
            gpa: edu.gpa || "",
            backlogs: edu.backlogs || 0,
          })) || [{
            institution: "",
            degree: "",
            specialization: "",
            startDate: "",
            endDate: "",
            graduationYear: "",
            academicPercentage: "",
            gpa: "",
            backlogs: 0,
          }],
          skills: data.skills || [],
          experiences: data.pastEmployers?.map(exp => ({
            company: exp.company || "",
            position: exp.position || "",
            startDate: exp.startDate ? exp.startDate.split('T')[0] : "",
            endDate: exp.endDate ? exp.endDate.split('T')[0] : "",
            isCurrentJob: exp.isCurrentJob || false,
            employmentType: exp.employmentType || "Full-time",
            description: exp.description || "",
          })) || [{
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            isCurrentJob: false,
            employmentType: "Full-time",
            description: "",
          }],
          certifications: data.certifications?.map(cert => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            issueDate: cert.issueDate ? cert.issueDate.split('T')[0] : "",
            expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : "",
            credentialId: cert.credentialId || "",
            credentialUrl: cert.credentialUrl || "",
          })) || [{
            name: "",
            issuer: "",
            issueDate: "",
            expiryDate: "",
            credentialId: "",
            credentialUrl: "",
          }],
          projects: data.projects?.map(proj => ({
            title: proj.title || "",
            description: proj.description || "",
            techStack: proj.techStack || [],
            projectUrl: proj.projectUrl || "",
            githubRepo: proj.githubRepo || "",
            startDate: proj.startDate ? proj.startDate.split('T')[0] : "",
            endDate: proj.endDate ? proj.endDate.split('T')[0] : "",
          })) || [{
            title: "",
            description: "",
            techStack: [],
            projectUrl: "",
            githubRepo: "",
            startDate: "",
            endDate: "",
          }],
          githubUrl: data.githubUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          portfolioUrl: data.portfolioUrl || "",
          address: data.address || {
            street: "",
            city: "",
            state: "",
            country: "",
            pincode: ""
          },
          willingToRelocate: data.willingToRelocate || false,
          noticePeriodDays: data.noticePeriodDays || 0,
          expectedCTC: data.expectedCTC || 0,
          currentCTC: data.currentCTC || 0,
          preferredLocations: data.preferredLocations || [],
          jobTypePreference: data.jobTypePreference || "Full-time",
          remotePreference: data.remotePreference || false,
          resumeUrl: data.resumeUrl || "",
          resumeText: data.resumeText || "",
        };

        setCandidate(transformedData);
        setForm(transformedData);
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
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSkillAdd = () => {
    const skill = newSkill.trim();
    if (!skill || (form.skills || []).includes(skill)) return;
    setForm(prev => ({ ...prev, skills: [...(prev.skills || []), skill] }));
    setNewSkill("");
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
      // Transform data back to API format
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        education: form.education,
        skills: form.skills,
        pastEmployers: form.experiences,
        certifications: form.certifications,
        projects: form.projects,
        githubUrl: form.githubUrl,
        linkedinUrl: form.linkedinUrl,
        portfolioUrl: form.portfolioUrl,
        address: form.address,
        willingToRelocate: form.willingToRelocate,
        noticePeriodDays: Number(form.noticePeriodDays) || 0,
        expectedCTC: Number(form.expectedCTC) || 0,
        currentCTC: Number(form.currentCTC) || 0,
        preferredLocations: form.preferredLocations,
        jobTypePreference: form.jobTypePreference,
        remotePreference: form.remotePreference,
        resumeText: form.resumeText,
      };

      const { data } = await api.put('/candidate/profile', payload);
      setCandidate(data);
      setForm(data);
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

      setForm(prev => ({
        ...prev,
        resumeText: res.data.resumeText,
        resumeUrl: res.data.url || prev.resumeUrl,
      }));

      setUploadProgress(0);
    } catch (err) {
      setError("Failed to upload or process resume");
      setUploadProgress(0);
    }
  };

  const addTechStackItem = (index, tech) => {
    const techValue = tech.trim();
    if (!techValue) return;
    
    setForm(prev => {
      const updatedProjects = [...prev.projects];
      if (!updatedProjects[index].techStack.includes(techValue)) {
        updatedProjects[index].techStack = [...updatedProjects[index].techStack, techValue];
      }
      return { ...prev, projects: updatedProjects };
    });
  };

  const removeTechStackItem = (projectIndex, techIndex) => {
    setForm(prev => {
      const updatedProjects = [...prev.projects];
      updatedProjects[projectIndex].techStack = updatedProjects[projectIndex].techStack.filter((_, idx) => idx !== techIndex);
      return { ...prev, projects: updatedProjects };
    });
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
                label="First Name" 
                name="firstName" 
                value={form.firstName} 
                onChange={handleInputChange} 
                disabled={!editMode}
                icon={<FaUser className="text-gray-400" />}
              />
              <InputField 
                label="Last Name" 
                name="lastName" 
                value={form.lastName} 
                onChange={handleInputChange} 
                disabled={!editMode}
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
                value={form.dateOfBirth}
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
              <InputField
                label="Notice Period (days)"
                name="noticePeriodDays"
                type="number"
                value={form.noticePeriodDays}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <InputField
                label="Expected CTC"
                name="expectedCTC"
                type="number"
                value={form.expectedCTC}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <InputField
                label="Current CTC"
                name="currentCTC"
                type="number"
                value={form.currentCTC}
                onChange={handleInputChange}
                disabled={!editMode}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="willingToRelocate"
                  name="willingToRelocate"
                  checked={form.willingToRelocate}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="mr-2"
                />
                <label htmlFor="willingToRelocate" className="text-gray-700">
                  Willing to relocate
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remotePreference"
                  name="remotePreference"
                  checked={form.remotePreference}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="mr-2"
                />
                <label htmlFor="remotePreference" className="text-gray-700">
                  Prefer remote work
                </label>
              </div>
              <SelectField
                label="Job Type Preference"
                name="jobTypePreference"
                value={form.jobTypePreference}
                onChange={handleInputChange}
                options={['Full-time', 'Part-time', 'Contract', 'Internship']}
                disabled={!editMode}
              />
            </div>
          )}

          {/* Education */}
          {activeTab === 'education' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaGraduationCap className="mr-2 text-indigo-600" />
                  Education
                </h2>
                {editMode && (
                  <button
                    onClick={() => addItem('education', {
                      institution: "",
                      degree: "",
                      specialization: "",
                      startDate: "",
                      endDate: "",
                      graduationYear: "",
                      academicPercentage: "",
                      gpa: "",
                      backlogs: 0,
                    })}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus /> Add Education
                  </button>
                )}
              </div>

              {(form.education || []).length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <FaGraduationCap className="mx-auto text-3xl text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No education added</h3>
                  <p className="text-gray-500 mb-4">Add your educational background here</p>
                  {editMode && (
                    <button
                      onClick={() => addItem('education', {
                        institution: "",
                        degree: "",
                        specialization: "",
                        startDate: "",
                        endDate: "",
                        graduationYear: "",
                        academicPercentage: "",
                        gpa: "",
                        backlogs: 0,
                      })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add First Education
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {(form.education || []).map((edu, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-6 bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Institution"
                          name={`edu-institution-${i}`}
                          value={edu.institution}
                          onChange={(e) => updateField('education', e.target.value, i, 'institution')}
                          disabled={!editMode}
                          icon={<FaGraduationCap className="text-gray-400" />}
                        />
                        <InputField
                          label="Degree"
                          name={`edu-degree-${i}`}
                          value={edu.degree}
                          onChange={(e) => updateField('education', e.target.value, i, 'degree')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Specialization"
                          name={`edu-specialization-${i}`}
                          value={edu.specialization}
                          onChange={(e) => updateField('education', e.target.value, i, 'specialization')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Start Date"
                          name={`edu-startDate-${i}`}
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => updateField('education', e.target.value, i, 'startDate')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="End Date"
                          name={`edu-endDate-${i}`}
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => updateField('education', e.target.value, i, 'endDate')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Graduation Year"
                          name={`edu-graduationYear-${i}`}
                          type="number"
                          min={1900}
                          max={new Date().getFullYear() + 10}
                          value={edu.graduationYear}
                          onChange={(e) => updateField('education', e.target.value, i, 'graduationYear')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Academic % or GPA"
                          name={`edu-academicPercentage-${i}`}
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          value={edu.academicPercentage}
                          onChange={(e) => updateField('education', e.target.value, i, 'academicPercentage')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="GPA"
                          name={`edu-gpa-${i}`}
                          type="number"
                          min={0}
                          max={10}
                          step="0.1"
                          value={edu.gpa}
                          onChange={(e) => updateField('education', e.target.value, i, 'gpa')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Backlogs"
                          name={`edu-backlogs-${i}`}
                          type="number"
                          min={0}
                          value={edu.backlogs}
                          onChange={(e) => updateField('education', e.target.value, i, 'backlogs')}
                          disabled={!editMode}
                        />
                      </div>
                      {editMode && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => removeItem('education', i)}
                            className="text-red-600 hover:text-red-800 font-medium flex items-center"
                          >
                            <FaTimes className="mr-1" /> Remove Education
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
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
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
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

          {/* Experience */}
          {activeTab === 'experience' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaBriefcase className="mr-2 text-indigo-600" />
                  Work Experience
                </h2>
                {editMode && (
                  <button
                    onClick={() => addItem('experiences', {
                      company: "",
                      position: "",
                      startDate: "",
                      endDate: "",
                      isCurrentJob: false,
                      employmentType: "Full-time",
                      description: "",
                    })}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus /> Add Experience
                  </button>
                )}
              </div>

              {(form.experiences || []).length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                  <FaBriefcase className="mx-auto text-3xl text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">No experience added</h3>
                  <p className="text-gray-500 mb-4">Add your work experience here</p>
                  {editMode && (
                    <button
                      onClick={() => addItem('experiences', {
                        company: "",
                        position: "",
                        startDate: "",
                        endDate: "",
                        isCurrentJob: false,
                        employmentType: "Full-time",
                        description: "",
                      })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add First Experience
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {(form.experiences || []).map((exp, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-6 bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Company"
                          name={`exp-company-${i}`}
                          value={exp.company}
                          onChange={(e) => updateField('experiences', e.target.value, i, 'company')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Position"
                          name={`exp-position-${i}`}
                          value={exp.position}
                          onChange={(e) => updateField('experiences', e.target.value, i, 'position')}
                          disabled={!editMode}
                        />
                        <InputField
                          label="Start Date"
                          name={`exp-startDate-${i}`}
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateField('experiences', e.target.value, i, 'startDate')}
                          disabled={!editMode}
                        />
                        {!exp.isCurrentJob ? (
                          <InputField
                            label="End Date"
                            name={`exp-endDate-${i}`}
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => updateField('experiences', e.target.value, i, 'endDate')}
                            disabled={!editMode}
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="text-gray-700">Current Job</span>
                          </div>
                        )}
                        <SelectField
                          label="Employment Type"
                          name={`exp-employmentType-${i}`}
                          value={exp.employmentType}
                          onChange={(e) => updateField('experiences', e.target.value, i, 'employmentType')}
                          options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']}
                          disabled={!editMode}
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`exp-current-${i}`}
                            checked={exp.isCurrentJob || false}
                            onChange={(e) => updateField('experiences', { ...exp, isCurrentJob: e.target.checked }, i)}
                            disabled={!editMode}
                            className="mr-2"
                          />
                          <label htmlFor={`exp-current-${i}`} className="text-gray-700">
                            Current Job
                          </label>
                        </div>
                        <div className="md:col-span-2">
                          <InputField
                            label="Description"
                            name={`exp-description-${i}`}
                            value={exp.description}
                            onChange={(e) => updateField('experiences', e.target.value, i, 'description')}
                            disabled={!editMode}
                            textarea
                          />
                        </div>
                      </div>
                      {editMode && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => removeItem('experiences', i)}
                            className="text-red-600 hover:text-red-800 font-medium flex items-center"
                          >
                            <FaTimes className="mr-1" /> Remove Experience
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
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
                  <SocialInput
                    icon={<FaGlobe className="text-green-600" />}
                    label="Portfolio Website"
                    name="portfolioUrl"
                    value={form.portfolioUrl || ''}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="https://yourportfolio.com"
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
                label="State"
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
                label="Pincode"
                name="pincode"
                type="number"
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
                    onClick={() =>
                      addItem('certifications', {
                        name: "",
                        issuer: "",
                        issueDate: "",
                        expiryDate: "",
                        credentialId: "",
                        credentialUrl: "",
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus /> Add Certification
                  </button>
                )}
              </div>

              {(form.certifications || []).map((cert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-6 mb-4 bg-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Name"
                      value={cert.name}
                      onChange={(e) => updateField('certifications', e.target.value, i, 'name')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="Issuer"
                      value={cert.issuer}
                      onChange={(e) => updateField('certifications', e.target.value, i, 'issuer')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="Issue Date"
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) => updateField('certifications', e.target.value, i, 'issueDate')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="Expiry Date"
                      type="date"
                      value={cert.expiryDate}
                      onChange={(e) => updateField('certifications', e.target.value, i, 'expiryDate')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="Credential ID"
                      value={cert.credentialId}
                      onChange={(e) => updateField('certifications', e.target.value, i, 'credentialId')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="Credential URL"
                      value={cert.credentialUrl}
                      onChange={(e) => updateField('certifications', e.target.value, i, 'credentialUrl')}
                      disabled={!editMode}
                    />
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
                    onClick={() =>
                      addItem('projects', {
                        title: "",
                        description: "",
                        techStack: [],
                        projectUrl: "",
                        githubRepo: "",
                        startDate: "",
                        endDate: "",
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FaPlus /> Add Project
                  </button>
                )}
              </div>

              {(form.projects || []).map((proj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-6 mb-4 bg-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Title"
                      value={proj.title}
                      onChange={(e) => updateField('projects', e.target.value, i, 'title')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="Project URL"
                      value={proj.projectUrl}
                      onChange={(e) => updateField('projects', e.target.value, i, 'projectUrl')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="GitHub Repo"
                      value={proj.githubRepo}
                      onChange={(e) => updateField('projects', e.target.value, i, 'githubRepo')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="Start Date"
                      type="date"
                      value={proj.startDate}
                      onChange={(e) => updateField('projects', e.target.value, i, 'startDate')}
                      disabled={!editMode}
                    />
                    <InputField
                      label="End Date"
                      type="date"
                      value={proj.endDate}
                      onChange={(e) => updateField('projects', e.target.value, i, 'endDate')}
                      disabled={!editMode}
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label="Description"
                        textarea
                        value={proj.description}
                        onChange={(e) => updateField('projects', e.target.value, i, 'description')}
                        disabled={!editMode}
                      />
                    </div>

                    {/* Tech Stack */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Tech Stack
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {proj.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            {tech}
                            {editMode && (
                              <button
                                onClick={() => removeTechStackItem(i, idx)}
                                className="text-red-500"
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {editMode && (
                        <input
                          type="text"
                          placeholder="Add technology"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTechStackItem(i, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                        />
                      )}
                    </div>
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
      </div>
    </div>
  );
}

/* --------------------- Reusable Components ------------------- */
function InputField({ label, icon, textarea, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
        {icon && <span className="mr-2">{icon}</span>}
        {textarea ? (
          <textarea
            {...props}
            className="w-full border-none focus:ring-0 focus:outline-none resize-y"
          />
        ) : (
          <input
            {...props}
            className="w-full border-none focus:ring-0 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function SocialInput({ icon, label, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
        {icon && <span className="mr-2">{icon}</span>}
        <input
          {...props}
          className="w-full border-none focus:ring-0 focus:outline-none"
        />
      </div>
    </div>
  );
}

function ResumeUpload({ onUpload, progress }) {
  return (
    <div>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => onUpload(e.target.files[0])}
        className="mb-2"
      />
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
