"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { uploadToImgBB } from "../../lib/imageUpload";
import { updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebaseClient";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { User, Mail, MapPin, Phone, Briefcase, Award, Save, ArrowLeft, Camera, Loader2, CheckCircle, AlertCircle, Plus, X, GraduationCap, Code, Calendar, Globe } from "lucide-react";
import Link from "next/link";
import Avatar from "../../components/common/Avatar";
import { API_BASE } from "../../lib/apiClient";
import apiClient from "../../lib/apiClient";

export default function EditProfilePage() {
    const { user, role, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const apiBase = API_BASE;

    const [formData, setFormData] = useState({
        displayName: "",
        title: "",
        location: "",
        phone: "",
        bio: "",
        skills: "",
        photoURL: "",
        experience: [],
        education: [],
        projects: [],
        certificates: [],
        portfolioUrl: "",
        linkedin: "",
        github: "",
        twitter: "",
        website: ""
    });
    const [fetching, setFetching] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/signin");
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchUserProfile = useCallback(async () => {
        try {
            const { data: json } = await apiClient.get(`/api/auth/profile/${user.uid}`);
            if (json.success) {
                const userData = json.data;
                setFormData({
                    displayName: userData.displayName || "",
                    title: userData.title || "",
                    location: userData.location || "",
                    phone: userData.phone || "",
                    bio: userData.bio || "",
                    skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills || "",
                    photoURL: userData.photoURL || user?.photoURL || "",
                    experience: userData.experience || [],
                    education: userData.education || [],
                    projects: userData.projects || [],
                    certificates: userData.certificates || [],
                    portfolioUrl: userData.portfolioUrl || "",
                    linkedin: userData.linkedin || "",
                    github: userData.github || "",
                    twitter: userData.twitter || "",
                    website: userData.website || ""
                });
            }
        } catch (err) {
            if (err.message !== "User not found") {
                console.error("Fetch profile error:", err);
                setError("Failed to load profile data");
            }
        } finally {
            setFetching(false);
        }
    }, [user?.uid, user?.photoURL]);

    useEffect(() => {
        if (user?.uid) {
            fetchUserProfile();
        }
    }, [user?.uid, fetchUserProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Experience handlers
    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, { company: "", position: "", startDate: "", endDate: "", description: "" }]
        }));
    };

    const updateExperience = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
        }));
    };

    const removeExperience = (index) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    // Education handlers
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" }]
        }));
    };

    const updateEducation = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
        }));
    };

    const removeEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    // Projects handlers
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { name: "", description: "", technologies: "", link: "", image: "" }]
        }));
    };

    const updateProject = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((proj, i) => i === index ? { ...proj, [field]: value } : proj)
        }));
    };

    const removeProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    // Certificates handlers
    const addCertificate = () => {
        setFormData(prev => ({
            ...prev,
            certificates: [...prev.certificates, { name: "", issuer: "", date: "", credentialId: "", image: "" }]
        }));
    };

    const updateCertificate = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            certificates: prev.certificates.map((cert, i) => i === index ? { ...cert, [field]: value } : cert)
        }));
    };

    const removeCertificate = (index) => {
        setFormData(prev => ({
            ...prev,
            certificates: prev.certificates.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const { url: uploadedUrl, error: uploadError } = await uploadToImgBB(file);

            if (uploadedUrl) {
                setFormData(prev => ({ ...prev, photoURL: uploadedUrl }));
                setSuccess("Image uploaded successfully!");

                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { photoURL: uploadedUrl });
                    await refreshUser();
                }
            } else {
                setError(uploadError || "Failed to upload image");
            }
        } catch (err) {
            console.error("Image upload error:", err);
            setError("An error occurred during upload");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError("");
        setSuccess("");

        try {
            const processedData = {
                ...formData,
                skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== "")
            };

            const { data: json } = await apiClient.put(`/api/auth/profile/${user.uid}`, processedData);
            if (json.success) {
                setSuccess("Profile updated successfully!");
                setTimeout(() => router.push("/profile"), 1500);
            } else {
                setError(json.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setError("An error occurred during update");
        } finally {
            setUpdating(false);
        }
    };

    if (authLoading || fetching) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfdfe]">
            <Navbar />

            <main className="pt-32 pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <Link href="/profile" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-4 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Profile
                            </Link>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
                            <p className="text-slate-500 font-medium">Keep your professional information up to date</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Profile Photo Section */}
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 premium-shadow">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group">
                                    <div onClick={() => fileInputRef.current.click()} className="cursor-pointer relative">
                                        <Avatar src={formData.photoURL} size="w-40 h-40" ring={true} className="shadow-xl" />
                                        <div className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <Camera className="w-8 h-8 text-white mb-1" />
                                            <span className="text-white text-[10px] font-black uppercase tracking-tighter">Change Photo</span>
                                        </div>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-20">
                                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-90 border-4 border-white">
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/jpeg,image/png,image/webp" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">Profile Picture</h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Upload a professional headshot. JPG, PNG or WebP. Max 5MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 premium-shadow space-y-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <User className="w-6 h-6 text-indigo-600" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input required type="text" name="displayName" placeholder="Jason Wong" value={formData.displayName} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Professional Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" name="title" placeholder="Senior Software Engineer" value={formData.title} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" name="location" placeholder="San Francisco, CA" value={formData.location} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Professional Summary</label>
                                <textarea name="bio" rows="4" placeholder="Tell recruiters about your professional journey..." value={formData.bio} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium resize-none text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Core Skills</label>
                                    <span className="text-[10px] font-bold text-slate-400">SEPARATE WITH COMMAS</span>
                                </div>
                                <div className="relative">
                                    <Award className="absolute left-5 top-5 w-4 h-4 text-slate-400" />
                                    <input type="text" name="skills" placeholder="React, Next.js, Node.js, Python..." value={formData.skills} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-900" />
                                </div>
                                <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> Note: Adding new skills requires passing a verification test before applying to jobs.
                                </p>
                            </div>
                        </div>

                        {/* Contact & Social Links Section */}
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 premium-shadow space-y-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <Globe className="w-6 h-6 text-indigo-600" />
                                Contact & Social Links
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Portfolio Website</label>
                                    <input type="url" name="portfolioUrl" placeholder="https://yourportfolio.com" value={formData.portfolioUrl} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">LinkedIn</label>
                                    <input type="url" name="linkedin" placeholder="https://linkedin.com/in/username" value={formData.linkedin} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">GitHub</label>
                                    <input type="url" name="github" placeholder="https://github.com/username" value={formData.github} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Twitter/X</label>
                                    <input type="url" name="twitter" placeholder="https://twitter.com/username" value={formData.twitter} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Personal Website</label>
                                    <input type="url" name="website" placeholder="https://yourwebsite.com" value={formData.website} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium" />
                                </div>
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 premium-shadow space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Briefcase className="w-6 h-6 text-indigo-600" />
                                    Work Experience
                                </h2>
                                <button type="button" onClick={addExperience} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                                    <Plus className="w-4 h-4" /> Add Experience
                                </button>
                            </div>
                            {formData.experience.map((exp, index) => (
                                <div key={index} className="p-6 bg-slate-50 rounded-2xl space-y-4 relative">
                                    <button type="button" onClick={() => removeExperience(index)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Company Name" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Position" value={exp.position} onChange={(e) => updateExperience(index, 'position', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Start Date (e.g., Jan 2020)" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="End Date (or 'Present')" value={exp.endDate} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                    </div>
                                    <textarea placeholder="Describe your responsibilities and achievements..." value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)} rows="3" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium resize-none" />
                                </div>
                            ))}
                            {formData.experience.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No work experience added yet</p>
                                </div>
                            )}
                        </div>

                        {/* Education Section */}
                        {role === 'candidate' && (
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 premium-shadow space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                                    Education
                                </h2>
                                <button type="button" onClick={addEducation} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                                    <Plus className="w-4 h-4" /> Add Education
                                </button>
                            </div>
                            {formData.education.map((edu, index) => (
                                <div key={index} className="p-6 bg-slate-50 rounded-2xl space-y-4 relative">
                                    <button type="button" onClick={() => removeEducation(index)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="School/University" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Degree (e.g., Bachelor's)" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(index, 'field', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Year (e.g., 2018-2022)" value={edu.startDate} onChange={(e) => updateEducation(index, 'startDate', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                    </div>
                                    <textarea placeholder="Additional details (optional)..." value={edu.description} onChange={(e) => updateEducation(index, 'description', e.target.value)} rows="2" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium resize-none" />
                                </div>
                            ))}
                            {formData.education.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No education added yet</p>
                                </div>
                            )}
                        </div>
                        )}

                        {/* Projects Section */}
                        {role === 'candidate' && (
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 premium-shadow space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Code className="w-6 h-6 text-indigo-600" />
                                    Projects
                                </h2>
                                <button type="button" onClick={addProject} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                                    <Plus className="w-4 h-4" /> Add Project
                                </button>
                            </div>
                            {formData.projects.map((proj, index) => (
                                <div key={index} className="p-6 bg-slate-50 rounded-2xl space-y-4 relative">
                                    <button type="button" onClick={() => removeProject(index)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => updateProject(index, 'name', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <textarea placeholder="Project description..." value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} rows="2" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium resize-none" />
                                        <input type="text" placeholder="Technologies used (comma separated)" value={proj.technologies} onChange={(e) => updateProject(index, 'technologies', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="url" placeholder="Project link (optional)" value={proj.link} onChange={(e) => updateProject(index, 'link', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        
                                        {/* Project Screenshot Upload */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Project Screenshot</label>
                                            <div className="flex flex-col gap-3">
                                                {proj.image && (
                                                    <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-slate-200 group">
                                                        <img src={proj.image} alt="Project screenshot" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateProject(index, 'image', '')}
                                                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                                                            >
                                                                Remove Image
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            
                                                            setUploading(true);
                                                            setError("");
                                                            
                                                            try {
                                                                const { url: uploadedUrl, error: uploadError } = await uploadToImgBB(file);
                                                                
                                                                if (uploadedUrl) {
                                                                    updateProject(index, 'image', uploadedUrl);
                                                                    setSuccess("Screenshot uploaded successfully!");
                                                                    setTimeout(() => setSuccess(""), 3000);
                                                                } else {
                                                                    setError(uploadError || "Failed to upload screenshot");
                                                                }
                                                            } catch (err) {
                                                                console.error("Screenshot upload error:", err);
                                                                setError("An error occurred during upload");
                                                            } finally {
                                                                setUploading(false);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                        className="hidden"
                                                        id={`project-screenshot-${index}`}
                                                    />
                                                    <label
                                                        htmlFor={`project-screenshot-${index}`}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                                    >
                                                        <Camera className="w-4 h-4" />
                                                        {uploading ? "Uploading..." : proj.image ? "Change Screenshot" : "Upload Screenshot"}
                                                    </label>
                                                    {proj.image && (
                                                        <input
                                                            type="url"
                                                            placeholder="Or paste URL"
                                                            value={proj.image}
                                                            onChange={(e) => updateProject(index, 'image', e.target.value)}
                                                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-sm"
                                                        />
                                                    )}
                                                </div>
                                                {!proj.image && (
                                                    <input
                                                        type="url"
                                                        placeholder="Or paste screenshot URL"
                                                        value={proj.image}
                                                        onChange={(e) => updateProject(index, 'image', e.target.value)}
                                                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.projects.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No projects added yet</p>
                                </div>
                            )}
                        </div>
                        )}

                        {/* Certificates Section */}
                        {role === 'candidate' && (
                        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 premium-shadow space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Award className="w-6 h-6 text-indigo-600" />
                                    Certificates & Achievements
                                </h2>
                                <button type="button" onClick={addCertificate} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                                    <Plus className="w-4 h-4" /> Add Certificate
                                </button>
                            </div>
                            {formData.certificates.map((cert, index) => (
                                <div key={index} className="p-6 bg-slate-50 rounded-2xl space-y-4 relative">
                                    <button type="button" onClick={() => removeCertificate(index)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Certificate Name" value={cert.name} onChange={(e) => updateCertificate(index, 'name', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Issuing Organization" value={cert.issuer} onChange={(e) => updateCertificate(index, 'issuer', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Issue Date (e.g., Jan 2024)" value={cert.date} onChange={(e) => updateCertificate(index, 'date', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        <input type="text" placeholder="Credential ID (optional)" value={cert.credentialId} onChange={(e) => updateCertificate(index, 'credentialId', e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
                                        
                                        {/* Certificate Image Upload */}
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Certificate Image</label>
                                            <div className="flex flex-col gap-3">
                                                {cert.image && (
                                                    <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-slate-200 group">
                                                        <img src={cert.image} alt="Certificate" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateCertificate(index, 'image', '')}
                                                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                                                            >
                                                                Remove Image
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            
                                                            setUploading(true);
                                                            setError("");
                                                            
                                                            try {
                                                                const { url: uploadedUrl, error: uploadError } = await uploadToImgBB(file);
                                                                
                                                                if (uploadedUrl) {
                                                                    updateCertificate(index, 'image', uploadedUrl);
                                                                    setSuccess("Certificate image uploaded successfully!");
                                                                    setTimeout(() => setSuccess(""), 3000);
                                                                } else {
                                                                    setError(uploadError || "Failed to upload certificate image");
                                                                }
                                                            } catch (err) {
                                                                console.error("Certificate upload error:", err);
                                                                setError("An error occurred during upload");
                                                            } finally {
                                                                setUploading(false);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                        className="hidden"
                                                        id={`certificate-image-${index}`}
                                                    />
                                                    <label
                                                        htmlFor={`certificate-image-${index}`}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                                    >
                                                        <Camera className="w-4 h-4" />
                                                        {uploading ? "Uploading..." : cert.image ? "Change Image" : "Upload Certificate"}
                                                    </label>
                                                    {cert.image && (
                                                        <input
                                                            type="url"
                                                            placeholder="Or paste URL"
                                                            value={cert.image}
                                                            onChange={(e) => updateCertificate(index, 'image', e.target.value)}
                                                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-sm"
                                                        />
                                                    )}
                                                </div>
                                                {!cert.image && (
                                                    <input
                                                        type="url"
                                                        placeholder="Or paste certificate image URL"
                                                        value={cert.image}
                                                        onChange={(e) => updateCertificate(index, 'image', e.target.value)}
                                                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.certificates.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No certificates added yet</p>
                                </div>
                            )}
                        </div>
                        )}

                        {/* Alerts */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-bold">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                {success}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button type="submit" disabled={updating} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 premium-shadow flex items-center justify-center gap-2 disabled:opacity-50">
                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                            </button>
                            <Link href="/profile" className="px-10 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-center">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
