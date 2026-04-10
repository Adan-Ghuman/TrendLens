import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";

const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-display",
});

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-body",
});

const ibmPlexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "InvestKaar Screening",
    description: "A sharp dashboard for the latest trending GitHub repositories.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>): ReactNode {
    return (
        <html lang="en">
            <body className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
                {children}
            </body>
        </html>
    );
}
