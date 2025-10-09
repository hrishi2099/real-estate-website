import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Zaminseva Prime",
  description: "Sign in to your Zaminseva Prime account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
