"use client";
import Navbar from "@/components/Navbar";
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
import { client } from "@/app/client";

// --- CONFIGURACIÓN BLOCKCHAIN ---
const chain = defineChain(11155111); // Sepolia
const CONTRACT_ADDRESS = "0xDa079A2707e52829D9Fd99Fc05ba690e4B50fF48"; 
const contract = getContract({ client, chain, address: CONTRACT_ADDRESS });

type Pedido = {
  id: number;
  id_maquina: number;
  nombre_maquina: string;
  estado: string;
  cantidad_horas: number;
  monto_total?: number;
  contract_id?: number; // 🆕 Campo clave para la corrección
};

export default function Dashboard() {
  const account = useActiveAccount();
  const [misPedidos, setMisPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos del Productor (Cliente)
  useEffect(() => {
    async function fetchPedidos() {
      if (!account) return;

      const { data: alquileres, error } = await supabase
        .from("alquileres")
        .select("*")
        .eq("wallet_cliente", account.address)
        .neq("estado", "FINALIZADO");

      if (error) {
        console.error("Error fetching pedidos:", error);
      } else if (alquileres) {
        
        const pedidosConNombre = await Promise.all(
          alquileres.map(async (p) => {
            const { data: maquina } = await supabase
              .from("maquinas")
              .select("nombre")
              .eq("id", p.id_maquina)
              .single();
            return { ...p, nombre_maquina: maquina?.nombre || "Máquina desconocida" };
          })
        );
        
        setMisPedidos(pedidosConNombre);
      }
      setLoading(false);
    }

    fetchPedidos();
  }, [account]);

  const registrarLiberacion = async (idPedido: number) => {
    await supabase.from("alquileres").update({ estado: "FINALIZADO" }).eq("id", idPedido);
    alert("✅ Pago liberado y contrato cerrado exitosamente.");
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold mb-2">Mi Panel de Productor</h1>
          <p className="text-zinc-400">Auditoría financiera y liberación de pagos.</p>
        </header>

        {!account ? (
          <div className="flex flex-col items-center justify-center h-64 border border-zinc-800 rounded-2xl bg-zinc-900/50">
            <p className="text-zinc-500">Conectá tu billetera para gestionar tus contratos.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20 animate-pulse text-zinc-500">Cargando contratos...</div>
        ) : misPedidos.length === 0 ? (
          <div className="text-center py-20 border border-zinc-800 rounded-2xl bg-zinc-900/50">
            <p className="text-zinc-300 mb-4">No tenés contratos activos pendientes de pago.</p>
            <a href="/market" className="text-green-400 hover:underline">Ir al Mercado</a>
          </div>
        ) : (
          <div className="space-y-6">
            {misPedidos.map((pedido) => (
              <div key={pedido.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                      {/* Mostramos el ID de contrato si existe, sino el de DB */}
                      CONTRATO #{pedido.contract_id ?? pedido.id} 
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {pedido.nombre_maquina}
                    </h3>

                    <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-xl w-full md:w-64">
                      <h4 className="text-sm font-bold text-zinc-300 mb-2">Auditoría Financiera</h4>
                      <div className="text-sm text-zinc-400 flex justify-between">
                        <span>Tiempo Base:</span>
                        <span className="text-white font-mono">10 h</span>
                      </div>
                      <div className="text-sm text-zinc-400 flex justify-between mt-1">
                        <span>Status:</span>
                        <span className="text-white font-mono">{pedido.estado}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">ACCIÓN REQUERIDA</span>
                    
                    <TransactionButton
                      transaction={() => {
                        // 🛠️ CORRECCIÓN CRÍTICA DE ID
                        // Usamos contract_id si existe. Si no, usamos pedido.id.
                        // BigInt es necesario para Solidity uint256
                        const idParaContrato = pedido.contract_id ?? pedido.id;
                        
                        console.log(`Intentando liberar trabajo con ID: ${idParaContrato}`);

                        return prepareContractCall({
                          contract,
                          method: "function confirmarTrabajo(uint256 _jobId)", 
                          params: [BigInt(idParaContrato)], 
                        });
                      }}
                      onTransactionConfirmed={(receipt) => {
                        console.log("Transacción confirmada:", receipt);
                        registrarLiberacion(pedido.id);
                      }}
                      onError={(error) => {
                        console.error("Error Web3:", error);
                        // Mensaje de error amigable
                        if (error.message.includes("Owner")) alert("❌ Error: Solo el dueño del contrato puede ejecutar esto.");
                        else if (error.message.includes("revert")) alert("❌ Error: El contrato rechazó la operación. Verificá que el ID del trabajo coincida.");
                        else alert("❌ Error técnico. Revisá la consola.");
                      }}
                      style={{
                        backgroundColor: "#f97316",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "10px",
                        padding: "12px 24px",
                        fontSize: "14px"
                      }}
                    >
                      💸 Aprobar y Liberar Pago
                    </TransactionButton>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}