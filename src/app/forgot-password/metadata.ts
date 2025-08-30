import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Forgot Password",
  "Reset your password to regain access to your account. Enter your email address to receive a password reset link.",
  null,
  {
    canonical: "/forgot-password"
  }
);
