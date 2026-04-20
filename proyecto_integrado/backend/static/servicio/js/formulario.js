const form = document.getElementById('formCita');
const alerta = document.getElementById('alertaPropia');
const textoAlerta = document.getElementById('textoAlerta');
const inputs = {
    cliente: document.getElementById('inputCliente'),
    modelo: document.getElementById('inputModelo'),
    placas: document.getElementById('inputPlacas'),
    tel: document.getElementById('inputTel'),
    fecha: document.getElementById('fechaCita'),
    servicio: document.getElementById('selectServicio'),
    hora: document.getElementById('selectHora')
};

function mostrarError(msj) {
    textoAlerta.innerText = msj;
    alerta.style.setProperty('display', 'flex', 'important');
    setTimeout(() => { alerta.style.setProperty('display', 'none', 'important'); }, 5000);
}

inputs.cliente.addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    const esValido = this.value.length >= 14 && this.value.trim().includes(' ');
    if (this.value.length > 0 && !esValido) this.classList.add('is-invalid-custom');
    else this.classList.remove('is-invalid-custom');
});

inputs.modelo.addEventListener('input', function() {
    if (this.value.length > 0 && !/[a-zA-Z]/.test(this.value)) this.classList.add('is-invalid-custom');
    else this.classList.remove('is-invalid-custom');
});

inputs.placas.addEventListener('input', function() {
    this.value = this.value.toUpperCase().replace(/\s/g, '');
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Z\d]{6,7}$/;
    if (this.value.length > 0 && !regex.test(this.value)) this.classList.add('is-invalid-custom');
    else this.classList.remove('is-invalid-custom');
});

inputs.tel.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
    if (this.value.length > 0 && this.value.length < 10) this.classList.add('is-invalid-custom');
    else this.classList.remove('is-invalid-custom');
});

const precios = {
    'Preventivo':  '$1,500 – $2,500 MXN',
    'Electrico':   '$800 – $3,000 MXN',
    'Frenos':      '$1,200 – $3,500 MXN',
    'Suspension':  '$1,500 – $4,000 MXN',
    'Otro':        'El asesor te contactará con el presupuesto'
};

function actualizarBahia() {
    const ahora = new Date();
    let fechaMin = ahora.toISOString().split('T')[0];
    if (ahora.getHours() >= 12) {
        const mañana = new Date(ahora);
        mañana.setDate(mañana.getDate() + 1);
        fechaMin = mañana.toISOString().split('T')[0];
    }
    inputs.fecha.setAttribute('min', fechaMin);
    inputs.fecha.disabled = false;
    inputs.fecha.value = "";

    const v = inputs.servicio.value;
    const info = document.getElementById('infoDias');
    if (v === 'Preventivo' || v === 'Electrico') info.innerHTML = '<span class="text-success">Recepción: Lunes a Sábado.</span>';
    else if (v === 'Frenos' || v === 'Suspension') info.innerHTML = '<span class="text-primary">Recepción: Lunes, Miércoles y Viernes.</span>';
    else if (v === 'Otro') info.innerHTML = '<span class="text-danger">Recepción: Lunes y Jueves.</span>';
    else { info.innerHTML = ''; inputs.fecha.disabled = true; inputs.fecha.value = ''; }

    // muestra el precio estimado segun el servicio
    const tarjeta = document.getElementById('precioEstimado');
    const textoPrecio = document.getElementById('textoPrecio');
    if (v && precios[v]) {
        textoPrecio.innerText = precios[v];
        tarjeta.style.display = 'block';
        // reinicia la animacion
        tarjeta.style.animation = 'none';
        tarjeta.offsetHeight;
        tarjeta.style.animation = 'fadeIn 0.3s ease';
    } else {
        tarjeta.style.display = 'none';
    }
}

inputs.fecha.addEventListener('input', function() {
    const d = new Date(this.value + 'T00:00:00').getUTCDay();
    const s = inputs.servicio.value;
    let ok = (s === 'Preventivo' || s === 'Electrico') ? (d >= 1 && d <= 6) :
             (s === 'Frenos' || s === 'Suspension') ? [1,3,5].includes(d) :
             (s === 'Otro') ? [1,4].includes(d) : false;

    if (!ok && this.value !== "") {
        this.value = "";
        this.classList.add('is-invalid-custom');
        mostrarError("Día no disponible para el servicio seleccionado.");
        setTimeout(() => this.classList.remove('is-invalid-custom'), 1500);
    }
});

form.addEventListener('submit', function(e) {
    const regexPlacas = /^(?=.*[A-Z])(?=.*\d)[A-Z\d]{6,7}$/;
    const hasLetters = /[a-zA-Z]/.test(inputs.modelo.value);
    let msj = "";

    if (inputs.cliente.value.length < 14 || !inputs.cliente.value.trim().includes(' ')) msj = "Ingresa Nombre y Apellido (min 14 letras).";
    else if (!hasLetters) msj = "El modelo debe incluir letras.";
    else if (!regexPlacas.test(inputs.placas.value)) msj = "Placas inválidas.";
    else if (inputs.tel.value.length < 10) msj = "Teléfono debe tener 10 dígitos.";
    else if (!inputs.fecha.value || !inputs.hora.value) msj = "Selecciona fecha y hora.";

    if (msj !== "") {
        e.preventDefault();
        mostrarError(msj);
    }
});
