"use client";

import {
  Archive,
  ArrowDownUp,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  ExternalLink,
  FileInput,
  FileText,
  Gauge,
  Import,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  UploadCloud,
  UsersRound,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { emptyDraft, seedApplications } from "@/lib/seedData";
import { ApplicationDraft, ApplicationStatus, JobApplication, ParsedRow, ResumeFile, STATUSES, View } from "@/lib/types";
import {
  applicationsToCsv,
  daysSince,
  daysUntil,
  downloadText,
  formatDate,
  googleExportUrl,
  makeId,
  parseCsv,
  today,
} from "@/lib/utils";

const STORAGE_KEY = "apptrack-applications-v1";
const RESUMES_KEY = "apptrack-resumes-v1";
const FIELD_LABELS: Record<keyof ApplicationDraft, string> = {
  company: "Company name",
  role: "Job title",
  jobUrl: "Job URL",
  dateApplied: "Date applied",
  status: "Status",
  notes: "Notes",
  deadline: "Deadline",
  resume: "Resume version used",
  recruiter: "Recruiter name",
  recruiterEmail: "Recruiter email",
  nextAction: "Next action",
};
const IMPORT_FIELDS: (keyof ApplicationDraft)[] = ["company", "role", "dateApplied", "status", "resume", "deadline", "recruiter", "recruiterEmail", "jobUrl", "nextAction", "notes"];

const NAV: { id: View; label: string; icon: typeof Gauge }[] = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "applications", label: "Applications", icon: BriefcaseBusiness },
  { id: "resumes", label: "Resumes", icon: FileText },
  { id: "import", label: "Import data", icon: Import },
  { id: "deadlines", label: "Deadlines", icon: CalendarDays },
  { id: "followups", label: "Follow-Ups", icon: BellRing },
  { id: "settings", label: "Settings", icon: Settings },
];

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setValue(JSON.parse(saved) as T);
      } catch {
        localStorage.removeItem(key);
      }
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(value));
  }, [key, ready, value]);
  return [value, setValue] as const;
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function EmptyState({ icon, title, copy, action }: { icon: ReactNode; title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </div>
  );
}

function Modal({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function ApplicationForm({
  initial = emptyDraft,
  onCancel,
  onSubmit,
}: {
  initial?: ApplicationDraft;
  onCancel: () => void;
  onSubmit: (draft: ApplicationDraft) => void;
}) {
  const [draft, setDraft] = useState<ApplicationDraft>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const update = (key: keyof ApplicationDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const missing = ["company", "role", "dateApplied"].filter((key) => !draft[key as keyof ApplicationDraft]);
    setErrors(missing);
    if (!missing.length) onSubmit(draft);
  };

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        {(["company", "role", "jobUrl", "dateApplied"] as (keyof ApplicationDraft)[]).map((key) => (
          <label key={key}>
            <span>{FIELD_LABELS[key]} {["company", "role", "dateApplied"].includes(key) && <b>*</b>}</span>
            <input
              className={errors.includes(key) ? "invalid" : ""}
              type={key === "dateApplied" ? "date" : key === "jobUrl" ? "url" : "text"}
              value={draft[key]}
              placeholder={key === "company" ? "e.g. Figma" : key === "role" ? "e.g. Product Engineer" : ""}
              onChange={(event) => update(key, event.target.value)}
            />
          </label>
        ))}
        <label>
          <span>Status</span>
          <select value={draft.status} onChange={(event) => update("status", event.target.value)}>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        {(["deadline", "resume", "nextAction", "recruiter", "recruiterEmail"] as (keyof ApplicationDraft)[]).map((key) => (
          <label key={key}>
            <span>{FIELD_LABELS[key]}</span>
            <input
              type={key === "deadline" ? "date" : key === "recruiterEmail" ? "email" : "text"}
              value={draft[key]}
              onChange={(event) => update(key, event.target.value)}
            />
          </label>
        ))}
        <label className="form-wide">
          <span>Notes</span>
          <textarea value={draft.notes} rows={4} placeholder="Interview context, role details, or useful links…" onChange={(event) => update("notes", event.target.value)} />
        </label>
      </div>
      <footer className="modal-actions">
        <button type="button" className="button secondary" onClick={onCancel}>Cancel</button>
        <button className="button primary" type="submit"><Check size={16} /> Save application</button>
      </footer>
    </form>
  );
}

function ApplicationsTable({
  applications,
  onUpdate,
  onDelete,
  compact = false,
}: {
  applications: JobApplication[];
  onUpdate: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<JobApplication | null>(null);
  const startEdit = (app: JobApplication) => {
    setEditing(app.id);
    setDraft(app);
  };
  const updateDraft = (key: keyof JobApplication, value: string) => setDraft((current) => current ? ({ ...current, [key]: value }) : null);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Company & role</th><th>Date applied</th><th>Status</th><th>Resume used</th><th>Next action</th><th>Deadline</th><th><span className="sr-only">Actions</span></th></tr>
        </thead>
        <tbody>
          {applications.map((app) => editing === app.id && draft ? (
            <tr key={app.id} className="editing-row">
              <td><input value={draft.company} onChange={(event) => updateDraft("company", event.target.value)} /><input value={draft.role} onChange={(event) => updateDraft("role", event.target.value)} /></td>
              <td><input type="date" value={draft.dateApplied} onChange={(event) => updateDraft("dateApplied", event.target.value)} /></td>
              <td><select value={draft.status} onChange={(event) => updateDraft("status", event.target.value)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td>
              <td><input value={draft.resume} onChange={(event) => updateDraft("resume", event.target.value)} /></td>
              <td><input value={draft.nextAction} onChange={(event) => updateDraft("nextAction", event.target.value)} /></td>
              <td><input type="date" value={draft.deadline} onChange={(event) => updateDraft("deadline", event.target.value)} /></td>
              <td><div className="row-actions"><button className="icon-button confirm" onClick={() => { onUpdate(draft); setEditing(null); }} aria-label="Save row"><Check size={15} /></button><button className="icon-button" onClick={() => setEditing(null)} aria-label="Cancel edit"><X size={15} /></button></div></td>
            </tr>
          ) : (
            <tr key={app.id}>
              <td><div className="company-cell"><span className="company-mark">{app.company.slice(0, 1)}</span><div><strong>{app.company}</strong><span>{app.role}</span></div>{app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer" aria-label={`Open ${app.company} job`}><ExternalLink size={13} /></a>}</div></td>
              <td>{formatDate(app.dateApplied)}</td>
              <td><StatusBadge status={app.status} /></td>
              <td>{app.resume || <span className="muted">Not linked</span>}</td>
              <td>{app.nextAction || <span className="muted">None set</span>}</td>
              <td>{app.deadline ? <span className={daysUntil(app.deadline) <= 3 ? "urgent-text" : ""}>{formatDate(app.deadline)}</span> : <span className="muted">Open</span>}</td>
              <td><div className="row-actions"><button className="icon-button" onClick={() => startEdit(app)} aria-label={`Edit ${app.company}`}><Pencil size={15} /></button><button className="icon-button danger" onClick={() => onDelete(app.id)} aria-label={`Delete ${app.company}`}><Trash2 size={15} /></button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!applications.length && !compact && <EmptyState icon={<Search size={24} />} title="No applications found" copy="Try another search or add a new opportunity." />}
    </div>
  );
}

export default function Apptrack() {
  const [applications, setApplications] = usePersistentState<JobApplication[]>(STORAGE_KEY, seedApplications);
  const [resumes, setResumes] = usePersistentState<ResumeFile[]>(RESUMES_KEY, []);
  const [view, setView] = useState<View>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showAdd, setShowAdd] = useState(false);
  const [prefill, setPrefill] = useState<ApplicationDraft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<keyof JobApplication>("dateApplied");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const filtered = useMemo(() => applications
    .filter((app) => statusFilter === "All" || app.status === statusFilter)
    .filter((app) => `${app.company} ${app.role} ${app.recruiter} ${app.nextAction}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const result = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDirection === "asc" ? result : -result;
    }), [applications, query, sortDirection, sortKey, statusFilter]);

  const stats = useMemo(() => {
    const responses = applications.filter((app) => !["Applied", "Ghosted"].includes(app.status)).length;
    return [
      { label: "Total applications", value: applications.length, detail: `${applications.filter((app) => app.dateApplied >= "2026-06-01").length} added this month`, icon: BriefcaseBusiness },
      { label: "Interviews scheduled", value: applications.filter((app) => app.status === "Interview").length, detail: "Active conversations", icon: UsersRound },
      { label: "Offers received", value: applications.filter((app) => app.status === "Offer").length, detail: "Worth celebrating", icon: Sparkles },
      { label: "Response rate", value: applications.length ? `${Math.round((responses / applications.length) * 100)}%` : "0%", detail: `${responses} recruiter responses`, icon: BellRing },
    ];
  }, [applications]);

  const addApplication = (draft: ApplicationDraft) => {
    setApplications((current) => [{ ...draft, id: makeId(), lastActionDate: today() }, ...current]);
    setShowAdd(false);
    setPrefill(emptyDraft);
    notify(`${draft.company} added to your pipeline.`);
  };
  const updateApplication = (next: JobApplication) => {
    setApplications((current) => current.map((app) => app.id === next.id ? next : app));
    notify(`${next.company} updated.`);
  };
  const deleteApplication = (id: string) => {
    const app = applications.find((item) => item.id === id);
    if (app && window.confirm(`Delete the ${app.role} application at ${app.company}?`)) {
      setApplications((current) => current.filter((item) => item.id !== id));
      setResumes((current) => current.map((resume) => ({ ...resume, applicationIds: resume.applicationIds.filter((item) => item !== id) })));
      notify("Application deleted.");
    }
  };
  const openAdd = (draft = emptyDraft) => {
    setPrefill({ ...draft });
    setShowAdd(true);
  };
  const navigate = (next: View) => {
    setView(next);
    setMobileMenu(false);
  };
  const title = NAV.find((item) => item.id === view)?.label ?? "Dashboard";

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <button className="brand" onClick={() => navigate("dashboard")}><span>A</span><strong>Apptrack</strong></button>
          <button className="icon-button collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <p className="nav-label">Workspace</p>
        <nav>{NAV.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => navigate(id)} title={label}><Icon size={18} /><span>{label}</span></button>)}</nav>
        <div className="sidebar-note">
          <Sparkles size={18} />
          <div><strong>Keep momentum.</strong><span>{applications.filter((app) => !["Offer", "Rejected"].includes(app.status)).length} opportunities still in motion.</span></div>
        </div>
        <button className="profile-button" onClick={() => navigate("settings")}><span>BL</span><div><strong>Benjamin Le</strong><small>Personal workspace</small></div></button>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileMenu(true)} aria-label="Open navigation"><Menu size={18} /></button>
          <div><p className="eyebrow">Job search workspace</p><h1>{title}</h1></div>
          <div className="top-actions">
            <button className="icon-button theme-quick" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="button primary" onClick={() => openAdd()} aria-label="Add application"><Plus size={17} /><span>Add application</span></button>
          </div>
        </header>

        <div className="content">
          {view === "dashboard" && <Dashboard stats={stats} applications={applications} filtered={filtered} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} sortKey={sortKey} setSortKey={setSortKey} sortDirection={sortDirection} setSortDirection={setSortDirection} onUpdate={updateApplication} onDelete={deleteApplication} openAdd={() => openAdd()} navigate={navigate} />}
          {view === "applications" && <Applications applications={filtered} total={applications.length} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} sortKey={sortKey} setSortKey={setSortKey} sortDirection={sortDirection} setSortDirection={setSortDirection} onUpdate={updateApplication} onDelete={deleteApplication} openAdd={() => openAdd()} />}
          {view === "resumes" && <Resumes resumes={resumes} setResumes={setResumes} applications={applications} notify={notify} />}
          {view === "import" && <ImportPanel applications={applications} setApplications={setApplications} openAdd={openAdd} notify={notify} />}
          {view === "deadlines" && <Deadlines applications={applications} jump={(app) => { setQuery(app.company); navigate("applications"); }} />}
          {view === "followups" && <FollowUps applications={applications} setApplications={setApplications} notify={notify} />}
          {view === "settings" && <SettingsPanel theme={theme} setTheme={setTheme} applications={applications} clear={() => { if (window.confirm("Clear all Apptrack data? This cannot be undone.")) { setApplications([]); setResumes([]); notify("Workspace cleared."); } }} notify={notify} />}
        </div>
      </main>
      {showAdd && <Modal eyebrow="New opportunity" title="Add application" onClose={() => setShowAdd(false)}><ApplicationForm initial={prefill} onCancel={() => setShowAdd(false)} onSubmit={addApplication} /></Modal>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  );
}

type SharedTableProps = {
  applications: JobApplication[];
  filtered: JobApplication[];
  query: string;
  setQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortKey: keyof JobApplication;
  setSortKey: (value: keyof JobApplication) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
  onUpdate: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  openAdd: () => void;
};

function TableTools(props: Pick<SharedTableProps, "query" | "setQuery" | "statusFilter" | "setStatusFilter" | "sortKey" | "setSortKey" | "sortDirection" | "setSortDirection">) {
  return (
    <div className="table-tools">
      <label className="search-box"><Search size={16} /><input value={props.query} onChange={(event) => props.setQuery(event.target.value)} placeholder="Search company, role, recruiter…" /></label>
      <select value={props.statusFilter} onChange={(event) => props.setStatusFilter(event.target.value)}><option>All</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
      <select value={props.sortKey} onChange={(event) => props.setSortKey(event.target.value as keyof JobApplication)}><option value="dateApplied">Date applied</option><option value="company">Company</option><option value="status">Status</option><option value="deadline">Deadline</option></select>
      <button className="icon-button" onClick={() => props.setSortDirection(props.sortDirection === "asc" ? "desc" : "asc")} aria-label="Change sort direction"><ArrowDownUp size={16} /></button>
    </div>
  );
}

function Dashboard(props: SharedTableProps & { stats: { label: string; value: string | number; detail: string; icon: typeof Gauge }[]; navigate: (view: View) => void }) {
  const active = props.applications.filter((app) => !["Offer", "Rejected", "Ghosted"].includes(app.status));
  return (
    <>
      <section className="hero fade-in">
        <div><p className="eyebrow">Monday, June 8</p><h2>Your next role is taking shape.</h2><p>Stay close to the conversations that matter and keep every opportunity moving with intention.</p></div>
        <div className="hero-meta"><span>{active.length}</span><small>active<br />opportunities</small></div>
      </section>
      <section className="stats-grid">{props.stats.map(({ label, value, detail, icon: Icon }, index) => <article className="stat-card fade-in" style={{ animationDelay: `${index * 70}ms` }} key={label}><span className="stat-icon"><Icon size={18} /></span><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>)}</section>
      <section className="panel fade-in">
        <header className="panel-header"><div><p className="eyebrow">Pipeline</p><h2>Recent applications</h2></div><button className="text-button" onClick={() => props.navigate("applications")}>View all <ChevronRight size={15} /></button></header>
        <TableTools {...props} />
        <ApplicationsTable applications={props.filtered.slice(0, 6)} onUpdate={props.onUpdate} onDelete={props.onDelete} compact />
        {!props.filtered.length && <EmptyState icon={<BriefcaseBusiness size={24} />} title="Build your pipeline" copy="Add your first opportunity to start tracking progress." action={<button className="button primary" onClick={props.openAdd}><Plus size={16} /> Add application</button>} />}
      </section>
    </>
  );
}

function Applications(props: Omit<SharedTableProps, "applications" | "filtered"> & { applications: JobApplication[]; total: number }) {
  return (
    <section className="panel fade-in">
      <header className="panel-header"><div><p className="eyebrow">Opportunity archive</p><h2>Every application, one clear view</h2><p>{props.total} total opportunities across your search.</p></div><button className="button primary" onClick={props.openAdd}><Plus size={16} /> Add application</button></header>
      <TableTools {...props} />
      <ApplicationsTable applications={props.applications} onUpdate={props.onUpdate} onDelete={props.onDelete} />
    </section>
  );
}

function Resumes({ resumes, setResumes, applications, notify }: { resumes: ResumeFile[]; setResumes: React.Dispatch<React.SetStateAction<ResumeFile[]>>; applications: JobApplication[]; notify: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = (files: FileList | null) => {
    [...(files ?? [])].filter((file) => file.type === "application/pdf").forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setResumes((current) => [{ id: makeId(), filename: file.name, label: file.name.replace(/\.pdf$/i, ""), uploadDate: today(), dataUrl: String(reader.result), applicationIds: [] }, ...current]);
        notify(`${file.name} added to your resume library.`);
      };
      reader.readAsDataURL(file);
    });
  };
  const update = (id: string, patch: Partial<ResumeFile>) => setResumes((current) => current.map((resume) => resume.id === id ? { ...resume, ...patch } : resume));
  return (
    <div className="split-layout fade-in">
      <section className="panel upload-card" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}>
        <span className="large-icon"><UploadCloud size={28} /></span><p className="eyebrow">Resume library</p><h2>Keep each story ready.</h2><p>Drag PDF resumes here or choose files to build a version history.</p>
        <button className="button primary" onClick={() => inputRef.current?.click()}><UploadCloud size={16} /> Choose PDF files</button>
        <input ref={inputRef} type="file" accept="application/pdf" multiple hidden onChange={(event) => addFiles(event.target.files)} />
      </section>
      <section className="panel">
        <header className="panel-header"><div><p className="eyebrow">Versions</p><h2>{resumes.length} saved resumes</h2></div></header>
        <div className="resume-list">
          {resumes.map((resume) => <article className="resume-card" key={resume.id}><span className="file-mark"><FileText size={20} /></span><div className="resume-main"><input className="inline-title" value={resume.label} onChange={(event) => update(resume.id, { label: event.target.value })} /><p>{resume.filename} · uploaded {formatDate(resume.uploadDate)}</p><label><span>Tagged applications</span><select multiple value={resume.applicationIds} onChange={(event) => update(resume.id, { applicationIds: [...event.target.selectedOptions].map((option) => option.value) })}>{applications.map((app) => <option value={app.id} key={app.id}>{app.company} — {app.role}</option>)}</select></label></div><div className="row-actions"><a className="icon-button" href={resume.dataUrl} download={resume.filename} aria-label={`Download ${resume.filename}`}><Download size={15} /></a><button className="icon-button danger" onClick={() => window.confirm(`Delete ${resume.filename}?`) && setResumes((current) => current.filter((item) => item.id !== resume.id))} aria-label={`Delete ${resume.filename}`}><Trash2 size={15} /></button></div></article>)}
          {!resumes.length && <EmptyState icon={<FileText size={24} />} title="No resumes yet" copy="Upload your first PDF to start managing versions." />}
        </div>
      </section>
    </div>
  );
}

declare global {
  interface Window { pdfjsLib?: { GlobalWorkerOptions: { workerSrc: string }; getDocument: (source: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (page: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } }; }
}

function ImportPanel({ applications, setApplications, openAdd, notify }: { applications: JobApplication[]; setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>; openAdd: (draft?: ApplicationDraft) => void; notify: (value: string) => void }) {
  const pdfRef = useRef<HTMLInputElement>(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<keyof ApplicationDraft, string>>>({});
  const [loading, setLoading] = useState(false);
  const headers = rows[0] ? Object.keys(rows[0]) : [];

  const parsePdf = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setPdfName(file.name);
    try {
      if (!window.pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Could not load PDF parser"));
          document.head.appendChild(script);
        });
      }
      if (!window.pdfjsLib) throw new Error("PDF parser unavailable");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const pdfDocument = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const text: string[] = [];
      for (let page = 1; page <= pdfDocument.numPages; page += 1) {
        const content = await (await pdfDocument.getPage(page)).getTextContent();
        text.push(content.items.map((item) => item.str).join(" "));
      }
      setPdfText(text.join("\n\n"));
      notify("PDF text extracted.");
    } catch (error) {
      setPdfText(`Could not extract text from ${file.name}. ${error instanceof Error ? error.message : "Try another PDF."}`);
    } finally {
      setLoading(false);
    }
  };
  const mapPdf = () => {
    const firstLine = pdfText.split("\n").find(Boolean) ?? "";
    const roleMatch = pdfText.match(/(?:role|position|title)\s*[:\-]\s*([^\n]+)/i);
    const companyMatch = pdfText.match(/(?:company|organization)\s*[:\-]\s*([^\n]+)/i);
    const dateMatch = pdfText.match(/20\d{2}[-/]\d{2}[-/]\d{2}/);
    openAdd({ ...emptyDraft, company: companyMatch?.[1]?.trim() || firstLine.slice(0, 60), role: roleMatch?.[1]?.trim() || "", deadline: dateMatch?.[0]?.replaceAll("/", "-") || "", notes: `Imported from ${pdfName}\n\n${pdfText.slice(0, 600)}` });
  };
  const fetchSource = async () => {
    setLoading(true);
    try {
      const response = await fetch(googleExportUrl(sourceUrl));
      if (!response.ok) throw new Error(`Import returned ${response.status}`);
      const text = await response.text();
      if (sourceUrl.includes("/document/")) {
        setPdfText(text);
        setPdfName("Google Doc");
        notify("Google Doc imported to text preview.");
      } else {
        const parsed = parseCsv(text);
        if (!parsed.length) throw new Error("No rows found");
        setRows(parsed);
        const detected: Partial<Record<keyof ApplicationDraft, string>> = {};
        IMPORT_FIELDS.forEach((field) => {
          detected[field] = Object.keys(parsed[0]).find((header) => header.toLowerCase().replaceAll(" ", "").includes(field.toLowerCase())) ?? "";
        });
        setMapping(detected);
        notify(`${parsed.length} rows ready to map.`);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  };
  const importAll = () => {
    const added = rows.map((row) => {
      const draft = Object.fromEntries(Object.entries(emptyDraft).map(([field, fallback]) => [field, mapping[field as keyof ApplicationDraft] ? row[mapping[field as keyof ApplicationDraft]!] || fallback : fallback])) as unknown as ApplicationDraft;
      if (!STATUSES.includes(draft.status as ApplicationStatus)) draft.status = "Applied";
      return { ...draft, id: makeId(), lastActionDate: today() };
    }).filter((app) => app.company && app.role);
    setApplications((current) => [...added, ...current]);
    setRows([]);
    notify(`${added.length} applications imported.`);
  };

  return (
    <div className="import-grid fade-in">
      <section className="panel import-card">
        <span className="large-icon"><FileInput size={26} /></span><p className="eyebrow">PDF intelligence</p><h2>Extract an opportunity</h2><p>Upload a job description, offer letter, or resume. Apptrack will extract readable text for review.</p>
        <button className="button primary" onClick={() => pdfRef.current?.click()} disabled={loading}><UploadCloud size={16} /> {loading ? "Reading…" : "Upload PDF"}</button>
        <input ref={pdfRef} type="file" accept="application/pdf" hidden onChange={(event) => parsePdf(event.target.files?.[0])} />
      </section>
      <section className="panel import-card">
        <span className="large-icon"><Import size={26} /></span><p className="eyebrow">Google workspace</p><h2>Bring in a shared file</h2><p>Paste a public Google Sheet or Doc link. Sheets become mapped rows; Docs become readable text.</p>
        <label><span>Public share link</span><input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://docs.google.com/…" /></label>
        <button className="button secondary" onClick={fetchSource} disabled={!sourceUrl || loading}><Import size={16} /> Import link</button>
      </section>
      {pdfText && <section className="panel import-preview full-span"><header className="panel-header"><div><p className="eyebrow">Extracted text</p><h2>{pdfName}</h2></div><button className="button primary" onClick={mapPdf}>Map to application</button></header><pre>{pdfText}</pre></section>}
      {rows.length > 0 && <section className="panel full-span"><header className="panel-header"><div><p className="eyebrow">Column mapping</p><h2>{rows.length} rows ready</h2><p>Choose which source column belongs to each Apptrack field.</p></div><button className="button primary" onClick={importAll}>Import all</button></header><div className="mapping-grid">{IMPORT_FIELDS.map((field) => <label key={field}><span>{FIELD_LABELS[field]}</span><select value={mapping[field] ?? ""} onChange={(event) => setMapping((current) => ({ ...current, [field]: event.target.value }))}><option value="">Do not import</option>{headers.map((header) => <option key={header}>{header}</option>)}</select></label>)}</div><div className="preview-table"><table><thead><tr>{headers.slice(0, 5).map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.slice(0, 4).map((row, index) => <tr key={index}>{headers.slice(0, 5).map((header) => <td key={header}>{row[header]}</td>)}</tr>)}</tbody></table></div></section>}
      {!applications.length && <p className="sr-only">No existing applications.</p>}
    </div>
  );
}

function Deadlines({ applications, jump }: { applications: JobApplication[]; jump: (app: JobApplication) => void }) {
  const dated = applications.filter((app) => app.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const groups = dated.reduce<Record<string, JobApplication[]>>((result, app) => {
    const date = new Date(`${app.deadline}T12:00:00`);
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const label = `Week of ${formatDate(start.toISOString().slice(0, 10))}`;
    result[label] = [...(result[label] ?? []), app];
    return result;
  }, {});
  return (
    <section className="panel fade-in">
      <header className="panel-header"><div><p className="eyebrow">Calendar</p><h2>Upcoming deadlines</h2><p>Priorities grouped by week, with urgency at a glance.</p></div></header>
      <div className="deadline-groups">{Object.entries(groups).map(([label, apps]) => <section key={label}><h3>{label}</h3>{apps.map((app) => { const days = daysUntil(app.deadline); return <button className="deadline-row" key={app.id} onClick={() => jump(app)}><span className={`urgency ${days <= 3 ? "urgent" : days <= 7 ? "soon" : "later"}`} /><div><strong>{app.company} · {app.role}</strong><span>{app.nextAction || "Application deadline"}</span></div><div><strong>{formatDate(app.deadline)}</strong><span>{days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "Due today" : `${days} days left`}</span></div><ChevronRight size={17} /></button>; })}</section>)}</div>
      {!dated.length && <EmptyState icon={<CalendarDays size={24} />} title="No deadlines on the calendar" copy="Add a deadline to an application and it will appear here." />}
    </section>
  );
}

function FollowUps({ applications, setApplications, notify }: { applications: JobApplication[]; setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>; notify: (value: string) => void }) {
  const due = applications.filter((app) => !["Offer", "Rejected"].includes(app.status) && daysSince(app.lastActionDate) > 7);
  const mark = (id: string) => {
    setApplications((current) => current.map((app) => app.id === id ? { ...app, lastActionDate: today(), nextAction: "Await recruiter response" } : app));
    notify("Follow-up logged for today.");
  };
  const copy = async (app: JobApplication) => {
    const name = app.recruiter ? ` ${app.recruiter.split(" ")[0]}` : "";
    await navigator.clipboard.writeText(`Hi${name},\n\nI hope you're doing well. I wanted to follow up on my application for the ${app.role} role at ${app.company}. I'm still very excited about the opportunity and would be glad to share anything else that is helpful.\n\nThank you for your time,\nBenjamin`);
    notify("Follow-up email copied.");
  };
  return (
    <section className="panel fade-in">
      <header className="panel-header"><div><p className="eyebrow">Keep conversations warm</p><h2>Follow-ups due</h2><p>Opportunities with no activity for more than seven days.</p></div><span className="count-pill">{due.length} due</span></header>
      <div className="followup-list">{due.map((app) => <article key={app.id}><span className="company-mark">{app.company.slice(0, 1)}</span><div><strong>{app.company} · {app.role}</strong><p>Last action {daysSince(app.lastActionDate)} days ago · {app.recruiterEmail || "No recruiter email saved"}</p></div><StatusBadge status={app.status} /><div className="followup-actions"><button className="button secondary" onClick={() => copy(app)}><Clipboard size={15} /> Send reminder</button><button className="button primary" onClick={() => mark(app.id)}><Check size={15} /> Mark followed up</button></div></article>)}</div>
      {!due.length && <EmptyState icon={<Check size={24} />} title="You're all caught up" copy="No follow-ups are due right now." />}
    </section>
  );
}

function SettingsPanel({ theme, setTheme, applications, clear, notify }: { theme: "dark" | "light"; setTheme: (value: "dark" | "light") => void; applications: JobApplication[]; clear: () => void; notify: (value: string) => void }) {
  const exportData = () => {
    downloadText(`apptrack-export-${today()}.csv`, applicationsToCsv(applications));
    notify("Application data exported.");
  };
  return (
    <div className="settings-grid fade-in">
      <section className="panel setting-card"><span className="large-icon">{theme === "dark" ? <Moon size={23} /> : <Sun size={23} />}</span><div><p className="eyebrow">Appearance</p><h2>Theme</h2><p>Switch between Apptrack&apos;s editorial dark and soft paper themes.</p></div><button className="toggle" aria-label="Toggle light mode" aria-pressed={theme === "light"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}><span /></button></section>
      <section className="panel setting-card"><span className="large-icon"><Download size={23} /></span><div><p className="eyebrow">Portability</p><h2>Export your data</h2><p>Download all {applications.length} applications as a CSV file.</p></div><button className="button secondary" onClick={exportData}><Download size={16} /> Export CSV</button></section>
      <section className="panel setting-card danger-zone"><span className="large-icon"><Archive size={23} /></span><div><p className="eyebrow">Fresh start</p><h2>Clear workspace</h2><p>Remove every application and resume stored in this browser.</p></div><button className="button danger-button" onClick={clear}><Trash2 size={16} /> Clear all data</button></section>
      <section className="panel about-card"><p className="eyebrow">About Apptrack</p><h2>A calmer way to find what&apos;s next.</h2><p>Apptrack is a private, browser-based job search workspace. Your data stays in local storage on this device. No account, server, or tracking required.</p><span>Version 1.0 · Designed for focused job seekers</span></section>
    </div>
  );
}
