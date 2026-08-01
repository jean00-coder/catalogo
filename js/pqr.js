/*=========================================================
PROYECTO: ATLAS
ARCHIVO: pqr.js
VERSIÓN: 0.8.0

FUNCIÓN:
Abrir el canal de solicitudes, generar un número de radicado
local y preparar el mensaje para enviarlo por WhatsApp.
El sitio no almacena los datos escritos en el formulario.
=========================================================*/

(() => {
    'use strict';

    const iniciarCanalPQR = () => {
        const modal = document.querySelector('#pqr-modal');
        const fondo = document.querySelector('#pqr-fondo');
        const formulario = document.querySelector('#pqr-formulario');
        const botonCerrar = document.querySelector('#pqr-cerrar');
        const botonCancelar = document.querySelector('#pqr-cancelar');
        const botonEnviar = document.querySelector('#pqr-enviar');
        const estado = document.querySelector('#pqr-estado');
        const enlaceManual = document.querySelector('#pqr-enlace-manual');

        if (!modal || !fondo || !formulario || !botonCerrar || !botonCancelar || !botonEnviar || !estado || !enlaceManual) {
            return;
        }

        const interfazTactil = window.matchMedia('(pointer: coarse)').matches;
        let botonOrigen = null;
        let enviando = false;

        const estaAbierto = () => modal.getAttribute('aria-hidden') === 'false';

        const normalizarEspacios = (valor) => String(valor || '').trim().replace(/\s+/g, ' ');

        const crearRadicado = (fecha = new Date()) => {
            const dosDigitos = (numero) => String(numero).padStart(2, '0');
            return [
                'ATL-PQR-',
                fecha.getFullYear(),
                dosDigitos(fecha.getMonth() + 1),
                dosDigitos(fecha.getDate()),
                '-',
                dosDigitos(fecha.getHours()),
                dosDigitos(fecha.getMinutes()),
                dosDigitos(fecha.getSeconds())
            ].join('');
        };

        const formatearFecha = (fecha) => new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(fecha);

        const obtenerNumeroWhatsApp = () => {
            const configurado = window.ATLASConfig?.whatsapp?.numero;
            return String(configurado || '573005130595').replace(/\D/g, '');
        };

        const limpiarEstado = () => {
            estado.textContent = '';
            estado.classList.remove('error', 'exito');
            enlaceManual.hidden = true;
            enlaceManual.removeAttribute('href');
        };

        const abrir = (boton) => {
            botonOrigen = boton || null;
            limpiarEstado();
            modal.classList.add('activo');
            fondo.classList.add('activo');
            modal.setAttribute('aria-hidden', 'false');
            fondo.setAttribute('aria-hidden', 'false');
            document.body.classList.add('pqr-abierto');

            if (!interfazTactil) {
                window.requestAnimationFrame(() => {
                    document.querySelector('#pqr-tipo')?.focus({ preventScroll: true });
                });
            }
        };

        const cerrar = () => {
            if (!estaAbierto() || enviando) {
                return;
            }

            modal.classList.remove('activo');
            fondo.classList.remove('activo');
            modal.setAttribute('aria-hidden', 'true');
            fondo.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('pqr-abierto');

            if (!interfazTactil) {
                botonOrigen?.focus({ preventScroll: true });
            }

            botonOrigen = null;
        };

        document.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-pqr-abrir]');
            if (!boton) {
                return;
            }

            evento.preventDefault();
            abrir(boton);
        });

        botonCerrar.addEventListener('click', cerrar);
        botonCancelar.addEventListener('click', cerrar);
        fondo.addEventListener('click', cerrar);

        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();

            if (enviando || !formulario.reportValidity()) {
                return;
            }

            const tipo = normalizarEspacios(document.querySelector('#pqr-tipo')?.value);
            const nombre = normalizarEspacios(document.querySelector('#pqr-nombre')?.value);
            const contacto = normalizarEspacios(document.querySelector('#pqr-contacto')?.value);
            const pedido = normalizarEspacios(document.querySelector('#pqr-pedido')?.value);
            const detalle = String(document.querySelector('#pqr-detalle')?.value || '').trim();

            if (!tipo || !nombre || !contacto || !detalle) {
                estado.textContent = 'Completa los campos obligatorios antes de continuar.';
                estado.classList.add('error');
                return;
            }

            enviando = true;
            botonEnviar.disabled = true;
            botonEnviar.setAttribute('aria-busy', 'true');
            limpiarEstado();

            const fecha = new Date();
            const radicado = crearRadicado(fecha);
            const lineas = [
                'Hola, ATLAS. Quiero radicar una solicitud.',
                '',
                `Radicado: ${radicado}`,
                `Tipo: ${tipo}`,
                `Fecha: ${formatearFecha(fecha)}`,
                `Nombre: ${nombre}`,
                `Contacto: ${contacto}`,
                pedido ? `Pedido o producto: ${pedido}` : null,
                '',
                'Detalle:',
                detalle,
                '',
                'Autorizo el uso de estos datos únicamente para atender y responder esta solicitud.'
            ].filter((linea) => linea !== null);

            const url = `https://wa.me/${obtenerNumeroWhatsApp()}?text=${encodeURIComponent(lineas.join('\n'))}`;
            enlaceManual.href = url;
            enlaceManual.hidden = false;
            estado.textContent = `Radicado ${radicado} generado. Conserva este código como referencia.`;
            estado.classList.add('exito');

            const ventana = window.open(url, '_blank', 'noopener,noreferrer');
            if (!ventana) {
                estado.textContent += ' Tu navegador bloqueó la apertura automática; usa el enlace inferior.';
            }

            window.setTimeout(() => {
                enviando = false;
                botonEnviar.disabled = false;
                botonEnviar.removeAttribute('aria-busy');
            }, 900);
        });

        document.addEventListener('keydown', (evento) => {
            if (!estaAbierto()) {
                return;
            }

            if (evento.key === 'Escape') {
                evento.preventDefault();
                cerrar();
                return;
            }

            if (evento.key === 'Tab') {
                const enfocables = Array.from(
                    modal.querySelectorAll(
                        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
                    )
                ).filter((elemento) => elemento.offsetParent !== null);

                if (enfocables.length === 0) {
                    evento.preventDefault();
                    return;
                }

                const primero = enfocables[0];
                const ultimo = enfocables[enfocables.length - 1];

                if (evento.shiftKey && document.activeElement === primero) {
                    evento.preventDefault();
                    ultimo.focus();
                } else if (!evento.shiftKey && document.activeElement === ultimo) {
                    evento.preventDefault();
                    primero.focus();
                }
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarCanalPQR);
    } else {
        iniciarCanalPQR();
    }
})();
