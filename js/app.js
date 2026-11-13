const IVA = 0.16;

const servicios = [
  {
    id: "seguridad",
    nombre: "Ciberseguridad y protección de datos",
    corto: "Ciberseguridad",
    icono: "⌑",
    imagen: "img/ciberseguridad.jpg",
    unidad: "por diagnóstico inicial",
    precio: 2900,
    descripcion: "Identifica riesgos y protege la información de tu negocio con una revisión clara y un plan de acción práctico.",
    incluye: ["Auditoría inicial de seguridad", "Revisión de red y accesos", "Recomendaciones de firewall y protección"]
  },
  {
    id: "nube",
    nombre: "Servicios en la nube",
    corto: "Servicios en la nube",
    icono: "☁",
    imagen: "img/serviciosnube.jpg",
    unidad: "por proyecto inicial",
    precio: 4900,
    descripcion: "Migra y organiza tus servicios en la nube con respaldos automatizados y una infraestructura lista para crecer.",
    incluye: ["Evaluación y plan de migración", "Configuración de almacenamiento y accesos", "Respaldo automático inicial"]
  },
  {
    id: "soporte",
    nombre: "Soporte técnico administrado",
    corto: "Soporte administrado",
    icono: "⌘",
    imagen: "img/soportetecnico.jpg",
    unidad: "mensual · plan base hasta 5 equipos",
    precio: 5900,
    descripcion: "Un equipo de TI externo para atender incidencias, mantener tus equipos al día y reducir interrupciones.",
    incluye: ["Mesa de ayuda en horario hábil", "Mantenimiento preventivo de hasta 5 equipos", "Actualizaciones y optimización de red"]
  },
  {
    id: "licencia-endpoint",
    nombre: "Licencia de protección para equipo",
    corto: "Licencia de protección",
    icono: "◈",
    imagen: "img/proteccionequipo.jpg",
    unidad: "por equipo · 1 año",
    precio: 890,
    descripcion: "Protección antivirus para una computadora, con instalación y revisión básica para empezar a usarla.",
    incluye: ["Licencia digital por 1 año", "Instalación en 1 equipo", "Configuración y revisión inicial"]
  },
  {
    id: "kit-respaldo",
    nombre: "Kit de respaldo local 1 TB",
    corto: "Kit de respaldo 1 TB",
    icono: "▣",
    imagen: "img/respaldolocal.jpg",
    unidad: "por kit · pago único",
    precio: 2490,
    descripcion: "Unidad SSD externa de 1 TB con configuración inicial para guardar una copia local de tus archivos importantes.",
    incluye: ["SSD externo de 1 TB", "Configuración de carpeta de respaldo", "Recomendación de rutina de copias"]
  }
];

const orden = {};
const $ = (id) => document.getElementById(id);
const moneda = (cantidad) => cantidad.toLocaleString("es-MX", {
  style: "currency",
  currency: "MXN"
});
const escaparHTML = (valor) => valor.replace(/[&<>"']/g, (caracter) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[caracter]));

function pintarCatalogo() {
  $("catalogo").innerHTML = servicios.map((servicio) => `
    <article class="service-card">
      <div class="service-image"><img src="${servicio.imagen}" alt="Imagen de ${servicio.nombre}" loading="lazy"></div>
      <div class="service-icon" aria-hidden="true">${servicio.icono}</div>
      <h3>${servicio.nombre}</h3>
      <p>${servicio.descripcion}</p>
      <ul>${servicio.incluye.map((elemento) => `<li>${elemento}</li>`).join("")}</ul>
      <div class="service-bottom">
        <div class="price">${moneda(servicio.precio)}<small>${servicio.unidad}</small></div>
        <button class="add-button" type="button" data-add="${servicio.id}">Solicitar servicio <span aria-hidden="true">→</span></button>
      </div>
    </article>
  `).join("");
}

function lineasOrden() {
  return servicios
    .filter((servicio) => orden[servicio.id])
    .map((servicio) => ({
      ...servicio,
      cantidad: orden[servicio.id],
      importe: servicio.precio * orden[servicio.id]
    }));
}

function calcularTotales() {
  const subtotal = lineasOrden().reduce((total, linea) => total + linea.importe, 0);
  const iva = subtotal * IVA;
  return { subtotal, iva, total: subtotal + iva };
}

function pintarOrden() {
  const lineas = lineasOrden();

  $("quoteItems").innerHTML = lineas.length
    ? lineas.map((linea) => `
        <div class="quote-line">
          <div>
            <strong>${linea.nombre}</strong>
            <small>${moneda(linea.precio)} ${linea.unidad}</small>
          </div>
          <div class="quantity-controls">
            <button type="button" data-menos="${linea.id}" aria-label="Quitar uno de ${linea.corto}">−</button>
            <strong>${linea.cantidad}</strong>
            <button type="button" data-mas="${linea.id}" aria-label="Agregar uno de ${linea.corto}">+</button>
          </div>
        </div>
      `).join("")
    : `<p class="empty-message">Todavía no agregas servicios. Puedes elegir uno desde las tarjetas de arriba.</p>`;

  $("orderLines").innerHTML = lineas.length
    ? lineas.map((linea) => `
        <div class="order-item">
          <span>${linea.corto} × ${linea.cantidad}</span>
          <span>${moneda(linea.importe)}</span>
        </div>
      `).join("")
    : `<p class="empty-order">Tu lista está vacía.</p>`;

  const totales = calcularTotales();
  $("subtotal").textContent = moneda(totales.subtotal);
  $("iva").textContent = moneda(totales.iva);
  $("total").textContent = moneda(totales.total);
  $("btnCot").disabled = lineas.length === 0;
  $("btnVaciar").disabled = lineas.length === 0;
}

document.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  if (boton.dataset.add) {
    const id = boton.dataset.add;
    orden[id] = (orden[id] || 0) + 1;
    const servicioAgregado = servicios.find((servicio) => servicio.id === id);
    $("serviceNoticeText").textContent = `${servicioAgregado.nombre} se agregó a tu cotización.`;
    $("serviceNotice").hidden = false;
  } else if (boton.dataset.mas) {
    orden[boton.dataset.mas] = (orden[boton.dataset.mas] || 0) + 1;
  } else if (boton.dataset.menos) {
    const id = boton.dataset.menos;
    orden[id] = (orden[id] || 0) - 1;
    if (orden[id] <= 0) delete orden[id];
  } else {
    return;
  }

  pintarOrden();
});

$("closeServiceNotice").addEventListener("click", () => {
  $("serviceNotice").hidden = true;
});

$("btnVaciar").addEventListener("click", () => {
  Object.keys(orden).forEach((id) => delete orden[id]);
  pintarOrden();
});

function generarCotizacion() {
  const requiereFactura = $("requiereFactura").checked;
  const billingIds = ["billingName", "billingRfc", "billingZip", "billingRegime", "billingUse"];
  if (requiereFactura) {
    const campos = billingIds.map((id) => $(id));
    const invalido = campos.find((campo) => !campo.value.trim() || !campo.checkValidity());
    if (invalido || !/^[A-Za-z&Ññ]{3,4}\d{6}[A-Za-z0-9]{3}$/.test($("billingRfc").value.trim())) {
      const campo = invalido || $("billingRfc");
      campo.setCustomValidity(campo.id === "billingRfc" && campo.value.trim() ? "Escribe un RFC válido de persona física o moral." : "Completa este dato fiscal para continuar.");
      campo.reportValidity();
      campo.addEventListener("input", () => campo.setCustomValidity(""), { once: true });
      return;
    }
  }
  const fecha = new Date();
  const fechaTexto = fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const folio = `COT-${String(Date.now()).slice(-6)}`;
  const totales = calcularTotales();

  const datosFiscales = requiereFactura ? `
    <div class="billing-document"><strong>Datos fiscales proporcionados</strong><br>
      ${escaparHTML($("billingName").value.trim())} · RFC ${escaparHTML($("billingRfc").value.trim().toUpperCase())}<br>
      C.P. ${escaparHTML($("billingZip").value.trim())} · ${escaparHTML($("billingRegime").value)} · Uso CFDI: ${escaparHTML($("billingUse").value)}
    </div>` : "";
  $("doc").innerHTML = `
    <div class="doc-meta"><span>Folio: ${folio}</span><span>Fecha: ${fechaTexto}</span></div>
    <p>Gracias por tu interés en los servicios de Solutek. Este es el resumen de tu cotización:</p>
    ${datosFiscales}
    <table>
      <thead><tr><th>Servicio / producto</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead>
      <tbody>
        ${lineasOrden().map((linea) => `
          <tr>
            <td>${linea.nombre}</td>
            <td>${linea.cantidad}</td>
            <td>${moneda(linea.precio)}</td>
            <td>${moneda(linea.importe)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr><td colspan="3">Subtotal</td><td>${moneda(totales.subtotal)}</td></tr>
        <tr><td colspan="3">IVA (16%)</td><td>${moneda(totales.iva)}</td></tr>
        <tr><td colspan="3">Total estimado</td><td>${moneda(totales.total)}</td></tr>
      </tfoot>
    </table>
    <p><small>Documento de cotización; no es un CFDI. Los precios son estimados y se confirmarán antes de contratar.</small></p>
  `;

  $("modalDoc").showModal();
}

$("btnCot").addEventListener("click", generarCotizacion);
$("requiereFactura").addEventListener("change", (evento) => {
  const mostrar = evento.target.checked;
  $("billingFields").hidden = !mostrar;
  ["billingName", "billingRfc", "billingZip", "billingRegime", "billingUse"].forEach((id) => {
    $(id).required = mostrar;
    $(id).setCustomValidity("");
  });
});
$("cerrarDoc").addEventListener("click", () => $("modalDoc").close());
$("cerrarDoc2").addEventListener("click", () => $("modalDoc").close());
$("imprimir").addEventListener("click", () => window.print());
$("continuarSolicitud").addEventListener("click", () => {
  const detalle = lineasOrden().map((linea) => `• ${linea.nombre} × ${linea.cantidad} — ${moneda(linea.importe)}`).join("\n");
  const totales = calcularTotales();
  const fiscales = $("requiereFactura").checked
    ? `\n\nDatos fiscales para facturación:\n${$("billingName").value.trim()} · RFC ${$("billingRfc").value.trim().toUpperCase()} · C.P. ${$("billingZip").value.trim()}\n${$("billingRegime").value} · Uso CFDI: ${$("billingUse").value}`
    : "";
  $("contactForm").elements.mensaje.value = `Hola, quiero solicitar información sobre estos servicios y productos:\n${detalle}\n\nTotal estimado con IVA: ${moneda(totales.total)}. Entiendo que el alcance y precio final deben confirmarse.${fiscales}`;
  $("modalDoc").close();
  $("contacto").scrollIntoView({ behavior: "smooth" });
  $("contactForm").elements.nombre.focus({ preventScroll: true });
});

$("contactForm").addEventListener("submit", (evento) => {
  evento.preventDefault();
  $("formMessage").textContent = "Este formulario es una demostración y todavía no envía la solicitud. Conecta un correo o backend para recibir mensajes.";
  evento.target.reset();
});

pintarCatalogo();
pintarOrden();
