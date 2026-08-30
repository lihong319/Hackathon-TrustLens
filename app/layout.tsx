import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "TrustLens — Verify before you trust",
  description:
    "AI-powered scam and misinformation verification with tamper-resistant proof on Sui.",
  openGraph: {
    title: "TrustLens — Verify before you trust",
    description: "AI verification. Verifiable proof. Powered by Gonka and secured on Sui.",
    type: "website",
    images: [{ url: "/og.png", width: 1747, height: 909, alt: "TrustLens — Verify before you trust" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustLens — Verify before you trust",
    description: "AI verification. Verifiable proof. Powered by Gonka and secured on Sui.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
