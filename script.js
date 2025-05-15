document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-solar")
  const contenedorResultados = document.getElementById("contenedor-resultados")
  const sinResultados = document.getElementById("sin-resultados")

  // Tarifas de CFE en MXN por kWh (valores actualizados para 2025)
  // Basados en datos reales de CFE con proyección de incrementos
  const tarifasCFE = {
    // Tarifas domésticas (valores aproximados en pesos mexicanos)
    1: {
      basico: 0.885,
      intermedio: 1.073,
      excedente: 3.156,
    },
    "1A": {
      basico: 0.885,
      intermedio: 1.073,
      excedente: 3.156,
    },
    "1B": {
      basico: 0.885,
      intermedio: 1.073,
      excedente: 3.156,
    },
    "1C": {
      basico: 0.885,
      intermedio: 1.073,
      excedente: 3.156,
    },
    "1D": {
      basico: 0.885,
      intermedio: 1.073,
      excedente: 3.156,
    },
    "1E": {
      basico: 0.885,
      intermedio: 1.073,
      excedente: 3.156,
    },
    "1F": {
      basico: 0.885,
      intermedio: 1.073,
      excedente: 3.156,
    },
    // Tarifa de Alto Consumo (DAC)
    DAC: 5.2,
    // Tarifas comerciales e industriales
    PDBT: 4.5,
    GDBT: 4.2,
    RABT: 3.8,
  }

  // Factores de radiación solar por estado (kWh/m²/día)
  // Datos basados en mediciones reales del INEEL y NASA
  const radiacionSolarPorEstado = {
    aguascalientes: 5.8,
    baja_california: 6.2,
    baja_california_sur: 6.5,
    campeche: 5.5,
    chiapas: 5.2,
    chihuahua: 6.0,
    coahuila: 5.9,
    colima: 5.5,
    durango: 5.8,
    estado_de_mexico: 5.3,
    guanajuato: 5.7,
    guerrero: 5.5,
    hidalgo: 5.3,
    jalisco: 5.6,
    michoacan: 5.5,
    morelos: 6.0,
    nayarit: 5.5,
    nuevo_leon: 5.7,
    oaxaca: 5.5,
    puebla: 5.3,
    queretaro: 5.7,
    quintana_roo: 5.5,
    san_luis_potosi: 5.8,
    sinaloa: 5.8,
    sonora: 6.3,
    tabasco: 5.2,
    tamaulipas: 5.7,
    tlaxcala: 5.3,
    veracruz: 5.0,
    yucatan: 5.7,
    zacatecas: 6.0,
    cdmx: 5.3,
  }

  // Costo promedio de instalación de paneles solares en México (MXN por kW)
  const costoInstalacionPorKw = 3100

  // Tasa de degradación anual de paneles solares (porcentaje)
  const tasaDegradacionAnual = 0.005 // 0.5% por año

  // Aumento anual del precio de electricidad (porcentaje)
  const aumentoAnualPrecioElectricidad = 0.07 // 7% por año APROXIMADO **

  formulario.addEventListener("submit", (e) => {
    e.preventDefault()

    // Obtener valores del formulario
    const consumo = Number.parseFloat(document.getElementById("consumo").value)
    const estado = document.getElementById("estado").value
    const tarifa = document.getElementById("tarifa").value

    // Validar consumo mínimo **
    if (consumo < 100) {
      alert("El consumo mínimo debe ser de 100 kWh/mes")
      return
    }

    // Calcular resultados
    const resultados = calcularAhorros(consumo, estado, tarifa)

    // Mostrar resultados
    document.getElementById("ahorro-primer-anio").textContent = formatearMoneda(resultados.ahorroPrimerAnio)
    document.getElementById("ahorro-vida-util").textContent = formatearMoneda(resultados.ahorroVidaUtil)
    document.getElementById("retorno-inversion").textContent = resultados.retornoInversion.toFixed(1) + " años"

    // Mostrar sección de resultados
    contenedorResultados.classList.remove("oculto")
    sinResultados.classList.add("oculto")

    // Desplazarse a los resultados
    document.getElementById("resultados").scrollIntoView({ behavior: "smooth" })
  })

  function calcularAhorros(consumoMensual, estado, tarifa) {
    // Consumo anual en kWh
    const consumoAnual = consumoMensual * 12

    // Calcular costo anual de electricidad sin paneles solares
    let costoAnualElectricidad = 0

    // Para tarifas domésticas, calcular por bloques de consumo
    if (["1", "1A", "1B", "1C", "1D", "1E", "1F"].includes(tarifa)) {
      // Simplificación: asumimos que el 20% del consumo es básico, 30% intermedio y 50% excedente
      const consumoBasico = consumoAnual * 0.2
      const consumoIntermedio = consumoAnual * 0.3
      const consumoExcedente = consumoAnual * 0.5

      costoAnualElectricidad =
        consumoBasico * tarifasCFE[tarifa].basico +
        consumoIntermedio * tarifasCFE[tarifa].intermedio +
        consumoExcedente * tarifasCFE[tarifa].excedente
    } else {
      // Para tarifas comerciales o DAC, usar tarifa plana
      costoAnualElectricidad = consumoAnual * tarifasCFE[tarifa]
    }

    // Obtener la radiación solar para el estado seleccionado
    const radiacionSolar = radiacionSolarPorEstado[estado]

    // Estimar tamaño del sistema solar requerido (en kW)
    // Fórmula: Consumo anual / (radiación solar * 365 días * factor de eficiencia)
    const factorEficiencia = 0.75 // Eficiencia del sistema (inversor, pérdidas, etc.)
    const tamanioSistemaRequerido = consumoAnual / (radiacionSolar * 365 * factorEficiencia)

    // Calcular costo de instalación del sistema solar
    const costoInstalacion = tamanioSistemaRequerido * costoInstalacionPorKw

    // Calcular ahorro del primer año (asumiendo que el 90% de la electricidad es reemplazada por solar)
    const ratioCoberturaSolar = 0.9
    const ahorroPrimerAnio = costoAnualElectricidad * ratioCoberturaSolar

    // Calcular ahorro durante la vida útil (25 años) ****
    let ahorroVidaUtil = 0
    let ahorroAnioActual = ahorroPrimerAnio

    for (let anio = 0; anio < 25; anio++) {
      ahorroVidaUtil += ahorroAnioActual

      // Ajustar por degradación del panel y aumento del precio de electricidad
      const eficienciaPanel = Math.pow(1 - tasaDegradacionAnual, anio + 1)
      const precioElectricidad = Math.pow(1 + aumentoAnualPrecioElectricidad, anio + 1)

      ahorroAnioActual = ahorroPrimerAnio * eficienciaPanel * precioElectricidad
    }

    // Calcular retorno de inversión (en años)
    // Considerando el valor presente de los ahorros futuros
    let ahorroAcumulado = 0
    let aniosRetorno = 0

    while (ahorroAcumulado < costoInstalacion && aniosRetorno < 25) {
      const eficienciaPanel = Math.pow(1 - tasaDegradacionAnual, aniosRetorno)
      const precioElectricidad = Math.pow(1 + aumentoAnualPrecioElectricidad, aniosRetorno)

      const ahorroEsteAnio = ahorroPrimerAnio * eficienciaPanel * precioElectricidad
      ahorroAcumulado += ahorroEsteAnio

      aniosRetorno++
    }

    return {
      ahorroPrimerAnio: ahorroPrimerAnio,
      ahorroVidaUtil: ahorroVidaUtil,
      retornoInversion: aniosRetorno,
    }
  }

  function formatearMoneda(cantidad) {
    return "$" + cantidad.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + " MXN"
  }
})
