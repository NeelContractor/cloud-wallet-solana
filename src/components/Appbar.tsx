import Image from "next/image";

export default function Appbar() {
    return (
        <div className="flex justify-around gap-4 border-b border-gray-400 py-5">
            <div className="flex self-auto">
            <Image src="/solanaLogo.png" alt="Solana logo" width={100} height={50} />
          </div>
        </div>
    )
}