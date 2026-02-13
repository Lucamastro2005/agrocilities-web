"use client";
import Navbar from "@/components/Navbar";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Maquina = { id: number; nombre: string; precio_hora: number; imagen_url: string; disponible: boolean; inversion_inicial: number; };
type Alquiler = { id: number; wallet_cliente: string; id_maquina: number; cantidad_horas: number; estado: string; latitud?: number; longitud?: number; nombre_maquina?: string; hora_inicio?: string; hora_fin?: string; };

export default function ContractorPage() {
  const account = useActiveAccount();
  const [misMaquinas, setMisMaquinas] = useState<Maquina[]>([]);
  const [misPedidos, setMisPedidos] = useState<Alquiler[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados Formulario Alta
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("Tractor");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaInversion, setNuevaInversion] = useState(""); 
  const [nuevaImagen, setNuevaImagen] = useState("");

  const [horasProyectadas, setHorasProyectadas] = useState<{ [key: number]: number }>({});

  useEffect(() => { if (account) fetchData(); }, [account]);

  async function fetchData() {
    if (!account) return;
    const { data: maquinasData } = await supabase.from('maquinas').select('*').eq('owner_wallet', account.address).order('id');
    if (maquinasData) {
      setMisMaquinas(maquinasData);
      const idsMios = maquinasData.map(m => m.id);
      if (idsMios.length > 0) {
        const { data: alquileresData } = await supabase.from('alquileres').select('*').in('id_maquina', idsMios).order('id', { ascending: false });
        if (alquileresData) {
          setMisPedidos(alquileresData.map(p => ({ ...p, nombre_maquina: maquinasData.find(m => m.id === p.id_maquina)?.nombre })));
        }
      } else { setMisPedidos([]); }
    }
    setLoading(false);
  }

  // --- MOTOR FINANCIERO (VAN Y RECUPERO) ---
  function calcularMetricas(inversion: number, precioHora: number, horasMes: number) {
    if (!inversion || !precioHora || !horasMes) return { van: 0, recupero: 0, flujoAnual: 0 };
    
    const flujoAnual = precioHora * horasMes * 12; 
    const tasaDescuento = 0.10; 
    const vidaUtil = 5; 
    
    let van = -inversion;
    for (let t = 1; t <= vidaUtil; t++) {
      van += flujoAnual / Math.pow(1 + tasaDescuento, t);
    }
    
    const recuperoAños = inversion / flujoAnual; 
    return { van, recupero: recuperoAños, flujoAnual };
  }

  async function agregarNuevaMaquina(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    const { error } = await supabase.from('maquinas').insert([{
      nombre: nuevoNombre, tipo: nuevoTipo, precio_hora: parseFloat(nuevoPrecio),
      inversion_inicial: parseFloat(nuevaInversion), 
      imagen_url: nuevaImagen || "https://cdn.pixabay.com/photo/2017/09/06/14/53/tractor-2721779_1280.jpg",
      disponible: true, owner_wallet: account.address
    }]);
    if (!error) { setNuevoNombre(""); setNuevoPrecio(""); setNuevaInversion(""); setNuevaImagen(""); fetchData(); }
  }

  async function iniciarTrabajo(idPedido: number) {
    await supabase.from('alquileres').update({ estado: 'TRABAJANDO', hora_inicio: new Date().toISOString() }).eq('id', idPedido);
    fetchData();
  }
  async function finalizarTrabajo(idPedido: number) {
    await supabase.from('alquileres').update({ estado: 'FINALIZADO', hora_fin: new Date().toISOString() }).eq('id', idPedido);
    fetchData();
  }
  async function cambiarEstado(idPedido: number, nuevoEstado: string) {
    await supabase.from('alquileres').update({ estado: nuevoEstado }).eq('id', idPedido);
    fetchData();
  }
  async function toggleDisponibilidad(id: number, actual: boolean) {
    await supabase.from('maquinas').update({ disponible: !actual }).eq('id', id);
    fetchData();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-blue-500">Portal de Contratista 🚜</h1>
          <p className="text-zinc-400">Gestión de flota, fichaje y evaluación financiera de proyectos.</p>
        </header>

        {!account ? (
          <div className="p-10 border border-zinc-800 rounded-2xl text-center bg-zinc-900">Conectá tu billetera para operar.</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* GESTIÓN DE FLOTA Y FINANZAS */}
            <section>
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">➕ Alta de Activo Fijo</h2>
                <form onSubmit={agregarNuevaMaquina} className="space-y-4">
                  <input required type="text" value={nuevoNombre} onChange={(e)=>setNuevoNombre(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 text-sm" placeholder="Nombre (Ej: John Deere)" />
                  <div className="flex gap-4">
                    <select value={nuevoTipo} onChange={(e)=>setNuevoTipo(e.target.value)} className="w-1/3 bg-black border border-zinc-700 rounded p-2 text-sm"><option value="Tractor">Tractor</option><option value="Cosechadora">Cosechadora</option></select>
                    <input required type="number" value={nuevaInversion} onChange={(e)=>setNuevaInversion(e.target.value)} className="w-1/3 bg-black border border-zinc-700 rounded p-2 text-sm" placeholder="Costo (USDC)" title="Inversión Inicial" />
                    <input required type="number" value={nuevoPrecio} onChange={(e)=>setNuevoPrecio(e.target.value)} className="w-1/3 bg-black border border-zinc-700 rounded p-2 text-sm" placeholder="Tarifa (USDC/h)" />
                  </div>
                  <input type="text" value={nuevaImagen} onChange={(e)=>setNuevaImagen(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 text-sm" placeholder="URL Foto" />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded">Cargar Máquina</button>
                </form>
              </div>

              <h2 className="text-xl font-bold mb-4">⚙️ Análisis de Rentabilidad de Flota</h2>
              <div className="space-y-6">
                {misMaquinas.map((m) => {
                  const horasMes = horasProyectadas[m.id] || 0;
                  const { van, recupero, flujoAnual } = calcularMetricas(m.inversion_inicial, m.precio_hora, horasMes);

                  return (
                    <div key={m.id} className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                        <div className="flex gap-4 items-center">
                          <img src={m.imagen_url} className="w-16 h-16 object-cover rounded-lg bg-zinc-800" />
                          <div>
                            <h3 className="font-bold text-lg">{m.nombre}</h3>
                            <p className="text-sm text-zinc-400 mt-1">
                              CAPEX: <span className="text-white">${m.inversion_inicial?.toLocaleString() || 0} USDC</span> | 
                              Tarifa: <span className="text-green-400 font-mono"> ${m.precio_hora} USDC/h</span>
                            </p>
                          </div>
                        </div>
                        <button onClick={() => toggleDisponibilidad(m.id, m.disponible)} className={`text-xs px-3 py-1.5 rounded border ${m.disponible ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-red-500 text-red-500 bg-red-900/20'}`}>
                          {m.disponible ? "🟢 En Servicio" : "🔴 Fuera de Servicio"}
                        </button>
                      </div>

                      <div className="bg-black/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-sm text-zinc-400">Proyección de alquiler mensual (Horas):</label>
                          <input type="number" className="w-24 bg-black border border-zinc-600 rounded px-2 py-1 text-sm text-center" placeholder="Ej: 150" value={horasProyectadas[m.id] || ''} onChange={(e) => setHorasProyectadas({...horasProyectadas, [m.id]: parseFloat(e.target.value)})} />
                        </div>
                        
                        {horasMes > 0 && m.inversion_inicial > 0 && (
                          <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-zinc-800/50">
                            <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Caja Anual (CF)</p><p className="font-mono text-green-400">${flujoAnual.toLocaleString()} USDC</p></div>
                            <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Recupero de Inversión</p><p className="font-mono text-blue-400">{recupero.toFixed(1)} años</p></div>
                            <div className="col-span-2 mt-2"><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Valor Actual Neto (5 años @ 10%)</p><p className={`font-mono text-lg ${van >= 0 ? 'text-green-500' : 'text-red-500'}`}>${van.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC {van >= 0 ? ' ✅ Viable' : ' ❌ Destruye Valor'}</p></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* LOGÍSTICA Y CONTROL OPERATIVO */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">⏱️ Control Operativo</h2>
              <div className="space-y-4">
                {misPedidos.map((pedido) => (
                  <div key={pedido.id} className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${pedido.estado === 'PENDIENTE' ? 'bg-yellow-500' : pedido.estado === 'EN CAMINO' ? 'bg-blue-500' : pedido.estado === 'TRABAJANDO' ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`}></div>
                    
                    <div className="pl-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-zinc-500">ORDEN #{pedido.id}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-white/5">{pedido.estado}</span>
                      </div>
                      <h4 className="font-bold text-lg">{pedido.nombre_maquina}</h4>
                      
                      {pedido.estado === 'TRABAJANDO' && pedido.hora_inicio && (
                         <p className="text-sm text-purple-400 mt-2">⏳ Iniciado: {new Date(pedido.hora_inicio).toLocaleTimeString()}</p>
                      )}

                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-800">
                        {pedido.estado === 'PENDIENTE' && <button onClick={() => cambiarEstado(pedido.id, 'EN CAMINO')} className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold text-sm">🚛 Iniciar Viaje al Lote</button>}
                        {pedido.estado === 'EN CAMINO' && <button onClick={() => iniciarTrabajo(pedido.id)} className="bg-purple-600 hover:bg-purple-500 text-white py-2 rounded font-bold text-sm">▶️ Llegué: Iniciar Reloj de Trabajo</button>}
                        {pedido.estado === 'TRABAJANDO' && <button onClick={() => finalizarTrabajo(pedido.id)} className="bg-red-600 hover:bg-red-500 text-white py-2 rounded font-bold text-sm">⏹️ Cortar Trabajo y Fichar Salida</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}