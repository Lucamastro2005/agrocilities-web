"use client";
import Navbar from "@/components/Navbar";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/app/client";
import { supabase } from "@/lib/supabase"; // Asegurate que esta ruta sea correcta según tu proyecto
import { useEffect, useState } from "react";

const chain = defineChain(11155111); // Sepolia

// ⚠️ CONTRATOS ACTUALIZADOS
const CONTRACT_ADDRESS = "0x01F8FeAc82f665391eBF5a940173441ee3787A8f";
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const contract = getContract({ client, chain, address: CONTRACT_ADDRESS });
const usdcContract = getContract({ client, chain, address: USDC_ADDRESS });

type Maquina = {
  id: number;
  nombre: string;
  tipo: string;
  precio_hora: number;
  imagen_url: string;
  disponible: boolean;
  owner_wallet: string;
};

export default function MarketPage() {
  const account = useActiveAccount();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del GPS
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Cargar Máquinas
  useEffect(() => {
    async function fetchMaquinas() {
      const { data, error } = await supabase
        .from("maquinas")
        .select("*")
        .order("id", { ascending: true });
      if (error) console.error(error);
      else setMaquinas(data || []);
      setLoading(false);
    }
    fetchMaquinas();
  }, []);

  // Lógica GPS Robusta
  const capturarUbicacion = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitud(position.coords.latitude);
          setLongitud(position.coords.longitude);
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          console.error("Error GPS:", error);

          let mensaje = "❌ No se pudo obtener la ubicación.";
          if (error.code === 1) mensaje = "❌ Permiso denegado. Habilitalo en el navegador.";
          else if (error.code === 2) mensaje = "❌ Sin señal GPS. Salí a cielo abierto.";
          else if (error.code === 3) mensaje = "❌ Tiempo de espera agotado (Timeout).";

          alert(mensaje);
        },
        // Configuración para Agro: Alta precisión y 20 segundos de espera
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Mercado de Maquinaria
          </h1>
          <p className="text-xl text-zinc-400">
            Alquiler directo, seguro y en Dólares Digitales (USDC).
          </p>
        </header>

        {/* Panel GPS */}
        <div className="bg-zinc-900/50 backdrop-blur-lg border border-blue-900/30 p-8 rounded-3xl mb-12 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-blue-900/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🛰️</span> Paso 1: Geolocalización del Lote
            </h2>
            <p className="text-zinc-400 mt-2">
              Capturamos tu posición satelital exacta para coordinar la logística.
            </p>
          </div>

          <button
            onClick={capturarUbicacion}
            disabled={latitud !== null || isLocating}
            className={`px-8 py-4 rounded-xl font-bold transition-all transform flex items-center gap-3 shadow-lg 
              ${latitud
                ? "bg-green-600 text-white cursor-default"
                : isLocating
                ? "bg-zinc-700 text-zinc-300 animate-pulse cursor-wait"
                : "bg-blue-600 hover:bg-blue-500 hover:scale-105 text-white"
              }`}
          >
            {latitud ? (
              <>✅ Coordenadas Aseguradas</>
            ) : isLocating ? (
              <>⏳ Buscando satélites...</>
            ) : (
              <>📍 Activar GPS Satelital</>
            )}
          </button>
        </div>

        {/* Grilla de Máquinas */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {maquinas.map((machine) => {
              // CÁLCULO SEGURO DEL MONTO (Evita decimales y errores BigInt)
              const precioNumerico = Number(machine.precio_hora);
              const montoCalculado = precioNumerico * 10 * 1000000; // 10 horas * decimales USDC
              const montoBigInt = BigInt(Math.floor(montoCalculado));

              return (
                <div
                  key={machine.id}
                  className={`group bg-zinc-900 border ${
                    machine.disponible
                      ? "border-zinc-800 hover:border-blue-500/50"
                      : "border-red-900/30 opacity-75"
                  } rounded-3xl overflow-hidden relative transition-all hover:shadow-2xl hover:shadow-blue-900/20`}
                >
                  {!machine.disponible && (
                    <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-red-600/90 text-white px-6 py-3 rounded-full font-bold text-xl transform -rotate-12 border-2 border-white/20 shadow-xl">
                        ALQUILADA
                      </span>
                    </div>
                  )}

                  <div className="h-56 bg-zinc-800 relative overflow-hidden">
                    <img
                      src={machine.imagen_url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://cdn.pixabay.com/photo/2017/09/06/14/53/tractor-2721779_1280.jpg")
                      }
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {machine.tipo}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{machine.nombre}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-green-400">
                          ${machine.precio_hora}
                        </span>
                        <span className="text-zinc-500 font-medium">
                          USDC / hora
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-6 space-y-3">
                      {/* BOTÓN 1: APROBAR (ALLOWANCE) */}
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract: usdcContract,
                            method: "function approve(address spender, uint256 amount)",
                            params: [CONTRACT_ADDRESS, montoBigInt],
                          })
                        }
                        onTransactionConfirmed={() =>
                          alert("✅ Fondos Aprobados. Ahora confirmá el alquiler.")
                        }
                        onError={(error) =>
                          alert(`❌ Error al aprobar: ${error.message}`)
                        }
                        disabled={!machine.disponible || !latitud}
                        style={{
                          width: "100%",
                          backgroundColor:
                            machine.disponible && latitud ? "#2563eb" : "#3f3f46",
                          color: "white",
                          padding: "14px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          opacity: machine.disponible && latitud ? 1 : 0.5,
                        }}
                      >
                        {!latitud ? "🚫 Falta GPS" : "1️⃣ Autorizar Fondos"}
                      </TransactionButton>

                      {/* BOTÓN 2: CREAR TRABAJO (ESCROW) */}
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract,
                            method:
                              "function crearTrabajo(address _contratista, uint256 _monto)",
                            params: [machine.owner_wallet, montoBigInt],
                          })
                        }
                        onTransactionConfirmed={async () => {
                          alert("🚀 ¡Alquiler Confirmado!");
                          if (account) {
                            await supabase.from("alquileres").insert([
                              {
                                wallet_cliente: account.address,
                                id_maquina: machine.id,
                                cantidad_horas: 10,
                                estado: "PENDIENTE",
                                latitud: latitud,
                                longitud: longitud,
                              },
                            ]);
                          }
                        }}
                        onError={(error) => {
                          console.error("Error Contrato:", error);
                          if (
                            error.message.includes("allowance") ||
                            error.message.includes("ERC20")
                          ) {
                            alert(
                              "❌ Error: Fondos insuficientes aprobados. Volvé a tocar el Botón 1."
                            );
                          } else {
                            alert(`❌ Error al alquilar: ${error.message}`);
                          }
                        }}
                        disabled={!machine.disponible || !latitud}
                        style={{
                          width: "100%",
                          backgroundColor:
                            machine.disponible && latitud ? "#16a34a" : "#3f3f46",
                          color: "white",
                          padding: "14px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          opacity: machine.disponible && latitud ? 1 : 0.5,
                        }}
                      >
                        {!latitud ? "🚫 Falta GPS" : "2️⃣ Confirmar Alquiler"}
                      </TransactionButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}