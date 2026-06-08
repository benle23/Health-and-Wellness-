import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apptrack | Job application workspace",
  description: "A refined workspace for managing applications, deadlines, resumes, and follow-ups.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
