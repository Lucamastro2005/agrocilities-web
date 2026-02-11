"use client";
import Navbar from "@/components/Navbar";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { client } from "@/app/client";
import { jsPDF } from "jspdf"; // NUEVA LIBRERÍA LEGAL

const chain = defineChain(11155111);

// ⚠️ TU CONTRATO ESCROW:
const CONTRACT_ADDRESS = "0x01F8FeAc82f665391eBF5a940173441ee3787A8f"; 
const contract = getContract({ client, chain, address: CONTRACT_ADDRESS });
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const usdcContract = getContract({ client, chain, address: USDC_ADDRESS });

type Alquiler = { id: number; id_maquina: number; cantidad_horas: number; estado: string; hora_inicio?: string; hora_fin?: string; deuda_pagada: boolean; wallet_cliente: string; };
type Maquina = { id: number; nombre: string; precio_hora: number; owner_wallet: string; imagen_url: string; };

export default function DashboardPage() {
  const account = useActiveAccount();
  const [misAlquileres, setMisAlquileres] = useState<Alquiler[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (account) cargarDatos(); }, [account]);

  async function cargarDatos() {
    const { data: alqData } = await supabase.from('alquileres').select('*').eq('wallet_cliente', account?.address).order('id', { ascending: false });
    const { data: maqData } = await supabase.from('maquinas').select('*');
    if (alqData) setMisAlquileres(alqData);
    if (maqData) setMaquinas(maqData);
    setLoading(false);
  }

  function calcularAuditoria(inicio?: string, fin?: string) {
    if (!inicio || !fin) return { reales: 0, excedente: 0 };
    const diffMs = new Date(fin).getTime() - new Date(inicio).getTime();
    const segundosReales = diffMs / 1000;
    const excedente = segundosReales > 10 ? Math.ceil(segundosReales - 10) : 0;
    return { reales: segundosReales, excedente };
  }

  const getStatusColor = (estado: string, tieneDeuda: boolean) => {
    if (estado === 'FINALIZADO' && tieneDeuda) return "bg-red-500 text-white";
    switch (estado) {
      case 'PENDIENTE': return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case 'EN CAMINO': return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case 'TRABAJANDO': return "bg-purple-500/20 text-purple-500 border-purple-500/50 animate-pulse";
      case 'FINALIZADO': return "bg-orange-500/20 text-orange-500 border-orange-500/50";
      case 'PAGADO': return "bg-green-500/20 text-green-500 border-green-500/50";
      default: return "bg-zinc-800";
    }
  }

  // --- NUEVO MÓDULO LEGAL: GENERADOR DE CONTRATO PDF ---
  const descargarContrato = (alquiler: Alquiler, maquina: Maquina) => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-AR");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CONTRATO DE LOCACIÓN DE MAQUINARIA AGRÍCOLA", 105, 20, { align: "center" });
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const textoCuerpo = `
En la fecha ${fecha}, se genera el presente instrumento digital que respalda 
la prestación de servicios agrícolas bajo la red AgroCilities.

PARTES INTERVINIENTES:
- LOCADOR (Contratista Dueño del Equipo): ${maquina.owner_wallet}
- LOCATARIO (Productor Cliente): ${alquiler.wallet_cliente}

CLÁUSULA PRIMERA (OBJETO): El Locador entrega en locación y se compromete a 
prestar servicio con la maquinaria identificada como: ${maquina.nombre}.

CLÁUSULA SEGUNDA (PRECIO Y FIDEICOMISO): El precio de la locación se fija en 
$${maquina.precio_hora} USDC por hora. Las partes acuerdan que el capital total del servicio ha sido 
bloqueado en garantía mediante un Contrato Inteligente (Escrow) alojado en 
la dirección: ${CONTRACT_ADDRESS}.

CLÁUSULA TERCERA (AUDITORÍA Y EXCEDENTES): Se establece un tiempo base de 
${alquiler.cantidad_horas} horas. El Locatario acepta que la telemetría satelital actuará como 
auditor. Todo excedente de uso será liquidado de forma obligatoria previo a 
la liberación de los fondos en garantía.

CLÁUSULA CUARTA (JURISDICCIÓN): Las partes aceptan la inmutabilidad de la 
blockchain como registro único, público y vinculante de la presente locación.

-----------------------------------------------------------------------------------------------------
ESTADO ACTUAL DE LA ORDEN: ${alquiler.estado}
ID DE OPERACIÓN BANCARIA (ON-CHAIN): #${alquiler.id}
    `;

    const lineas = doc.splitTextToSize(textoCuerpo, 170);
    doc.text(lineas, 20, 40);
    
    doc.setFont("helvetica", "bold");
    doc.text("Firma Criptográfica Locador", 30, 160);
    doc.text("Firma Criptográfica Locatario", 120, 160);
    
    // Genera y descarga el archivo
    doc.save(`Contrato_AgroCilities_Orden_${alquiler.id}.pdf`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-zinc-950 to-zinc-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
            👨‍🌾 Panel del Productor
          </h1>
          <p className="text-xl text-zinc-400">Auditoría de tiempos, gestión de contratos y liberación de pagos Escrow.</p>
        </header>

        {!account ? (
          <div className="p-16 border-2 border-dashed border-zinc-800 rounded-3xl text-center bg-zinc-900/50">
            <p className="text-2xl font-bold text-zinc-300 mb-4">🔐 Acceso Requerido</p>
            <p className="text-zinc-500">Conectá tu billetera Web3 para ver tus contratos activos.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div></div> : 
            
            misAlquileres.map((alquiler) => {
              const maquina = maquinas.find(m => m.id === alquiler.id_maquina);
              if (!maquina) return null;
              const { reales, excedente } = calcularAuditoria(alquiler.hora_inicio, alquiler.hora_fin);
              const deudaUSDC = excedente * maquina.precio_hora; 
              const tieneDeudaPendiente = excedente > 0 && !alquiler.deuda_pagada;

              return (
                <div key={alquiler.id} className={`bg-zinc-900/80 backdrop-blur-md border ${tieneDeudaPendiente ? 'border-red-500/50 shadow-xl shadow-red-900/20' : 'border-zinc-800 hover:border-green-500/30'} p-8 rounded-3xl relative overflow-hidden transition-all group`}>
                  
                  {/* Encabezado */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-6">
                       <img src={maquina.imagen_url} className="w-24 h-24 object-cover rounded-2xl border border-zinc-700 shadow-lg" onError={(e) => e.currentTarget.src = 'https://cdn.pixabay.com/photo/2017/09/06/14/53/tractor-2721779_1280.jpg'} />
                       <div>
                          <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Contrato #{alquiler.id}</p>
                          <h3 className="text-3xl font-extrabold text-white">{maquina.nombre}</h3>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-6 py-3 rounded-xl font-extrabold text-sm border-2 uppercase tracking-wider ${getStatusColor(alquiler.estado, tieneDeudaPendiente)}`}>
                        {alquiler.estado === 'FINALIZADO' && tieneDeudaPendiente ? '🛑 Auditoría Pendiente' : alquiler.estado}
                      </div>
                      
                      {/* BOTÓN DE DESCARGA PDF */}
                      <button 
                        onClick={() => descargarContrato(alquiler, maquina)}
                        className="text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        📄 Descargar Contrato (PDF)
                      </button>
                    </div>
                  </div>

                  {alquiler.estado === 'TRABAJANDO' && (
                     <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl flex items-center gap-3 mb-6 animate-pulse">
                        <span className="text-2xl">⚙️</span> <p className="text-purple-300 font-bold">La máquina está operando en tu lote en este momento.</p>
                     </div>
                  )}

                  {/* Auditoría Financiera */}
                  {alquiler.estado === 'FINALIZADO' && (
                    <div className="bg-black/40 p-6 rounded-2xl border border-zinc-800 mb-8">
                      <h4 className="text-lg font-bold text-zinc-200 mb-4 flex items-center gap-2">📋 Estado de Cuenta y Auditoría</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
                        <div><p className="text-zinc-500 text-xs uppercase">Horas Contratadas</p><p className="text-2xl font-bold text-white">10 h</p></div>
                        <div><p className="text-zinc-500 text-xs uppercase">Tiempo Real</p><p className={`text-2xl font-bold ${excedente > 0 ? 'text-red-400' : 'text-green-400'}`}>{reales.toFixed(0)} seg</p></div>
                        <div className="col-span-2">
                           {excedente > 0 ? (
                             <div className={`p-4 rounded-xl border ${alquiler.deuda_pagada ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                               <p className={`font-bold ${alquiler.deuda_pagada ? 'text-green-400' : 'text-red-400'}`}>{alquiler.deuda_pagada ? '✅ Excedente liquidado.' : `⚠️ Exceso detectado: ${excedente} seg.`}</p>
                               <p className="text-2xl font-black mt-1">{alquiler.deuda_pagada ? 'SALDO: $0.00' : `DEUDA: $${deudaUSDC} USDC`}</p>
                             </div>
                           ) : (
                             <div className="p-4 rounded-xl bg-green-900/20 border border-green-500/50"><p className="text-green-400 font-bold">✅ Sin excedentes.</p></div>
                           )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones de Pago */}
                  {alquiler.estado === 'FINALIZADO' && (
                    <div className="flex flex-col md:flex-row justify-end gap-4 mt-6 border-t border-zinc-800 pt-6">
                      {tieneDeudaPendiente ? (
                        <TransactionButton
                          transaction={() => { return prepareContractCall({ contract: usdcContract, method: "function transfer(address to, uint256 amount)", params: [maquina.owner_wallet, BigInt(deudaUSDC * 1000000)] }); }}
                          onTransactionConfirmed={async () => { await supabase.from('alquileres').update({ deuda_pagada: true }).eq('id', alquiler.id); cargarDatos(); }}
                          style={{ backgroundColor: "#ef4444", color: "white", fontWeight: "900", padding: "16px 32px", borderRadius: "14px", fontSize: "1.1rem" }}
                        >💸 Pagar Multa (${deudaUSDC} USDC)</TransactionButton>
                      ) : (
                        <TransactionButton
                          transaction={() => prepareContractCall({ contract, method: "function finalizarTrabajo(uint256 _idTrabajo)", params: [BigInt(alquiler.id)] })}
                          onTransactionConfirmed={async () => { await supabase.from('alquileres').update({ estado: 'PAGADO' }).eq('id', alquiler.id); cargarDatos(); }}
                          style={{ backgroundColor: "#16a34a", color: "white", fontWeight: "900", padding: "16px 32px", borderRadius: "14px", fontSize: "1.1rem" }}
                        >🤝 Aprobar y Liberar Pago Escrow</TransactionButton>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}