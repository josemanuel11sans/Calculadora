document.addEventListener("DOMContentLoaded", () => {
  // Configuración de PDF.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

  // Elementos de navegación
  const paso1 = document.getElementById("paso-1")
  const paso2 = document.getElementById("paso-2")
  const paso3 = document.getElementById("paso-3")
  const siguiente1 = document.getElementById("siguiente-1")
  const siguiente2 = document.getElementById("siguiente-2")
  const anterior2 = document.getElementById("anterior-2")
  const anterior3 = document.getElementById("anterior-3")
  const calcular = document.getElementById("calcular")
  const recalcular = document.getElementById("recalcular")
  const contacto = document.getElementById("contacto")

  // Elementos de formulario
  const estado = document.getElementById("estado")
  const tipoTarifaRadios = document.getElementsByName("tipo-tarifa")
  const tarifaEspecifica = document.getElementById("tarifa-especifica")
  const tarifaComercialEspecifica = document.getElementById("tarifa-comercial-especifica")
  const tarifaDomesticaContainer = document.querySelector(".tarifa-domestica-container")
  const tarifaComercialContainer = document.querySelector(".tarifa-comercial-container")
  const opcionMonto = document.getElementById("opcion-monto")
  const opcionKwh = document.getElementById("opcion-kwh")
  const montoRecibo = document.getElementById("monto-recibo")
  const consumoKwh = document.getElementById("consumo-kwh")

  // Elementos para el lector de recibos
  const opcionManual = document.getElementById("opcion-manual")
  const opcionRecibo = document.getElementById("opcion-recibo")
  const entradaManual = document.getElementById("entrada-manual")
  const entradaRecibo = document.getElementById("entrada-recibo")
  const fileInput = document.getElementById("fileInput")
  const fileName = document.getElementById("file-name")
  const reciboResultados = document.getElementById("recibo-resultados")
  const output = document.getElementById("output")
  const tablaContainer = document.getElementById("tablaContainer")

  // Elementos de resultados
  const resultadosContainer = document.getElementById("resultados-container")
  const ahorroPrimerAnio = document.getElementById("ahorro-primer-anio")
  const ahorroVidaUtil = document.getElementById("ahorro-vida-util")
  const retornoInversion = document.getElementById("retorno-inversion")
  const capacidadSistema = document.getElementById("capacidad-sistema")
  const numeroPaneles = document.getElementById("numero-paneles")
  const inversionAproximada = document.getElementById("inversion-aproximada")
  const reduccionCO2 = document.getElementById("reduccion-co2")

  // Variables para almacenar datos del recibo
  let datosCFE = {
    tarifa: "",
    consumoMensual: 0,
    consumoBimestral: 0,
    tipoTarifa: "domestica",
  }

  // Datos para cálculos
  const tarifasCFE = {
    // Tarifas domésticas (valores aproximados en pesos mexicanos por kWh)
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

  // Radiación solar por estado (kWh/m²/día)
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
    morelos: 5.7,
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
  const costoInstalacionPorKw = 5000 // 3100 MXN por kW

  // Potencia de un panel solar estándar (kW)
  const potenciaPanelEstandar = 0.4 // 400W = 0.4kW

  // Tasa de degradación anual de paneles solares (porcentaje)
  const tasaDegradacionAnual = 0.05 // 0.5% por año

  // Aumento anual del precio de electricidad (porcentaje)
  const aumentoAnualPrecioElectricidad = 0.07 // 6% por año

  // Factor de emisión de CO2 por kWh en México (kg CO2/kWh)
  const factorEmisionCO2 = 0.438 // Fuente: SEMARNAT

  // Navegación entre pasos
  siguiente1.addEventListener("click", () => {
    if (validarPaso1()) {
      paso1.classList.remove("activo")
      paso2.classList.add("activo")
    }
  })

  siguiente2.addEventListener("click", () => {
    if (validarPaso2()) {
      paso2.classList.remove("activo")
      paso3.classList.add("activo")

      // Si se cargó un recibo, prellenar los datos de consumo
      if (datosCFE.consumoBimestral > 0) {
        opcionKwh.classList.add("activa")
        opcionMonto.classList.remove("activa")
        consumoKwh.value = datosCFE.consumoBimestral
      }
    }
  })

  anterior2.addEventListener("click", () => {
    paso2.classList.remove("activo")
    paso1.classList.add("activo")
  })

  anterior3.addEventListener("click", () => {
    paso3.classList.remove("activo")
    paso2.classList.add("activo")
  })

  // Cambio de tipo de tarifa
  tipoTarifaRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const tipoTarifa = document.querySelector('input[name="tipo-tarifa"]:checked').value

      if (tipoTarifa === "domestica") {
        tarifaDomesticaContainer.style.display = "block"
        tarifaComercialContainer.style.display = "none"
      } else if (tipoTarifa === "comercial") {
        tarifaDomesticaContainer.style.display = "none"
        tarifaComercialContainer.style.display = "block"
      } else {
        tarifaDomesticaContainer.style.display = "none"
        tarifaComercialContainer.style.display = "none"
      }
    })
  })

  // Cambio entre opciones de consumo
  opcionMonto.querySelector(".tab-header").addEventListener("click", () => {
    opcionMonto.classList.add("activa")
    opcionKwh.classList.remove("activa")
  })

  opcionKwh.querySelector(".tab-header").addEventListener("click", () => {
    opcionKwh.classList.add("activa")
    opcionMonto.classList.remove("activa")
  })

  // Cambio entre opciones de entrada de datos
  opcionManual.querySelector(".tab-header").addEventListener("click", () => {
    opcionManual.classList.add("activa")
    opcionRecibo.classList.remove("activa")
    entradaManual.style.display = "block"
    entradaRecibo.style.display = "none"
  })

  opcionRecibo.querySelector(".tab-header").addEventListener("click", () => {
    opcionRecibo.classList.add("activa")
    opcionManual.classList.remove("activa")
    entradaManual.style.display = "none"
    entradaRecibo.style.display = "block"
  })

  // Mostrar nombre del archivo seleccionado
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      fileName.textContent = e.target.files[0].name
      procesarReciboCFE(e)
    } else {
      fileName.textContent = "Ningún archivo seleccionado"
    }
  })

  // Procesar recibo CFE
  async function procesarReciboCFE(e) {
    const file = e.target.files[0]
    if (!file) return

    reciboResultados.style.display = "none"
    output.textContent = "Procesando recibo..."

    const fileReader = new FileReader()
    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result)
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise

        let textoTotal = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const textoPagina = textContent.items.map((item) => item.str).join("\n")
          textoTotal += textoPagina + "\n"
        }

        // TARIFA
        const tarifaRegex = /TARIFA:\s*(\w+)/i
        const matchTarifa = textoTotal.match(tarifaRegex)
        const tarifa = matchTarifa ? matchTarifa[1] : "No encontrada"

        // DATOS DE TABLAS
        const registros = []

        // 🟩 Formato habitacional
        const regex1 = /del\s+(\d{2} \w{3} \d{2})\s+al\s+(\d{2} \w{3} \d{2})\s+(\d+)\s+\$([\d,]+\.\d{2})/g
        let match
        while ((match = regex1.exec(textoTotal)) !== null) {
          registros.push({
            desde: match[1],
            hasta: match[2],
            dias: Number.parseInt(match[3]),
            monto: Number.parseFloat(match[4].replace(",", "")),
            tipo: "habitacional",
          })
        }

        // 🟨 Formato empresarial
        const regex2 = /^([A-Z]{3})\s+(\d{2})\s+(\d+)\s+([\d,]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/gm
        while ((match = regex2.exec(textoTotal)) !== null) {
          registros.push({
            mes: match[1],
            anio: "20" + match[2],
            dias: Number.parseInt(match[3]),
            consumo: Number.parseInt(match[4].replace(",", "")),
            factor: Number.parseFloat(match[5]),
            demanda: Number.parseFloat(match[6]),
            precio: Number.parseFloat(match[7]),
            tipo: "empresarial",
          })
        }

        if (registros.length === 0) {
          output.textContent = "❌ No se detectaron registros de consumo."
          return
        }

        // 👉 Primeros 6 registros = 12 meses (bimestres)
        const primeros6 = registros.slice(0, 6)

        let consumoAnual = 0
        let consumoBimestral = 0
        let consumoMensual = 0
        let unidad = ""
        let tipoTarifa = ""

        if (primeros6[0].tipo === "habitacional") {
          consumoAnual = primeros6.reduce((acc, r) => acc + r.dias, 0)
          consumoBimestral = (consumoAnual / 6).toFixed(2)
          consumoMensual = (consumoAnual / 12).toFixed(2)
          unidad = "KWh"
          tipoTarifa = "domestica"
        } else {
          consumoAnual = registros.reduce((acc, r) => acc + r.consumo, 0)
          consumoMensual = (consumoAnual / registros.length).toFixed(2)
          console.log("consumo mensual", consumoMensual);
          
          consumoBimestral = consumoMensual * 2
          // consumoBimestral = (consumoAnual / 6).toFixed(2)
          unidad = "kWh"
          tipoTarifa = "comercial"  
        }

        // Guardar datos para cálculos posteriores
        datosCFE = {
          tarifa: tarifa,
          consumoMensual: Number.parseFloat(consumoMensual),
          consumoBimestral: consumoBimestral,
          tipoTarifa: tipoTarifa,
        }

        // Actualizar interfaz con la tarifa detectada
        if (tipoTarifa === "domestica") {
          document.getElementById("tarifa-domestica").checked = true

          // Intentar seleccionar la tarifa específica
          if (tarifa && tarifaEspecifica.querySelector(`option[value="${tarifa}"]`)) {
            tarifaEspecifica.value = tarifa
          }

          tarifaDomesticaContainer.style.display = "block"
          tarifaComercialContainer.style.display = "none"
        } else if (tipoTarifa === "comercial") {
          document.getElementById("tarifa-comercial").checked = true
          tarifaDomesticaContainer.style.display = "none"
          tarifaComercialContainer.style.display = "block"
        }

        // MOSTRAR RESUMEN
        
          if(registros[0].tipo === "habitacional") {
           output.textContent =
          `⚡ Tarifa: ${tarifa}\n📊 Registros detectados: ${registros.length}\n` +
          `📆 Consumo de últimos 12 meses (6 registros):\n` +
          `   Consumo de anual: ${consumoAnual} ${unidad}\n` +
          `   Promedio mensual: ${consumoMensual} ${unidad}`

          }else if(registros[0].tipo === "empresarial") {
            output.textContent =
          `⚡ Tarifa: ${tarifa}\n📊 Registros detectados: ${registros.length}\n` +
          `📆 Consumo de últimos 12 meses (6 registros):\n` +
          `   Consumo de: ${registros.length} meses ${consumoAnual} ${unidad}\n` +
          `   Promedio mensual: ${consumoMensual} ${unidad}`

          }

        // TABLA HTML
        tablaContainer.innerHTML = ""
        const tabla = document.createElement("table")
        let headers = ""
        let body = ""

        if (registros[0].tipo === "habitacional") {
          headers = "<tr><th>Desde</th><th>Hasta</th><th>KWh</th><th>Importe ($)</th></tr>"
          body = registros
            .map(
              (r, i) => `
            <tr class="${i < 6 ? "resaltado" : ""}">
              <td>${r.desde}</td><td>${r.hasta}</td><td>${r.dias}</td><td>${r.monto.toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")
        } else {
          headers =
            "<tr><th>Mes</th><th>Año</th><th>Demanda kW</th><th>Consumo total kWh</th><th>Factor potencia %</th><th>Factor de carga %</th><th>Precio medio (MXN)</th></tr>"
          body = registros
            .map(
              (r, i) => `
            <tr class="${i < registros.length ? "resaltado" : ""}">
              <td>${r.mes}</td><td>${r.anio}</td><td>${r.dias}</td><td>${r.consumo}</td>
              <td>${r.factor}</td><td>${r.demanda}</td><td>${r.precio}</td>
            </tr>
          `,
            )
            .join("")
        }

        tabla.innerHTML = `<thead>${headers}</thead><tbody>${body}</tbody>`
        tablaContainer.appendChild(tabla)

        reciboResultados.style.display = "block"
      } catch (error) {
        console.error("Error al procesar el PDF:", error)
        output.textContent = "❌ Error al procesar el archivo. Asegúrate de que sea un recibo de CFE válido."
      }
    }

    fileReader.readAsArrayBuffer(file)
  }

  // Calcular resultados
  calcular.addEventListener("click", () => {
    if (validarPaso3()) {
      const datosCalculadora = obtenerDatosFormulario()
      const resultados = calcularAhorros(datosCalculadora)
      mostrarResultados(resultados)

      // Ocultar pasos y mostrar resultados
      paso3.classList.remove("activo")
      resultadosContainer.classList.remove("oculto")
      setTimeout(() => {
        resultadosContainer.classList.add("visible")
      }, 100)

      // Desplazarse a los resultados
      resultadosContainer.scrollIntoView({ behavior: "smooth" })
    }
  })

  // Recalcular
  recalcular.addEventListener("click", () => {
    resultadosContainer.classList.remove("visible")
    setTimeout(() => {
      resultadosContainer.classList.add("oculto")
      paso1.classList.add("activo")
    }, 300)
  })

  // Contacto (simulado)
  // contacto.addEventListener("click", () => {
  //   alert(
  //     "¡Gracias por tu interés! Un asesor se pondrá en contacto contigo pronto para brindarte una cotización personalizada.",
  //   )
  // })
contacto.addEventListener("click", () => {
  // Obtener los resultados actuales
  const estadoSel = estado.options[estado.selectedIndex]?.text || estado.value
  const capacidad = capacidadSistema.textContent
  const paneles = numeroPaneles.textContent
  const inversion = inversionAproximada.textContent
  const ahorro1 = ahorroPrimerAnio.textContent
  const ahorro25 = ahorroVidaUtil.textContent
  const retorno = retornoInversion.textContent
  const co2 = reduccionCO2.textContent
  const fecha = new Date().toLocaleDateString('es-MX')

  // Crear PDF con jsPDF
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Definir colores
  const colorPrimario = [22, 160, 133] // Verde azulado
  const colorSecundario = [243, 156, 18] // Naranja
  const colorTexto = [44, 62, 80] // Azul oscuro
  const colorFondo = [247, 247, 247] // Gris muy claro
  const colorTextoGrafico = [62, 156, 75] // verde

  // Márgenes y dimensiones
  const margenIzq = 15
  const margenDer = 195
  const anchoUtil = margenDer - margenIzq

  // Fondo de página completa con margen superior
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, 210, 297, 'F')

  // Encabezado
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.rect(0, 0, 210, 30, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text("Cotización de Paneles Solares", 105, 15, { align: 'center' })
  doc.setFontSize(10)
  doc.text(`Fecha: ${fecha}`, margenDer, 25, { align: 'right' })

  // Sección de información del cliente - Lado izquierdo
  let yPos = 40
  
  // Título de sección
  doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
  doc.roundedRect(margenIzq, yPos, anchoUtil / 2 - 5, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.text("INFORMACIÓN DEL SISTEMA", margenIzq + (anchoUtil / 4) - 5, yPos + 5.5, { align: 'center' })
  
  // Contenido de información del sistema
  doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
  doc.roundedRect(margenIzq, yPos + 10, anchoUtil / 2 - 5, 50, 2, 2, 'F')
  
  // Datos del sistema
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.setFontSize(10)
  const infoStartY = yPos + 20
  const lineHeight = 8
  
  // Etiquetas - columna izquierda
  doc.setFont('helvetica', 'bold')
  doc.text("Ubicación:", margenIzq + 5, infoStartY)
  doc.text("Capacidad del Sistema:", margenIzq + 5, infoStartY + lineHeight)
  doc.text("Número de Paneles:", margenIzq + 5, infoStartY + lineHeight * 2)
  doc.text("Inversión Aproximada:", margenIzq + 5, infoStartY + lineHeight * 3)
  
  // Valores - alineados
  doc.setFont('helvetica', 'normal')
  const colValores = margenIzq + 50
  doc.text(estadoSel, colValores, infoStartY)
  doc.text(capacidad, colValores, infoStartY + lineHeight)
  doc.text(paneles, colValores, infoStartY + lineHeight * 2)
  doc.text(inversion, colValores, infoStartY + lineHeight * 3)

  // Sección de beneficios - Lado derecho
  // Título de sección
  doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
  doc.roundedRect(margenIzq + (anchoUtil / 2) + 5, yPos, anchoUtil / 2 - 5, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.text("BENEFICIOS", margenIzq + (anchoUtil * 3/4) + 5, yPos + 5.5, { align: 'center' })
  
  // Contenido de beneficios
  doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
  doc.roundedRect(margenIzq + (anchoUtil / 2) + 5, yPos + 10, anchoUtil / 2 - 5, 50, 2, 2, 'F')
  
  // Datos de beneficios
  const benefStartY = infoStartY
  const colBenef = margenIzq + (anchoUtil / 2) + 10
  
  // Etiquetas - columna derecha
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.text("Ahorro Primer Año:", colBenef, benefStartY)
  doc.text("Ahorro Total (25 años):", colBenef, benefStartY + lineHeight)
  doc.text("Retorno de Inversión:", colBenef, benefStartY + lineHeight * 2)
  doc.text("Reducción de CO2:", colBenef, benefStartY + lineHeight * 3)
  
  // Valores - alineados
  doc.setFont('helvetica', 'normal')
  const colValoresBenef = colBenef + 50
  doc.text(ahorro1, colValoresBenef, benefStartY)
  doc.text(ahorro25, colValoresBenef, benefStartY + lineHeight)
  doc.text(retorno, colValoresBenef, benefStartY + lineHeight * 2)
  doc.text(co2, colValoresBenef, benefStartY + lineHeight * 3)

  // Sección de visualización - Gráfico simulado
  yPos = 105
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2], 0.1)
  doc.roundedRect(margenIzq, yPos, anchoUtil, 70, 3, 3, 'F')
  
  // Título de la sección
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.roundedRect(margenIzq, yPos, anchoUtil, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.text("VISUALIZACIÓN DE AHORRO", 105, yPos + 5.5, { align: 'center' })
  
  // Gráfico simulado
  // Eje X
  doc.setDrawColor(colorTextoGrafico[0], colorTextoGrafico[1], colorTextoGrafico[2])
  doc.setLineWidth(0.3)
  doc.line(margenIzq + 20, yPos + 60, margenDer - 20, yPos + 60)
  
  // Eje Y
  doc.line(margenIzq + 20, yPos + 15, margenIzq + 20, yPos + 60)
  
  // Barras de gráfico
  const numBarras = 5
  const anchoBarra = (anchoUtil - 60) / numBarras
  
  for (let i = 0; i < numBarras; i++) {
    const altura = 10 + (i * 7)
    const xBarra = margenIzq + 30 + (i * anchoBarra)
    
    doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
    doc.rect(xBarra, yPos + 60 - altura, anchoBarra - 10, altura, 'F')
    
    // Etiquetas de años
    doc.setTextColor(colorTextoGrafico[0], colorTextoGrafico[1], colorTextoGrafico[2])
    doc.setFontSize(8)
    doc.text(`Año ${(i+1)*5}`, xBarra + (anchoBarra - 10)/2, yPos + 65, { align: 'center' })
  }
  
  // Leyenda del gráfico
  doc.setFontSize(9)
  doc.text("Ahorro acumulado (MXN)", margenIzq + 25, yPos + 20)
  
  // Sección de información adicional
  yPos = 180
  doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2])
  doc.roundedRect(margenIzq, yPos, anchoUtil, 50, 3, 3, 'F')
  
  // Título de la sección
  doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
  doc.roundedRect(margenIzq, yPos, anchoUtil, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.text("INFORMACIÓN ADICIONAL", 105, yPos + 5.5, { align: 'center' })
  
  // Contenido de información adicional
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  const infoAdicionalY = yPos + 20
  doc.text("• Los paneles solares tienen una garantía de 25 años y una vida útil de más de 30 años.", margenIzq + 5, infoAdicionalY)
  doc.text("• La instalación incluye todos los materiales necesarios y mano de obra calificada.", margenIzq + 5, infoAdicionalY + lineHeight)
  doc.text("• Genera tu propia electricidad y olvídate de los cortes de luz.", margenIzq + 5, infoAdicionalY + lineHeight * 2)
  doc.text("• El mantenimiento recomendado es una limpieza cada 6 meses.", margenIzq + 5, infoAdicionalY + lineHeight * 3)
  
  // Pie de página
  const footerY = 260
  
  // Línea separadora
  doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.setLineWidth(0.5)
  doc.line(margenIzq, footerY, margenDer, footerY)
  
  // Contenido del pie de página
  doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text("¡Gracias por considerar la energía solar para su hogar!", 105, footerY + 10, { align: 'center' })
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text("Esta cotización es aproximada y puede variar según condiciones específicas.", 105, footerY + 15, { align: 'center' })
  doc.text("Contáctenos: ventas@hexasolar.com.mx | Tel: (+52) 5590481290 | www.hexasolar.com", 105, footerY + 20, { align: 'center' })
  
  // Simulación de código QR
  try {
 // Crear una imagen y cargarla desde la ruta local
  const logoImg = new Image();
  logoImg.src = './img/logo-transparente-60.png'; // Ajusta esta ruta a la ubicación real de tu logo en el proyecto
  logoImg.onload = function() {
    // Crear un canvas para convertir la imagen a base64
    const canvas = document.createElement('canvas');
    canvas.width = logoImg.width;
    canvas.height = logoImg.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(logoImg, 0, 0);
    
    // Obtener la imagen como base64
    const logoBase64 = canvas.toDataURL('image/png');
    
    // Añadir la imagen al PDF
    doc.addImage(logoBase64, 'PNG', margenIzq, footerY + 5, 15, 15);
    
    // Guardar el PDF después de que la imagen se haya cargado
    doc.save("cotizacion-hexasolar.pdf");
  };

 // Manejar errores de carga de imagen
  logoImg.onerror = function() {
    console.error('Error al cargar el logo desde la ruta local');
    // Fallback: dibujar un círculo simple
    doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
    doc.circle(margenIzq + 7.5, footerY + 12.5, 7.5, 'F');
    doc.save("cotizacion-hexasolar.pdf");
  };
  
  // Importante: No llamar a doc.save() aquí, ya que se llamará en los callbacks
  return; // Salir de la función para evitar que se ejecute el doc.save() al final
  
  // doc.addImage(logoUrl, 'PNG', margenIzq, footerY + 5, 15, 15);
} catch (error) {
  console.error('Error al cargar la imagen:', error);
  // Fallback en caso de error: dibujar un círculo simple
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.circle(margenIzq + 7.5, footerY + 12.5, 7.5, 'F');
}
  // Guardar el PDF
  doc.save("cotizacion-paneles-solares.pdf")
})

  // Funciones de validación
  function validarPaso1() {
    if (!estado.value) {
      alert("Por favor, selecciona tu estado")
      return false
    }
    return true
  }

  function validarPaso2() {
    // Si está usando la opción de cargar recibo
    if (opcionRecibo.classList.contains("activa")) {
      if (!datosCFE.tarifa) {
        alert("Por favor, carga un recibo de CFE válido o selecciona la opción manual")
        return false
      }
      return true
    }

    // Si está usando la opción manual
    const tipoTarifa = document.querySelector('input[name="tipo-tarifa"]:checked').value

    if (tipoTarifa === "domestica" && !tarifaEspecifica.value) {
      alert("Por favor, selecciona tu tarifa específica")
      return false
    }

    if (tipoTarifa === "comercial" && !tarifaComercialEspecifica.value) {
      alert("Por favor, selecciona tu tarifa comercial")
      return false
    }

    return true
  }

  function validarPaso3() {
    // Si los datos ya vienen del recibo, no es necesario validar
    if (datosCFE.consumoBimestral > 0) {
      return true
    }

    const esOpcionMonto = opcionMonto.classList.contains("activa")

    if (esOpcionMonto && (!montoRecibo.value || montoRecibo.value < 100)) {
      alert("Por favor, ingresa un monto válido de tu recibo (mínimo $100)")
      return false
    }

    if (!esOpcionMonto && (!consumoKwh.value || consumoKwh.value < 50)) {
      alert("Por favor, ingresa un consumo válido en kWh (mínimo 50 kWh)")
      return false
    }

    return true
  }

  // Obtener datos del formulario
  function obtenerDatosFormulario() {
    const estadoSeleccionado = estado.value
    let tarifaSeleccionada
    let consumoBimestral

    // Si los datos vienen del recibo cargado
    if (datosCFE.consumoBimestral > 0 && opcionRecibo.classList.contains("activa")) {
      tarifaSeleccionada = datosCFE.tarifa
      consumoBimestral = datosCFE.consumoBimestral
    } else {
      // Datos ingresados manualmente
      const tipoTarifa = document.querySelector('input[name="tipo-tarifa"]:checked').value

      if (tipoTarifa === "domestica") {
        tarifaSeleccionada = tarifaEspecifica.value
      } else if (tipoTarifa === "comercial") {
        tarifaSeleccionada = tarifaComercialEspecifica.value
      } else {
        tarifaSeleccionada = "DAC"
      }

      const esOpcionMonto = opcionMonto.classList.contains("activa")

      if (esOpcionMonto) {
        const montoBimestral = Number.parseFloat(montoRecibo.value)
        // Estimar consumo en kWh basado en el monto
        consumoBimestral = estimarConsumoDesdeFactura(montoBimestral, tarifaSeleccionada)
      } else {
        consumoBimestral = Number.parseFloat(consumoKwh.value)
      }
    }

    return {
      estado: estadoSeleccionado,
      tarifa: tarifaSeleccionada,
      consumoBimestral: consumoBimestral,
    }
  }

  // Estimar consumo en kWh basado en el monto de la factura
  function estimarConsumoDesdeFactura(montoBimestral, tarifa) {
    // Simplificación: asumimos un precio promedio por kWh según la tarifa
    let precioPorKwh

    if (["1", "1A", "1B", "1C", "1D", "1E", "1F"].includes(tarifa)) {
      // Para tarifas domésticas, usamos un promedio ponderado
      precioPorKwh =
        tarifasCFE[tarifa].basico * 0.2 + tarifasCFE[tarifa].intermedio * 0.3 + tarifasCFE[tarifa].excedente * 0.5
    } else {
      // Para tarifas comerciales o DAC
      precioPorKwh = tarifasCFE[tarifa]
    }

    // Descontar aproximadamente 20% por cargos fijos, IVA, etc.
    const montoSinCargos = montoBimestral * 0.8

    // Estimar consumo
    return montoSinCargos / precioPorKwh
  }

  // Calcular ahorros y retorno de inversión
  function calcularAhorros(datos) {
    // Consumo anual en kWh (convertir de bimestral a anual)
    const consumoAnual = datos.consumoBimestral * 6

    // Calcular costo anual de electricidad sin paneles solares
    let costoAnualElectricidad = 0

    // Para tarifas domésticas, calcular por bloques de consumo
    if (["1", "1A", "1B", "1C", "1D", "1E", "1F"].includes(datos.tarifa)) {
      // Simplificación: asumimos que el 20% del consumo es básico, 30% intermedio y 50% excedente
      const consumoBasico = consumoAnual * 0.2
      const consumoIntermedio = consumoAnual * 0.3
      const consumoExcedente = consumoAnual * 0.5

      costoAnualElectricidad =
        consumoBasico * tarifasCFE[datos.tarifa].basico +
        consumoIntermedio * tarifasCFE[datos.tarifa].intermedio +
        consumoExcedente * tarifasCFE[datos.tarifa].excedente
    } else {
      // Para tarifas comerciales o DAC, usar tarifa plana
      costoAnualElectricidad = consumoAnual * tarifasCFE[datos.tarifa]
    }

    // Obtener la radiación solar para el estado seleccionado
    const radiacionSolar = radiacionSolarPorEstado[datos.estado]

    // Estimar tamaño del sistema solar requerido (en kW)
    // Fórmula: Consumo anual / (radiación solar * 365 días * factor de eficiencia)
    const factorEficiencia = 0.75 // Eficiencia del sistema (inversor, pérdidas, etc.)
    console.log("consimo anual", consumoAnual)
    console.log("radiacion solar", radiacionSolar)
    console.log("factor eficiencia", factorEficiencia)
    //consultar formula
    // const tamanioSistemaRequerido = consumoAnual / (radiacionSolar * 365 * factorEficiencia) 
    const tamanioSistemaRequerido = (((consumoAnual/365)/radiacionSolar)*1000)
    // Calcular número de paneles
    // const numeroPanelesRequeridos = Math.ceil(tamanioSistemaRequerido / potenciaPanelEstandar)
   const numeroPanelesRequeridos = Math.ceil(tamanioSistemaRequerido / 400)
    // Calcular costo de instalación del sistema solar
    // const costoInstalacion = tamanioSistemaRequerido * costoInstalacionPorKw
    const costoInstalacion = numeroPanelesRequeridos * costoInstalacionPorKw
    console.log("Costo de instalación:", costoInstalacion)
    console.log("Tamaño del sistema requerido:", tamanioSistemaRequerido)
    console.log("Número de paneles requeridos:", numeroPanelesRequeridos)
    console.log("Radiación solar:", radiacionSolar)
    console.log("Consumo anual:", consumoAnual)
    console.log("Costo anual de electricidad:", costoAnualElectricidad)
    console.log("Ahorro del primer año:", costoAnualElectricidad * 0.9)
    console.log("Ahorro durante la vida útil:", costoAnualElectricidad * 0.9 * 30)
    console.log("Reducción de CO2:", (consumoAnual * 0.9 * factorEmisionCO2) / 1000 * 30)
    console.log("Retorno de inversión (años):", costoInstalacion / (costoAnualElectricidad * 0.9))

    // Calcular ahorro del primer año (asumiendo que el 90% de la electricidad es reemplazada por solar)
    const ratioCoberturaSolar = 0.9
    const ahorroPrimerAnio = costoAnualElectricidad * ratioCoberturaSolar

    // Calcular ahorro durante la vida útil (25 años)
    let ahorroVidaUtil = 0
    let ahorroAnioActual = ahorroPrimerAnio

    for (let anio = 0; anio < 25; anio++) {
      ahorroVidaUtil += ahorroAnioActual

      // Ajustar por degradación del panel y aumento del precio de electricidad
      const eficienciaPanel = Math.pow(1 - tasaDegradacionAnual, anio + 1)
      const precioElectricidad = Math.pow(1 + aumentoAnualPrecioElectricidad, anio + 1)

      ahorroAnioActual = ahorroPrimerAnio * eficienciaPanel * precioElectricidad
    }

    // Calcular retorno de inversión (ROI) en años
    // Fórmula: costo neto / ahorro total anual
    const retornoInversionAnios = costoInstalacion / ahorroPrimerAnio

    // Calcular reducción de CO2 en toneladas (durante 25 años)
    const reduccionCO2Anual = (consumoAnual * ratioCoberturaSolar * factorEmisionCO2) / 1000 // Convertir kg a toneladas
    const reduccionCO2Total = reduccionCO2Anual * 25 // Durante 25 años

    return {
      ahorroPrimerAnio: ahorroPrimerAnio,
      ahorroVidaUtil: ahorroVidaUtil,
      retornoInversionAnios: retornoInversionAnios,
      tamanioSistema: tamanioSistemaRequerido,
      numeroPaneles: numeroPanelesRequeridos,
      costoInstalacion: costoInstalacion,
      reduccionCO2: reduccionCO2Total,
    }
  }

  // Mostrar resultados en la interfaz
  function mostrarResultados(resultados) {
    ahorroPrimerAnio.textContent = formatearMoneda(resultados.ahorroPrimerAnio)
    ahorroVidaUtil.textContent = formatearMoneda(resultados.ahorroVidaUtil)
    retornoInversion.textContent = resultados.retornoInversionAnios.toFixed(1) + " años"
    capacidadSistema.textContent = resultados.tamanioSistema.toFixed(2) + " W"
    numeroPaneles.textContent = resultados.numeroPaneles + " paneles"
    inversionAproximada.textContent = formatearMoneda(resultados.costoInstalacion)
    reduccionCO2.textContent = resultados.reduccionCO2.toFixed(1) + " toneladas"
  }

  // Formatear moneda
  function formatearMoneda(cantidad) {
    return "$" + cantidad.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + " MXN"
  }
})
