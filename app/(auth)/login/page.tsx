"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage(){
    const [form, setform] = useState({email:"", password:""})
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin =async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const res = await signIn("credentials",{
            redirect: false,
            email: form.email,
            password: form.password,
            callbackUrl:"/"
        })

        if (res?.ok) {
            router.push("/")
        }else{
            setError("Invalid email or password")
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
            <input type="email"
            placeholder="email"
            value={form.email}
            onChange={(e)=>setform({...form, email:e.target.value})}
             className="w-full p-2 border rounded"
          required
            />
            <input type="password"
            placeholder="password"
            value={form.password}
            onChange={(e)=>setform({...form, password:e.target.value})}
            className="w-full p-2 border rounded"
            required
            />
            {error && <p className="text-red-600"> {error} </p>}
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Sign In</button>
        </form>
        <button 
        className="w-full bg-blue-300 text-white p-2 rounded m-2"
        onClick={()=>{
            signIn("google", {callbackUrl: "http://localhost:3000"})
        }}
        >Google</button>
        </div>

    )
}