const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");
const tablaContainer = document.getElementById("tablaContainer");

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

    let textoTotal = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textoPagina = textContent.items.map(item => item.str).join('\n');
      textoTotal += textoPagina + '\n';
    }

    // TARIFA
    const tarifaRegex = /TARIFA:\s*(\w+)/i;
    const matchTarifa = textoTotal.match(tarifaRegex);
    const tarifa = matchTarifa ? matchTarifa[1] : "No encontrada";

    // DATOS DE TABLAS
    const registros = [];

    // 🟩 Formato habitacional
    const regex1 = /del\s+(\d{2} \w{3} \d{2})\s+al\s+(\d{2} \w{3} \d{2})\s+(\d+)\s+\$([\d,]+\.\d{2})/g;
    let match;
    while ((match = regex1.exec(textoTotal)) !== null) {
      registros.push({
        desde: match[1],
        hasta: match[2],
        dias: parseInt(match[3]),
        monto: parseFloat(match[4].replace(',', '')),
        tipo: 'habitacional'
      });
    }

    // 🟨 Formato empresarial
    const regex2 = /^([A-Z]{3})\s+(\d{2})\s+(\d+)\s+([\d,]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/gm;
    while ((match = regex2.exec(textoTotal)) !== null) {
      registros.push({
        mes: match[1],
        anio: '20' + match[2],
        dias: parseInt(match[3]),
        consumo: parseInt(match[4].replace(',', '')),
        factor: parseFloat(match[5]),
        demanda: parseFloat(match[6]),
        precio: parseFloat(match[7]),
        tipo: 'empresarial'
      });
    }

    if (registros.length === 0) {
      output.textContent = '❌ No se detectaron registros de consumo.';
      return;
    }

    // 👉 Primeros 6 registros = 12 meses (bimestres)
    const primeros6 = registros.slice(0, 6);

    let consumoAnual = 0;
    let consumoMensual = 0;
    let unidad = '';

    if (primeros6[0].tipo === 'habitacional') {
      consumoAnual = primeros6.reduce((acc, r) => acc + r.dias, 0);
      consumoMensual = (consumoAnual / 12).toFixed(2);
      unidad = 'KWh';
    } else {
      consumoAnual = primeros6.reduce((acc, r) => acc + r.consumo, 0);
      consumoMensual = (consumoAnual / 12).toFixed(2);
      unidad = 'kWh';
    }

    // MOSTRAR RESUMEN
    output.textContent =
      `⚡ Tarifa: ${tarifa}\n📊 Registros detectados: ${registros.length}\n` +
      `📆 Consumo de últimos 12 meses (6 registros):\n` +
      `   Consumo anual: ${consumoAnual} ${unidad}\n` +
      `   Promedio mensual: ${consumoMensual} ${unidad}`;

    // TABLA HTML
    tablaContainer.innerHTML = '';
    const tabla = document.createElement('table');
    let headers = '';
    let body = '';

    if (registros[0].tipo === 'habitacional') {
      headers = '<tr><th>Desde</th><th>Hasta</th><th>KWh</th><th>Importe ($)</th></tr>';
      body = registros.map((r, i) => `
        <tr class="${i < 6 ? 'resaltado' : ''}">
          <td>${r.desde}</td><td>${r.hasta}</td><td>${r.dias}</td><td>${r.monto.toFixed(2)}</td>
        </tr>
      `).join('');
    } else {
      headers = '<tr><th>Mes</th><th>Año</th><th>Demanda kW</th><th>Consumo total kWh</th><th>Factor potencia %</th><th>Factor de carga %</th><th>Precio medio (MXN)</th></tr>';
      body = registros.map((r, i) => `
        <tr class="${i < 6 ? 'resaltado' : ''}">
          <td>${r.mes}</td><td>${r.anio}</td><td>${r.dias}</td><td>${r.consumo}</td>
          <td>${r.factor}</td><td>${r.demanda}</td><td>${r.precio}</td>
        </tr>
      `).join('');
    }

    tabla.innerHTML = `<thead>${headers}</thead><tbody>${body}</tbody>`;
    tablaContainer.appendChild(tabla);
  };

  fileReader.readAsArrayBuffer(file);
});
