"use client"
import SlideImage from "@/components/SlideImage";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  return (
    <div>
      <div className="flex my-20 justify-between mx-10">
        <div >
          <div>
            <h1 className="text-6xl font-thin">One Wallet to</h1><h1 className="text-6xl text-purple-700">Rule Them All</h1>
          </div>
          <div className="mt-10">
            <p className="text-lg font-medium">🚀 Your Crypto, Always Within Reach! Experience lightning-fast transactions<br /> with our Cloud Wallet on Solana. Secure, scalable,<br /> and accessible from anywhere—store, swap, and stake your digital assets effortlessly. <br />Harness the power of Solana’s speed with the convenience of the cloud!</p>
          </div>
        </div>
        <div className="flex">
          <SlideImage />
        </div>
      </div>
      <div className="grid justify-center gap-4">
        <div className="flex justify-center ">
          <p className="text-xl font-thin">Create an account today and join to <span className="font-bold">active Cloud Wallet users</span>. buy, sell, trade, play and explore!</p>
        </div>
        <div className="flex justify-center gap-4">
          <button 
            className="text-base font-bold border rounded-xl border-purple-300 p-2 hover:bg-white hover:text-purple-800"
            onClick={() => {
              router.push('/SignAuth/SignUp')
            }}
          >Create Account</button>
          <button 
            className="text-base font-bold border rounded-xl border-purple-300 p-2 px-5 hover:bg-white hover:text-purple-800"
            onClick={() => {
              router.push('/SignAuth/SignIn')
            }}
          >Login</button>
        </div>
      </div>
   </div>
  );
}
