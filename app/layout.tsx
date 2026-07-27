import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "ERICA — Run your whole business", description: "CRM, operations, people, inventory and automation in one shared system." };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body className="min-h-screen antialiased">{children}</body></html>;
}
