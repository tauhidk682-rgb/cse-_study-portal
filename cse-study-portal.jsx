import { useState, useEffect, useRef } from "react";

const USERS = [
  { id: 1, name: "Admin (CR)", email: "cr@cse.edu", password: "cr123", role: "admin", avatar: "AC", batch: "CSE-25" },
  { id: 2, name: "Moderator 1", email: "mod1@cse.edu", password: "mod123", role: "moderator", avatar: "M1", batch: "CSE-25" },
  { id: 3, name: "Moderator 2", email: "mod2@cse.edu", password: "mod123", role: "moderator", avatar: "M2", batch: "CSE-25" },
  { id: 4, name: "Alice Rahman", email: "alice@cse.edu", password: "pass123", role: "student", avatar: "AR", batch: "CSE-25" },
  { id: 5, name: "Bob Hossain", email: "bob@cse.edu", password: "pass123", role: "student", avatar: "BH", batch: "CSE-25" },
];

const SAMPLE_NOTICES = [
  { id: 1, title: "Mid-Term Exam Schedule Released", content: "Mid-term exams will be held from June 10–20. Check the academic portal for detailed schedules. All departments must confirm lab slots by June 5.", author: "Admin (CR)", authorRole: "admin", date: "2026-05-29", pinned: true, tags: ["exam", "important"] },
  { id: 2, title: "Algorithm Assignment Deadline Extended", content: "Due to multiple requests, the deadline for Algorithm Design Assignment #3 has been extended to June 7, 2026. Please submit through the portal.", author: "Moderator 1", authorRole: "moderator", date: "2026-05-28", pinned: false, tags: ["assignment", "algorithm"] },
  { id: 3, title: "Study Group for Data Structures", content: "A study group session for Data Structures Chapter 5 (Trees & Graphs) is scheduled for Saturday 3 PM in Lab 302. Everyone is welcome!", author: "Alice Rahman", authorRole: "student", date: "2026-05-27", pinned: false, tags: ["study-group"] },
];

const SAMPLE_FILES = [
  { id: 1, name: "Data Structures - Lecture Notes Week 1-5.pdf", subject: "Data Structures", type: "pdf", size: "2.4 MB", uploader: "Moderator 1", uploaderRole: "moderator", date: "2026-05-28", downloads: 47, semester: "3rd" },
  { id: 2, name: "Algorithm Design - Assignment 3.docx", subject: "Algorithm Design", type: "docx", size: "340 KB", uploader: "Alice Rahman", uploaderRole: "student", date: "2026-05-27", downloads: 23, semester: "3rd" },
  { id: 3, name: "OOP in Java - Complete Slides.pptx", subject: "OOP", type: "pptx", size: "8.1 MB", uploader: "Moderator 2", uploaderRole: "moderator", date: "2026-05-26", downloads: 61, semester: "3rd" },
  { id: 4, name: "Database Systems - ER Diagram Examples.pdf", subject: "Database", type: "pdf", size: "1.2 MB", uploader: "Bob Hossain", uploaderRole: "student", date: "2026-05-25", downloads: 38, semester: "3rd" },
  { id: 5, name: "Discrete Math - Past Papers 2022-2025.pdf", subject: "Discrete Math", type: "pdf", size: "5.7 MB", uploader: "Admin (CR)", uploaderRole: "admin", date: "2026-05-24", downloads: 89, semester: "2nd" },
  { id: 6, name: "Computer Networks - Lab Manual.pdf", subject: "Networking", type: "pdf", size: "3.3 MB", uploader: "Moderator 1", uploaderRole: "moderator", date: "2026-05-23", downloads: 55, semester: "4th" },
];

const fileIcon = (type) => {
  if (type === "pdf") return "ti-file-type-pdf";
  if (type === "docx") return "ti-file-type-doc";
  if (type === "pptx") return "ti-presentation";
  if (type === "xlsx") return "ti-file-spreadsheet";
  if (type === "zip") return "ti-file-zip";
  return "ti-file";
};

const fileColor = (type) => {
  if (type === "pdf") return "#e24b4a";
  if (type === "docx") return "#378add";
  if (type === "pptx") return "#ef9f27";
  if (type === "xlsx") return "#639922";
  return "#888780";
};

const roleColor = (role) => {
  if (role === "admin") return { bg: "var(--color-background-danger)", color: "var(--color-text-danger)" };
  if (role === "moderator") return { bg: "var(--color-background-warning)", color: "var(--color-text-warning)" };
  return { bg: "var(--color-background-info)", color: "var(--color-text-info)" };
};

const roleLabel = (role) => {
  if (role === "admin") return "CR / Admin";
  if (role === "moderator") return "Moderator";
  return "Student";
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [notices, setNotices] = useState(SAMPLE_NOTICES);
  const [files, setFiles] = useState(SAMPLE_FILES);
  const [loginError, setLoginError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeFilter, setNoticeFilter] = useState("all");
  const [fileFilter, setFileFilter] = useState("all");
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", tags: "", pinned: false });
  const [newFile, setNewFile] = useState({ name: "", subject: "", type: "pdf", semester: "3rd", size: "0 KB" });
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = () => {
    const found = USERS.find(u => u.email === loginData.email && u.password === loginData.password);
    if (found) {
      setUser(found);
      setLoginError("");
      setPage("dashboard");
    } else {
      setLoginError("Invalid email or password.");
    }
  };

  const handleLogout = () => { setUser(null); setPage("dashboard"); };

  const canPostNotice = user && (user.role === "admin" || user.role === "moderator");

  const handleAddNotice = () => {
    if (!newNotice.title || !newNotice.content) { showToast("Fill title and content", "error"); return; }
    const n = {
      id: Date.now(), title: newNotice.title, content: newNotice.content,
      author: user.name, authorRole: user.role, date: new Date().toISOString().split("T")[0],
      pinned: newNotice.pinned, tags: newNotice.tags.split(",").map(t => t.trim()).filter(Boolean)
    };
    setNotices([n, ...notices]);
    setNewNotice({ title: "", content: "", tags: "", pinned: false });
    setShowNoticeForm(false);
    showToast("Notice posted!");
  };

  const handleUploadFile = () => {
    if (!newFile.name || !newFile.subject) { showToast("Fill all file details", "error"); return; }
    const f = {
      id: Date.now(), ...newFile, uploader: user.name, uploaderRole: user.role,
      date: new Date().toISOString().split("T")[0], downloads: 0
    };
    setFiles([f, ...files]);
    setNewFile({ name: "", subject: "", type: "pdf", semester: "3rd", size: "0 KB" });
    setShowUploadForm(false);
    showToast("File uploaded!");
  };

  const handleAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a helpful academic assistant for CSE students. Give concise, clear answers about computer science topics, assignments, and study help.",
          messages: [{ role: "user", content: aiPrompt }]
        })
      });
      const data = await res.json();
      setAiResponse(data.content?.[0]?.text || "No response.");
    } catch {
      setAiResponse("Error reaching AI. Please try again.");
    }
    setAiLoading(false);
  };

  const filteredFiles = files.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.subject.toLowerCase().includes(q);
    const matchFilter = fileFilter === "all" || f.subject === fileFilter || f.semester === fileFilter || f.type === fileFilter;
    return matchSearch && matchFilter;
  });

  const filteredNotices = notices.filter(n => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    const matchFilter = noticeFilter === "all" || (noticeFilter === "pinned" && n.pinned) || n.tags.includes(noticeFilter);
    return matchSearch && matchFilter;
  });

  const subjects = [...new Set(files.map(f => f.subject))];

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #0f1829 50%, #0a0e1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
          .login-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2.5rem; width: 380px; max-width: 90vw; backdrop-filter: blur(12px); }
          .login-title { font-family: 'Space Mono', monospace; color: #64ffda; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
          .login-heading { font-family: 'IBM Plex Sans', sans-serif; color: #e2e8f0; font-size: 28px; font-weight: 600; margin-bottom: 2rem; line-height: 1.2; }
          .login-label { font-family: 'Space Mono', monospace; font-size: 11px; color: #64ffda; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px; }
          .login-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(100,255,218,0.2); border-radius: 6px; padding: 10px 14px; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; box-sizing: border-box; outline: none; margin-bottom: 1.25rem; transition: border-color 0.2s; }
          .login-input:focus { border-color: rgba(100,255,218,0.6); }
          .login-btn { width: 100%; background: #64ffda; color: #0a0e1a; border: none; border-radius: 6px; padding: 12px; font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 2px; cursor: pointer; text-transform: uppercase; transition: opacity 0.2s; }
          .login-btn:hover { opacity: 0.85; }
          .demo-hint { background: rgba(100,255,218,0.05); border: 1px solid rgba(100,255,218,0.1); border-radius: 6px; padding: 12px; margin-top: 1.25rem; }
          .demo-row { font-family: 'Space Mono', monospace; font-size: 11px; color: #718096; margin: 3px 0; cursor: pointer; transition: color 0.2s; }
          .demo-row:hover { color: #64ffda; }
        `}</style>
        <div className="login-card">
          <div className="login-title">CSE Batch 2025</div>
          <div className="login-heading">Study Portal</div>
          <label className="login-label">Email address</label>
          <input className="login-input" type="email" placeholder="you@cse.edu" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <label className="login-label">Password</label>
          <input className="login-input" type="password" placeholder="••••••••" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {loginError && <div style={{ color: "#fc8181", fontFamily: "'Space Mono'", fontSize: 12, marginBottom: 12 }}>{loginError}</div>}
          <button className="login-btn" onClick={handleLogin}>Sign In →</button>
          <div className="demo-hint">
            <div style={{ fontFamily: "'Space Mono'", fontSize: 10, color: "#4a5568", marginBottom: 6, letterSpacing: 2 }}>DEMO ACCOUNTS</div>
            {[["CR / Admin", "cr@cse.edu", "cr123"], ["Moderator", "mod1@cse.edu", "mod123"], ["Student", "alice@cse.edu", "pass123"]].map(([role, email, pass]) => (
              <div key={email} className="demo-row" onClick={() => setLoginData({ email, password: pass })}>
                {role}: {email} / {pass}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
    { id: "notices", label: "Notices", icon: "ti-bell" },
    { id: "files", label: "Files", icon: "ti-folder-open" },
    { id: "ai", label: "AI Assistant", icon: "ti-robot" },
    ...(user.role === "admin" ? [{ id: "members", label: "Members", icon: "ti-users" }] : []),
  ];

  const stats = [
    { label: "Batch Members", value: 120, icon: "ti-users", color: "#378add" },
    { label: "Study Files", value: files.length, icon: "ti-folder", color: "#639922" },
    { label: "Active Notices", value: notices.length, icon: "ti-bell", color: "#ef9f27" },
    { label: "Total Downloads", value: files.reduce((a, f) => a + f.downloads, 0), icon: "ti-download", color: "#d4537e" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f9fc; }
        .sidebar { position: fixed; left: 0; top: 0; height: 100vh; width: 220px; background: #0d1117; display: flex; flex-direction: column; z-index: 100; }
        .main { margin-left: 220px; min-height: 100vh; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 20px; color: #8892a4; font-size: 14px; font-weight: 400; cursor: pointer; border-radius: 6px; margin: 2px 10px; transition: all 0.15s; text-decoration: none; }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
        .nav-item.active { background: rgba(100,255,218,0.1); color: #64ffda; font-weight: 500; }
        .nav-item i { font-size: 18px; }
        .card { background: white; border-radius: 10px; border: 1px solid #eaecf0; padding: 20px; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
        .btn-primary { background: #0d1117; color: white; }
        .btn-primary:hover { background: #21262d; }
        .btn-outline { background: white; color: #374151; border: 1px solid #e5e7eb; }
        .btn-outline:hover { background: #f9fafb; }
        .btn-danger { background: #fee2e2; color: #dc2626; border: none; }
        .btn-danger:hover { background: #fecaca; }
        .input { width: 100%; padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s; }
        .input:focus { border-color: #64ffda; box-shadow: 0 0 0 3px rgba(100,255,218,0.1); }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .tag { display: inline-block; padding: 2px 8px; background: #f3f4f6; color: #6b7280; border-radius: 4px; font-size: 11px; margin: 2px 2px 0 0; }
        .notice-card { background: white; border: 1px solid #eaecf0; border-radius: 10px; padding: 18px 20px; margin-bottom: 12px; transition: border-color 0.15s; }
        .notice-card:hover { border-color: #d1d5db; }
        .notice-card.pinned { border-left: 3px solid #ef9f27; }
        .file-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #eaecf0; border-radius: 8px; margin-bottom: 8px; transition: border-color 0.15s; }
        .file-row:hover { border-color: #d1d5db; }
        .stat-card { background: white; border: 1px solid #eaecf0; border-radius: 10px; padding: 20px; display: flex; align-items: center; gap: 16px; }
        .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .modal-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .modal { background: white; border-radius: 12px; padding: 28px; width: 520px; max-width: 90vw; max-height: 90vh; overflow-y: auto; }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 999; animation: slidein 0.3s ease; }
        @keyframes slidein { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .search-bar { display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 14px; }
        .search-bar input { border: none; outline: none; font-size: 14px; font-family: inherit; background: transparent; width: 100%; }
        .ai-bubble { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-top: 16px; font-size: 14px; line-height: 1.7; color: #166534; white-space: pre-wrap; }
        select.input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; background-size: 16px; padding-right: 32px; }
        @media (max-width: 768px) { .sidebar { display: none; } .sidebar.open { display: flex; } .main { margin-left: 0; } }
      `}</style>

      {/* Sidebar */}
      <div className={`sidebar${mobileMenu ? " open" : ""}`}>
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", color: "#64ffda", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>CSE Batch 2025</div>
          <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 16 }}>Study Portal</div>
        </div>

        <div style={{ padding: "0 0 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
          {nav.map(n => (
            <div key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => { setPage(n.id); setMobileMenu(false); }}>
              <i className={`ti ${n.icon}`} />
              {n.label}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", padding: "16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 10 }}>
            <div className="avatar" style={{ background: "#1e3a5f", color: "#64ffda", fontSize: 11 }}>{user.avatar}</div>
            <div>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{user.name}</div>
              <div style={{ ...roleColor(user.role), fontSize: 11, padding: "1px 6px", borderRadius: 4, display: "inline-block", marginTop: 2 }}>{roleLabel(user.role)}</div>
            </div>
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ color: "#fc8181" }}>
            <i className="ti ti-logout" />
            Sign out
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {/* Topbar */}
        <div style={{ background: "white", borderBottom: "1px solid #eaecf0", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ display: "none", background: "none", border: "none", cursor: "pointer", fontSize: 22 }} className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
              <i className="ti ti-menu-2" />
            </button>
            <div style={{ fontWeight: 600, fontSize: 17, color: "#0d1117" }}>
              {nav.find(n => n.id === page)?.label || ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {(page === "notices" || page === "files") && (
              <div className="search-bar" style={{ width: 220 }}>
                <i className="ti ti-search" style={{ color: "#9ca3af", fontSize: 16 }} />
                <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            )}
            <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#374151" }}>
              <i className="ti ti-user" style={{ marginRight: 6, verticalAlign: -1, fontSize: 15 }} />
              {user.name}
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 28px" }}>
          {/* DASHBOARD */}
          {page === "dashboard" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#0d1117", marginBottom: 4 }}>
                  Welcome back, {user.name.split(" ")[0]} 👋
                </div>
                <div style={{ color: "#6b7280", fontSize: 14 }}>Here's what's happening in your batch today.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
                {stats.map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#0d1117" }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#0d1117" }}>Recent Notices</div>
                    <button className="btn btn-outline" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setPage("notices")}>View all</button>
                  </div>
                  {notices.slice(0, 3).map(n => (
                    <div key={n.id} style={{ padding: "10px 0", borderBottom: "1px solid #f3f4f6", lastChild: { borderBottom: "none" } }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        {n.pinned && <i className="ti ti-pin" style={{ color: "#ef9f27", fontSize: 14, marginTop: 2, flexShrink: 0 }} />}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>{n.author} · {n.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#0d1117" }}>Recent Files</div>
                    <button className="btn btn-outline" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setPage("files")}>View all</button>
                  </div>
                  {files.slice(0, 4).map(f => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <i className={`ti ${fileIcon(f.type)}`} style={{ color: fileColor(f.type), fontSize: 20, flexShrink: 0 }} />
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{f.subject} · {f.size}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTICES */}
          {page === "notices" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {["all", "pinned", "exam", "assignment", "study-group"].map(f => (
                    <button key={f} className="btn" style={{ background: noticeFilter === f ? "#0d1117" : "white", color: noticeFilter === f ? "white" : "#374151", border: "1px solid #e5e7eb", padding: "6px 12px", fontSize: 12 }} onClick={() => setNoticeFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
                    </button>
                  ))}
                </div>
                {canPostNotice && (
                  <button className="btn btn-primary" onClick={() => setShowNoticeForm(true)}>
                    <i className="ti ti-plus" /> Post Notice
                  </button>
                )}
              </div>

              {filteredNotices.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                  <i className="ti ti-bell-off" style={{ fontSize: 40, display: "block", marginBottom: 12 }} />
                  No notices found.
                </div>
              )}

              {filteredNotices.sort((a, b) => b.pinned - a.pinned).map(n => (
                <div key={n.id} className={`notice-card${n.pinned ? " pinned" : ""}`}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {n.pinned && <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}><i className="ti ti-pin" style={{ fontSize: 11 }} /> Pinned</span>}
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0d1117" }}>{n.title}</h3>
                    </div>
                    <span className="badge" style={{ ...roleColor(n.authorRole), flexShrink: 0 }}>{roleLabel(n.authorRole)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.65, marginBottom: 12 }}>{n.content}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {n.tags.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      <i className="ti ti-user" style={{ marginRight: 4, verticalAlign: -1 }} />
                      {n.author} · {n.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FILES */}
          {page === "files" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select className="input" style={{ width: "auto", fontSize: 13 }} value={fileFilter} onChange={e => setFileFilter(e.target.value)}>
                    <option value="all">All Subjects</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="input" style={{ width: "auto", fontSize: 13 }} onChange={e => setFileFilter(e.target.value)}>
                    <option value="all">All Semesters</option>
                    {["1st","2nd","3rd","4th","5th","6th","7th","8th"].map(s => <option key={s} value={s}>{s} Sem</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => setShowUploadForm(true)}>
                  <i className="ti ti-upload" /> Upload File
                </button>
              </div>

              <div style={{ background: "white", border: "1px solid #eaecf0", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 100px 80px", gap: 0, padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #eaecf0", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  <div>File Name</div>
                  <div>Subject</div>
                  <div>Uploaded by</div>
                  <div>Size</div>
                  <div style={{ textAlign: "center" }}>Downloads</div>
                </div>
                {filteredFiles.map(f => (
                  <div key={f.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 100px 80px", gap: 0, padding: "13px 16px", borderBottom: "1px solid #f3f4f6", alignItems: "center", transition: "background 0.1s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <i className={`ti ${fileIcon(f.type)}`} style={{ color: fileColor(f.type), fontSize: 22, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{f.date} · Semester: {f.semester}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#374151" }}>
                      <span style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>{f.subject}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      <div>{f.uploader}</div>
                      <span className="badge" style={{ ...roleColor(f.uploaderRole), marginTop: 2 }}>{roleLabel(f.uploaderRole)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#374151" }}>{f.size}</div>
                    <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <i className="ti ti-download" style={{ fontSize: 14, color: "#9ca3af" }} />
                      <span style={{ fontSize: 13, color: "#374151" }}>{f.downloads}</span>
                    </div>
                  </div>
                ))}
                {filteredFiles.length === 0 && (
                  <div style={{ textAlign: "center", padding: "50px 20px", color: "#9ca3af" }}>
                    <i className="ti ti-folder-off" style={{ fontSize: 36, display: "block", marginBottom: 10 }} />
                    No files match your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI ASSISTANT */}
          {page === "ai" && (
            <div style={{ maxWidth: 700 }}>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="ti ti-robot" style={{ fontSize: 22, color: "#16a34a" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#0d1117" }}>CSE Study Assistant</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Powered by Claude — ask anything about your coursework</div>
                  </div>
                </div>
                <textarea
                  className="input"
                  style={{ resize: "vertical", minHeight: 100 }}
                  placeholder="Ask about algorithms, data structures, OOP concepts, exam tips, or anything CSE-related..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
                <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="btn btn-outline" onClick={() => { setAiPrompt(""); setAiResponse(""); }}>Clear</button>
                  <button className="btn btn-primary" onClick={handleAI} disabled={aiLoading}>
                    {aiLoading ? <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} /> Thinking...</> : <><i className="ti ti-send" /> Ask AI</>}
                  </button>
                </div>
                {aiResponse && <div className="ai-bubble">{aiResponse}</div>}
              </div>

              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0d1117", marginBottom: 12 }}>Quick prompts</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Explain Binary Search Trees", "What is Big O notation?", "Difference between TCP and UDP", "How does garbage collection work?", "SQL vs NoSQL databases", "Recursion vs iteration examples"].map(p => (
                    <button key={p} className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => setAiPrompt(p)}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS (admin only) */}
          {page === "members" && user.role === "admin" && (
            <div>
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Showing demo members (5 of 120)</div>
                <button className="btn btn-primary"><i className="ti ti-plus" /> Add Member</button>
              </div>
              <div style={{ background: "white", border: "1px solid #eaecf0", borderRadius: 10, overflow: "hidden" }}>
                {USERS.map(u => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="avatar" style={{ background: "#1e3a5f", color: "#64ffda", fontSize: 11, width: 40, height: 40 }}>{u.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14, color: "#0d1117" }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="badge" style={roleColor(u.role)}>{roleLabel(u.role)}</span>
                      <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }}>Edit role</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POST NOTICE MODAL */}
      {showNoticeForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowNoticeForm(false)}>
          <div className="modal">
            <div style={{ fontWeight: 600, fontSize: 18, color: "#0d1117", marginBottom: 20 }}>Post a Notice</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Title *</label>
              <input className="input" placeholder="Notice title" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Content *</label>
              <textarea className="input" rows={4} style={{ resize: "vertical" }} placeholder="Write the notice..." value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Tags (comma separated)</label>
              <input className="input" placeholder="exam, assignment, important" value={newNotice.tags} onChange={e => setNewNotice({...newNotice, tags: e.target.value})} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="pin" checked={newNotice.pinned} onChange={e => setNewNotice({...newNotice, pinned: e.target.checked})} />
              <label htmlFor="pin" style={{ fontSize: 13, color: "#374151", cursor: "pointer" }}>Pin this notice</label>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowNoticeForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddNotice}>Post Notice</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {showUploadForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowUploadForm(false)}>
          <div className="modal">
            <div style={{ fontWeight: 600, fontSize: 18, color: "#0d1117", marginBottom: 20 }}>Upload Study Material</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>File Name *</label>
              <input className="input" placeholder="e.g. Data Structures Notes Week 6.pdf" value={newFile.name} onChange={e => setNewFile({...newFile, name: e.target.value})} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Subject *</label>
                <input className="input" placeholder="e.g. Data Structures" value={newFile.subject} onChange={e => setNewFile({...newFile, subject: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>File Type</label>
                <select className="input" value={newFile.type} onChange={e => setNewFile({...newFile, type: e.target.value})}>
                  {["pdf","docx","pptx","xlsx","zip","other"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Semester</label>
                <select className="input" value={newFile.semester} onChange={e => setNewFile({...newFile, semester: e.target.value})}>
                  {["1st","2nd","3rd","4th","5th","6th","7th","8th"].map(s => <option key={s} value={s}>{s} Semester</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>File Size</label>
                <input className="input" placeholder="e.g. 2.5 MB" value={newFile.size} onChange={e => setNewFile({...newFile, size: e.target.value})} />
              </div>
            </div>
            <div style={{ background: "#f9fafb", border: "2px dashed #e5e7eb", borderRadius: 8, padding: "24px", textAlign: "center", marginBottom: 20, cursor: "pointer" }}>
              <i className="ti ti-cloud-upload" style={{ fontSize: 32, color: "#9ca3af", display: "block", marginBottom: 8 }} />
              <div style={{ fontSize: 14, color: "#6b7280" }}>Click to browse or drag & drop your file</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>PDF, DOCX, PPTX, XLSX, ZIP up to 50MB</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowUploadForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUploadFile}><i className="ti ti-upload" /> Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast" style={{ background: toast.type === "error" ? "#fee2e2" : "#dcfce7", color: toast.type === "error" ? "#dc2626" : "#16a34a" }}>
          <i className={`ti ${toast.type === "error" ? "ti-x" : "ti-check"}`} style={{ marginRight: 8 }} />
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
