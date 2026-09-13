"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  FileText,
  Camera,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  ShieldCheck,
  Award,
  Layers,
} from "lucide-react";

interface FacultyProfileData {
  id: string;
  fullName: string;
  designation: string;
  qualification: string;
  bio: string | null;
  profilePhotoUrl: string | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: number;
}

interface NoteItem {
  id: string;
  title: string;
  description: string | null;
  semester: number;
  fileUrl: string;
  fileType: string | null;
  subject: { code: string; name: string; semester: number };
  createdAt: string;
}

export default function FacultyDashboardClient() {
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "subjects" | "gallery">("overview");

  const [profile, setProfile] = useState<FacultyProfileData | null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<SubjectItem[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    designation: "",
    qualification: "",
    bio: "",
    profilePhotoUrl: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Note Form State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: "",
    description: "",
    semester: 1,
    subjectId: "",
    fileUrl: "",
    fileType: "PDF Document",
  });
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Gallery Form State
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    imageUrl: "",
    caption: "",
  });
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);

  // Delete Confirmation Modal State
  const [deleteNoteId, setDeleteNoteId] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Clear alerts
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // Fetch Faculty Dashboard Data
  const fetchFacultyData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/faculty/dashboard");
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setAssignedSubjects(data.assignedSubjects || []);
        setAllSubjects(data.allSubjects || []);
        setNotes(data.notes || []);

        if (data.profile) {
          setProfileForm({
            fullName: data.profile.fullName || "",
            designation: data.profile.designation || "",
            qualification: data.profile.qualification || "",
            bio: data.profile.bio || "",
            profilePhotoUrl: data.profile.profilePhotoUrl || "",
          });
        }
      } else {
        setErrorMsg(data.error || "Failed to load faculty portal data.");
      }
    } catch {
      setErrorMsg("Failed to connect to faculty dashboard API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  // Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/faculty/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update profile.");
      } else {
        setSuccessMsg("Faculty profile updated successfully!");
        setShowProfileModal(false);
        fetchFacultyData();
      }
    } catch {
      setErrorMsg("Network error updating profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Note File State
  const [noteFile, setNoteFile] = useState<File | null>(null);

  // Create Note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingNote(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let res: Response;
      if (noteFile) {
        const formData = new FormData();
        formData.append("file", noteFile);
        formData.append("title", noteForm.title);
        if (noteForm.description) formData.append("description", noteForm.description);
        formData.append("semester", noteForm.semester.toString());
        formData.append("subjectId", noteForm.subjectId);

        res = await fetch("/api/faculty/notes", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!noteForm.fileUrl) {
          throw new Error("Please choose a document file to upload or enter a valid file URL.");
        }
        res = await fetch("/api/faculty/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noteForm),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to publish note.");
      } else {
        setSuccessMsg(`Study note '${data.note.title}' published successfully!`);
        setShowNoteModal(false);
        setNoteFile(null);
        setNoteForm({
          title: "",
          description: "",
          semester: 1,
          subjectId: "",
          fileUrl: "",
          fileType: "PDF Document",
        });
        fetchFacultyData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error publishing note.");
    } finally {
      setIsCreatingNote(false);
    }
  };

  // Faculty Photo Upload
  const handleFacultyPhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/faculty/profile/photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo.");

      setProfileForm((prev) => ({ ...prev, profilePhotoUrl: data.profilePhotoUrl }));
      setSuccessMsg("Faculty profile photo uploaded to durable storage!");
      fetchFacultyData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload photo.");
    }
  };

  // Delete Note
  const handleDeleteNote = async () => {
    if (!deleteNoteId) return;
    setIsDeletingNote(true);

    try {
      const res = await fetch(`/api/faculty/notes/${deleteNoteId.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to delete note.");
      } else {
        setSuccessMsg("Study note deleted successfully!");
        setDeleteNoteId(null);
        fetchFacultyData();
      }
    } catch {
      setErrorMsg("Network error deleting note.");
    } finally {
      setIsDeletingNote(false);
    }
  };

  // Gallery Upload
  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingGallery(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/faculty/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: galleryForm.imageUrl,
          caption: galleryForm.caption,
          status: "PUBLISHED",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to publish photo.");
      } else {
        setSuccessMsg("Activity photo uploaded to gallery successfully!");
        setShowGalleryModal(false);
        setGalleryForm({ imageUrl: "", caption: "" });
      }
    } catch {
      setErrorMsg("Network error publishing photo.");
    } finally {
      setIsCreatingGallery(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-[#756860]">Loading faculty dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
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
          <Layers className="w-3.5 h-3.5" /> Overview & Profile
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "notes"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Study Notes & Resources ({notes.length})
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "subjects"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Assigned Subjects ({assignedSubjects.length})
        </button>

        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "gallery"
              ? "bg-[#1C1917] text-white shadow-sm"
              : "text-[#756860] hover:bg-[#FBF9F7] hover:text-[#1C1917]"
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> Gallery Upload
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PROFILE */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#756860]">Faculty Profile</h2>
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-1.5 text-[#756860] hover:text-[#1C1917] hover:bg-[#FBF9F7] rounded-lg transition-all"
                title="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {profile?.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  className="w-20 h-20 rounded-full object-cover border border-[#EFEAE3]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#FDB27C]/20 border border-[#EFEAE3] flex items-center justify-center text-[#1C1917]">
                  <User className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1C1917]">{profile?.fullName}</h3>
                <p className="text-xs text-[#756860]">{profile?.designation}</p>
                <p className="text-xs font-medium text-[#1C1917]">{profile?.qualification}</p>
              </div>

              {profile?.bio && <p className="text-xs text-[#756860] leading-relaxed italic">&quot;{profile.bio}&quot;</p>}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#756860] pb-2 border-b border-[#EFEAE3]">
                Academic Summary
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3]">
                  <div className="text-xs text-[#756860] uppercase tracking-wider font-semibold">Assigned Subjects</div>
                  <div className="text-2xl font-bold text-[#1C1917] mt-1">{assignedSubjects.length}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3]">
                  <div className="text-xs text-[#756860] uppercase tracking-wider font-semibold">Study Notes Uploaded</div>
                  <div className="text-2xl font-bold text-[#1C1917] mt-1">{notes.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#756860] pb-2 border-b border-[#EFEAE3]">
                Quick Actions
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="px-4 py-2 bg-[#1C1917] hover:bg-[#231F1C] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Upload Study Resource
                </button>

                <button
                  onClick={() => setShowGalleryModal(true)}
                  className="px-4 py-2 bg-[#FBF9F7] hover:bg-[#EFEAE3] text-[#1C1917] text-xs font-medium rounded-xl transition-all border border-[#EFEAE3] flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" /> Upload Activity Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDY NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEAE3]">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> Academic Notes &amp; Resources
                </h2>
                <p className="text-xs text-[#756860] mt-0.5">
                  Publish and manage course materials for department students.
                </p>
              </div>

              <button
                onClick={() => setShowNoteModal(true)}
                className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#231F1C] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Upload Note
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#756860] bg-[#FBF9F7] rounded-xl border border-dashed border-[#EFEAE3]">
                No academic resources have been added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FBF9F7] text-xs uppercase tracking-wider text-[#756860]">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Note Title</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Semester</th>
                      <th className="p-3.5">Resource Link</th>
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
                          <a
                            href={n.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            View File &rarr;
                          </a>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setDeleteNoteId({ id: n.id, title: n.title })}
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

      {/* TAB 3: ASSIGNED SUBJECTS */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4">
            <div className="pb-4 border-b border-[#EFEAE3]">
              <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" /> Assigned Subjects &amp; Courses
              </h2>
              <p className="text-xs text-[#756860] mt-0.5">
                Courses officially assigned to your teaching profile by administration.
              </p>
            </div>

            {assignedSubjects.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#756860] bg-[#FBF9F7] rounded-xl border border-dashed border-[#EFEAE3]">
                No subjects have been assigned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedSubjects.map((sub) => (
                  <div key={sub.id} className="p-5 rounded-2xl bg-[#FBF9F7] border border-[#EFEAE3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1C1917] px-2.5 py-1 rounded-md bg-white border border-[#EFEAE3]">
                        {sub.code}
                      </span>
                      <span className="text-xs font-semibold text-[#756860]">Semester {sub.semester}</span>
                    </div>

                    <h3 className="font-bold text-[#1C1917] text-base">{sub.name}</h3>
                    {sub.description && <p className="text-xs text-[#756860] leading-relaxed">{sub.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EFEAE3] shadow-sm space-y-4 max-w-xl">
            <div className="pb-4 border-b border-[#EFEAE3]">
              <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-600" /> Upload Activity Photo
              </h2>
              <p className="text-xs text-[#756860] mt-0.5">
                Upload photos from department events, labs, or academic activities.
              </p>
            </div>

            <form onSubmit={handleCreateGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Photo Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={galleryForm.imageUrl}
                  onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Caption</label>
                <input
                  type="text"
                  placeholder="e.g. AI Lab Practical Demonstration"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingGallery}
                className="py-2.5 px-5 bg-[#1C1917] hover:bg-[#231F1C] text-white font-medium text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                {isCreatingGallery ? "Publishing..." : "Publish to Gallery"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
              <h3 className="font-bold text-[#1C1917]">Edit Faculty Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-[#756860] hover:text-[#1C1917]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={profileForm.designation}
                  onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Qualification *</label>
                <input
                  type="text"
                  required
                  value={profileForm.qualification}
                  onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Profile Photo (Upload file or enter URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={profileForm.profilePhotoUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, profilePhotoUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                  />
                  <label className="px-3 py-1.5 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#231F1C] cursor-pointer inline-flex items-center">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFacultyPhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-3 py-1.5 text-xs text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-xl hover:bg-[#231F1C] disabled:opacity-50"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE3]">
              <h3 className="font-bold text-[#1C1917]">Upload Study Note / Resource</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-[#756860] hover:text-[#1C1917]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Note Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Introduction to Machine Learning"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Subject *</label>
                <select
                  required
                  value={noteForm.subjectId}
                  onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                >
                  <option value="">-- Select Subject --</option>
                  {allSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.code}] {sub.name} (Sem {sub.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Semester *</label>
                <select
                  value={noteForm.semester}
                  onChange={(e) => setNoteForm({ ...noteForm, semester: parseInt(e.target.value, 10) })}
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
                <label className="block text-xs font-semibold text-[#756860] mb-1">
                  Upload Document File (PDF, DOCX, PPTX, TXT - Max 25MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1C1917] file:text-white hover:file:bg-[#231F1C]"
                />
                {noteFile && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Selected File: {noteFile.name} ({(noteFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">
                  Or External Resource URL {!noteFile && "*"}
                </label>
                <input
                  type="url"
                  required={!noteFile}
                  placeholder="https://..."
                  value={noteForm.fileUrl}
                  onChange={(e) => setNoteForm({ ...noteForm, fileUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#756860] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief note description..."
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FBF9F7] border border-[#EFEAE3] rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-1.5 text-xs text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingNote}
                  className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-xl hover:bg-[#231F1C] disabled:opacity-50"
                >
                  {isCreatingNote ? "Uploading..." : "Publish Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Note Confirmation Modal */}
      {deleteNoteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EFEAE3] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#1C1917]">Confirm Note Deletion</h3>
                <p className="text-xs text-[#756860]">Permanently remove study resource.</p>
              </div>
            </div>

            <p className="text-xs text-[#1C1917] leading-relaxed bg-[#FBF9F7] p-3 rounded-xl border border-[#EFEAE3]">
              Are you sure you want to delete <strong>&quot;{deleteNoteId.title}&quot;</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteNoteId(null)}
                disabled={isDeletingNote}
                className="px-4 py-2 text-xs font-medium text-[#756860] hover:bg-[#FBF9F7] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNote}
                disabled={isDeletingNote}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                {isDeletingNote ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
