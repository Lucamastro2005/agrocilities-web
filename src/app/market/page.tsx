const capturarUbicacion = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => { 
          // ÉXITO: Consiguió la ubicación real
          setLatitud(position.coords.latitude); 
          setLongitud(position.coords.longitude); 
          setIsLocating(false); 
        },
        (error) => { 
          // FALLÓ EL GPS REAL: Entra el Plan de Respaldo (Fallback)
          setIsLocating(false); 
          console.warn("GPS Real falló:", error.message);
          
          alert("⚠️ La señal satelital es débil o estás en una PC de escritorio. Inyectando coordenadas simuladas del lote para continuar la operación.");
          
          // Coordenadas de un campo de prueba (Ej: Zona Núcleo, Argentina)
          setLatitud(-33.9424); 
          setLongitud(-60.5588);
        },
        // Le sacamos el "High Accuracy" para que no se trabe en computadoras
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 } 
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };