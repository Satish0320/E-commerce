"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", name: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        router.push("/login")
      } else {
        const data = await res.json()
        if (data.error == "Email Already Exist") {
            setError("Email Already Exist")
        }else{
            setError("Something went wrong. try again Later")
        }
      }
    } catch (err) {
      setError("Network error")
    }finally{
        setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-2 border rounded"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
        disabled={loading}
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

    </div>
  )
}
