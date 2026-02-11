// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interfaz mínima para interactuar con Dólares Digitales (USDC/USDT)
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AgrocilitiesEscrowUSDC {
    enum Estado { PENDIENTE, FINALIZADO, DISPUTA }
    
    struct Trabajo {
        uint256 id;
        address productor;
        address contratista;
        uint256 monto;
        Estado estado;
    }
    
    uint256 public contadorTrabajos;
    mapping(uint256 => Trabajo) public trabajos;
    
    // Esta variable guarda qué moneda acepta el contrato (ej: la dirección de USDC)
    IERC20 public monedaStable; 
    
    // Al desplegar el contrato, le definimos qué moneda vamos a usar
    constructor(address _direccionUSDC) {
        monedaStable = IERC20(_direccionUSDC);
    }
    
    // ------------------------------------------------------------------------
    // FUNCIÓN 1: EL CLIENTE PAGA EN USDC
    // ------------------------------------------------------------------------
    function crearTrabajo(address _contratista, uint256 _monto) public {
        require(_monto > 0, "El pago debe ser mayor a 0");
        
        contadorTrabajos++;
        
        trabajos[contadorTrabajos] = Trabajo({
            id: contadorTrabajos,
            productor: msg.sender,
            contratista: _contratista,
            monto: _monto,
            estado: Estado.PENDIENTE
        });
        
        // LA MAGIA: El contrato transfiere los USDC del cliente hacia la bóveda
        // (El cliente primero tiene que "Aprobar" este gasto desde la web)
        require(monedaStable.transferFrom(msg.sender, address(this), _monto), "Fallo la transferencia de USDC");
    }
    
    // ------------------------------------------------------------------------
    // FUNCIÓN 2: EL CLIENTE LIBERA LOS USDC AL CONTRATISTA
    // ------------------------------------------------------------------------
    function finalizarTrabajo(uint256 _idTrabajo) public {
        Trabajo storage trabajo = trabajos[_idTrabajo];
        
        require(trabajo.estado == Estado.PENDIENTE, "El trabajo ya no esta pendiente");
        require(msg.sender == trabajo.productor, "Solo el productor puede liberar el pago");
        
        trabajo.estado = Estado.FINALIZADO;
        
        // LA MAGIA: El contrato saca los USDC de la bóveda y se los manda al contratista
        require(monedaStable.transfer(trabajo.contratista, trabajo.monto), "Fallo al enviar USDC al contratista");
    }
}