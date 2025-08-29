"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiArrowRight, FiArrowLeft, FiX } from "react-icons/fi";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
const CompanyRegistrationModal = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [companyData, setCompanyData] = useState({
    name: "",
    logo: "",
    industry: "",
    hiringPolicies: "",
    website: "",
    location: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const steps = [
    { title: "Company Information", subtitle: "Tell us about your company" },
    { title: "Additional Details", subtitle: "Complete your company profile" },
  ];

  // ✅ Fetch company profile on open
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/company-profile"); // backend recruiter GET route
        if (res.data) {
          setCompanyData({
            name: res.data.name || "",
            logo: res.data.logo || "",
            industry: res.data.industry || "",
            hiringPolicies: res.data.hiringPolicies || "",
            website: res.data.website || "",
            location: res.data.location || ""
          });
        }
      } catch (err) {
        console.error("Error fetching company profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCompanyProfile();
    }
  }, [isOpen]);

  const nextStep = async () => {
    if (validateStep(step)) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        try {
          // ✅ Save/Update company profile
          const res = await api.post("/company-profile", companyData);
          
          router.push('/recruiter/dashboard'); // Redirect to dashboard after completion
          console.log("Saved company:", res.data);
          setIsOpen(false);
          setStep(0);
        } catch (err) {
          console.error("Error saving company profile", err);
          alert("Failed to save company profile");
        }
      }
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    switch (currentStep) {
      case 0:
        if (!companyData.name.trim()) newErrors.name = "Company name is required";
        if (!companyData.industry.trim()) newErrors.industry = "Industry is required";
        break;
      case 1:
        if (!companyData.website.trim()) {
          newErrors.website = "Website is required";
        } else if (!isValidUrl(companyData.website)) {
          newErrors.website = "Please enter a valid URL";
        }
        if (!companyData.location.trim()) newErrors.location = "Location is required";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setCompanyData({ ...companyData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-orange-200 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-800 p-6 rounded-2xl w-full max-w-2xl shadow-xl cursor-default relative overflow-hidden border-2 border-gray-800"
          >
            {/* Header with return button */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{steps[step].title}</h3>
                <p className="text-sm text-gray-600">{steps[step].subtitle}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="bg-[#262026] hover:scale-105 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                Return to Landing Page
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/50 rounded-full h-2.5 mb-6 border border-gray-300">
              <div 
                className="bg-[#262026] h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>

            {/* Step Content */}
            <div className="mb-6 min-h-[300px] overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Company Name *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={companyData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your company name"
                        />
                        {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Logo URL</label>
                        <input 
                          type="url" 
                          className="w-full p-2 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={companyData.logo}
                          onChange={(e) => handleInputChange('logo', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                        {companyData.logo && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Logo Preview:</p>
                            <img 
                              src={companyData.logo} 
                              alt="Company logo preview" 
                              className="h-12 object-contain border rounded-lg p-1 bg-white"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Industry *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={companyData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          placeholder="e.g. Technology, Healthcare, Finance"
                        />
                        {errors.industry && <p className="text-red-600 text-xs mt-1">{errors.industry}</p>}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Website *</label>
                        <input 
                          type="url" 
                          className="w-full p-2 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={companyData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourcompany.com"
                        />
                        {errors.website && <p className="text-red-600 text-xs mt-1">{errors.website}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Location *</label>
                        <input 
                          type="text" 
                          className="w-full p-2 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={companyData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g. San Francisco, CA"
                        />
                        {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Hiring Policies</label>
                        <textarea 
                          rows={4}
                          className="w-full p-2 rounded-lg bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#262026]"
                          value={companyData.hiringPolicies}
                          onChange={(e) => handleInputChange('hiringPolicies', e.target.value)}
                          placeholder="Describe your company's hiring policies, processes, and any specific requirements for candidates..."
                        ></textarea>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={step === 0}
                className={`flex items-center px-4 py-2 rounded-lg ${step === 0 ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'bg-orange-200 hover:bg-[#ffe589] text-gray-800'}`}
              >
                <FiArrowLeft className="mr-2" /> Back
              </button>
              
              <button
                onClick={nextStep}
                className="flex items-center bg-[#262026] hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {step === steps.length - 1 ? 'Complete Registration' : 'Next'} <FiArrowRight className="ml-2" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Example wrapper component to demonstrate the modal
const ExampleWrapper = () => {
  const [isOpen, setIsOpen] = useState(true); // Modal opens when page loads
  
  return (
    <div className="min-h-screen bg-orange-200 flex items-center justify-center p-4">
      <CompanyRegistrationModal isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Fallback content if modal is closed */}
      {!isOpen && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Company Registration Closed</h2>
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-[#262026] hover:scale-105 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            Reopen Registration
          </button>
        </div>
      )}
    </div>
  );
};

export default ExampleWrapper;