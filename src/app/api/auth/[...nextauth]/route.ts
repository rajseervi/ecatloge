import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          const user = userCredential.user;

          if (user) {
            return {
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email,
            };
          }

          return null;
        } catch (error: unknown) {
          console.error("Authentication error:", error);
          
          // Provide user-friendly error messages
          const firebaseError = error as { code?: string };
          if (firebaseError.code === "auth/user-not-found") {
            throw new Error("No account found with this email");
          } else if (firebaseError.code === "auth/wrong-password") {
            throw new Error("Incorrect password");
          } else if (firebaseError.code === "auth/invalid-email") {
            throw new Error("Invalid email address");
          } else if (firebaseError.code === "auth/user-disabled") {
            throw new Error("This account has been disabled");
          } else if (firebaseError.code === "auth/too-many-requests") {
            throw new Error("Too many failed attempts. Please try again later");
          } else if (firebaseError.code === "auth/invalid-credential") {
            throw new Error("Invalid email or password");
          }
          
          throw new Error("Authentication failed. Please try again");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        token.name = user.name || user.email || "Admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After successful login, redirect to admin dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/admin`;
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/admin`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
