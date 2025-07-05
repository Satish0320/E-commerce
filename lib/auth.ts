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

        const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
        });

        const existingAccount = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId
                }
            }
        });

        // 🟡 Important: Allow first-time Google login to create user
        // The PrismaAdapter will handle user + account creation AFTER this callback
        if (existingUser?.password && !existingAccount) {
            // Let NextAuth proceed and create the account
            // But prevent login AFTER user/account are saved
            // You can optionally unlink OAuth accounts later
            return false;
        }
    }

    return true;
}
,

    },
    pages: {
        signIn: "/login"
    }
}
