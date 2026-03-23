"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { AlertCircle, Clock, Send, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../lib/apiClient";
import apiClient from "../lib/apiClient";

export default function SkillTestPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const apiBase = API_BASE;

    const [profile, setProfile] = useState(null);
    const [pageStatus, setPageStatus] = useState("loading"); // loading, selection, instruction, testing, submitting, result
    const [errorMsg, setErrorMsg] = useState("");
    const [warnMsg, setWarnMsg] = useState("");

    const [unverifiedSkills, setUnverifiedSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const [testData, setTestData] = useState(null); // { testId, questions, skill }
    const [answers, setAnswers] = useState({}); // { questionId: answerText }

    // Timer
    const TIME_LIMIT = 600; // 10 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

    // Result
    const [resultData, setResultData] = useState(null); // { score, result, feedback, ... }


    

    function checkTestingEligibility(p) {
        // Did they fail recently? Check cooldown
        if (p.nextAttemptTime) {
            const nextTime = new Date(p.nextAttemptTime);
            if (nextTime > new Date()) {
                const diffMin = Math.ceil((nextTime - new Date()) / 60000);
                setErrorMsg(`You did not pass your previous test. Please wait ${diffMin} minutes before taking another test.`);
                setPageStatus("error");
                return;
            }
        }

        const allSkills = Array.isArray(p.skills) ? p.skills : [];
        const verSkills = Array.isArray(p.verifiedSkills) ? p.verifiedSkills : [];
        const hasDeclaredSkills = allSkills.length > 0;
        const pending = allSkills.filter((s) => !verSkills.includes(s));
        const derivedSkillVerified = hasDeclaredSkills && pending.length === 0 && verSkills.length > 0;
        const effectiveSkillVerified = Boolean(p.isSkillVerified) || derivedSkillVerified;

        if (effectiveSkillVerified) {
            setPageStatus("verified"); // Already totally verified
            return;
        }

        // If no skills are declared, user cannot take the test yet.
        if (!hasDeclaredSkills) {
            setErrorMsg("Please add at least one skill in your profile before starting skill verification.");
            setPageStatus("error");
            return;
        }

        setUnverifiedSkills(pending);
        setPageStatus("selection");
    }

    const fetchProfile = async () => {
        try {
            const { data } = await apiClient.get(`/api/auth/profile/${user.uid}`);
            if (data.success) {
                const p = data.data;
                setProfile(p);
                checkTestingEligibility(p);
            } else {
                setErrorMsg("Failed to load profile.");
                setPageStatus("error");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Error fetching profile.");
            setPageStatus("error");
        }
    };

    // Fetch Profile
    useEffect(() => {
        if (!loading && !isAuthenticated) {
                router.push("/signin");
            } else if (!loading && isAuthenticated) {
                const t = setTimeout(() => fetchProfile(), 0);
                return () => clearTimeout(t);
            }
    }, [loading, isAuthenticated, router]);  

    

    const startTestGeneration = async () => {
        if (selectedSkills.length === 0) return;
        setPageStatus("submitting"); // repurposing for loading questions
        setErrorMsg("");

        try {
            const { data } = await apiClient.post(`/api/skill-test/generate`, {
                candidateId: user.uid,
                skills: selectedSkills,
            });
            if (data.success) {
                setTestData(data.data);
                const initAnswers = {};
                data.data.questions.forEach(q => initAnswers[q.id] = "");
                setAnswers(initAnswers);
                setTimeLeft(TIME_LIMIT);
                setPageStatus("testing");
            } else {
                setErrorMsg(data.message || "Failed to generate test.");
                setPageStatus("selection");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Network error.");
            setPageStatus("selection");
        }
    };

    const handleSubmitTest = async () => {
        setPageStatus("submitting");
        
        // Format answers for API
        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer: answer.trim()
        }));

        try {
            const { data } = await apiClient.post(`/api/skill-test/submit`, {
                testId: testData.testId,
                candidateId: user.uid,
                answers: formattedAnswers,
            });
            if (data.success) {
                setResultData(data.data);
                setPageStatus("result");
            } else {
                setErrorMsg(data.message || "Failed to submit test.");
                setPageStatus("error");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Network error submitting test.");
            setPageStatus("error");
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (pageStatus === "testing" && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (pageStatus === "testing" && timeLeft <= 0) {
            // Auto submit when time is up (deferred to avoid sync setState in effect)
            const tt = setTimeout(() => handleSubmitTest(), 0);
            return () => clearTimeout(tt);
        }
        return () => clearInterval(interval);
    }, [pageStatus, timeLeft]);  

    // Anti-cheating: Tab visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && pageStatus === "testing") {
                setWarnMsg("Warning: Leaving the tab during the test may result in an automatic failure.");
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [pageStatus]);

    const handleAnswerChange = (qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // UI RENDERING

    if (loading || pageStatus === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Checking Verification Status...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center">
                
                {/* HEADINGS */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Skill Verification Test</h1>
                    <p className="text-slate-500 text-lg">Prove your technical expertise and earn a verified badge.</p>
                </div>

                {/* ERROR OR ALREADY VERIFIED */}
                {(pageStatus === "error" || pageStatus === "verified") && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 text-center max-w-2xl mx-auto w-full">
                        {pageStatus === "verified" ? (
                            <>
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">You are fully verified!</h2>
                                <p className="text-slate-500 mb-8">All your declared skills are verified. You can now apply to any job.</p>
                                <button onClick={() => router.push("/jobs")} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                                    Browse Jobs
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                                    <ShieldAlert className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Test Unavailable</h2>
                                <p className="text-slate-500 mb-8 max-w-md mx-auto">{errorMsg}</p>
                                <button onClick={() => router.push("/resume")} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm">
                                    Upload Resume
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* SKILL SELECTION */}
                {pageStatus === "selection" && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 max-w-2xl mx-auto w-full">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Select skills to verify</h2>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                            You have added skills to your profile that are not yet verified. Select up to 3 skills below to begin an easy MCQ test.
                        </p>

                        <div className="space-y-3 mb-8">
                            {unverifiedSkills.map(skill => {
                                const isSelected = selectedSkills.includes(skill);
                                const isDisabled = !isSelected && selectedSkills.length >= 3;
                                return (
                                <label key={skill} className={`block p-5 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : isDisabled ? 'border-slat-100 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-slate-100 hover:border-indigo-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 text-indigo-600 focus:ring-0 rounded" 
                                            name="skill" 
                                            value={skill} 
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    if (selectedSkills.length < 3) setSelectedSkills([...selectedSkills, skill]);
                                                } else {
                                                    setSelectedSkills(selectedSkills.filter(s => s !== skill));
                                                }
                                            }}
                                        />
                                        <span className="font-bold text-slate-900 text-lg">{skill}</span>
                                    </div>
                                </label>
                                );
                            })}
                        </div>

                        {errorMsg && <p className="text-red-500 font-medium text-sm mb-4 text-center">{errorMsg}</p>}

                        <button 
                            disabled={selectedSkills.length === 0}
                            className={`w-full py-4 rounded-2xl font-bold shadow-xl flex flex-col items-center justify-center ${selectedSkills.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-transparent'}`}
                            onClick={startTestGeneration}
                        >
                            <span className="text-base text-lg mb-1">Begin Test ({selectedSkills.length}/3)</span>
                            <span className="font-normal text-xs text-white/70">Beginner-friendly MCQ format</span>
                        </button>
                    </div>
                )}

                {/* TESTING / SUBMITTING */}
                {(pageStatus === "testing" || pageStatus === "submitting") && testData && (
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-slate-200 border border-slate-100 relative max-h-fit mb-12 animate-fade-in">
                        
                        {/* Status Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100 sticky top-0 bg-white z-10 pt-2">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Testing Skills</p>
                                <h2 className="text-xl font-black text-indigo-600">{testData.skills ? testData.skills.join(", ") : testData.skill}</h2>
                            </div>
                            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold border ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                <Clock className="w-5 h-5" />
                                <span className="text-lg w-16 text-center tabular-nums">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        {/* Warnings */}
                        {warnMsg && (
                            <div className="mb-8 flex items-center justify-between gap-4 p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-bold">{warnMsg}</p>
                                </div>
                                <button onClick={() => setWarnMsg("")} className="text-sm underline">Dismiss</button>
                            </div>
                        )}

                        {/* Questions List */}
                        <div className="space-y-12">
                            {testData.questions.map((q, idx) => (
                                <div key={q.id} className="relative">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg">
                                            {idx + 1}
                                        </div>
                                        <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg border ${
                                            q.difficulty === 'Simple' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                            q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                                            'bg-red-50 text-red-600 border-red-200'
                                        }`}>
                                            {q.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 leading-relaxed">{q.text}</h3>
                                    
                                    {Array.isArray(q.options) && q.options.length > 0 ? (
                                        <div className="space-y-3">
                                            {q.options.map((opt) => {
                                                const selected = (answers[q.id] || "") === opt;
                                                return (
                                                    <label
                                                        key={`${q.id}-${opt}`}
                                                        className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-xl border transition-all select-text ${
                                                            selected
                                                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                                                : "border-slate-200 bg-white hover:border-indigo-300 text-slate-700"
                                                        } ${pageStatus === "submitting" ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${q.id}`}
                                                            value={opt}
                                                            checked={selected}
                                                            disabled={pageStatus === "submitting"}
                                                            onChange={() => handleAnswerChange(q.id, opt)}
                                                            className="mt-1"
                                                        />
                                                        <span className="select-text">{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <textarea
                                            value={answers[q.id] || ""}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            disabled={pageStatus === "submitting"}
                                            placeholder="Type your answer here..."
                                            rows="6"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-y placeholder:text-slate-400 select-text"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleSubmitTest}
                                disabled={pageStatus === "submitting"}
                                className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-3 disabled:opacity-50 text-base"
                            >
                                {pageStatus === "submitting" ? (
                                    <>
                                        <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Test <Send className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* RESULT */}
                {pageStatus === "result" && resultData && (
                    <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 text-center max-w-2xl mx-auto w-full animate-fade-in relative overflow-hidden">
                        
                        {resultData.result === "pass" ? (
                            <>
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-400/20 blur-3xl rounded-full pointer-events-none" />
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 relative z-10">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Congratulations!</h2>
                                <p className="text-emerald-600 font-bold mb-2 text-lg">You passed the test for {selectedSkills.join(", ")}.</p>
                                <p className="text-slate-500 text-sm mb-8">Next step: Complete the Communication Verification to unlock job applications.</p>
                            </>
                        ) : (
                            <>
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-400/20 blur-3xl rounded-full pointer-events-none" />
                                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6 relative z-10">
                                    <ShieldAlert className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2 text-red-600">Test Failed</h2>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Don&apos;t worry! Review the concepts and try again in 2 hours.</p>
                            </>
                        )}

                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8 max-w-md mx-auto relative z-10">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
                            <div className="flex items-end justify-center gap-2 mb-4">
                                <span className="text-5xl font-black text-slate-900 tabular-nums">{resultData.score}</span>
                                <span className="text-slate-400 text-xl font-bold pb-1">/ 100</span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-t border-slate-200 pt-4">&quot;{resultData.feedback}&quot;</p>
                        </div>

                        <div className="flex gap-4 p-4 border-t border-slate-100 justify-center">
                            <button
                                onClick={() => router.push(resultData.result === "pass" ? "/verification/communication-intro" : "/jobs")}
                                className={`px-8 py-4 text-white rounded-2xl font-bold shadow-xl transition-all ${resultData.result === "pass" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"}`}
                            >
                                {resultData.result === "pass" ? "Continue → Communication Test" : "Understood"}
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
