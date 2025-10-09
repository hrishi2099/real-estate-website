import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Zaminseva Prime",
  description: "Create your Zaminseva Prime account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
