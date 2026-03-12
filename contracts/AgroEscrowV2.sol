// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interfaz para interactuar con el Dólar Digital (USDC)
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AgroEscrowV2 {
    IERC20 public usdcToken;
    address public treasuryWallet; // Billetera de AgroCilities (Dueño)
    uint256 public feePorcentaje = 3; // 3% de comisión
    uint256 public contadorTrabajos = 0;

    struct Trabajo {
        address cliente;      // El productor que paga
        address contratista;  // El dueño de la máquina
        uint256 monto;        // Total en USDC (Wei)
        bool finalizado;      // Si ya se pagó o no
    }

    mapping(uint256 => Trabajo) public trabajos;

    // 📢 EVENTOS CLAVE (Esto es lo que le faltaba a tu versión anterior)
    // Permiten que tu Frontend capture el ID exacto apenas se crea el trabajo.
    event TrabajoCreado(uint256 indexed idTrabajo, address indexed cliente, address indexed contratista, uint256 monto);
    event TrabajoFinalizado(uint256 indexed idTrabajo, uint256 montoPagado, uint256 feeCobrado);

    constructor(address _usdcAddress) {
        usdcToken = IERC20(_usdcAddress);
        treasuryWallet = msg.sender; 
    }

    // Función 1: Crear el Escrow (El cliente deposita)
    function crearTrabajo(address _contratista, uint256 _monto) public {
        require(_monto > 0, "El monto debe ser mayor a 0");
        require(_contratista != address(0), "Contratista invalido");

        // 1. Retenemos los fondos del cliente en el contrato
        require(usdcToken.transferFrom(msg.sender, address(this), _monto), "Fallo transferencia de USDC. Verifica el allowance.");
        
        // 2. Generamos el ID y guardamos datos
        contadorTrabajos++;
        trabajos[contadorTrabajos] = Trabajo(msg.sender, _contratista, _monto, false);

        // 3. 📢 GRITAMOS EL EVENTO PARA LA WEB
        emit TrabajoCreado(contadorTrabajos, msg.sender, _contratista, _monto);
    }

    // Función 2: Liberar Pago (Solo el cliente puede ejecutarla)
    function finalizarTrabajo(uint256 _idTrabajo) public {
        Trabajo storage t = trabajos[_idTrabajo];
        
        // Validaciones de Seguridad 🔒
        require(t.monto > 0, "El trabajo no existe");
        require(msg.sender == t.cliente, "Solo el cliente que contrato puede liberar el pago");
        require(!t.finalizado, "Este trabajo ya fue pagado");
        
        t.finalizado = true;

        // Distribución de Fondos 💸
        uint256 comisionPlataforma = (t.monto * feePorcentaje) / 100;
        uint256 pagoContratista = t.monto - comisionPlataforma;

        // Transferencias Atómicas
        require(usdcToken.transfer(treasuryWallet, comisionPlataforma), "Fallo comision");
        require(usdcToken.transfer(t.contratista, pagoContratista), "Fallo pago al contratista");

        emit TrabajoFinalizado(_idTrabajo, pagoContratista, comisionPlataforma);
    }
}