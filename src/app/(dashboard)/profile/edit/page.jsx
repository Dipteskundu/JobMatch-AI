"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import { uploadToImgBB } from "../../../lib/imageUpload";
import Image from "next/image";
import {
  User, Mail, MapPin, Phone, Briefcase, Award, Save, ArrowLeft,
  Camera, Loader2, CheckCircle, AlertCircle, Plus, X,
  GraduationCap, Code, Globe, Calendar, FileText, Upload,
} from "lucide-react";
import Link from "next/link";
import Avatar from "../../../components/common/Avatar";
import api, { API_BASE } from "../../../lib/apiClient";
import {
  getResumeProfileImportValues,
  isProfileValueEmpty,
} from "../../../lib/resumeProfileImport";

const RESUME_IMPORT_FIELDS = [
  ["displayName", "Full name"],
  ["title", "Professional title"],
  ["location", "Location"],
  ["phone", "Phone"],
  ["bio", "Professional summary"],
  ["skills", "Core skills"],
  ["yearsOfExperience", "Years of experience"],
  ["experience", "Work experience"],
  ["education", "Education"],
  ["projects", "Projects"],
  ["certificates", "Certificates"],
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
  ["twitter", "Twitter / X"],
  ["website", "Personal website"],
  ["portfolioUrl", "Portfolio URL"],
];

const TABS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "social", label: "Social", icon: Globe },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: Code },
  { id: "certs", label: "Certs", icon: Award },
];

export default function EditProfilePage() {
  const { user, userProfile, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    displayName: "", title: "", location: "", phone: "", bio: "", skills: "",
    photoURL: "", experience: [], education: [], projects: [], certificates: [],
    portfolioUrl: "", linkedin: "", github: "", twitter: "", website: "",
    yearsOfExperience: "",
  });
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeImport, setResumeImport] = useState(null);
  const [selectedResumeFields, setSelectedResumeFields] = useState(new Set());
  const [importingResume, setImportingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeSuccess, setResumeSuccess] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (userProfile) {
        setFormData({
            displayName: userProfile.displayName || "", 
            title: userProfile.title || "",
            location: userProfile.location || "", 
            phone: userProfile.phone || "", 
            bio: userProfile.bio || "",
            skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(", ") : userProfile.skills || "",
            photoURL: userProfile.photoURL || user?.photoURL || "",
            experience: userProfile.experience || [], 
            education: userProfile.education || [],
            projects: userProfile.projects || [], 
            certificates: userProfile.certificates || [],
            yearsOfExperience: userProfile.yearsOfExperience ?? "",
            portfolioUrl: userProfile.portfolioUrl || "", 
            linkedin: userProfile.linkedin || "",
            github: userProfile.github || "", 
            twitter: userProfile.twitter || "", 
            website: userProfile.website || "",
        });
        setFetching(false);
    } else if (!authLoading) {
        setFetching(false);
    }
  }, [userProfile, user?.photoURL, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setResumeError("");
    setResumeSuccess("");
    setResumeImport(null);
    setSelectedResumeFields(new Set());

    if (!file) {
      setResumeFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeFile(null);
      setResumeError("Resume file must be 10MB or less.");
      event.target.value = "";
      return;
    }

    if (!/\.(pdf|doc|docx|txt)$/i.test(file.name)) {
      setResumeFile(null);
      setResumeError("Please upload a PDF, DOC, DOCX, or TXT resume.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleResumeAnalyze = async () => {
    if (!resumeFile) {
      setResumeError("Choose a resume file first.");
      return;
    }

    setImportingResume(true);
    setResumeError("");
    setResumeSuccess("");
    try {
      const uploadData = new FormData();
      uploadData.append("resume", resumeFile);
      uploadData.append("profileImport", "true");
      const response = await api.post("/api/resume/upload", uploadData, {
        headers: { "Content-Type": undefined },
        timeout: 120000,
      });
      const values = getResumeProfileImportValues(response.data?.data);

      if (Object.keys(values).length === 0) {
        setResumeImport(null);
        setResumeError("No editable profile details could be extracted. Try a clearer resume file.");
        return;
      }

      setResumeImport({
        values,
        warning: response.data?.warning || "",
        fileName: resumeFile.name,
      });
      setSelectedResumeFields(
        new Set(Object.keys(values).filter((field) => isProfileValueEmpty(formData[field]))),
      );
    } catch (uploadError) {
      setResumeError(
        uploadError?.response?.data?.message ||
          uploadError?.message ||
          "Resume analysis failed.",
      );
    } finally {
      setImportingResume(false);
    }
  };

  const toggleResumeField = (field) => {
    setSelectedResumeFields((previous) => {
      const next = new Set(previous);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const applyResumeImport = () => {
    if (!resumeImport || selectedResumeFields.size === 0) {
      setResumeError("Select at least one extracted field to apply.");
      return;
    }

    setFormData((previous) => {
      const next = { ...previous };
      for (const field of selectedResumeFields) {
        next[field] = resumeImport.values[field];
      }
      return next;
    });
    setResumeImport(null);
    setResumeFile(null);
    setSelectedResumeFields(new Set());
    setResumeSuccess("Selected resume details were added to your unsaved profile. Review them and save your changes.");
    setResumeError("");
  };

  // --- Experience ---
  const addExperience = () => setFormData(p => ({ ...p, experience: [...p.experience, { company: "", position: "", startDate: "", endDate: "", description: "" }] }));
  const updateExperience = (i, f, v) => setFormData(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const removeExperience = (i) => setFormData(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  // --- Education ---
  const addEducation = () => setFormData(p => ({ ...p, education: [...p.education, { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" }] }));
  const updateEducation = (i, f, v) => setFormData(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const removeEducation = (i) => setFormData(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  // --- Projects ---
  const addProject = () => setFormData(p => ({ ...p, projects: [...p.projects, { name: "", description: "", technologies: "", link: "", image: "" }] }));
  const updateProject = (i, f, v) => setFormData(p => ({ ...p, projects: p.projects.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const removeProject = (i) => setFormData(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));

  // --- Certificates ---
  const addCertificate = () => setFormData(p => ({ ...p, certificates: [...p.certificates, { name: "", issuer: "", date: "", credentialId: "", image: "" }] }));
  const updateCertificate = (i, f, v) => setFormData(p => ({ ...p, certificates: p.certificates.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const removeCertificate = (i) => setFormData(p => ({ ...p, certificates: p.certificates.filter((_, idx) => idx !== i) }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError(""); setSuccess("");
    try {
      const { url, error: uploadError } = await uploadToImgBB(file);
      if (url) {
        setFormData(prev => ({ ...prev, photoURL: url }));
        await refreshUser();
        setSuccess("Photo uploaded!");
      } else { setError(uploadError || "Upload failed"); }
    } catch { setError("Upload error"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleFileUploadForField = async (e, onSuccess) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const { url, error: uploadError } = await uploadToImgBB(file);
      if (url) { onSuccess(url); setSuccess("Uploaded!"); setTimeout(() => setSuccess(""), 2000); }
      else setError(uploadError || "Upload failed");
    } catch { setError("Upload error"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true); setError(""); setSuccess("");
    try {
      const processedData = {
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        yearsOfExperience: formData.yearsOfExperience === ""
          ? null
          : Number(formData.yearsOfExperience),
      };
      const res = await api.put(`/api/auth/profile/${user.uid}`, processedData);
      const json = res.data;
      if (json.success) {
        await refreshUser();
        setSuccess("Profile updated!");
        setTimeout(() => router.push("/profile"), 1200);
      } else { setError(json.message || "Update failed"); }
    } catch { setError("An error occurred"); }
    finally { setUpdating(false); }
  };

  if (authLoading || fetching) {
    return <div className="min-h-screen theme-page-muted flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen theme-page-muted">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Edit Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Keep your information up to date</p>
        </div>

        <section className="mb-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-black text-slate-900">Fill your profile from a resume</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review extracted details and choose what to add. Nothing is saved until you save your profile.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleResumeFileChange}
              disabled={importingResume}
              aria-label="Upload resume for profile extraction"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700"
            />
            <button
              type="button"
              onClick={handleResumeAnalyze}
              disabled={importingResume || !resumeFile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importingResume
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Upload className="h-4 w-4" />}
              {importingResume ? "Analyzing..." : "Analyze resume"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">PDF, DOC, DOCX, or TXT · 10MB maximum</p>
          {resumeError && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {resumeError}
            </p>
          )}
          {resumeSuccess && (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {resumeSuccess}
            </p>
          )}

          {resumeImport && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900">Review extracted details</h3>
                  <p className="text-xs text-slate-500">{resumeImport.fileName}</p>
                </div>
                <p className="text-xs text-slate-500">Choose fields to apply; checked fields replace existing values.</p>
              </div>
              {resumeImport.warning && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {resumeImport.warning}
                </p>
              )}
              <div className="mt-3 space-y-2">
                {RESUME_IMPORT_FIELDS.filter(([field]) => (
                  Object.hasOwn(resumeImport.values, field)
                )).map(([field, label]) => (
                  <label key={field} className="flex cursor-pointer gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={selectedResumeFields.has(field)}
                      onChange={() => toggleResumeField(field)}
                      className="mt-1 h-4 w-4 accent-indigo-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
                      {!isProfileValueEmpty(formData[field]) && (
                        <span className="mt-1 block text-xs text-slate-500">
                          Current: {formatResumeImportValue(field, formData[field])}
                        </span>
                      )}
                      <span className="mt-1 block break-words text-sm font-medium text-slate-800">
                        From resume: {formatResumeImportValue(field, resumeImport.values[field])}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={applyResumeImport}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  <CheckCircle className="h-4 w-4" /> Apply selected to form
                </button>
                <button
                  type="button"
                  onClick={() => setResumeImport(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Tab Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 mb-5 flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── BASIC INFO ── */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              {/* Photo */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <SectionHeader icon={<Camera className="w-4 h-4 text-indigo-600" />} title="Profile Photo" />
                <div className="flex items-center gap-5 mt-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                    <Avatar src={formData.photoURL} size="w-20 h-20" ring className="shadow-md" />
                    <div className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    {uploading && <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center"><Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /></div>}
                    <button type="button" className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full border-2 border-white shadow">
                      <Camera className="w-3 h-3" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/jpeg,image/png,image/webp" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Upload a professional photo</p>
                    <p className="text-slate-400 text-xs mt-0.5">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Basic fields */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <SectionHeader icon={<User className="w-4 h-4 text-indigo-600" />} title="Basic Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Full Name *" icon={<User className="w-4 h-4 text-slate-400" />}>
                    <input required type="text" name="displayName" placeholder="Your name" value={formData.displayName} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Professional Title" icon={<Briefcase className="w-4 h-4 text-slate-400" />}>
                    <input type="text" name="title" placeholder="Web Developer" value={formData.title} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Location" icon={<MapPin className="w-4 h-4 text-slate-400" />}>
                    <input type="text" name="location" placeholder="Dhaka" value={formData.location} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Phone" icon={<Phone className="w-4 h-4 text-slate-400" />}>
                    <input type="tel" name="phone" placeholder="01799137382" value={formData.phone} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Years of Experience" icon={<Briefcase className="w-4 h-4 text-slate-400" />}>
                    <input type="number" min="0" step="0.5" name="yearsOfExperience" placeholder="e.g. 3" value={formData.yearsOfExperience} onChange={handleChange} className={inputCls} />
                  </Field>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Summary</label>
                  <textarea name="bio" rows="4" placeholder="Tell recruiters about yourself..." value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium resize-none text-slate-900 placeholder:text-slate-300" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Skills</label>
                    <span className="text-[10px] font-bold text-slate-400">Separate with commas</span>
                  </div>
                  <Field icon={<Award className="w-4 h-4 text-slate-400" />}>
                    <input type="text" name="skills" placeholder="HTML, UI/UX Design, React..." value={formData.skills} onChange={handleChange} className={inputCls} />
                  </Field>
                  <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> New skills require a verification test before applying to jobs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── SOCIAL ── */}
          {activeTab === "social" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <SectionHeader icon={<Globe className="w-4 h-4 text-indigo-600" />} title="Social & Links" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {[
                  { name: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
                  { name: "github", label: "GitHub", placeholder: "https://github.com/..." },
                  { name: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/..." },
                  { name: "website", label: "Personal Website", placeholder: "https://yoursite.com" },
                  { name: "portfolioUrl", label: "Portfolio URL", placeholder: "https://portfolio.com" },
                ].map(({ name, label, placeholder }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                    <input type="url" name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium placeholder:text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button type="button" onClick={addExperience} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
              {formData.experience.length === 0 && <EmptyState icon={<Briefcase className="w-10 h-10" />} label="No work experience added yet" />}
              {formData.experience.map((exp, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative">
                  <button type="button" onClick={() => removeExperience(i)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Company Name" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Position" value={exp.position} onChange={(e) => updateExperience(i, "position", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Start Date (e.g., Jan 2020)" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="End Date (or 'Present')" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className={cardInputCls} />
                  </div>
                  <textarea placeholder="Describe your responsibilities..." value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows="3" className={`${cardInputCls} w-full mt-4 resize-none`} />
                </div>
              ))}
            </div>
          )}

          {/* ── EDUCATION ── */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button type="button" onClick={addEducation} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
              {formData.education.length === 0 && <EmptyState icon={<GraduationCap className="w-10 h-10" />} label="No education added yet" />}
              {formData.education.map((edu, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative">
                  <button type="button" onClick={() => removeEducation(i)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="School / University" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Year (e.g., 2021-2025)" value={edu.startDate} onChange={(e) => updateEducation(i, "startDate", e.target.value)} className={cardInputCls} />
                  </div>
                  <textarea placeholder="Additional details (optional)..." value={edu.description} onChange={(e) => updateEducation(i, "description", e.target.value)} rows="2" className={`${cardInputCls} w-full mt-4 resize-none`} />
                </div>
              ))}
            </div>
          )}

          {/* ── PROJECTS ── */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button type="button" onClick={addProject} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
              {formData.projects.length === 0 && <EmptyState icon={<Code className="w-10 h-10" />} label="No projects added yet" />}
              {formData.projects.map((proj, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative space-y-3">
                  <button type="button" onClick={() => removeProject(i)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                  <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => updateProject(i, "name", e.target.value)} className={cardInputCls + " w-full"} />
                  <textarea placeholder="Project description..." value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} rows="2" className={`${cardInputCls} w-full resize-none`} />
                  <input type="text" placeholder="Technologies (comma separated)" value={proj.technologies} onChange={(e) => updateProject(i, "technologies", e.target.value)} className={cardInputCls + " w-full"} />
                  <input type="url" placeholder="Project link (optional)" value={proj.link} onChange={(e) => updateProject(i, "link", e.target.value)} className={cardInputCls + " w-full"} />
                  {/* Screenshot */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Screenshot</label>
                    {proj.image && (
                      <div className="relative w-full h-36 rounded-xl mb-2 border border-slate-100 overflow-hidden bg-slate-50">
                        <Image
                          src={proj.image}
                          alt="Project screenshot"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label htmlFor={`proj-img-${i}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer">
                        <Camera className="w-4 h-4" /> {uploading ? "Uploading..." : proj.image ? "Change" : "Upload Screenshot"}
                      </label>
                      <input type="file" id={`proj-img-${i}`} accept="image/*" className="hidden" onChange={(e) => handleFileUploadForField(e, (url) => updateProject(i, "image", url))} />
                      <input type="url" placeholder="Or paste URL" value={proj.image} onChange={(e) => updateProject(i, "image", e.target.value)} className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CERTS ── */}
          {activeTab === "certs" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button type="button" onClick={addCertificate} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Certificate
                </button>
              </div>
              {formData.certificates.length === 0 && <EmptyState icon={<Award className="w-10 h-10" />} label="No certificates added yet" />}
              {formData.certificates.map((cert, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative space-y-3">
                  <button type="button" onClick={() => removeCertificate(i)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Certificate Name" value={cert.name} onChange={(e) => updateCertificate(i, "name", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Issuing Organization" value={cert.issuer} onChange={(e) => updateCertificate(i, "issuer", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Issue Date (e.g., Jan 2024)" value={cert.date} onChange={(e) => updateCertificate(i, "date", e.target.value)} className={cardInputCls} />
                    <input type="text" placeholder="Credential ID (optional)" value={cert.credentialId} onChange={(e) => updateCertificate(i, "credentialId", e.target.value)} className={cardInputCls} />
                  </div>
                  {/* Cert image */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Certificate Image</label>
                    {cert.image && (
                      <div className="relative w-full h-36 rounded-xl mb-2 border border-slate-100 overflow-hidden bg-slate-50">
                        <Image
                          src={cert.image}
                          alt="Certificate image"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label htmlFor={`cert-img-${i}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer">
                        <Camera className="w-4 h-4" /> {uploading ? "Uploading..." : cert.image ? "Change" : "Upload Certificate"}
                      </label>
                      <input type="file" id={`cert-img-${i}`} accept="image/*" className="hidden" onChange={(e) => handleFileUploadForField(e, (url) => updateCertificate(i, "image", url))} />
                      <input type="url" placeholder="Or paste URL" value={cert.image} onChange={(e) => updateCertificate(i, "image", e.target.value)} className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold mt-4">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-bold mt-4">
              <CheckCircle className="w-5 h-5 shrink-0" /> {success}
            </div>
          )}

          {/* Sticky Footer */}
          <div className="sticky bottom-0 left-0 right-0 mt-6 theme-page-muted pt-3 pb-4 flex gap-3">
            <button type="submit" disabled={updating} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-50">
              {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
            <Link href="/profile" className="px-8 py-3.5 border border-slate-200 bg-white rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-center text-sm">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ──
const inputCls = "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-300";
const cardInputCls = "px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-300";

function formatResumeImportValue(field, value) {
  if (!Array.isArray(value)) return String(value ?? "");

  return value.map((entry) => {
    if (field === "experience") {
      const dates = [entry.startDate, entry.endDate].filter(Boolean).join(" – ");
      return [entry.position, entry.company, dates].filter(Boolean).join(" · ");
    }
    if (field === "education") {
      const degree = [entry.degree, entry.field].filter(Boolean).join(" ");
      const dates = [entry.startDate, entry.endDate].filter(Boolean).join(" – ");
      return [degree, entry.school, dates].filter(Boolean).join(" · ");
    }
    if (field === "projects") return entry.name || entry.description || "Project";
    if (field === "certificates") {
      return [entry.name, entry.issuer, entry.date].filter(Boolean).join(" · ");
    }
    return Object.values(entry).filter(Boolean).join(" · ");
  }).join("; ");
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
      <div className="p-2 bg-indigo-50 rounded-xl">{icon}</div>
      <h2 className="font-black text-slate-900 text-base">{title}</h2>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, label }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-400">
      <div className="mx-auto mb-3 opacity-30">{icon}</div>
      <p className="font-semibold text-sm">{label}</p>
    </div>
  );
}
