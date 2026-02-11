"use client";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

// Definimos el tipo de dato para los alquileres
type Alquiler = {
  id: number;
  created_at: string;
  wallet_cliente: string;
  id_maquina: number;
  cantidad_horas: number;
  estado: string;
};

export default function AdminPage() {
  const [pedidos, setPedidos] = useState<Alquiler[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar pedidos al iniciar
  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    const { data, error } = await supabase
      .from('alquileres')
      .select('*')
      .order('id', { ascending: false }); // Los más nuevos arriba

    if (error) console.error("Error trayendo pedidos:", error);
    else setPedidos(data || []);
    setLoading(false);
  }

  // 2. Función para cambiar el estado (El botón mágico)
  async function actualizarEstado(id: number, nuevoEstado: string) {
    const { error } = await supabase
      .from('alquileres')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      alert("Error actualizando: " + error.message);
    } else {
      // Recargamos la lista para ver el cambio
      fetchPedidos(); 
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Centro de Logística 🚛</h1>
            <p className="text-zinc-400">Gestioná los despachos de maquinaria.</p>
          </div>
          <button onClick={fetchPedidos} className="text-sm text-green-400 hover:text-green-300 underline">
            Refrescar lista
          </button>
        </header>
        
        {loading ? (
          <p className="text-zinc-500 animate-pulse">Cargando órdenes entrantes...</p>
        ) : (
          <div className="space-y-4">
            {pedidos.length === 0 && (
              <p className="text-zinc-500">No hay pedidos pendientes.</p>
            )}

            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Info del Pedido */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded font-mono">
                      ORDEN #{pedido.id}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      pedido.estado === 'PENDIENTE' ? 'bg-yellow-500/20 text-yellow-500' :
                      pedido.estado === 'EN CAMINO' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {pedido.estado}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-1">
                    Cliente: <span className="text-white font-mono">{pedido.wallet_cliente.slice(0,6)}...{pedido.wallet_cliente.slice(-4)}</span>
                  </p>
                  <p className="text-lg font-bold">
                    Máquina ID: {pedido.id_maquina} <span className="text-zinc-500 font-normal">x {pedido.cantidad_horas} horas</span>
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2">
                  {pedido.estado === 'PENDIENTE' && (
                    <button 
                      onClick={() => actualizarEstado(pedido.id, 'EN CAMINO')}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                    >
                      🚛 Despachar
                    </button>
                  )}
                  
                  {pedido.estado === 'EN CAMINO' && (
                    <button 
                      onClick={() => actualizarEstado(pedido.id, 'FINALIZADO')}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                    >
                      ✅ Finalizar Trabajo
                    </button>
                  )}

                  {pedido.estado === 'FINALIZADO' && (
                    <span className="text-zinc-500 text-sm italic">Orden completada</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}