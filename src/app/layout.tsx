import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sergio Gutierrez | Front End Developer",
  description:
    "Descubre el portafolio de Sergio Gutierrez, un talentoso desarrollador front-end especializado en React. Explora proyectos innovadores, soluciones creativas y su pasión por construir interfaces web intuitivas y funcionales. ¡Transforma tus ideas en realidad con Sergio!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
