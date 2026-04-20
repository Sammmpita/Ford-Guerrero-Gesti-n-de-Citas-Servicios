let citaIdActual = null;

function abrirModalCancelar(citaId) {
    citaIdActual = citaId;
    new bootstrap.Modal(document.getElementById('modalAdvertenciaCancelar')).show();
}

function confirmarCancelacion() {
    bootstrap.Modal.getInstance(document.getElementById('modalAdvertenciaCancelar')).hide();
    document.getElementById('formCancelacion').action = '/seguimiento/cancelar/' + citaIdActual + '/';
    setTimeout(() => {
        new bootstrap.Modal(document.getElementById('modalMotivoCancelacion')).show();
    }, 300);
}

function abrirModalComentario(citaId) {
    document.getElementById('formComentario').action = '/seguimiento/comentar/' + citaId + '/';
    new bootstrap.Modal(document.getElementById('modalComentario')).show();
}
