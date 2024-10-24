"use client"
import { signin } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { useState } from "react"

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    return <div className="grid justify-center items-center h-screen">
        <div>
            <div className="flex justify-center text-3xl">
                <h1 className="flex justify-center text-4xl font-bold">Account Registration</h1>
            </div>
            <div className="p-4">
                <input onChange={(e) => {
                    setEmail(e.target.value)
                }} className="p-2 m-2 bg-gray-950 w-72 font-semibold text-base border rounded-xl border-white" type="text" placeholder="username" /> <br />
                <input onChange={(e) => {
                    setPassword(e.target.value)
                }}  className="p-2 m-2 bg-gray-950 w-72 font-semibold text-base border rounded-xl border-white" type="password" placeholder="password" /> <br />
                <div className="mt-4 grid justify-center gap-4">
                    <button 
                        className="border rounded-2xl p-2 text-base font-bold hover:border-purple-700 hover:text-purple-800"
                        onClick={async () => {
                        signin(email, password)
                        router.push('/dashboard')
                    }} >Sign In</button>
                    <p className="my-3 flex justify-center text-lg font-bold">OR</p>
                    <button 
                        className="border rounded-2xl p-2 text-base font-bold hover:border-purple-700 hover:text-purple-800"
                        onClick={async () => {
                        router.push('/SignAuth/SignUp')
                    }} >Sign Up</button>
                </div>
            </div>
        </div>
    </div>
}