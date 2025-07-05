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
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            httpOptions: {
                timeout: 10000
            }
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
            console.log("account ", account);
            console.log("user ", user);

            if (account?.provider === "google") {
                if (!account.providerAccountId || !user.email) {
                    throw new Error("Missing Google account or user email");
                }

                const existingAccount = await prisma.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId
                        }
                    },
                    include: { user: true }
                });

                if (existingAccount) {
                    return true;
                }

                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (existingUser?.password) {
                    console.log("Blocking login: Google login attempted for existing credentials user.");
                    return false;
                }

                return true;
            }

            if (account?.provider === "credentials") {
                const existingAccount = await prisma.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: "credentials",
                            providerAccountId: user.email!
                        }
                    }
                });

                if (!existingAccount) {
                    await prisma.account.create({
                        data: {
                            user: { connect: { id: user.id } },
                            type: "credentials",
                            provider: "credentials",
                            providerAccountId: user.email!,
                        }
                    });
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
