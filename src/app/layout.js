import "./globals.css";

export const metadata = {
  title: "The Traditional Villa",
  description: "Villa booking admin panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}