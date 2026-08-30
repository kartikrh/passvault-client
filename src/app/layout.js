import "@/assets/scss/theme.scss";

export const metadata = {
  title: "PassVault",
  description: "Sign in to your PassVault account",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
