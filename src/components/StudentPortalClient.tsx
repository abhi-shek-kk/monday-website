"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import {
  GraduationCap,
  User,
  Hash,
  Calendar,
  CheckCircle2,
  Shield,
  FolderKanban,
  FileText,
  Users,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Star,
  Download,
  Search,
  Filter,
  AlertCircle,
  X,
  Check,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  projectUrl: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  createdAt: string | Date;
}

interface Wing {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isJoined: boolean;
}

interface Note {
  id: string;
  title: string;
  description: string | null;
  semester: number;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  subject: {
    code: string;
    name: string;
    semester: number;
  };
  uploader: {
    fullName: string;
    designation: string;
  };
}

interface StudentPortalClientProps {
  user: {
    id: string;
    username: string;
    email: string | null;
    role: string;
    status: string;
    studentProfile: {
      id: string;
      fullName: string;
      registerNumber: string;
      batch: string;
      bloodGroup?: string | null;
      dateOfBirth?: string | Date | null;
      bio: string | null;
      profilePhotoUrl: string | null;
      githubUrl: string | null;
      linkedinUrl: string | null;
      websiteUrl: string | null;
    } | null;
  };
  initialProjects: Project[];
  initialWings: Wing[];
  initialNotes: Note[];
  initialSubjects: { id: string; code: string; name: string; semester: number }[];
}

export default function StudentPortalClient({
  user,
  initialProjects,
  initialWings,
  initialNotes,
  initialSubjects,
}: StudentPortalClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "projects" | "wings" | "notes">(
    "overview"
  );

  // Profile State
  const profile = user.studentProfile;
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || "");
  const initialDob = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
    : "";
  const [dateOfBirth, setDateOfBirth] = useState(initialDob);
  const [bio, setBio] = useState(profile?.bio || "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile?.profilePhotoUrl || "");
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Projects State
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectImageUrl, setProjectImageUrl] = useState("");
  const [projectIsFeatured, setProjectIsFeatured] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Wings State
  const [wings, setWings] = useState<Wing[]>(initialWings);
  const [wingTogglingId, setWingTogglingId] = useState<string | null>(null);

  // Notes State
  const [notes] = useState<Note[]>(initialNotes);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [noteSearchQuery, setNoteSearchQuery] = useState("");

  // Direct Photo File Upload Handler
  const [photoUploading, setPhotoUploading] = useState(false);
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setProfileMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/student/profile/photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload profile photo.");

      setProfilePhotoUrl(data.profilePhotoUrl);
      setProfileMessage({ type: "success", text: "Profile photo uploaded to durable cloud storage!" });
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to upload photo." });
    } finally {
      setPhotoUploading(false);
    }
  };

  // Direct Project Image File Upload Handler
  const [projectUploading, setProjectUploading] = useState(false);
  const handleProjectImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editingProject) {
      alert("Please save the project details first, then edit it to upload a project image file.");
      return;
    }

    setProjectUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/student/projects/${editingProject.id}/image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload project image.");

      setProjectImageUrl(data.imageUrl);
      const refreshedRes = await fetch("/api/student/projects");
      const refreshedData = await refreshedRes.json();
      if (refreshedData.projects) setProjects(refreshedData.projects);
    } catch (err: any) {
      setProjectError(err.message || "Failed to upload project image.");
    } finally {
      setProjectUploading(false);
    }
  };

  // Secure Note Download Handler
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(null);
  const handleDownloadNote = async (noteId: string) => {
    setDownloadingNoteId(noteId);
    try {
      const res = await fetch(`/api/notes/${noteId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to download note.");

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } catch (err: any) {
      alert(err.message || "Failed to download file.");
    } finally {
      setDownloadingNoteId(null);
    }
  };

  // Calculation for profile completion
  const completionFields = [
    Boolean(fullName),
    Boolean(bloodGroup),
    Boolean(dateOfBirth),
    Boolean(bio),
    Boolean(profilePhotoUrl),
    Boolean(githubUrl || linkedinUrl || websiteUrl),
    projects.length > 0,
  ];
  const completionPercentage = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  // Profile submit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          bloodGroup,
          dateOfBirth,
          bio,
          profilePhotoUrl,
          githubUrl,
          linkedinUrl,
          websiteUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Error saving profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Open Project Modal
  const handleOpenProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setProjectTitle(proj.title);
      setProjectDescription(proj.description);
      setProjectUrl(proj.projectUrl || "");
      setProjectImageUrl(proj.imageUrl || "");
      setProjectIsFeatured(proj.isFeatured);
    } else {
      setEditingProject(null);
      setProjectTitle("");
      setProjectDescription("");
      setProjectUrl("");
      setProjectImageUrl("");
      setProjectIsFeatured(false);
    }
    setProjectError(null);
    setIsProjectModalOpen(true);
  };

  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectSaving(true);
    setProjectError(null);

    try {
      const payload = {
        title: projectTitle,
        description: projectDescription,
        projectUrl,
        imageUrl: projectImageUrl,
        isFeatured: projectIsFeatured,
      };

      const url = editingProject
        ? `/api/student/projects/${editingProject.id}`
        : "/api/student/projects";
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save project");
      }

      // Re-fetch project list or sync state
      const refreshedProjectsRes = await fetch("/api/student/projects");
      const refreshedData = await refreshedProjectsRes.json();
      if (refreshedData.projects) {
        setProjects(refreshedData.projects);
      }

      setIsProjectModalOpen(false);
    } catch (err: any) {
      setProjectError(err.message || "Failed to save project.");
    } finally {
      setProjectSaving(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/student/projects/${projectId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete project");

      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err: any) {
      alert(err.message || "Failed to delete project.");
    }
  };

  // Toggle Featured Project
  const handleToggleFeatured = async (proj: Project) => {
    try {
      const res = await fetch(`/api/student/projects/${proj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !proj.isFeatured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update featured status");

      const refreshedProjectsRes = await fetch("/api/student/projects");
      const refreshedData = await refreshedProjectsRes.json();
      if (refreshedData.projects) {
        setProjects(refreshedData.projects);
      }
    } catch (err: any) {
      alert(err.message || "Failed to toggle featured status.");
    }
  };

  // Wing Membership Toggle
  const handleToggleWing = async (wingId: string, currentJoined: boolean) => {
    setWingTogglingId(wingId);
    try {
      const action = currentJoined ? "leave" : "join";
      const res = await fetch("/api/student/wings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wingId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update wing membership");

      setWings(
        wings.map((w) => (w.id === wingId ? { ...w, isJoined: !currentJoined } : w))
      );
    } catch (err: any) {
      alert(err.message || "Failed to modify wing membership.");
    } finally {
      setWingTogglingId(null);
    }
  };

  // Filter Notes
  const filteredNotes = notes.filter((n) => {
    if (selectedSemester !== "ALL" && n.semester !== parseInt(selectedSemester, 10)) {
      return false;
    }
    if (selectedSubject !== "ALL" && n.subject.code !== selectedSubject) {
      return false;
    }
    if (noteSearchQuery.trim()) {
      const q = noteSearchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchSubject = n.subject.name.toLowerCase().includes(q) || n.subject.code.toLowerCase().includes(q);
      const matchDesc = n.description?.toLowerCase().includes(q) || false;
      return matchTitle || matchSubject || matchDesc;
    }
    return true;
  });

  const featuredProject = projects.find((p) => p.isFeatured);
  const joinedWingsCount = wings.filter((w) => w.isJoined).length;

  return (
    <div className="min-h-screen bg-[#FBF9F7] dark:bg-[#141210] text-[#1C1917] dark:text-[#FBF9F7]">
      {/* HEADER */}
      <header className="bg-white dark:bg-[#1C1917] border-b border-[#EFEAE3] dark:border-[#38322D] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            title="Go to St. Berchmans College Home Page"
            className="flex items-center gap-3 group transition-transform"
          >
            <Image
              src="/images/branding/sb-college-logo.jpg"
              alt="St. Berchmans College Logo"
              width={44}
              height={44}
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl shadow-2xs group-hover:scale-105 transition-transform bg-white p-0.5 border border-[#EFEAE3] shrink-0"
            />
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold text-[#756860] dark:text-[#A89F91] uppercase tracking-wider block leading-none group-hover:text-[#1C1917] dark:group-hover:text-[#FBF9F7] transition-colors">
                Student Portal
              </span>
              <span className="text-xs sm:text-sm font-bold font-heading text-[#1C1917] dark:text-[#FBF9F7] group-hover:text-[#756860] dark:group-hover:text-[#A89F91] transition-colors mt-0.5 leading-tight">
                St. Berchmans College — AI & DS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-[#FBF9F7] dark:bg-[#141210] px-3 py-1.5 rounded-full border border-[#EFEAE3] dark:border-[#38322D]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-[#1C1917] dark:text-[#FBF9F7]">{user.username}</span>
              <span className="text-[#756860] dark:text-[#A89F91]">({user.role})</span>
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-4 border-t border-[#EFEAE3] dark:border-[#38322D] pt-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-[#1C1917] dark:border-[#FBF9F7] text-[#1C1917] dark:text-[#FBF9F7]"
                  : "border-transparent text-[#756860] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FBF9F7]"
              }`}
            >
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === "profile"
                  ? "border-[#1C1917] dark:border-[#FBF9F7] text-[#1C1917] dark:text-[#FBF9F7]"
                  : "border-transparent text-[#756860] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FBF9F7]"
              }`}
            >
              <User className="w-4 h-4" /> Profile & Showcase
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`py-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === "projects"
                  ? "border-[#1C1917] dark:border-[#FBF9F7] text-[#1C1917] dark:text-[#FBF9F7]"
                  : "border-transparent text-[#756860] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FBF9F7]"
              }`}
            >
              <FolderKanban className="w-4 h-4" /> Projects & Portfolio ({projects.length})
            </button>

            <button
              onClick={() => setActiveTab("wings")}
              className={`py-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === "wings"
                  ? "border-[#1C1917] dark:border-[#FBF9F7] text-[#1C1917] dark:text-[#FBF9F7]"
                  : "border-transparent text-[#756860] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FBF9F7]"
              }`}
            >
              <Users className="w-4 h-4" /> Co-Curricular Wings ({joinedWingsCount})
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`py-3 px-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === "notes"
                  ? "border-[#1C1917] dark:border-[#FBF9F7] text-[#1C1917] dark:text-[#FBF9F7]"
                  : "border-transparent text-[#756860] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FBF9F7]"
              }`}
            >
              <FileText className="w-4 h-4" /> Academic Notes ({notes.length})
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved Student Account
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#1C1917]">
                  Welcome back, {fullName || user.username}!
                </h1>
                <p className="text-sm text-[#756860]">
                  Manage your public profile, portfolio projects, co-curricular wing memberships, and access official academic notes.
                </p>
              </div>

              {/* Profile Completion Card */}
              <div className="bg-[#FBF9F7] p-4 rounded-2xl border border-[#EFEAE3] min-w-[240px] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1C1917]">Profile Completion</span>
                  <span className="font-mono font-bold text-[#1C1917]">{completionPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EFEAE3] overflow-hidden">
                  <div
                    className="h-full bg-[#1C1917] transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-[#756860]">
                  {completionPercentage === 100
                    ? "Your profile & portfolio are complete!"
                    : "Add bio, photo, links & projects to complete profile."}
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#756860]">
                  Register Number
                </span>
                <div className="text-xl font-bold font-mono text-[#1C1917]">
                  {profile?.registerNumber || "Not Set"}
                </div>
                <span className="text-xs text-[#756860] block">System Verified</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#756860]">
                  Academic Batch
                </span>
                <div className="text-xl font-bold font-heading text-[#1C1917]">
                  {profile?.batch || "Not Set"}
                </div>
                <span className="text-xs text-[#756860] block">BSc AI & Data Science</span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#756860]">
                  Portfolio Projects
                </span>
                <div className="text-xl font-bold font-mono text-[#1C1917]">
                  {projects.length} {projects.length === 1 ? "Project" : "Projects"}
                </div>
                <span className="text-xs text-[#756860] block">
                  {featuredProject ? "1 Featured Project set" : "No featured project set"}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#756860]">
                  Wing Memberships
                </span>
                <div className="text-xl font-bold font-mono text-[#1C1917]">
                  {joinedWingsCount} / {wings.length} Wings
                </div>
                <span className="text-xs text-[#756860] block">Co-curricular activities</span>
              </div>
            </div>

            {/* Profile & Portfolio Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account Identity Details */}
              <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#756860] pb-2 border-b border-[#EFEAE3]">
                  Identity & Authorization
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-[#756860] shrink-0" />
                    <div>
                      <div className="text-xs text-[#756860]">Username</div>
                      <div className="font-semibold text-[#1C1917]">{user.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-[#756860] shrink-0" />
                    <div>
                      <div className="text-xs text-[#756860]">Register / Roll Number</div>
                      <div className="font-semibold text-[#1C1917]">{profile?.registerNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#756860] shrink-0" />
                    <div>
                      <div className="text-xs text-[#756860]">Batch</div>
                      <div className="font-semibold text-[#1C1917]">{profile?.batch}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      B
                    </div>
                    <div>
                      <div className="text-xs text-[#756860]">Blood Group</div>
                      <div className="font-semibold text-[#1C1917]">{bloodGroup || profile?.bloodGroup || "Not specified"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#756860] shrink-0" />
                    <div>
                      <div className="text-xs text-[#756860]">Date of Birth</div>
                      <div className="font-semibold text-[#1C1917]">
                        {dateOfBirth || (profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not specified")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-[#756860] shrink-0" />
                    <div>
                      <div className="text-xs text-[#756860]">Role Level</div>
                      <div className="font-semibold text-[#1C1917]">{user.role}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EFEAE3]">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="w-full py-2 rounded-xl bg-[#FBF9F7] text-[#1C1917] border border-[#EFEAE3] text-xs font-bold hover:bg-[#EFEAE3] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile Info
                  </button>
                </div>
              </div>

              {/* Featured Project Showcase Card */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE3]">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#756860]">
                      Featured Portfolio Project
                    </h2>
                    <button
                      onClick={() => setActiveTab("projects")}
                      className="text-xs font-bold text-[#1C1917] hover:underline"
                    >
                      Manage All ({projects.length}) &rarr;
                    </button>
                  </div>

                  {featuredProject ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                        </span>
                        <h3 className="text-lg font-bold font-heading text-[#1C1917]">
                          {featuredProject.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#756860] leading-relaxed line-clamp-3">
                        {featuredProject.description}
                      </p>
                      {featuredProject.projectUrl && (
                        <a
                          href={featuredProject.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1C1917] hover:underline"
                        >
                          Visit Project Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <FolderKanban className="w-8 h-8 text-[#756860] mx-auto opacity-40" />
                      <p className="text-xs text-[#756860]">
                        You haven&apos;t marked a project as featured yet. Mark your best project as featured to showcase it prominently.
                      </p>
                      <button
                        onClick={() => setActiveTab("projects")}
                        className="px-4 py-2 rounded-xl bg-[#1C1917] text-white text-xs font-bold hover:bg-[#231F1C] transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FDB27C]" /> Add / Select Featured Project
                      </button>
                    </div>
                  )}
                </div>

                {/* Joined Wings Summary */}
                <div className="pt-4 border-t border-[#EFEAE3] space-y-2">
                  <span className="text-xs text-[#756860] block font-semibold">Active Wing Memberships:</span>
                  {joinedWingsCount > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {wings
                        .filter((w) => w.isJoined)
                        .map((w) => (
                          <span
                            key={w.id}
                            className="px-3 py-1 rounded-xl bg-[#EFEAE3] text-[#1C1917] text-xs font-bold"
                          >
                            {w.name}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-[#756860]">
                      No wings joined yet. Go to Co-Curricular Wings tab to select your wing memberships.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PROFILE & SHOWCASE ==================== */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* EDIT FORM */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE3] shadow-xs space-y-6">
              <div className="border-b border-[#EFEAE3] pb-4 space-y-1">
                <h2 className="text-xl font-bold font-heading text-[#1C1917]">
                  Edit Profile Information
                </h2>
                <p className="text-xs text-[#756860]">
                  Update your public student profile. System identity fields (Role, Status, Register #, Batch) cannot be modified.
                </p>
              </div>

              {profileMessage && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                      placeholder="e.g. Alan Turing"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#756860] block">
                      Username (Read Only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.username}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#EFEAE3]/50 text-[#756860] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#756860] block">
                      Register / Roll Number (Read Only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile?.registerNumber || ""}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#EFEAE3]/50 text-[#756860] cursor-not-allowed font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#756860] block">
                      Batch (Read Only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile?.batch || ""}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#EFEAE3]/50 text-[#756860] cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Blood Group and Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1C1917] block">Short Bio</label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                    placeholder="Brief introduction about your academic interests, AI focus areas, or projects..."
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1C1917] block">Profile Photo (Upload or URL)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={profilePhotoUrl}
                      onChange={(e) => setProfilePhotoUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                      placeholder="https://example.com/photo.jpg or choose file to upload"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold hover:bg-[#231F1C] transition-all cursor-pointer inline-flex items-center justify-center shrink-0">
                      {photoUploading ? "Uploading..." : "Choose Image File"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handlePhotoFileUpload}
                        disabled={photoUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[10px] text-[#756860] block">
                    Supported formats: JPG, PNG, WebP, GIF (Max 5MB). Files are saved to durable external storage.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">GitHub URL</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">LinkedIn URL</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1C1917] block">Personal Website</label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                      placeholder="https://mywebsite.com"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold hover:bg-[#231F1C] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {profileSaving ? "Saving Changes..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* LIVE PUBLIC DIRECTORY CARD PREVIEW */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-[#EFEAE3] shadow-xs space-y-4">
                <div className="border-b border-[#EFEAE3] pb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#756860]">
                    Public Directory Card Preview
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Live Preview
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-4">
                  <div className="flex items-center gap-4">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt={fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#EFEAE3]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#1C1917] text-white flex items-center justify-center font-serif text-xl font-bold shrink-0">
                        {(fullName || user.username).charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold font-heading text-[#1C1917]">
                        {fullName || user.username}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#756860] mt-0.5">
                        <span>Batch {profile?.batch}</span>
                        <span>&bull;</span>
                        <span className="font-mono">{profile?.registerNumber}</span>
                      </div>
                    </div>
                  </div>

                  {bio ? (
                    <p className="text-xs text-[#756860] leading-relaxed border-t border-[#EFEAE3] pt-3">
                      {bio}
                    </p>
                  ) : (
                    <p className="text-xs italic text-[#756860] border-t border-[#EFEAE3] pt-3">
                      No bio added yet.
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#EFEAE3] flex items-center gap-3 text-[#756860]">
                    {githubUrl && <Github className="w-4 h-4" />}
                    {linkedinUrl && <Linkedin className="w-4 h-4" />}
                    {websiteUrl && <Globe className="w-4 h-4" />}
                    {!githubUrl && !linkedinUrl && !websiteUrl && (
                      <span className="text-[11px] italic">No social links added</span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#756860] leading-normal">
                  This card displays on the public website under <strong className="text-[#1C1917]">Students Directory (/students)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: PORTFOLIO & PROJECTS ==================== */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFEAE3] pb-4">
              <div>
                <h2 className="text-2xl font-bold font-heading text-[#1C1917]">
                  My Portfolio Projects
                </h2>
                <p className="text-xs text-[#756860]">
                  Manage research models, software apps, and data science projects in your student portfolio.
                </p>
              </div>
              <button
                onClick={() => handleOpenProjectModal()}
                className="px-4 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold hover:bg-[#231F1C] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#FDB27C]" /> Add New Project
              </button>
            </div>

            {/* PROJECTS GRID */}
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-3xl border border-[#EFEAE3] shadow-xs p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {proj.imageUrl && (
                        <img
                          src={proj.imageUrl}
                          alt={proj.title}
                          className="w-full h-40 rounded-2xl object-cover border border-[#EFEAE3]"
                        />
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-bold font-heading text-[#1C1917]">
                            {proj.title}
                          </h3>
                          {proj.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#756860] leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#EFEAE3] flex items-center justify-between">
                      <button
                        onClick={() => handleToggleFeatured(proj)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                          proj.isFeatured
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-[#FBF9F7] text-[#756860] border-[#EFEAE3] hover:bg-[#EFEAE3]"
                        }`}
                      >
                        <Star className={`w-3 h-3 ${proj.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                        {proj.isFeatured ? "Featured" : "Set Featured"}
                      </button>

                      <div className="flex items-center gap-2">
                        {proj.projectUrl && (
                          <a
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#1C1917] hover:bg-[#EFEAE3] transition-colors"
                            aria-label="View Project"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenProjectModal(proj)}
                          className="p-2 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#1C1917] hover:bg-[#EFEAE3] transition-colors"
                          aria-label="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                          aria-label="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-4 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] text-[#756860] flex items-center justify-center mx-auto">
                  <FolderKanban className="w-7 h-7 opacity-50" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-heading text-[#1C1917]">
                    No projects have been added to your portfolio yet.
                  </h3>
                  <p className="text-xs text-[#756860]">
                    Create your first project entry to feature your work on the public department showcase.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenProjectModal()}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold hover:bg-[#231F1C] transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#FDB27C]" /> Create First Project
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: WINGS ==================== */}
        {activeTab === "wings" && (
          <div className="space-y-6">
            <div className="border-b border-[#EFEAE3] pb-4 space-y-1">
              <h2 className="text-2xl font-bold font-heading text-[#1C1917]">
                Department Co-Curricular Wings
              </h2>
              <p className="text-xs text-[#756860]">
                Select the co-curricular wings you participate in. Your wing badges appear on your public profile card.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wings.map((wing) => (
                <div
                  key={wing.id}
                  className={`bg-white rounded-3xl border shadow-xs p-6 space-y-4 flex flex-col justify-between transition-all ${
                    wing.isJoined ? "border-emerald-300 bg-emerald-50/10" : "border-[#EFEAE3]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EFEAE3] text-[#1C1917] text-[10px] font-bold">
                        {wing.type}
                      </span>
                      {wing.isJoined && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Member
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold font-heading text-[#1C1917]">
                      {wing.name}
                    </h3>
                    <p className="text-xs text-[#756860] leading-relaxed">
                      {wing.description || "Official department co-curricular wing."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#EFEAE3] flex justify-end">
                    <button
                      disabled={wingTogglingId === wing.id}
                      onClick={() => handleToggleWing(wing.id, wing.isJoined)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                        wing.isJoined
                          ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          : "bg-[#1C1917] text-white hover:bg-[#231F1C]"
                      }`}
                    >
                      {wingTogglingId === wing.id ? (
                        "Updating..."
                      ) : wing.isJoined ? (
                        <>
                          <X className="w-3.5 h-3.5" /> Leave Wing
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-[#FDB27C]" /> Join Wing
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: NOTES ==================== */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="border-b border-[#EFEAE3] pb-4 space-y-1">
              <h2 className="text-2xl font-bold font-heading text-[#1C1917]">
                Academic Notes & Study Resources
              </h2>
              <p className="text-xs text-[#756860]">
                Access and download official faculty lecture slides, lab references, and course notes.
              </p>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-2xl border border-[#EFEAE3] shadow-xs flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-[#756860] absolute left-3 top-3" />
                <input
                  type="text"
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  placeholder="Search notes by title or subject..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#756860]" />
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-xs font-bold text-[#1C1917] focus:outline-none"
                >
                  <option value="ALL">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s.toString()}>
                      Semester {s}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-xs font-bold text-[#1C1917] focus:outline-none max-w-[180px] truncate"
                >
                  <option value="ALL">All Subjects</option>
                  {initialSubjects.map((sub) => (
                    <option key={sub.id} value={sub.code}>
                      {sub.code} — {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* NOTES GRID */}
            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-6 rounded-3xl bg-white border border-[#EFEAE3] shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] flex items-center justify-center text-[#1C1917]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#1C1917] text-[#FDB27C] text-xs font-bold font-mono">
                          Sem {n.semester}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono font-bold text-[#756860]">
                          {n.subject.code} &bull; {n.subject.name}
                        </span>
                        <h3 className="text-base font-bold text-[#1C1917]">{n.title}</h3>
                        {n.description && (
                          <p className="text-xs text-[#756860] line-clamp-2">{n.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EFEAE3] flex items-center justify-between text-xs">
                      <span className="text-[#756860]">
                        By <strong className="text-[#1C1917]">{n.uploader.fullName}</strong>
                      </span>

                      <button
                        onClick={() => handleDownloadNote(n.id)}
                        disabled={downloadingNoteId === n.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C1917] text-white font-bold hover:bg-[#231F1C] transition-all disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FDB27C]" />{" "}
                        {downloadingNoteId === n.id ? "Securing..." : "Download Note"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-white border border-[#EFEAE3] text-center space-y-3 max-w-md mx-auto">
                <FileText className="w-10 h-10 text-[#756860] mx-auto opacity-40" />
                <h3 className="text-base font-bold text-[#1C1917]">
                  No academic notes are available yet.
                </h3>
                <p className="text-xs text-[#756860]">
                  Faculty members upload notes and course materials directly for each subject semester.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==================== PROJECT CREATE/EDIT MODAL ==================== */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EFEAE3] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EFEAE3] pb-4">
              <h3 className="text-xl font-bold font-heading text-[#1C1917]">
                {editingProject ? "Edit Portfolio Project" : "Add New Project"}
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 rounded-lg text-[#756860] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {projectError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{projectError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C1917] block">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                  placeholder="e.g. Brain Tumor Segmentation using CNN"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C1917] block">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                  placeholder="Detailed summary of problem statement, machine learning architecture, dataset, and results..."
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C1917] block">Project / Repository URL</label>
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                  placeholder="https://github.com/myrepo or live app URL"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C1917] block">Image / Thumbnail URL</label>
                <input
                  type="url"
                  value={projectImageUrl}
                  onChange={(e) => setProjectImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFEAE3] bg-[#FBF9F7] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                  placeholder="https://example.com/project-screenshot.jpg"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeaturedCheck"
                  checked={projectIsFeatured}
                  onChange={(e) => setProjectIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#1C1917] focus:ring-[#1C1917]"
                />
                <label htmlFor="isFeaturedCheck" className="text-xs font-bold text-[#1C1917] cursor-pointer">
                  Mark as Primary Featured Project
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EFEAE3]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-xs font-bold text-[#756860] hover:bg-[#EFEAE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold hover:bg-[#231F1C] transition-all disabled:opacity-50"
                >
                  {projectSaving ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
