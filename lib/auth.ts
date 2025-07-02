import { prisma } from "@/prisma/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "abc@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email }
                })

                if (!user) throw new Error("No User Found")

                return user
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {

         async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        
        async session({ token, session }) {
            if (token) {
                session.user.id = token.id as string;
            }
            return session;
        },

        async signIn({ user, account }) {
            if (account?.provider === "google") {
                if (!user.email) throw new Error("No email from provider");
                const existinguser = await prisma.user.findUnique({
                    where: { email: user.email }
                });
                if (existinguser?.password) {
                    throw new Error("Email already registered with password. Please use credentials login.")
                }
            }
            return true
        },

        // async session({ token, session }) {
        //     if (token) session.user.id = token.sub!
        //     return session
        // }
    },
    pages: {
        signIn: "/login"
    }
}



// async signIn({ user, account, profile }) {
//     if (account?.provider === "google") {
//         if (!user.email) throw new Error("No email from provider");
        
//         // Check if user exists with password
//         const existingUser = await prisma.user.findUnique({
//             where: { email: user.email }
//         });

//         if (existingUser?.password) {
//             // Option 1: Allow both methods (recommended)
//             // Just continue with Google sign-in
            
//             // Option 2: Block and show error (current behavior)
//             throw new Error("Email already registered with password. Please use credentials login.");
//         }

//         // For new Google users, ensure their record is properly created
//         if (!existingUser) {
//             await prisma.user.create({
//                 data: {
//                     email: user.email,
//                     name: user.name || profile?.name || "Google User",
//                     // No password for Google users
//                 }
//             });
//         }
//     }
//     return true;
// }