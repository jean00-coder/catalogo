/*=========================================================
PROYECTO: ATLAS
ARCHIVO: config.js
VERSIÓN: 0.5.0

FUNCIÓN:
Centralizar los datos generales del catálogo y el número de
WhatsApp que recibirá las consultas y los pedidos.
=========================================================*/

(() => {
    'use strict';

    window.ATLASConfig = Object.freeze({
        tienda: Object.freeze({
            nombre: 'ATLAS'
        }),
        whatsapp: Object.freeze({
            numero: '573005130595',
            mensajeGeneral: 'Hola, ATLAS. Quiero recibir información sobre los productos disponibles.'
        })
    });
})();
