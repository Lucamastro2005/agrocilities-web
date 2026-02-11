import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-green-500/30">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-zinc-950 to-zinc-950 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm mb-8 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Plataforma Bimonetaria Activa en la Web3
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            El fin del riesgo de cobro en <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-green-400 via-blue-500 to-green-400 bg-clip-text text-transparent bg-300% animate-gradient">
              la maquinaria agrícola.
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            AgroCilities es el primer marketplace descentralizado para el agro. Conectamos productores y contratistas mediante Contratos Inteligentes (Escrow) y pagos dolarizados en USDC.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/market" className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-green-900/20">
              Explorar Maquinaria
            </Link>
            <Link href="/contractor" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl font-bold text-lg transition-all">
              Ofrecer mis Equipos
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-zinc-900/50 border-y border-zinc-800/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Fideicomiso Inteligente</h3>
              <p className="text-zinc-400 leading-relaxed">
                Los fondos se bloquean en la blockchain antes de que el tractor arranque. El contratista tiene asegurado su pago y el productor solo libera el capital cuando la labor finaliza.
              </p>
            </div>

            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative overflow-hidden group hover:border-green-500/30 transition-colors">
              <div className="text-5xl mb-6">💵</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Tarifas Dolarizadas</h3>
              <p className="text-zinc-400 leading-relaxed">
                Olvidate de la volatilidad cambiaria. Operamos exclusivamente con Dólares Digitales (USDC), permitiendo liquidaciones estables y transparentes al instante.
              </p>
            </div>

            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="text-5xl mb-6">⏱️</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Auditoría en Tiempo Real</h3>
              <p className="text-zinc-400 leading-relaxed">
                Relojes fichadores satelitales auditan las horas de trabajo. Si hay excedente de uso, la plataforma calcula y exige el pago de la diferencia automáticamente.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16">¿Cómo funciona la red?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Línea conectora invisible en mobile, visible en desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10 transform -translate-y-1/2"></div>
            
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/50 shadow-2xl">
              <div className="w-16 h-16 bg-blue-900/20 border border-blue-500/50 text-blue-400 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">1</div>
              <h4 className="text-xl font-bold mb-2">Reserva y Escrow</h4>
              <p className="text-zinc-500 text-sm">El productor elige el equipo y deposita los USDC en la bóveda inmutable del Smart Contract.</p>
            </div>
            
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/50 shadow-2xl">
              <div className="w-16 h-16 bg-purple-900/20 border border-purple-500/50 text-purple-400 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">2</div>
              <h4 className="text-xl font-bold mb-2">Ejecución y Logística</h4>
              <p className="text-zinc-500 text-sm">El contratista recibe las coordenadas GPS, viaja al lote y la plataforma audita el tiempo de labor exacto.</p>
            </div>
            
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/50 shadow-2xl">
              <div className="w-16 h-16 bg-green-900/20 border border-green-500/50 text-green-400 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">3</div>
              <h4 className="text-xl font-bold mb-2">Liquidación</h4>
              <p className="text-zinc-500 text-sm">Al finalizar, si no hay multas por tiempo extra, el contrato libera automáticamente los fondos a la billetera del dueño.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-12 text-center bg-black">
        <p className="text-zinc-600 font-bold flex items-center justify-center gap-2">
          <span className="text-xl">🌾</span> AgroCilities Protocol © {new Date().getFullYear()}
        </p>
        <p className="text-zinc-700 text-sm mt-2">Tecnología Financiera Descentralizada para el Sector Agropecuario.</p>
      </footer>
    </main>
  );
}