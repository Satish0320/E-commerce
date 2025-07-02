import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest){
    try {
        const {name, email, password} = await req.json()
        if (!name || !password || !email) {
            return NextResponse.json({error:"Fields are missing"},{status:400})
        }

        const existingEmail = await prisma.user.findUnique({
            where:{email}
        })
        if (existingEmail) {
            return NextResponse.json({error:"Email Already Exist"},{status:400})
        }

       const newUser = await prisma.user.create({
            data:{
                email,
                name,
                password
            }
        })
        return NextResponse.json({User:newUser},{status:201})
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}