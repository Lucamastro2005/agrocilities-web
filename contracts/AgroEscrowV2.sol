// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AgroEscrowV2 {
    IERC20 public usdcToken;
    address public treasuryWallet; // La billetera de AgroCilities
    uint256 public feePorcentaje = 3; // 3% de comisión (Take Rate)
    uint256 public contadorTrabajos = 0;

    struct Trabajo {
        address cliente;
        address contratista;
        uint256 monto;
        bool finalizado;
    }

    mapping(uint256 => Trabajo) public trabajos;

    constructor(address _usdcAddress) {
        usdcToken = IERC20(_usdcAddress);
        treasuryWallet = msg.sender; // Vos sos el dueño de la plataforma
    }

    function crearTrabajo(address _contratista, uint256 _monto) public {
        // 1. Traemos los USDC del Productor a la bóveda
        require(usdcToken.transferFrom(msg.sender, address(this), _monto), "Fallo transferencia USDC");
        
        contadorTrabajos++;
        trabajos[contadorTrabajos] = Trabajo(msg.sender, _contratista, _monto, false);
    }

    function finalizarTrabajo(uint256 _idTrabajo) public {
        Trabajo storage t = trabajos[_idTrabajo];
        require(!t.finalizado, "El trabajo ya fue pagado");
        
        t.finalizado = true;

        // 2. EL MODELO DE NEGOCIOS EN ACCIÓN 💸
        uint256 comisionPlataforma = (t.monto * feePorcentaje) / 100;
        uint256 pagoContratista = t.monto - comisionPlataforma;

        // 3. Repartimos la plata automáticamente (sin intermediarios humanos)
        require(usdcToken.transfer(treasuryWallet, comisionPlataforma), "Fallo el pago de comision");
        require(usdcToken.transfer(t.contratista, pagoContratista), "Fallo el pago al contratista");
    }
}