import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "MinkTilet - Bio-Intelligence Harness",
  description: "Luxury corporate bio-nexus operating system grounding clinical science in Ethiopian ancestral wisdom.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-luxury-bg text-luxury-text font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
