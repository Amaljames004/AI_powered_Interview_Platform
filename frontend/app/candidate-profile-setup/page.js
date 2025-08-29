"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useState, useEffect } from "react";
import {
  FiArrowRight,
  FiArrowLeft,
  FiUpload,
  FiCheck,
  FiX,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import api from "@/utils/axios";
import Link from "next/link";

const ExampleWrapper = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#fbd5d9]">
      <SpringModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

const SpringModal = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  // Initialize all state with proper defaults
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    willingToRelocate: false,
    noticePeriodDays: 0,
    expectedCTC: 0,
    currentCTC: 0,
    preferredLocations: [],
    jobTypePreference: "Full-time",
    remotePreference: false,
  });

  const [education, setEducation] = useState([
    {
      institution: "",
      degree: "",
      specialization: "",
      startDate: "",
      endDate: "",
      graduationYear: "",
      academicPercentage: "",
      gpa: "",
      backlogs: 0,
    },
  ]);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [experiences, setExperiences] = useState([
    {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrentJob: false,
      employmentType: "Full-time",
      description: "",
    },
  ]);

  const [certifications, setCertifications] = useState([
    {
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    },
  ]);

  const [projects, setProjects] = useState([
    {
      title: "",
      description: "",
      techStack: [],
      projectUrl: "",
      githubRepo: "",
      startDate: "",
      endDate: "",
    },
  ]);

  const [socialLinks, setSocialLinks] = useState({
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { title: "Upload Resume", subtitle: "Start by uploading your resume" },
    { title: "Personal Information", subtitle: "Tell us about yourself" },
    { title: "Education", subtitle: "Add your educational background" },
    { title: "Skills", subtitle: "List your skills and competencies" },
    { title: "Experience", subtitle: "Share your work experience" },
    { title: "Certifications", subtitle: "Add any relevant certifications" },
    { title: "Projects", subtitle: "Showcase your projects" },
    { title: "Social Links", subtitle: "Connect your professional profiles" },
  ];

  // Utility safe number conversion
  const toNumber = (val, fallback = null) => {
    if (val === null || val === undefined || val === "") return fallback;
    const num = Number(val);
    return isNaN(num) ? fallback : num;
  };

  // Safe array access utility
  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  // -------- Fetch Profile Data --------
  useEffect(() => {
    const checkProfileCompleteness = async () => {
      try {
        const { data } = await api.get("/candidate/check-profile");
        setProfileComplete(data.complete || false);

        if (!data.complete) {
          await fetchProfile();
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to check profile completeness:", err);
        await fetchProfile();
      }
    };

    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/candidate/profile");
        
        if (data) {
          // Update personal info with safe defaults
          setPersonalInfo(prev => ({
            ...prev,
            firstName: data.firstName || "",
            middleName: data.middleName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : "",
            gender: data.gender || "",
            willingToRelocate: Boolean(data.willingToRelocate),
            noticePeriodDays: toNumber(data.noticePeriodDays, 0),
            expectedCTC: toNumber(data.expectedCTC, 0),
            currentCTC: toNumber(data.currentCTC, 0),
            preferredLocations: safeArray(data.preferredLocations),
            jobTypePreference: data.jobTypePreference || "Full-time",
            remotePreference: Boolean(data.remotePreference),
          }));

          // Update education with safe defaults
          setEducation(
            safeArray(data.education).map(edu => ({
              institution: edu.institution || "",
              degree: edu.degree || "",
              specialization: edu.specialization || "",
              startDate: edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : "",
              endDate: edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : "",
              graduationYear: edu.graduationYear || "",
              academicPercentage: edu.academicPercentage || "",
              gpa: edu.gpa || "",
              backlogs: toNumber(edu.backlogs, 0),
            }))
          );

          // Update other arrays with safe defaults
          setSkills(safeArray(data.skills));
          
          setExperiences(
            safeArray(data.pastEmployers).map(exp => ({
              company: exp.company || "",
              position: exp.position || "",
              startDate: exp.startDate ? new Date(exp.startDate).toISOString().split("T")[0] : "",
              endDate: exp.endDate ? new Date(exp.endDate).toISOString().split("T")[0] : "",
              isCurrentJob: Boolean(exp.isCurrentJob),
              employmentType: exp.employmentType || "Full-time",
              description: exp.description || "",
            }))
          );

          setCertifications(
            safeArray(data.certifications).map(cert => ({
              name: cert.name || "",
              issuer: cert.issuer || "",
              issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split("T")[0] : "",
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split("T")[0] : "",
              credentialId: cert.credentialId || "",
              credentialUrl: cert.credentialUrl || "",
            }))
          );

          setProjects(
            safeArray(data.projects).map(proj => ({
              title: proj.title || "",
              description: proj.description || "",
              techStack: safeArray(proj.techStack),
              projectUrl: proj.projectUrl || "",
              githubRepo: proj.githubRepo || "",
              startDate: proj.startDate ? new Date(proj.startDate).toISOString().split("T")[0] : "",
              endDate: proj.endDate ? new Date(proj.endDate).toISOString().split("T")[0] : "",
            }))
          );

          setSocialLinks({
            githubUrl: data.githubUrl || "",
            linkedinUrl: data.linkedinUrl || "",
            portfolioUrl: data.portfolioUrl || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      checkProfileCompleteness();
    }
  }, [isOpen]);

  // -------- Submit Profile --------
  const submitProfile = async () => {
    try {
      setIsLoading(true);

      const payload = {
        ...personalInfo,
        noticePeriodDays: toNumber(personalInfo.noticePeriodDays, 0),
        expectedCTC: toNumber(personalInfo.expectedCTC, 0),
        currentCTC: toNumber(personalInfo.currentCTC, 0),
        education: education.map(edu => ({
          ...edu,
          graduationYear: toNumber(edu.graduationYear),
          academicPercentage: toNumber(edu.academicPercentage),
          gpa: toNumber(edu.gpa),
          backlogs: toNumber(edu.backlogs, 0),
        })),
        skills: safeArray(skills),
        pastEmployers: experiences,
        certifications: safeArray(certifications),
        projects: safeArray(projects),
        ...socialLinks,
      };

      await api.put("/candidate/profile", payload);

      if (resume) {
        const formData = new FormData();
        formData.append("resume", resume);
        await api.post("/candidate/upload/resume", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      router.push("/candidate/dashboard");
      
      
      setIsOpen(false);
    } catch (error) {
      console.error("Profile Update Error:", error.response?.data || error);
      if (error.response?.data?.errors) {
        alert(error.response.data.errors.join(", "));
      } else {
        alert(error.response?.data?.message || "Error saving profile ❌");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -------- Step Navigation --------
  const nextStep = () => {
    if (validateStep(step)) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        submitProfile();
      }
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // -------- Validation --------
  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        // Resume step is optional, no validation needed
        break;

      case 1:
        if (!personalInfo.firstName?.trim())
          newErrors.firstName = "First name is required";
        if (!personalInfo.lastName?.trim())
          newErrors.lastName = "Last name is required";
        if (!personalInfo.email?.trim())
          newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(personalInfo.email))
          newErrors.email = "Invalid email format";
        if (!personalInfo.phoneNumber?.trim())
          newErrors.phoneNumber = "Phone number is required";
        break;

      case 2:
        if (education.length === 0 || !education[0]?.institution?.trim())
          newErrors.institution = "Institution is required";
        if (education.length === 0 || !education[0]?.degree?.trim())
          newErrors.degree = "Degree is required";

        if (education[0]?.gpa && (toNumber(education[0].gpa) < 0 || toNumber(education[0].gpa) > 10))
          newErrors.gpa = "GPA must be between 0 and 10";

        if (education[0]?.academicPercentage && 
            (toNumber(education[0].academicPercentage) < 0 || toNumber(education[0].academicPercentage) > 100))
          newErrors.academicPercentage = "Percentage must be between 0 and 100";
        break;

      case 3:
        if (safeArray(skills).length === 0) 
          newErrors.skills = "Please add at least one skill";
        break;

      default:
        // Other steps are optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------- Helpers --------
  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !safeArray(skills).includes(trimmedSkill)) {
      setSkills([...safeArray(skills), trimmedSkill]);
      setNewSkill("");
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: "" }));
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(safeArray(skills).filter(skill => skill !== skillToRemove));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...safeArray(education)];
    if (!updatedEducation[index]) {
      updatedEducation[index] = {
        institution: "",
        degree: "",
        specialization: "",
        startDate: "",
        endDate: "",
        graduationYear: "",
        academicPercentage: "",
        gpa: "",
        backlogs: 0,
      };
    }
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setEducation(updatedEducation);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addEducation = () => {
    setEducation([
      ...safeArray(education),
      {
        institution: "",
        degree: "",
        specialization: "",
        startDate: "",
        endDate: "",
        graduationYear: "",
        academicPercentage: "",
        gpa: "",
        backlogs: 0,
      },
    ]);
  };

  const removeEducation = (index) => {
    if (safeArray(education).length > 1) {
      setEducation(safeArray(education).filter((_, i) => i !== index));
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...safeArray(experiences)];
    if (!updatedExperiences[index]) {
      updatedExperiences[index] = {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrentJob: false,
        employmentType: "Full-time",
        description: "",
      };
    }
    
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value };
    
    if (field === "isCurrentJob" && value) {
      updatedExperiences[index].endDate = "";
    }
    
    setExperiences(updatedExperiences);
  };

  const addExperience = () => {
    setExperiences([
      ...safeArray(experiences),
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrentJob: false,
        employmentType: "Full-time",
        description: "",
      },
    ]);
  };

  const removeExperience = (index) => {
    if (safeArray(experiences).length > 1) {
      setExperiences(safeArray(experiences).filter((_, i) => i !== index));
    }
  };

  const handleCertificationChange = (index, field, value) => {
    const updatedCertifications = [...safeArray(certifications)];
    if (!updatedCertifications[index]) {
      updatedCertifications[index] = {
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      };
    }
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value };
    setCertifications(updatedCertifications);
  };

  const addCertification = () => {
    setCertifications([
      ...safeArray(certifications),
      {
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      },
    ]);
  };

  const removeCertification = (index) => {
    if (safeArray(certifications).length > 1) {
      setCertifications(safeArray(certifications).filter((_, i) => i !== index));
    }
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...safeArray(projects)];
    if (!updatedProjects[index]) {
      updatedProjects[index] = {
        title: "",
        description: "",
        techStack: [],
        projectUrl: "",
        githubRepo: "",
        startDate: "",
        endDate: "",
      };
    }
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  const addProject = () => {
    setProjects([
      ...safeArray(projects),
      {
        title: "",
        description: "",
        techStack: [],
        projectUrl: "",
        githubRepo: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const removeProject = (index) => {
    if (safeArray(projects).length > 1) {
      setProjects(safeArray(projects).filter((_, i) => i !== index));
    }
  };

  const handleSocialLinkChange = (field, value) => {
    setSocialLinks({ ...socialLinks, [field]: value });
  };

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset errors
    setErrors(prev => ({ ...prev, resume: "" }));
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: "File must be < 5MB" }));
      return;
    }
    
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, resume: "Only PDF or Word documents allowed" }));
      return;
    }
    
    setResume(file);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:8000/parse-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const parsed = res.data;

      // Update form with parsed data, but don't overwrite existing data
      setPersonalInfo(prev => ({
        ...prev,
        phoneNumber: prev.phoneNumber || parsed.phone?.[0] || "",
        // Add other fields as needed
      }));

      // Only update skills if we don't have any yet
      if (safeArray(skills).length === 0 && safeArray(parsed.skills).length > 0) {
        setSkills(parsed.skills);
      }

      setSocialLinks(prev => ({
        ...prev,
        githubUrl: prev.githubUrl || parsed.links?.github_profiles?.[0] || "",
        portfolioUrl: prev.portfolioUrl || parsed.links?.portfolio?.[0] || "",
        linkedinUrl: prev.linkedinUrl || parsed.links?.linkedin?.[0] || "",
      }));

      // Move to next step
      setStep(1);
    } catch (err) {
      console.error("Resume parsing failed:", err);
      setErrors(prev => ({ 
        ...prev, 
        resume: "Failed to parse resume. Please continue with manual entry." 
      }));
    }
  };

  const addTechStackItem = (projectIndex, tech) => {
    const trimmedTech = tech.trim();
    if (!trimmedTech) return;
    
    const updatedProjects = [...safeArray(projects)];
    if (!updatedProjects[projectIndex]) {
      updatedProjects[projectIndex] = {
        title: "",
        description: "",
        techStack: [],
        projectUrl: "",
        githubRepo: "",
        startDate: "",
        endDate: "",
      };
    }
    
    if (!updatedProjects[projectIndex].techStack.includes(trimmedTech)) {
      updatedProjects[projectIndex].techStack = [
        ...safeArray(updatedProjects[projectIndex].techStack),
        trimmedTech
      ];
      setProjects(updatedProjects);
    }
  };

  const removeTechStackItem = (projectIndex, techIndex) => {
    const updatedProjects = [...safeArray(projects)];
    if (updatedProjects[projectIndex]) {
      updatedProjects[projectIndex].techStack = safeArray(updatedProjects[projectIndex].techStack)
        .filter((_, index) => index !== techIndex);
      setProjects(updatedProjects);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbd5d9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#262026] mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profileComplete) {
    return (
      <div className="min-h-screen bg-[#fbd5d9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md border-2 border-gray-800">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile is Complete!</h2>
          <p className="text-gray-600 mb-6">Your candidate profile has already been completed. You can update it anytime from your dashboard.</p>
         
          <Link href="candidate/dashboard"
           
            className="bg-[#262026] hover:scale-105 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
          >
            Return to Dashboard
          </Link>
       
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-orange-200 backdrop-blur p-4 md:p-8 fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-800 p-4 md:p-6 rounded-2xl w-full max-w-4xl shadow-xl cursor-default relative overflow-hidden border-2 border-gray-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Header with return button */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                  {steps[step]?.title || "Profile Setup"}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {steps[step]?.subtitle || "Complete your profile"}
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-[#262026] hover:scale-105 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center text-sm"
              >
                Return to Landing Page
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-[#262026] h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>

            {/* Step Content */}
            <div className="mb-6 min-h-[300px] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 text-center bg-gray-50">
                        <FiUpload className="mx-auto text-3xl mb-2 text-gray-700" />
                        <p className="mb-4 text-gray-700">Drag & drop your resume here or</p>
                        <label htmlFor="resume-upload" className="cursor-pointer bg-[#262026] text-white px-4 py-2 rounded-lg font-medium inline-block">
                          Browse Files
                        </label>
                        <input 
                          id="resume-upload" 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                        {resume && (
                          <div className="mt-4 flex items-center justify-center">
                            <FiCheck className="text-green-600 mr-2" />
                            <span className="text-gray-700">{resume.name}</span>
                          </div>
                        )}
                        <p className="text-xs mt-2 text-gray-600">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                        {errors.resume && <p className="text-red-600 text-xs mt-2">{errors.resume}</p>}
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        <p>You can skip this step and upload your resume later</p>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">First Name *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={personalInfo.firstName || ""}
                          onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                        />
                        {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Middle Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={personalInfo.middleName || ""}
                          onChange={(e) => handlePersonalInfoChange('middleName', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Last Name *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={personalInfo.lastName || ""}
                          onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                        />
                        {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
                        <input 
                          type="email" 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={personalInfo.email || ""}
                          onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                          disabled
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number *</label>
                        <input 
                          type="tel" 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={personalInfo.phoneNumber || ""}
                          onChange={(e) => handlePersonalInfoChange('phoneNumber', e.target.value)}
                        />
                        {errors.phoneNumber && <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Date of Birth</label>
                        <input 
                          type="date" 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={personalInfo.dateOfBirth || ""}
                          onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Gender</label>
                        <select 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={personalInfo.gender || ""}
                          onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Current CTC (₹)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                            value={personalInfo.currentCTC || 0}
                            onChange={(e) => handlePersonalInfoChange('currentCTC', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Expected CTC (₹)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                            value={personalInfo.expectedCTC || 0}
                            onChange={(e) => handlePersonalInfoChange('expectedCTC', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Notice Period (Days)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                            value={personalInfo.noticePeriodDays || 0}
                            onChange={(e) => handlePersonalInfoChange('noticePeriodDays', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Job Type Preference</label>
                          <select 
                            className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                            value={personalInfo.jobTypePreference || "Full-time"}
                            onChange={(e) => handlePersonalInfoChange('jobTypePreference', e.target.value)}
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="willingToRelocate"
                            className="mr-2 h-4 w-4 text-[#262026] focus:ring-[#262026] border-gray-300 rounded"
                            checked={personalInfo.willingToRelocate || false}
                            onChange={(e) => handlePersonalInfoChange('willingToRelocate', e.target.checked)}
                          />
                          <label htmlFor="willingToRelocate" className="text-sm text-gray-700">Willing to Relocate</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="remotePreference"
                            className="mr-2 h-4 w-4 text-[#262026] focus:ring-[#262026] border-gray-300 rounded"
                            checked={personalInfo.remotePreference || false}
                            onChange={(e) => handlePersonalInfoChange('remotePreference', e.target.checked)}
                          />
                          <label htmlFor="remotePreference" className="text-sm text-gray-700">Prefer Remote Work</label>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-700">Preferred Locations (comma separated)</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={safeArray(personalInfo.preferredLocations).join(', ')}
                          onChange={(e) => handlePersonalInfoChange('preferredLocations', e.target.value.split(',').map(loc => loc.trim()))}
                          placeholder="e.g. Bangalore, Mumbai, Remote"
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      {safeArray(education).map((edu, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-300 relative">
                          {safeArray(education).length > 1 && (
                            <button 
                              onClick={() => removeEducation(index)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                          <h4 className="font-medium mb-3 text-gray-800">Education {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-1 text-gray-700">Institution *</label>
                              <input 
                                type="text" 
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.institution || ""}
                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                              />
                              {errors.institution && index === 0 && <p className="text-red-600 text-xs mt-1">{errors.institution}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">Degree *</label>
                              <input 
                                type="text" 
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.degree || ""}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              />
                              {errors.degree && index === 0 && <p className="text-red-600 text-xs mt-1">{errors.degree}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">Specialization</label>
                              <input 
                                type="text" 
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.specialization || ""}
                                onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                              <input 
                                type="date" 
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.startDate || ""}
                                onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                              <input 
                                type="date" 
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.endDate || ""}
                                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">Graduation Year</label>
                              <input 
                                type="number" 
                                min="1900" 
                                max={new Date().getFullYear() + 10}
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.graduationYear || ""}
                                onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">Academic Percentage</label>
                              <input 
                                type="number" 
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.academicPercentage || ""}
                                onChange={(e) => handleEducationChange(index, 'academicPercentage', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">GPA</label>
                              <input 
                                type="number" 
                                step="0.01"
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.gpa || ""}
                                onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">Backlogs</label>
                              <input 
                                type="number" 
                                min="0"
                                className="w-full p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={edu.backlogs || 0}
                                onChange={(e) => handleEducationChange(index, 'backlogs', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={addEducation}
                        className="flex items-center gap-2 px-4 py-2 bg-[#262026] text-white rounded-lg hover:scale-105 transition"
                      >
                        <FiPlus /> Add Education
                      </button>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Enter a skill"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                        />
                        <button 
                          onClick={addSkill}
                          className="px-4 py-2 bg-[#262026] text-white rounded-lg hover:scale-105 transition"
                        >
                          Add
                        </button>
                      </div>
                      {errors.skills && <p className="text-red-600 text-xs">{errors.skills}</p>}
                      <div className="flex flex-wrap gap-2">
                        {safeArray(skills).map((skill, idx) => (
                          <span 
                            key={idx}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            {skill}
                            <FiX 
                              className="cursor-pointer hover:text-red-600"
                              onClick={() => removeSkill(skill)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      {safeArray(experiences).map((exp, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-300 relative">
                          {safeArray(experiences).length > 1 && (
                            <button 
                              onClick={() => removeExperience(index)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                          <h4 className="font-medium mb-3 text-gray-800">Experience {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                              type="text"
                              placeholder="Company"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={exp.company || ""}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            />
                            <input 
                              type="text"
                              placeholder="Position"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={exp.position || ""}
                              onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            />
                            <input 
                              type="date"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={exp.startDate || ""}
                              onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            />
                            {!exp.isCurrentJob && (
                              <input 
                                type="date"
                                className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={exp.endDate || ""}
                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                              />
                            )}
                            <div className="flex items-center gap-2 col-span-2">
                              <input 
                                type="checkbox"
                                checked={exp.isCurrentJob || false}
                                onChange={(e) => handleExperienceChange(index, 'isCurrentJob', e.target.checked)}
                                className="focus:ring-[#262026] text-[#262026]"
                              />
                              <label className="text-sm text-gray-700">Current Job</label>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1 text-gray-700">Employment Type</label>
                              <select 
                                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                value={exp.employmentType || "Full-time"}
                                onChange={(e) => handleExperienceChange(index, 'employmentType', e.target.value)}
                              >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                              <textarea
                                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                placeholder="Job description"
                                rows={3}
                                value={exp.description || ""}
                                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={addExperience}
                        className="flex items-center gap-2 px-4 py-2 bg-[#262026] text-white rounded-lg hover:scale-105 transition"
                      >
                        <FiPlus /> Add Experience
                      </button>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4">
                      {safeArray(certifications).map((cert, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-300 relative">
                          {safeArray(certifications).length > 1 && (
                            <button 
                              onClick={() => removeCertification(index)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                          <h4 className="font-medium mb-3 text-gray-800">Certification {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                              type="text"
                              placeholder="Name"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={cert.name || ""}
                              onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                            />
                            <input 
                              type="text"
                              placeholder="Issuer"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={cert.issuer || ""}
                              onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                            />
                            <input 
                              type="date"
                              placeholder="Issue Date"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={cert.issueDate || ""}
                              onChange={(e) => handleCertificationChange(index, 'issueDate', e.target.value)}
                            />
                            <input 
                              type="date"
                              placeholder="Expiry Date"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={cert.expiryDate || ""}
                              onChange={(e) => handleCertificationChange(index, 'expiryDate', e.target.value)}
                            />
                            <input 
                              type="text"
                              placeholder="Credential ID"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={cert.credentialId || ""}
                              onChange={(e) => handleCertificationChange(index, 'credentialId', e.target.value)}
                            />
                            <input 
                              type="url"
                              placeholder="Credential URL"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={cert.credentialUrl || ""}
                              onChange={(e) => handleCertificationChange(index, 'credentialUrl', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={addCertification}
                        className="flex items-center gap-2 px-4 py-2 bg-[#262026] text-white rounded-lg hover:scale-105 transition"
                      >
                        <FiPlus /> Add Certification
                      </button>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-4">
                      {safeArray(projects).map((proj, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-300 relative">
                          {safeArray(projects).length > 1 && (
                            <button 
                              onClick={() => removeProject(index)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                          <h4 className="font-medium mb-3 text-gray-800">Project {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                              type="text"
                              placeholder="Title"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={proj.title || ""}
                              onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                            />
                            <div className="md:col-span-2">
                              <textarea
                                placeholder="Description"
                                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                rows={3}
                                value={proj.description || ""}
                                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <div className="flex gap-2 flex-wrap mb-2">
                                {safeArray(proj.techStack).map((tech, tidx) => (
                                  <span 
                                    key={tidx}
                                    className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2"
                                  >
                                    {tech}
                                    <FiX 
                                      onClick={() => removeTechStackItem(index, tidx)}
                                      className="cursor-pointer hover:text-red-600"
                                    />
                                  </span>
                                ))}
                              </div>
                              <input 
                                type="text"
                                placeholder="Add technology and press Enter"
                                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTechStackItem(index, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </div>
                            <input 
                              type="url"
                              placeholder="Project URL"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={proj.projectUrl || ""}
                              onChange={(e) => handleProjectChange(index, 'projectUrl', e.target.value)}
                            />
                            <input 
                              type="url"
                              placeholder="GitHub Repo"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={proj.githubRepo || ""}
                              onChange={(e) => handleProjectChange(index, 'githubRepo', e.target.value)}
                            />
                            <input 
                              type="date"
                              placeholder="Start Date"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={proj.startDate || ""}
                              onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                            />
                            <input 
                              type="date"
                              placeholder="End Date"
                              className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                              value={proj.endDate || ""}
                              onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={addProject}
                        className="flex items-center gap-2 px-4 py-2 bg-[#262026] text-white rounded-lg hover:scale-105 transition"
                      >
                        <FiPlus /> Add Project
                      </button>
                    </div>
                  )}

                  {step === 7 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">GitHub URL</label>
                        <input 
                          type="url"
                          placeholder="https://github.com/username"
                          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={socialLinks.githubUrl || ""}
                          onChange={(e) => handleSocialLinkChange('githubUrl', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">LinkedIn URL</label>
                        <input 
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={socialLinks.linkedinUrl || ""}
                          onChange={(e) => handleSocialLinkChange('linkedinUrl', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Portfolio URL</label>
                        <input 
                          type="url"
                          placeholder="https://yourportfolio.com"
                          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={socialLinks.portfolioUrl || ""}
                          onChange={(e) => handleSocialLinkChange('portfolioUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between items-center mt-6">
              {step > 0 ? (
                <button 
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <FiArrowLeft /> Back
                </button>
              ) : (
                <div></div>
              )}

              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-2 bg-[#262026] text-white rounded-lg hover:scale-105 transition"
              >
                {step < steps.length - 1 ? <>Next <FiArrowRight /></> : <>Submit <FiCheck /></>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExampleWrapper;