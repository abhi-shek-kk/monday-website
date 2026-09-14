"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  BookOpen,
  FolderKanban,
  Calendar,
  Camera,
  Layers,
  FileText,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  Star,
  RefreshCw,
  Search,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AdminStats {
  totalStudents: number;
  pendingStudents: number;
  approvedStudents: number;
  facultyCount: number;
  subjectCount: number;
  projectCount: number;
  publishedEvents: number;
  publishedGallery: number;
  notesCount: number;
  wingCount: number;
}

interface StudentItem {
  id: string;
  username: string;
  email: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  studentProfile: {
    fullName: string;
    registerNumber: string;
    batch: string;
    bloodGroup?: string | null;
    dateOfBirth?: string | Date | null;
    projects?: { id: string; title: string }[];
    wingMemberships?: { wing: { name: string; type: string } }[];
  } | null;
}

interface FacultyItem {
  id: string;
  username: string;
  email: string | null;
  status: string;
  facultyProfile: {
    id: string;
    fullName: string;
    designation: string;
    qualification: string;
    bio: string | null;
    profilePhotoUrl: string | null;
    subjects: {
      subject: { id: string; code: string; name: string; semester: number };
    }[];
    notes: { id: string; title: string; semester: number }[];
  } | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: number;
  faculties: {
    faculty: { id: string; fullName: string; designation: string };
  }[];
  notes: { id: string; title: string }[];
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  projectUrl: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    registerNumber: string;
    batch: string;
    user: { username: string; status: string };
  };
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdBy: { username: string; role: string };
}

interface GalleryItemType {
  id: string;
  imageUrl: string;
  caption: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  uploader: { username: string; role: string };
}

interface WingItem {
  id: string;
  name: string;
  type: string;
  description: string | null;
  _count: { members: number };
}

interface NoteItem {
  id: string;
  title: string;
  description: string | null;
  semester: number;
  fileUrl: string;
  fileType: string | null;
  subject: { code: string; name: string; semester: number };
  uploader: { fullName: string; designation: string };
  createdAt: string;
}

interface CleanupProfileItem {
  id: string;
  username: string;
  email: string | null;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  profileId?: string;
  fullName: string;
  registerNumber?: string | null;
  batch?: string | null;
  designation?: string | null;
  qualification?: string | null;
  reasons: { category: "DUPLICATE" | "DEMO_TEST" | "INCOMPLETE" | "UNUSED"; description: string }[];
  linkedItemsCount: {
    projects: number;
    notes: number;
    events: number;
    gallery: number;
    wings: number;
  };
}

export default function AdminManagementClient() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "faculty" | "subjects" | "projects" | "events" | "gallery" | "wings" | "notes" | "cleanup"
  >("overview");

  // State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Messages
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Tab Data States
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>("ALL");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItemType[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const [wings, setWings] = useState<WingItem[]>([]);
  const [isLoadingWings, setIsLoadingWings] = useState(false);

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Profile Cleanup States
  const [cleanupItems, setCleanupItems] = useState<CleanupProfileItem[]>([]);
  const [isLoadingCleanup, setIsLoadingCleanup] = useState(false);
  const [cleanupCategoryFilter, setCleanupCategoryFilter] = useState<string>("ALL");
  const [selectedCleanupDetail, setSelectedCleanupDetail] = useState<CleanupProfileItem | null>(null);
  const [deleteCleanupTarget, setDeleteCleanupTarget] = useState<CleanupProfileItem | null>(null);
  const [isDeletingCleanup, setIsDeletingCleanup] = useState(false);

  // Form States
  // Provision Faculty Form
  const [facultyForm, setFacultyForm] = useState({
    username: "",
    password: "",
    fullName: "",
    designation: "Assistant Professor",
    qualification: "M.Tech in AI / Ph.D",
    email: "",
  });
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Edit Faculty Form
  const [editingFaculty, setEditingFaculty] = useState<{
    id: string;
    fullName: string;
    designation: string;
    qualification: string;
    bio: string;
  } | null>(null);

  // Subject Form
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    semester: 1,
    description: "",
  });
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // Assign Subject Form
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ facultyId: "", subjectId: "" });

  // Event Form
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    imageUrl: "",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  });
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Gallery Form
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    imageUrl: "",
    caption: "",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  });
  const [isSavingGallery, setIsSavingGallery] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "student" | "subject" | "project" | "event" | "gallery" | "note";
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (globalSuccess || globalError) {
      const timer = setTimeout(() => {
        setGlobalSuccess(null);
        setGlobalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [globalSuccess, globalError]);

  // Fetch Overview Stats
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      }
    } catch {
      setGlobalError("Failed to fetch admin dashboard statistics.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch data per tab
  useEffect(() => {
    if (activeTab === "overview") {
      fetchStats();
    } else if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "faculty") {
      fetchFaculty();
    } else if (activeTab === "subjects") {
      fetchSubjects();
      fetchFaculty();
    } else if (activeTab === "projects") {
      fetchProjects();
    } else if (activeTab === "events") {
      fetchEvents();
    } else if (activeTab === "gallery") {
      fetchGallery();
    } else if (activeTab === "wings") {
      fetchWings();
    } else if (activeTab === "notes") {
      fetchNotes();
    } else if (activeTab === "cleanup") {
      fetchCleanup();
    }
  }, [activeTab]);

  // Handlers
  const fetchCleanup = async () => {
    setIsLoadingCleanup(true);
    try {
      const res = await fetch("/api/admin/cleanup");
      const data = await res.json();
      if (res.ok) setCleanupItems(data.cleanupItems || []);
    } catch {
      setGlobalError("Failed to load profile cleanup data.");
    } finally {
      setIsLoadingCleanup(false);
    }
  };

  const executeDeleteCleanup = async () => {
    if (!deleteCleanupTarget) return;
    setIsDeletingCleanup(true);

    try {
      const res = await fetch(`/api/admin/cleanup/${deleteCleanupTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.error || "Failed to delete profile.");
      } else {
        setGlobalSuccess(data.message || "Profile deleted successfully!");
        setDeleteCleanupTarget(null);
        setSelectedCleanupDetail(null);
        fetchCleanup();
        fetchStats();
      }
    } catch {
      setGlobalError("Network error while deleting profile.");
    } finally {
      setIsDeletingCleanup(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const url = new URL("/api/admin/students", window.location.origin);
      if (studentSearch) url.searchParams.set("query", studentSearch);
      if (studentStatusFilter !== "ALL") url.searchParams.set("status", studentStatusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) setStudents(data.students || []);
    } catch {
      setGlobalError("Failed to load students.");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchFaculty = async () => {
    setIsLoadingFaculty(true);
    try {
      const res = await fetch("/api/admin/faculty");
      const data = await res.json();
      if (res.ok) setFacultyList(data.faculty || []);
    } catch {
      setGlobalError("Failed to load faculty.");
    } finally {
      setIsLoadingFaculty(false);
    }
  };

  const fetchSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const res = await fetch("/api/admin/subjects");
      const data = await res.json();
      if (res.ok) setSubjects(data.subjects || []);
    } catch {
      setGlobalError("Failed to load subjects.");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (res.ok) setProjects(data.projects || []);
    } catch {
      setGlobalError("Failed to load projects.");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (res.ok) setEvents(data.events || []);
    } catch {
      setGlobalError("Failed to load events.");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (res.ok) setGalleryItems(data.galleryItems || []);
    } catch {
      setGlobalError("Failed to load gallery items.");
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const fetchWings = async () => {
    setIsLoadingWings(true);
    try {
      const res = await fetch("/api/admin/wings");
      const data = await res.json();
      if (res.ok) setWings(data.wings || []);
    } catch {
      setGlobalError("Failed to load wings.");
    } finally {
      setIsLoadingWings(false);
    }
  };

  const fetchNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const res = await fetch("/api/admin/notes");
      const data = await res.json();
      if (res.ok) setNotes(data.notes || []);
    } catch {
      setGlobalError("Failed to load notes.");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Student Approval
  const handleStudentApproval = async (userId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/approve-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Approval update failed.");
      } else {
        setGlobalSuccess(status === "APPROVED" ? "Student approved!" : "Student registration rejected.");
        fetchStudents();
        fetchStats();
      }
    } catch {
      setGlobalError("Failed to process approval.");
    }
  };

  // Faculty Provisioning
  const handleFacultyProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    setGlobalError(null);
    setGlobalSuccess(null);

    try {
      const res = await fetch("/api/admin/provision-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facultyForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Faculty provisioning failed.");
      } else {
        setGlobalSuccess(`Faculty user '${data.user.username}' provisioned successfully!`);
        setFacultyForm({
          username: "",
          password: "",
          fullName: "",
          designation: "Assistant Professor",
          qualification: "M.Tech in AI / Ph.D",
          email: "",
        });
        fetchFaculty();
        fetchStats();
      }
    } catch {
      setGlobalError("Network error while provisioning faculty.");
    } finally {
      setIsProvisioning(false);
    }
  };

  // Faculty Profile Update
  const handleFacultyUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;

    try {
      const res = await fetch(`/api/admin/faculty/${editingFaculty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFaculty),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Faculty update failed.");
      } else {
        setGlobalSuccess("Faculty details updated successfully!");
        setEditingFaculty(null);
        fetchFaculty();
      }
    } catch {
      setGlobalError("Failed to update faculty profile.");
    }
  };

  // Create Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSubject(true);

    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Failed to create subject.");
      } else {
        setGlobalSuccess(`Subject '${data.subject.code}' created successfully!`);
        setShowSubjectModal(false);
        setSubjectForm({ code: "", name: "", semester: 1, description: "" });
        fetchSubjects();
        fetchStats();
      }
    } catch {
      setGlobalError("Network error while creating subject.");
    } finally {
      setIsSavingSubject(false);
    }
  };

  // Assign Subject
  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/subjects/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Failed to assign subject.");
      } else {
        setGlobalSuccess("Faculty assigned to subject successfully!");
        setShowAssignModal(false);
        setAssignForm({ facultyId: "", subjectId: "" });
        fetchSubjects();
        fetchFaculty();
      }
    } catch {
      setGlobalError("Network error during assignment.");
    }
  };

  const handleRemoveAssignment = async (facultyId: string, subjectId: string) => {
    try {
      const res = await fetch("/api/admin/subjects/assign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, subjectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Failed to remove assignment.");
      } else {
        setGlobalSuccess("Faculty assignment removed.");
        fetchSubjects();
        fetchFaculty();
      }
    } catch {
      setGlobalError("Network error removing assignment.");
    }
  };

  // Toggle Project Featured
  const handleToggleProjectFeatured = async (projectId: string, isFeatured: boolean) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Failed to update project.");
      } else {
        setGlobalSuccess(!isFeatured ? "Project marked as featured!" : "Project unfeatured.");
        fetchProjects();
      }
    } catch {
      setGlobalError("Error updating project featured status.");
    }
  };

  // Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEvent(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Failed to create event.");
      } else {
        setGlobalSuccess(`Event '${data.event.title}' created successfully!`);
        setShowEventModal(false);
        setEventForm({
          title: "",
          description: "",
          eventDate: "",
          location: "",
          imageUrl: "",
          status: "PUBLISHED",
        });
        fetchEvents();
        fetchStats();
      }
    } catch {
      setGlobalError("Network error while creating event.");
    } finally {
      setIsSavingEvent(false);
    }
  };

  // Gallery File State
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  // Create Gallery Item
  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGallery(true);
    try {
      let res: Response;
      if (galleryFile) {
        const formData = new FormData();
        formData.append("file", galleryFile);
        if (galleryForm.caption) formData.append("caption", galleryForm.caption);
        formData.append("status", galleryForm.status);

        res = await fetch("/api/admin/gallery", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!galleryForm.imageUrl) {
          throw new Error("Please select an image file to upload or enter an image URL.");
        }
        res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(galleryForm),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error || "Failed to create gallery item.");
      } else {
        setGlobalSuccess("Gallery photo published successfully!");
        setShowGalleryModal(false);
        setGalleryFile(null);
        setGalleryForm({ imageUrl: "", caption: "", status: "PUBLISHED" });
        fetchGallery();
        fetchStats();
      }
    } catch (err: any) {
      setGlobalError(err.message || "Network error publishing photo.");
    } finally {
      setIsSavingGallery(false);
    }
  };

  // Execute Deletion Confirmation
  const executeDelete = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);

    const { type, id } = deleteConfirmation;

    try {
      let endpoint = "";
      if (type === "student") endpoint = `/api/admin/students/${id}`;
      else if (type === "subject") endpoint = `/api/admin/subjects/${id}`;
      else if (type === "project") endpoint = `/api/admin/projects/${id}`;
      else if (type === "event") endpoint = `/api/admin/events/${id}`;
      else if (type === "gallery") endpoint = `/api/admin/gallery/${id}`;
      else if (type === "note") endpoint = `/api/admin/notes/${id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.error || `Failed to delete ${type}.`);
      } else {
        setGlobalSuccess(`${type.toUpperCase()} deleted successfully!`);
        if (type === "student") fetchStudents();
        else if (type === "subject") fetchSubjects();
        else if (type === "project") fetchProjects();
        else if (type === "event") fetchEvents();
        else if (type === "gallery") fetchGallery();
        else if (type === "note") fetchNotes();
        fetchStats();
      }
    } catch {
      setGlobalError(`Network error while deleting ${type}.`);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Global Alerts */}
      {globalError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {globalSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{globalSuccess}</span>
          </div>
          <button onClick={() => setGlobalSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-[#EFEAE3] shadow-sm overflow-x-auto flex items-center gap-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "overview"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "students"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Students
          {stats?.pendingStudents ? (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {stats.pendingStudents}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("faculty")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "faculty"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Faculty
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "subjects"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Subjects / Courses
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "projects"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" /> Projects
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "events"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Events
        </button>

        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "gallery"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> Gallery
        </button>

        <button
          onClick={() => setActiveTab("wings")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "wings"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Wings
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "notes"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Study Notes
        </button>

        <button
          onClick={() => setActiveTab("cleanup")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "cleanup"
              ? "bg-red-900 text-white shadow-sm"
              : "text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" /> Profile Cleanup
          {cleanupItems.length > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
              {cleanupItems.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1C1917]">Department Overview & Real Metrics</h2>
            <button
              onClick={fetchStats}
              disabled={isLoadingStats}
              className="px-3 py-1.5 bg-white hover:bg-[#FBF9F7] text-xs font-medium rounded-xl border border-[#EFEAE3] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? "animate-spin" : ""}`} /> Refresh Overview
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Total Students</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.totalStudents ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2 flex justify-between">
                <span>Approved: <strong className="text-emerald-700">{stats?.approvedStudents ?? 0}</strong></span>
                <span>Pending: <strong className="text-amber-700">{stats?.pendingStudents ?? 0}</strong></span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Department Faculty</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.facultyCount ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2">
                Provisioned & Verified Accounts
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Academic Subjects</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.subjectCount ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2">
                Across Semesters 1 &ndash; 8
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Student Projects</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.projectCount ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2">
                Portfolios & Research Projects
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Published Events</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.publishedEvents ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2">
                Seminars & Workshops
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Gallery Media</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.publishedGallery ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2">
                Photos & Activities
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Study Notes</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.notesCount ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2">
                Faculty Learning Resources
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFEAE3] shadow-xs space-y-1">
              <div className="text-xs font-semibold text-[#756860] uppercase tracking-wider">Department Wings</div>
              <div className="text-3xl font-bold text-[#1C1917]">{stats?.wingCount ?? 0}</div>
              <div className="text-[11px] text-[#756860] pt-1 border-t border-[#EFEAE3] mt-2">
                Co-curricular Wings
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE3]">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" /> Student Approvals & Directory
                </h2>
                <p className="text-xs text-[#756860] mt-0.5">
                  Manage student registration approvals and oversee student portal accounts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#756860] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, username, reg no..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
                    className="pl-9 pr-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C] w-60"
                  />
                </div>

                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="APPROVED">Approved Only</option>
                  <option value="REJECTED">Rejected Only</option>
                </select>

                <button
                  onClick={fetchStudents}
                  className="px-3 py-1.5 bg-[#1C1917] hover:bg-[#231F1C] text-white text-xs font-medium rounded-xl transition-all shadow-xs"
                >
                  Filter
                </button>
              </div>
            </div>

            {isLoadingStudents ? (
              <div className="py-12 text-center text-sm text-[#756860]">Loading student directory...</div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#756860] bg-[#FBF9F7] rounded-xl border border-dashed border-[#EFEAE3]">
                No students match your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FBF9F7] text-xs uppercase tracking-wider text-[#756860]">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Student Name</th>
                      <th className="p-3.5">Username / Reg No</th>
                      <th className="p-3.5">Batch</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEAE3]">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-[#FBF9F7]/50">
                        <td className="p-3.5">
                          <div className="font-semibold text-[#1C1917] flex items-center gap-2">
                            <span>{student.studentProfile?.fullName || "Unset Profile"}</span>
                            {student.studentProfile?.bloodGroup && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                                {student.studentProfile.bloodGroup}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#756860]">
                            {student.email || "No email"}
                            {student.studentProfile?.dateOfBirth && (
                              <span> &bull; DOB: {new Date(student.studentProfile.dateOfBirth).toLocaleDateString("en-GB")}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono text-xs text-[#1C1917]">{student.username}</div>
                          <div className="text-xs text-[#756860]">
                            Reg: {student.studentProfile?.registerNumber || "N/A"}
                          </div>
                        </td>
                        <td className="p-3.5 text-[#756860] font-medium">
                          {student.studentProfile?.batch || "N/A"}
                        </td>
                        <td className="p-3.5">
                          {student.status === "PENDING" && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> PENDING
                            </span>
                          )}
                          {student.status === "APPROVED" && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> APPROVED
                            </span>
                          )}
                          {student.status === "REJECTED" && (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold inline-flex items-center gap-1">
                              <X className="w-3 h-3" /> REJECTED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {student.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleStudentApproval(student.id, "APPROVED")}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleStudentApproval(student.id, "REJECTED")}
                                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}

                            {student.status === "REJECTED" && (
                              <button
                                onClick={() => handleStudentApproval(student.id, "APPROVED")}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1 shadow-xs"
                              >
                                Re-approve
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: "student",
                                  id: student.id,
                                  title: student.studentProfile?.fullName || student.username,
                                })
                              }
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY */}
      {activeTab === "faculty" && (
        <div className="space-y-8">
          {/* Provision Faculty Form */}
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="pb-4 border-b border-[#EFEAE3]">
              <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Provision Faculty Account
              </h2>
              <p className="text-xs text-[#756860] mt-0.5">
                Faculty accounts are provisioned directly by Admin (bypasses public signup).
              </p>
            </div>

            <form onSubmit={handleFacultyProvisionSubmit} className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.fullName}
                    onChange={(e) => setFacultyForm({ ...facultyForm, fullName: e.target.value })}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                    placeholder="e.g. Assistant Professor / HOD"
                    className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.username}
                    onChange={(e) => setFacultyForm({ ...facultyForm, username: e.target.value })}
                    placeholder="e.g. jsmith_faculty"
                    className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={facultyForm.password}
                    onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.qualification}
                    onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                    placeholder="e.g. Ph.D in Computer Science"
                    className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#756860] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    placeholder="jsmith@sbcollege.ac.in"
                    className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FDB27C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProvisioning}
                className="py-2.5 px-5 bg-[#1C1917] hover:bg-[#231F1C] text-white font-medium text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                {isProvisioning ? "Provisioning..." : "Provision Faculty Account"}
              </button>
            </form>
          </div>

          {/* Faculty List */}
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <h3 className="text-md font-bold text-[#1C1917]">Department Faculty Directory</h3>

            {isLoadingFaculty ? (
              <div className="py-8 text-center text-sm text-[#756860]">Loading faculty list...</div>
            ) : facultyList.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#756860]">No faculty provisioned yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultyList.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-[#1C1917]">
                            {f.facultyProfile?.fullName || f.username}
                          </h4>
                          <p className="text-xs text-[#756860]">
                            {f.facultyProfile?.designation} &bull; {f.facultyProfile?.qualification}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setEditingFaculty({
                              id: f.facultyProfile?.id || "",
                              fullName: f.facultyProfile?.fullName || "",
                              designation: f.facultyProfile?.designation || "",
                              qualification: f.facultyProfile?.qualification || "",
                              bio: f.facultyProfile?.bio || "",
                            })
                          }
                          className="p-1.5 text-[#756860] hover:text-[#1C1917] hover:bg-white rounded-lg transition-all"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#EFEAE3] space-y-1 text-xs">
                        <div className="text-[#756860]">
                          Username: <span className="font-mono text-[#1C1917]">{f.username}</span>
                        </div>
                        <div className="text-[#756860]">
                          Assigned Subjects:{" "}
                          <strong className="text-[#1C1917]">
                            {f.facultyProfile?.subjects.length || 0} subjects
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Faculty Modal */}
          {editingFaculty && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
                  <h3 className="font-bold text-[#1C1917]">Edit Faculty Profile</h3>
                  <button onClick={() => setEditingFaculty(null)} className="text-[#756860] hover:text-[#1C1917]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleFacultyUpdateSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingFaculty.fullName}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, fullName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      value={editingFaculty.designation}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Qualification</label>
                    <input
                      type="text"
                      required
                      value={editingFaculty.qualification}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, qualification: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={editingFaculty.bio}
                      onChange={(e) => setEditingFaculty({ ...editingFaculty, bio: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingFaculty(null)}
                      className="px-3 py-1.5 text-xs text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-xl hover:bg-[#231F1C]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SUBJECTS */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE3]">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" /> Academic Subjects & Course Catalog
                </h2>
                <p className="text-xs text-[#756860] mt-0.5">
                  Manage department subjects (Semesters 1&ndash;8) and faculty course assignments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-3 py-1.5 bg-[#EFEAE3] hover:bg-[#EFEAE3]/80 text-[#1C1917] text-xs font-semibold rounded-xl transition-all border border-[#EFEAE3]"
                >
                  Assign Faculty
                </button>
                <button
                  onClick={() => setShowSubjectModal(true)}
                  className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#231F1C] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </button>
              </div>
            </div>

            {isLoadingSubjects ? (
              <div className="py-8 text-center text-sm text-[#756860]">Loading subjects...</div>
            ) : subjects.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#756860]">No subjects configured.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FBF9F7] text-xs uppercase tracking-wider text-[#756860]">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Code</th>
                      <th className="p-3.5">Subject Name</th>
                      <th className="p-3.5">Semester</th>
                      <th className="p-3.5">Assigned Faculty</th>
                      <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEAE3]">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#FBF9F7]/50">
                        <td className="p-3.5 font-mono text-xs font-bold text-[#1C1917]">{sub.code}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-[#1C1917]">{sub.name}</div>
                          {sub.description && (
                            <div className="text-xs text-[#756860] truncate max-w-md">{sub.description}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-xs text-[#756860]">
                          <span className="px-2 py-0.5 rounded-full bg-[#EFEAE3] text-[#1C1917] font-semibold">
                            Semester {sub.semester}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs">
                          {sub.faculties.length === 0 ? (
                            <span className="text-[#756860] italic">Unassigned</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {sub.faculties.map((f) => (
                                <span
                                  key={f.faculty.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-200"
                                >
                                  {f.faculty.fullName}
                                  <button
                                    onClick={() => handleRemoveAssignment(f.faculty.id, sub.id)}
                                    className="hover:text-red-600 ml-0.5"
                                    title="Remove Assignment"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: "subject",
                                id: sub.id,
                                title: `${sub.code} — ${sub.name}`,
                              })
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Subject Modal */}
          {showSubjectModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
                  <h3 className="font-bold text-[#1C1917]">Add Academic Subject</h3>
                  <button onClick={() => setShowSubjectModal(false)} className="text-[#756860] hover:text-[#1C1917]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateSubject} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Subject Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AIDS303"
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs uppercase font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Subject Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Reinforcement Learning"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Semester *</label>
                    <select
                      value={subjectForm.semester}
                      onChange={(e) => setSubjectForm({ ...subjectForm, semester: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Subject syllabus overview..."
                      value={subjectForm.description}
                      onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSubjectModal(false)}
                      className="px-3 py-1.5 text-xs text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSubject}
                      className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-xl hover:bg-[#231F1C] disabled:opacity-50"
                    >
                      {isSavingSubject ? "Saving..." : "Add Subject"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Assign Faculty Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
                  <h3 className="font-bold text-[#1C1917]">Assign Faculty to Subject</h3>
                  <button onClick={() => setShowAssignModal(false)} className="text-[#756860] hover:text-[#1C1917]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAssignSubject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Select Faculty *</label>
                    <select
                      required
                      value={assignForm.facultyId}
                      onChange={(e) => setAssignForm({ ...assignForm, facultyId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    >
                      <option value="">-- Choose Faculty --</option>
                      {facultyList.map((f) => (
                        <option key={f.facultyProfile?.id || f.id} value={f.facultyProfile?.id}>
                          {f.facultyProfile?.fullName} ({f.facultyProfile?.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Select Subject *</label>
                    <select
                      required
                      value={assignForm.subjectId}
                      onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          [{sub.code}] {sub.name} (Sem {sub.semester})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-3 py-1.5 text-xs text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-xl hover:bg-[#231F1C]"
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="pb-4 border-b border-[#EFEAE3]">
              <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-emerald-600" /> Student Projects Moderation
              </h2>
              <p className="text-xs text-[#756860] mt-0.5">
                Review, feature, or moderate student project portfolios.
              </p>
            </div>

            {isLoadingProjects ? (
              <div className="py-8 text-center text-sm text-[#756860]">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#756860]">No student projects created yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#1C1917] leading-snug">{proj.title}</h3>
                        {proj.isFeatured ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-[#756860] line-clamp-3 leading-relaxed">{proj.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#EFEAE3] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#1C1917]">{proj.student.fullName}</div>
                        <div className="text-[11px] text-[#756860]">{proj.student.batch}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleProjectFeatured(proj.id, proj.isFeatured)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            proj.isFeatured
                              ? "bg-amber-50 text-amber-900 border border-amber-200"
                              : "bg-[#FBF9F7] text-[#1C1917] hover:bg-[#EFEAE3]"
                          }`}
                        >
                          {proj.isFeatured ? "Unfeature" : "Feature"}
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: "project",
                              id: proj.id,
                              title: proj.title,
                            })
                          }
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: EVENTS */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEAE3]">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" /> Department Events Management
                </h2>
                <p className="text-xs text-[#756860] mt-0.5">
                  Publish department seminars, workshops, and symposiums.
                </p>
              </div>

              <button
                onClick={() => setShowEventModal(true)}
                className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#231F1C] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Create Event
              </button>
            </div>

            {isLoadingEvents ? (
              <div className="py-8 text-center text-sm text-[#756860]">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#756860]">No department events published yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-700">
                          {new Date(evt.eventDate).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            evt.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {evt.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-[#1C1917] text-base leading-snug">{evt.title}</h3>
                      <p className="text-xs text-[#756860] line-clamp-3">{evt.description}</p>
                      {evt.location && <p className="text-xs text-[#1C1917] font-medium">&bull; {evt.location}</p>}
                    </div>

                    <div className="pt-3 border-t border-[#EFEAE3] flex items-center justify-between text-xs">
                      <span className="text-[#756860]">By: {evt.createdBy.username}</span>

                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: "event",
                            id: evt.id,
                            title: evt.title,
                          })
                        }
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Event Modal */}
          {showEventModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
                  <h3 className="font-bold text-[#1C1917]">Create Department Event</h3>
                  <button onClick={() => setShowEventModal(false)} className="text-[#756860] hover:text-[#1C1917]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI & Ethics Symposium 2026"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. SB College Auditorium / Online"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Event description and schedule..."
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="px-3 py-1.5 text-xs text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEvent}
                      className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-xl hover:bg-[#231F1C] disabled:opacity-50"
                    >
                      {isSavingEvent ? "Publishing..." : "Publish Event"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEAE3]">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-pink-600" /> Department Gallery Management
                </h2>
                <p className="text-xs text-[#756860] mt-0.5">
                  Publish photo media to the public department gallery.
                </p>
              </div>

              <button
                onClick={() => setShowGalleryModal(true)}
                className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#231F1C] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Gallery Photo
              </button>
            </div>

            {isLoadingGallery ? (
              <div className="py-8 text-center text-sm text-[#756860]">Loading gallery items...</div>
            ) : galleryItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#756860]">No gallery items added yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-2">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "Gallery item"}
                      className="w-full h-36 rounded-xl object-cover border border-[#EFEAE3]"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-medium text-[#1C1917] truncate">{item.caption || "No caption"}</p>
                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: "gallery",
                            id: item.id,
                            title: item.caption || "Gallery item",
                          })
                        }
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Gallery Modal */}
          {showGalleryModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
                  <h3 className="font-bold text-[#1C1917]">Add Gallery Photo</h3>
                  <button onClick={() => setShowGalleryModal(false)} className="text-[#756860] hover:text-[#1C1917]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateGallery} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">
                      Upload Image File (JPG, PNG, WebP, GIF - Max 10MB)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1C1917] file:text-white hover:file:bg-[#231F1C]"
                    />
                    {galleryFile && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        Selected Image: {galleryFile.name} ({(galleryFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">
                      Or Image URL {!galleryFile && "*"}
                    </label>
                    <input
                      type="url"
                      required={!galleryFile}
                      placeholder="https://..."
                      value={galleryForm.imageUrl}
                      onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#756860] mb-1">Caption</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Workshop 2026 Keynote"
                      value={galleryForm.caption}
                      onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGalleryModal(false)}
                      className="px-3 py-1.5 text-xs text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingGallery}
                      className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-xl hover:bg-[#231F1C] disabled:opacity-50"
                    >
                      {isSavingGallery ? "Publishing..." : "Publish Photo"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: WINGS */}
      {activeTab === "wings" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="pb-4 border-b border-[#EFEAE3]">
              <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" /> Department Wing Structure
              </h2>
              <p className="text-xs text-[#756860] mt-0.5">
                Official department co-curricular wings (NSS, Sports, Tech Team, NCC).
              </p>
            </div>

            {isLoadingWings ? (
              <div className="py-8 text-center text-sm text-[#756860]">Loading wings...</div>
            ) : wings.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#756860]">No wings configured.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wings.map((w) => (
                  <div key={w.id} className="p-5 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[#1C1917]">{w.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                        {w.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#756860] leading-relaxed">{w.description}</p>
                    <div className="pt-2 text-xs text-[#1C1917] font-semibold">
                      Student Members: {w._count.members}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="pb-4 border-b border-[#EFEAE3]">
              <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" /> Faculty Study Notes Oversight
              </h2>
              <p className="text-xs text-[#756860] mt-0.5">
                Review and moderate academic study materials published by department faculty.
              </p>
            </div>

            {isLoadingNotes ? (
              <div className="py-8 text-center text-sm text-[#756860]">Loading study notes...</div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#756860]">No faculty study notes uploaded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FBF9F7] text-xs uppercase tracking-wider text-[#756860]">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Note Title</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Semester</th>
                      <th className="p-3.5">Uploader</th>
                      <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEAE3]">
                    {notes.map((n) => (
                      <tr key={n.id} className="hover:bg-[#FBF9F7]/50">
                        <td className="p-3.5">
                          <div className="font-semibold text-[#1C1917]">{n.title}</div>
                          {n.description && <div className="text-xs text-[#756860]">{n.description}</div>}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-[#1C1917]">
                          [{n.subject.code}] {n.subject.name}
                        </td>
                        <td className="p-3.5 text-xs text-[#756860]">Semester {n.semester}</td>
                        <td className="p-3.5 text-xs">
                          <div className="font-medium text-[#1C1917]">{n.uploader.fullName}</div>
                          <div className="text-[#756860]">{n.uploader.designation}</div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: "note",
                                id: n.id,
                                title: n.title,
                              })
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 10: PROFILE CLEANUP */}
      {activeTab === "cleanup" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE3]">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600" /> Unwanted Profile & Duplicate Record Cleanup
                </h2>
                <p className="text-xs text-[#756860] mt-0.5">
                  Scan, inspect, and permanently remove demo profiles, test accounts, duplicate entries, and incomplete records.
                </p>
              </div>
              <button
                onClick={fetchCleanup}
                disabled={isLoadingCleanup}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-1.5 transition-all shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCleanup ? "animate-spin" : ""}`} /> Rescan Profiles
              </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
                <div className="text-[10px] font-semibold text-[#756860] uppercase">Total Flagged</div>
                <div className="text-2xl font-bold text-red-700">{cleanupItems.length}</div>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                <div className="text-[10px] font-semibold text-amber-900 uppercase">Duplicates</div>
                <div className="text-2xl font-bold text-amber-800">
                  {cleanupItems.filter((item) => item.reasons.some((r) => r.category === "DUPLICATE")).length}
                </div>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200">
                <div className="text-[10px] font-semibold text-purple-900 uppercase">Demo / Test</div>
                <div className="text-2xl font-bold text-purple-800">
                  {cleanupItems.filter((item) => item.reasons.some((r) => r.category === "DEMO_TEST")).length}
                </div>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                <div className="text-[10px] font-semibold text-blue-900 uppercase">Incomplete</div>
                <div className="text-2xl font-bold text-blue-800">
                  {cleanupItems.filter((item) => item.reasons.some((r) => r.category === "INCOMPLETE")).length}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="text-[10px] font-semibold text-gray-700 uppercase">Unused / Old</div>
                <div className="text-2xl font-bold text-gray-800">
                  {cleanupItems.filter((item) => item.reasons.some((r) => r.category === "UNUSED")).length}
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-semibold text-[#756860] mr-2">Filter:</span>
              {[
                { id: "ALL", label: "All Flagged" },
                { id: "DUPLICATE", label: "Potential Duplicates" },
                { id: "DEMO_TEST", label: "Demo / Test Accounts" },
                { id: "INCOMPLETE", label: "Incomplete Profiles" },
                { id: "UNUSED", label: "Unused / Old" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setCleanupCategoryFilter(filter.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    cleanupCategoryFilter === filter.id
                      ? "bg-[#1C1917] text-white shadow-xs"
                      : "bg-[#FBF9F7] text-[#756860] border border-[#EFEAE3] hover:text-[#1C1917]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Cleanup Items List */}
            {isLoadingCleanup ? (
              <div className="py-12 text-center text-sm text-[#756860]">Scanning profile database...</div>
            ) : cleanupItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold">No Unwanted or Duplicate Profiles Found!</p>
                <p className="text-xs text-emerald-700">All user accounts and profiles in the system are verified and clean.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cleanupItems
                  .filter((item) => {
                    if (cleanupCategoryFilter === "ALL") return true;
                    return item.reasons.some((r) => r.category === cleanupCategoryFilter);
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-white border border-[#EFEAE3] hover:border-red-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-2 flex-grow">
                        {/* Reason Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.reasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                reason.category === "DUPLICATE"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : reason.category === "DEMO_TEST"
                                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                                  : reason.category === "INCOMPLETE"
                                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                                  : "bg-gray-100 text-gray-800 border border-gray-300"
                              }`}
                            >
                              [{reason.category}] {reason.description}
                            </span>
                          ))}
                        </div>

                        {/* Profile Info */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-bold text-sm text-[#1C1917]">{item.fullName}</span>
                          <span className="text-xs font-mono text-[#756860]">(@{item.username})</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.role === "STUDENT"
                                ? "bg-blue-50 text-blue-700"
                                : item.role === "FACULTY"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {item.role}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {/* Additional Meta */}
                        <div className="text-xs text-[#756860] flex flex-wrap items-center gap-x-4 gap-y-1">
                          {item.email && <span>Email: <strong className="text-[#1C1917]">{item.email}</strong></span>}
                          {item.registerNumber && (
                            <span>Register No: <strong className="text-[#1C1917]">{item.registerNumber}</strong></span>
                          )}
                          {item.batch && <span>Batch: <strong className="text-[#1C1917]">{item.batch}</strong></span>}
                          {item.designation && <span>Designation: <strong className="text-[#1C1917]">{item.designation}</strong></span>}
                          <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Activity Summary */}
                        <div className="text-[11px] text-[#756860] flex items-center gap-3 pt-1 border-t border-[#EFEAE3]/60">
                          <span>Projects: <strong className="text-[#1C1917]">{item.linkedItemsCount.projects}</strong></span>
                          <span>Notes: <strong className="text-[#1C1917]">{item.linkedItemsCount.notes}</strong></span>
                          <span>Events: <strong className="text-[#1C1917]">{item.linkedItemsCount.events}</strong></span>
                          <span>Gallery: <strong className="text-[#1C1917]">{item.linkedItemsCount.gallery}</strong></span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 md:self-center">
                        <button
                          onClick={() => setSelectedCleanupDetail(item)}
                          className="px-3 py-1.5 bg-[#FBF9F7] hover:bg-[#EFEAE3]/60 text-xs font-semibold text-[#1C1917] rounded-xl border border-[#EFEAE3] transition-all"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setDeleteCleanupTarget(item)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-xl transition-all shadow-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#1C1917]">Confirm Deletion</h3>
                <p className="text-xs text-[#756860]">This action is safe but permanent.</p>
              </div>
            </div>

            <p className="text-xs text-[#1C1917] leading-relaxed bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
              Are you sure you want to delete{" "}
              <strong>&quot;{deleteConfirmation.title}&quot;</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup View Details Modal */}
      {selectedCleanupDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-lg w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#1C1917]">{selectedCleanupDetail.fullName}</h3>
                <p className="text-xs font-mono text-[#756860]">ID: {selectedCleanupDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedCleanupDetail(null)}
                className="p-1 rounded-lg text-[#756860] hover:bg-[#FBF9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#FBF9F7] p-4 rounded-xl border border-[#EFEAE3] text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-[#756860]">Username:</span> <strong className="text-[#1C1917]">{selectedCleanupDetail.username}</strong></div>
                <div><span className="text-[#756860]">Role:</span> <strong className="text-[#1C1917]">{selectedCleanupDetail.role}</strong></div>
                <div><span className="text-[#756860]">Account Status:</span> <strong className="text-[#1C1917]">{selectedCleanupDetail.status}</strong></div>
                <div><span className="text-[#756860]">Email:</span> <strong className="text-[#1C1917]">{selectedCleanupDetail.email || "N/A"}</strong></div>
                {selectedCleanupDetail.registerNumber && (
                  <div><span className="text-[#756860]">Register No:</span> <strong className="text-[#1C1917]">{selectedCleanupDetail.registerNumber}</strong></div>
                )}
                {selectedCleanupDetail.batch && (
                  <div><span className="text-[#756860]">Batch:</span> <strong className="text-[#1C1917]">{selectedCleanupDetail.batch}</strong></div>
                )}
                {selectedCleanupDetail.designation && (
                  <div><span className="text-[#756860]">Designation:</span> <strong className="text-[#1C1917]">{selectedCleanupDetail.designation}</strong></div>
                )}
                <div><span className="text-[#756860]">Created On:</span> <strong className="text-[#1C1917]">{new Date(selectedCleanupDetail.createdAt).toLocaleString()}</strong></div>
              </div>

              <div className="pt-2 border-t border-[#EFEAE3]">
                <span className="font-semibold block mb-1 text-[#1C1917]">Flagged Reasons:</span>
                <ul className="space-y-1 list-disc list-inside text-red-700">
                  {selectedCleanupDetail.reasons.map((r, i) => (
                    <li key={i}>[{r.category}] {r.description}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#EFEAE3]">
                <span className="font-semibold block mb-1 text-[#1C1917]">Associated Data:</span>
                <div className="grid grid-cols-2 gap-2 text-[#756860]">
                  <div>Projects: <strong>{selectedCleanupDetail.linkedItemsCount.projects}</strong></div>
                  <div>Study Notes: <strong>{selectedCleanupDetail.linkedItemsCount.notes}</strong></div>
                  <div>Events Created: <strong>{selectedCleanupDetail.linkedItemsCount.events}</strong></div>
                  <div>Gallery Photos: <strong>{selectedCleanupDetail.linkedItemsCount.gallery}</strong></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCleanupDetail(null)}
                className="px-4 py-2 text-xs font-medium text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteCleanupTarget(selectedCleanupDetail);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit Profile Deletion Confirmation Modal */}
      {deleteCleanupTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1C1917]">Confirm Permanent Deletion</h3>
                <p className="text-xs text-red-600 font-semibold">Irreversible Action</p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-xs space-y-2 text-red-950">
              <p className="font-bold text-red-900">You are about to permanently delete the following profile:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Name: <strong>{deleteCleanupTarget.fullName}</strong></li>
                <li>Username: <strong>@{deleteCleanupTarget.username}</strong></li>
                <li>Role: <strong>{deleteCleanupTarget.role}</strong></li>
                <li>User ID: <code className="font-mono">{deleteCleanupTarget.id}</code></li>
                {deleteCleanupTarget.registerNumber && <li>Register No: <strong>{deleteCleanupTarget.registerNumber}</strong></li>}
              </ul>
              <div className="pt-2 border-t border-red-200 text-red-900">
                ⚠️ All linked records (projects, notes, assignments, wing memberships) will be safely purged. This action cannot be undone.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCleanupTarget(null)}
                disabled={isDeletingCleanup}
                className="px-4 py-2 text-xs font-semibold text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteCleanup}
                disabled={isDeletingCleanup}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingCleanup ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Permanently Delete Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
}
