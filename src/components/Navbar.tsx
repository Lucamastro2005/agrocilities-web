"use client";
import Link from "next/link";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/app/client";

export default function Navbar() {
  const account = useActiveAccount();

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl transition-transform group-hover:scale-110">🌾</span>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            AgroCilities
          </h1>
        </Link>

        {/* ENLACES DE NAVEGACIÓN (Solo si está conectado) */}
        {account && (
          <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50">
            <Link href="/market" className="px-6 py-2 rounded-full text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition">
              🛒 Mercado
            </Link>
            <Link href="/dashboard" className="px-6 py-2 rounded-full text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition">
              👨‍🌾 Productor
            </Link>
            <Link href="/contractor" className="px-6 py-2 rounded-full text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition">
              🚜 Contratista
            </Link>
          </div>
        )}

        {/* BOTÓN DE CONEXIÓN */}
        <div>
          <ConnectButton 
            client={client} 
            theme={"dark"}
            connectModal={{
              size: "compact",
              title: "Acceder a AgroCilities",
              welcomeScreen: { title: "Bienvenido al Agro Web3", subtitle: "Conectá tu billetera para operar." }
            }}
            connectButton={{
              label: "Conectar Billetera",
              style: { fontWeight: "bold", borderRadius: "12px", padding: "12px 24px" }
            }}
          />
        </div>
      </div>
    </nav>
  );
}