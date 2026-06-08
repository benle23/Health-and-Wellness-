export const STATUSES = ["Applied", "Screening", "Interview", "Offer", "Rejected", "Ghosted"] as const;

export type ApplicationStatus = (typeof STATUSES)[number];
export type View = "dashboard" | "applications" | "resumes" | "import" | "deadlines" | "followups" | "settings";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  dateApplied: string;
  status: ApplicationStatus;
  notes: string;
  deadline: string;
  resume: string;
  recruiter: string;
  recruiterEmail: string;
  nextAction: string;
  lastActionDate: string;
}

export interface ResumeFile {
  id: string;
  filename: string;
  label: string;
  uploadDate: string;
  dataUrl: string;
  applicationIds: string[];
}

export type ApplicationDraft = Omit<JobApplication, "id" | "lastActionDate">;

export interface ParsedRow {
  [key: string]: string;
}
