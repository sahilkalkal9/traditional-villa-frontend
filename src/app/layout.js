import "./globals.css";

export const metadata = {
  title: "The Traditional Villa",
  description: "Villa booking admin panel",
  manifest: "/manifest.json",
  themeColor: "#071726",

  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },

  appleWebApp: {
    capable: true,
    title: "The Traditional Villa",
    statusBarStyle: "black-translucent",
  },

  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-startup-image"
          href="/splash-iphone-x-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-iphone-13-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-iphone-14-pro-max-1290x2796.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}