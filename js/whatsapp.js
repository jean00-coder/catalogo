/*=========================================================
PROYECTO: ATLAS
ARCHIVO: whatsapp.js
VERSIÓN: 1.0.0

FUNCIÓN:
Abrir WhatsApp para consultas generales y generar el mensaje
del pedido con productos, variantes, cantidades, total, foto y enlace al producto.
=========================================================*/

(() => {
    'use strict';

    const obtenerConfiguracion = () => window.ATLASConfig?.whatsapp || {};

    const limpiarNumero = (numero) => String(numero ?? '').replace(/\D/g, '');

    const numeroEsValido = (numero) => /^\d{10,15}$/.test(numero);

    const normalizarTexto = (valor) => String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const escaparExpresionRegular = (valor) => String(valor)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const modeloIncluyeMarcaCompleta = (marca, modelo) => {
        const marcaNormalizada = normalizarTexto(marca);
        const modeloNormalizado = normalizarTexto(modelo);

        if (!marcaNormalizada || !modeloNormalizado) {
            return false;
        }

        const palabrasMarca = marcaNormalizada
            .split(' ')
            .filter(Boolean)
            .map(escaparExpresionRegular)
            .join('\\s+');

        const patronMarcaCompleta = new RegExp(
            `(^|\\s)${palabrasMarca}(?=\\s|$)`,
            'i'
        );

        return patronMarcaCompleta.test(modeloNormalizado);
    };

    const crearNombreProducto = (item) => {
        const marca = String(item?.marca ?? '').trim();
        const modelo = String(item?.modelo ?? '').trim();

        if (!marca) {
            return modelo || 'Producto ATLAS';
        }

        if (!modelo) {
            return marca;
        }

        return modeloIncluyeMarcaCompleta(marca, modelo)
            ? modelo
            : `${marca} ${modelo}`;
    };

    const formatearPrecio = (precio, moneda = 'COP') => {
        const valor = Number(precio);

        if (!Number.isFinite(valor)) {
            return 'Precio por confirmar';
        }

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: String(moneda || 'COP'),
            maximumFractionDigits: 0
        }).format(valor);
    };


    const crearURLAbsoluta = (ruta) => {
        const valor = String(ruta ?? '').trim();

        if (!valor) {
            return '';
        }

        try {
            return new URL(valor, window.location.href).href;
        } catch (error) {
            console.warn('ATLAS: no fue posible crear la URL de la imagen.', error);
            return '';
        }
    };

    const crearEnlaceProducto = (codigo) => {
        try {
            const url = new URL(window.location.href);
            url.search = '';
            url.hash = '';
            url.searchParams.set('producto', String(codigo ?? '').trim());
            return url.href;
        } catch (error) {
            console.warn('ATLAS: no fue posible crear el enlace del producto.', error);
            return '';
        }
    };

    const crearEnlace = (mensaje) => {
        const configuracion = obtenerConfiguracion();
        const numero = limpiarNumero(configuracion.numero);

        if (!numeroEsValido(numero)) {
            console.error('ATLAS: el número de WhatsApp no es válido.');
            return null;
        }

        return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    };

    const abrirWhatsApp = (mensaje) => {
        const enlace = crearEnlace(mensaje);

        if (!enlace) {
            window.alert('No fue posible abrir WhatsApp. Revisa el número configurado.');
            return false;
        }

        window.open(enlace, '_blank', 'noopener,noreferrer');
        return true;
    };

    const crearMensajePedido = (items) => {
        const lineasProductos = items.flatMap((item, indice) => {
            const precioUnitario = formatearPrecio(item.precio, item.moneda);
            const subtotal = formatearPrecio(
                Number(item.precio) * Number(item.cantidad),
                item.moneda
            );

            const fotoReferencia = crearURLAbsoluta(item.imagen);
            const enlaceProducto = crearEnlaceProducto(item.codigo);

            const accesorio = String(item.familia || '').toLowerCase() === 'accesorios'
                || /^ATL-ACC-/i.test(String(item.codigo || ''));

            return [
                `${indice + 1}. ${crearNombreProducto(item)}`,
                `Código: ${item.codigo}`,
                `Color: ${item.color}`,
                ...(accesorio ? [`Categoría: ${item.subcategoria || 'Relojes'}`] : []),
                ...(accesorio && item.materialCorrea ? [`Material de correa: ${item.materialCorrea}`] : []),
                ...(accesorio && item.tipoCierre ? [`Tipo de cierre: ${item.tipoCierre}`] : []),
                ...(!accesorio && item.talla ? [`Talla: ${item.sistemaTallas} ${item.talla}`] : []),
                `Cantidad: ${item.cantidad}`,
                `Precio unitario: ${precioUnitario}`,
                `Subtotal: ${subtotal}`,
                ...(fotoReferencia ? [`Foto de referencia: ${fotoReferencia}`] : []),
                ...(enlaceProducto ? [`Ver producto en ATLAS: ${enlaceProducto}`] : []),
                ''
            ];
        });

        const total = items.reduce(
            (acumulado, item) => acumulado + (Number(item.precio) * Number(item.cantidad)),
            0
        );
        const moneda = items[0]?.moneda || 'COP';

        const incluyeCalzado = items.some((item) => !(String(item.familia || '').toLowerCase() === 'accesorios' || /^ATL-ACC-/i.test(String(item.codigo || ''))));

        return [
            'Hola, ATLAS. Quiero confirmar el siguiente pedido:',
            '',
            ...lineasProductos,
            `Total estimado: ${formatearPrecio(total, moneda)}`,
            '',
            incluyeCalzado
                ? 'Entiendo que los productos identificados como réplica se ofrecen como tales y que las tallas y la disponibilidad deben ser confirmadas.'
                : 'Entiendo que la disponibilidad debe ser confirmada antes de realizar el pago.'
        ].join('\n');
    };

    const finalizarPedido = () => {
        const items = window.ATLASCarrito?.obtenerItems?.() || [];

        if (items.length === 0) {
            window.alert('Tu carrito está vacío. Agrega un producto antes de continuar.');
            return;
        }

        abrirWhatsApp(crearMensajePedido(items));
    };

    const abrirConsultaGeneral = (evento) => {
        evento?.preventDefault?.();

        const configuracion = obtenerConfiguracion();
        const mensaje = String(
            configuracion.mensajeGeneral
            || 'Hola, ATLAS. Quiero recibir información sobre los productos disponibles.'
        );

        abrirWhatsApp(mensaje);
    };

    const iniciar = () => {
        const botonPedido = document.querySelector('#carrito-continuar');
        const botonCabecera = document.querySelector('.accion-whatsapp');
        const botonHero = document.querySelector('.hero-botones .btn-secundario');

        botonPedido?.addEventListener('click', finalizarPedido);
        botonCabecera?.addEventListener('click', abrirConsultaGeneral);
        botonHero?.addEventListener('click', abrirConsultaGeneral);
    };

    window.ATLASWhatsApp = Object.freeze({
        abrirConsultaGeneral,
        finalizarPedido,
        crearMensajePedido,
        crearEnlaceProducto,
        crearURLAbsoluta
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
