🌾 AgroCilities Protocol
Marketplace Bimonetario & Auditoría Satelital para el Agro.
El primer ecosistema que elimina el riesgo de cobro mediante Smart Contracts y Dólares Digitales.
💡 El Problema
La cadena de pagos en el sector agropecuario sufre de fricción financiera (pagos diferidos, cheques rechazados), riesgo cambiario (volatilidad de la moneda local) y asimetría de información (disputas sobre las horas reales de uso de la maquinaria).
🚀 La Solución: AgroCilities
Una plataforma descentralizada (DApp) que actúa como Fideicomiso de Garantía (Escrow).
Seguridad: El productor deposita USDC (Dólares Digitales) en un Smart Contract antes de iniciar la labor.
Transparencia: Los fondos quedan bloqueados (inmutables) hasta que se cumple el servicio.
Auditoría: Telemetría GPS actúa como "reloj fichador". Si hay exceso de uso, el sistema bloquea la liberación de fondos hasta saldar la deuda.
🛠️ Stack Tecnológico
Frontend & Core
Framework: Next.js 14 (App Router).
Styling: Tailwind CSS (Diseño responsivo y Dark Mode).
Web3 Integration: Thirdweb SDK para conexión de wallets y llamadas a Smart Contracts.
Backend & Data
Base de Datos: Supabase (PostgreSQL) para gestión de flota, pedidos y usuarios.
Smart Contracts: Solidity (EVM Compatible). Desplegados en Ethereum Sepolia Testnet.
AgroEscrowV2.sol: Manejo de lógica de Escrow, comisiones (Take Rate 3%) y liberación de pagos.
Features Avanzados
Generación Legal: Librería jspdf para emitir contratos de locación firmados criptográficamente en tiempo real.
Geolocalización: API de Geolocalización del navegador con Fallback automático para simulación de lotes.
Análisis Financiero: Módulo de cálculo de VAN (Valor Actual Neto) y TIR para evaluación de proyectos de inversión en maquinaria.
📸 Capturas de Pantalla
Marketplace (Cliente)
Panel de Control (Productor)
Catálogo con precios en USDC y disponibilidad en tiempo real.
Seguimiento de estado (Escrow), GPS y liberación de pagos.


Portal Contratista
Auditoría Financiera
Gestión de flota, alta de equipos y reloj fichador.
Cálculo automático de multas por exceso de tiempo.

⚙️ Instalación y Despliegue Local
# 1. Clonar el repositorio
git clone [https://github.com/TU_USUARIO/agrocilities-web.git](https://github.com/TU_USUARIO/agrocilities-web.git)

# 2. Instalar dependencias
cd agrocilities-web
npm install

# 3. Configurar Variables de Entorno (.env.local)
# Crear un archivo .env.local con las siguientes claves:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_THIRDWEB_CLIENT_ID=...

# 4. Correr el servidor de desarrollo
npm run dev


📄 Smart Contracts
El protocolo utiliza el estándar ERC-20 para manejar pagos en Stablecoins.
Dirección del Contrato (Sepolia): 0xDa079A2707e52829D9Fd99Fc05ba690e4B50fF48
Moneda Base: USDC (Testnet).
💼 Modelo de Negocios
AgroCilities opera bajo un modelo de Take Rate del 3%.
El uso de la plataforma es gratuito.
La comisión se debita automáticamente (On-Chain) únicamente cuando una transacción se completa con éxito, eliminando costos administrativos de cobranza.
Desarrollado por Luca Mastromonaco - Economía & Contabilidad | Universidad Austral