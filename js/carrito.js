/*=========================================================
PROYECTO: ATLAS

ARCHIVO: carrito.js

VERSIÓN: 0.8.0

FUNCIÓN:
Administrar el carrito lateral, cantidades, variantes, total y
persistencia local en el navegador.

=========================================================*/

(() => {
    'use strict';

    const CLAVE_ALMACENAMIENTO = 'atlas_carrito_v1';
    const CANTIDAD_MAXIMA = 10;

    let carrito = [];
    let elementos = null;
    let botonQueAbrioCarrito = null;
    let temporizadorAnuncio = null;
    const interfazTactil = window.matchMedia('(pointer: coarse)').matches;

    const escaparHTML = (valor) => String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const formatearPrecio = (precio, moneda = 'COP') => {
        const valor = Number(precio);

        if (!Number.isFinite(valor)) {
            return 'Precio por confirmar';
        }

        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: moneda,
            maximumFractionDigits: 0
        }).format(valor);
    };

    const obtenerFamilia = (producto) => {
        const familia = String(producto?.familia || '').trim();
        if (familia) return familia;
        return /^ATL-ACC-/i.test(String(producto?.codigo || '')) ? 'Accesorios' : 'Calzado';
    };

    const esAccesorio = (producto) => obtenerFamilia(producto).toLowerCase() === 'accesorios';

    const crearClaveItem = (productoId, talla = '') => `${productoId}::${String(talla || 'sin-talla')}`;

    const obtenerMaximoItem = (item) => {
        const stock = Number(item?.cantidadDisponible);
        if (esAccesorio(item) && Number.isInteger(stock) && stock >= 0) {
            return Math.min(CANTIDAD_MAXIMA, stock);
        }
        return CANTIDAD_MAXIMA;
    };

    const normalizarItem = (item) => {
        const cantidad = Number(item?.cantidad);
        const precio = Number(item?.precio);
        const productoId = String(item?.productoId ?? '').trim();
        const familia = obtenerFamilia(item);
        const accesorio = familia.toLowerCase() === 'accesorios';
        const talla = accesorio ? '' : String(item?.talla ?? '').trim();

        if (!productoId || (!accesorio && !talla) || !Number.isFinite(precio) || precio < 0) return null;

        const cantidadDisponible = accesorio && Number.isInteger(Number(item?.cantidadDisponible))
            ? Math.max(0, Number(item.cantidadDisponible))
            : null;
        const maximo = accesorio && cantidadDisponible !== null
            ? Math.min(CANTIDAD_MAXIMA, cantidadDisponible)
            : CANTIDAD_MAXIMA;
        if (accesorio && maximo <= 0) return null;

        return {
            clave: crearClaveItem(productoId, talla),
            productoId,
            codigo: String(item.codigo || 'Sin código'),
            familia,
            subcategoria: String(item.subcategoria || (accesorio ? 'Relojes' : 'Tenis')),
            marca: String(item.marca || 'ATLAS'),
            modelo: String(item.modelo || 'Producto sin nombre'),
            color: String(item.color || 'Color por confirmar'),
            materialCorrea: String(item.materialCorrea || ''),
            tipoCierre: String(item.tipoCierre || ''),
            cantidadDisponible,
            precio,
            moneda: String(item.moneda || 'COP'),
            talla,
            sistemaTallas: accesorio ? '' : String(item.sistemaTallas || 'EUR'),
            cantidad: Math.min(maximo, Math.max(1, Number.isInteger(cantidad) ? cantidad : 1)),
            imagen: String(item.imagen || '')
        };
    };

    const cargarCarrito = () => {
        try {
            const guardado = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
            const datos = guardado ? JSON.parse(guardado) : [];

            const itemsNormalizados = Array.isArray(datos)
                ? datos.map(normalizarItem).filter(Boolean)
                : [];

            const catalogoActual = typeof productos !== 'undefined' && Array.isArray(productos)
                ? productos
                : [];

            carrito = itemsNormalizados.map((item) => {
                const productoActual = catalogoActual.find((producto) => (
                    String(producto.id ?? '') === item.productoId
                    || String(producto.codigo ?? '') === item.codigo
                ));

                if (!productoActual) {
                    return item;
                }

                if (productoActual.activo !== true) {
                    return null;
                }

                const imagenActual = Array.isArray(productoActual.imagenes)
                    ? String(productoActual.imagenes.find((ruta) => typeof ruta === 'string' && ruta.trim()) || item.imagen)
                    : item.imagen;

                return {
                    ...item,
                    codigo: String(productoActual.codigo || item.codigo),
                    marca: String(productoActual.marca || item.marca),
                    modelo: String(productoActual.modelo || item.modelo),
                    familia: obtenerFamilia(productoActual),
                    subcategoria: String(productoActual.subcategoria || item.subcategoria || (esAccesorio(productoActual) ? 'Relojes' : 'Tenis')),
                    color: String(productoActual.color || item.color),
                    materialCorrea: String(productoActual.materialCorrea || item.materialCorrea || ''),
                    tipoCierre: String(productoActual.tipoCierre || item.tipoCierre || ''),
                    cantidadDisponible: esAccesorio(productoActual) && Number.isInteger(Number(productoActual.cantidadDisponible))
                        ? Math.max(0, Number(productoActual.cantidadDisponible))
                        : item.cantidadDisponible,
                    precio: Number.isFinite(Number(productoActual.precio))
                        ? Number(productoActual.precio)
                        : item.precio,
                    moneda: String(productoActual.moneda || item.moneda),
                    sistemaTallas: String(productoActual.sistemaTallas || item.sistemaTallas),
                    imagen: imagenActual
                };
            }).filter(Boolean).map(normalizarItem).filter(Boolean);
        } catch (error) {
            console.warn('ATLAS: no fue posible recuperar el carrito guardado.', error);
            carrito = [];
        }
    };

    const guardarCarrito = () => {
        try {
            window.localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(carrito));
            return true;
        } catch (error) {
            console.warn('ATLAS: no fue posible guardar el carrito.', error);
            return false;
        }
    };

    const obtenerCantidadTotal = () => carrito.reduce(
        (total, item) => total + item.cantidad,
        0
    );

    const obtenerTotal = () => carrito.reduce(
        (total, item) => total + (item.precio * item.cantidad),
        0
    );

    const mostrarAnuncio = (mensaje) => {
        if (!elementos?.anuncio) {
            return;
        }

        window.clearTimeout(temporizadorAnuncio);
        elementos.anuncio.textContent = mensaje;
        elementos.anuncio.classList.add('activo');

        temporizadorAnuncio = window.setTimeout(() => {
            elementos.anuncio.classList.remove('activo');
        }, 1500);
    };

    const actualizarContador = () => {
        const cantidad = obtenerCantidadTotal();

        if (elementos?.contador) {
            elementos.contador.textContent = String(cantidad);
            elementos.contador.classList.toggle('contador-vacio', cantidad === 0);
        }

        if (elementos?.botonAbrir) {
            elementos.botonAbrir.setAttribute(
                'aria-label',
                cantidad === 0
                    ? 'Abrir carrito vacío'
                    : `Abrir carrito con ${cantidad} ${cantidad === 1 ? 'artículo' : 'artículos'}`
            );
        }
    };

    const crearHTMLItem = (item) => {
        const subtotal = item.precio * item.cantidad;
        const imagen = escaparHTML(item.imagen);
        const modelo = escaparHTML(item.modelo);
        const marca = escaparHTML(item.marca);
        const codigo = escaparHTML(item.codigo);
        const color = escaparHTML(item.color);
        const clave = escaparHTML(item.clave);
        const accesorio = esAccesorio(item);
        const detalle = accesorio
            ? `${escaparHTML(item.subcategoria || 'Accesorio')}${item.materialCorrea ? ` · ${escaparHTML(item.materialCorrea)}` : ''}`
            : `Talla ${escaparHTML(item.sistemaTallas)} ${escaparHTML(item.talla)}`;
        const maximo = obtenerMaximoItem(item);
        const ariaEliminar = accesorio
            ? `Eliminar ${modelo}`
            : `Eliminar ${modelo}, talla ${escaparHTML(item.sistemaTallas)} ${escaparHTML(item.talla)}`;

        return `
            <li class="carrito-item" data-carrito-clave="${clave}">
                <div class="carrito-item-media">
                    ${imagen ? `<img src="${imagen}" alt="${modelo}" width="160" height="160" loading="lazy" decoding="async" fetchpriority="low">` : ''}
                    <i class="fa-regular fa-image" aria-hidden="true"></i>
                </div>
                <div class="carrito-item-info">
                    <div class="carrito-item-meta"><span>${marca}</span><small>${codigo}</small></div>
                    <h3>${modelo}</h3>
                    <p>${color}</p>
                    <strong class="carrito-item-talla">${detalle}</strong>
                    <span class="carrito-item-precio">${escaparHTML(formatearPrecio(item.precio, item.moneda))} c/u</span>
                    <div class="carrito-item-controles">
                        <div class="carrito-cantidad" aria-label="Cambiar cantidad de ${modelo}">
                            <button type="button" data-carrito-accion="disminuir" aria-label="Disminuir cantidad"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>
                            <span aria-live="polite">${item.cantidad}</span>
                            <button type="button" data-carrito-accion="aumentar" aria-label="Aumentar cantidad" ${item.cantidad >= maximo ? 'disabled' : ''}><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
                        </div>
                        <button class="carrito-item-eliminar" type="button" data-carrito-accion="eliminar" aria-label="${ariaEliminar}"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>
                    </div>
                </div>
                <strong class="carrito-item-subtotal">${escaparHTML(formatearPrecio(subtotal, item.moneda))}</strong>
            </li>
        `;
    };

    const prepararErroresImagen = () => {
        elementos?.lista?.querySelectorAll('.carrito-item-media img').forEach((imagen) => {
            imagen.addEventListener('error', () => {
                imagen.closest('.carrito-item-media')?.classList.add('imagen-error');
                imagen.remove();
            }, { once: true });
        });
    };

    const renderizar = () => {
        if (!elementos) {
            return;
        }

        const estaVacio = carrito.length === 0;

        elementos.vacio.hidden = !estaVacio;
        elementos.lista.hidden = estaVacio;
        elementos.pie.hidden = estaVacio;

        if (estaVacio) {
            elementos.lista.replaceChildren();
            elementos.total.textContent = formatearPrecio(0);
        } else {
            elementos.lista.innerHTML = carrito.map(crearHTMLItem).join('');
            elementos.total.textContent = formatearPrecio(obtenerTotal(), carrito[0]?.moneda || 'COP');
            prepararErroresImagen();
        }

        actualizarContador();
    };

    const carritoEstaAbierto = () => elementos?.panel?.getAttribute('aria-hidden') === 'false';

    const abrir = (botonOrigen = null) => {
        if (!elementos) {
            return;
        }

        botonQueAbrioCarrito = botonOrigen || document.activeElement;
        elementos.panel.classList.add('activo');
        elementos.fondo.classList.add('activo');
        elementos.panel.setAttribute('aria-hidden', 'false');
        elementos.fondo.setAttribute('aria-hidden', 'false');
        document.body.classList.add('carrito-abierto');

        if (!interfazTactil) {
            window.requestAnimationFrame(() => elementos.cerrar.focus({ preventScroll: true }));
        }
    };

    const cerrar = () => {
        if (!elementos || !carritoEstaAbierto()) {
            return;
        }

        elementos.panel.classList.remove('activo');
        elementos.fondo.classList.remove('activo');
        elementos.panel.setAttribute('aria-hidden', 'true');
        elementos.fondo.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('carrito-abierto');

        if (!interfazTactil && botonQueAbrioCarrito instanceof HTMLElement) {
            botonQueAbrioCarrito.focus({ preventScroll: true });
        }

        botonQueAbrioCarrito = null;
    };

    const agregarProducto = (producto, talla = '') => {
        if (!producto || producto.activo !== true) return { ok: false, mensaje: 'Este producto no está disponible.' };

        const accesorio = esAccesorio(producto);
        const tallaTexto = accesorio ? '' : String(talla ?? '').trim();
        const tallasValidas = Array.isArray(producto.tallas) ? producto.tallas.map(String) : [];
        if (!accesorio && (!tallaTexto || !tallasValidas.includes(tallaTexto))) {
            return { ok: false, mensaje: 'Selecciona una talla válida.' };
        }

        const cantidadDisponible = accesorio && Number.isInteger(Number(producto.cantidadDisponible))
            ? Math.max(0, Number(producto.cantidadDisponible))
            : null;
        if (accesorio && (String(producto.estado || '').toLowerCase() === 'agotado' || cantidadDisponible === 0)) {
            return { ok: false, mensaje: 'Este accesorio está agotado.' };
        }

        const precio = Number(producto.precio);
        if (!Number.isFinite(precio) || precio < 0) return { ok: false, mensaje: 'El precio de este producto no es válido.' };

        const productoId = String(producto.id ?? producto.codigo ?? '').trim();
        const clave = crearClaveItem(productoId, tallaTexto);
        const existente = carrito.find((item) => item.clave === clave);
        const maximo = accesorio && cantidadDisponible !== null ? Math.min(CANTIDAD_MAXIMA, cantidadDisponible) : CANTIDAD_MAXIMA;

        if (existente) {
            if (existente.cantidad >= maximo) {
                return { ok: false, mensaje: accesorio ? 'No hay más unidades registradas de este accesorio.' : `La cantidad máxima por talla es ${CANTIDAD_MAXIMA}.` };
            }
            existente.cantidad += 1;
        } else {
            const imagen = Array.isArray(producto.imagenes)
                ? String(producto.imagenes.find((ruta) => typeof ruta === 'string' && ruta.trim()) || '')
                : '';
            carrito.push({
                clave,
                productoId,
                codigo: String(producto.codigo || 'Sin código'),
                familia: obtenerFamilia(producto),
                subcategoria: String(producto.subcategoria || (accesorio ? 'Relojes' : 'Tenis')),
                marca: String(producto.marca || 'ATLAS'),
                modelo: String(producto.modelo || 'Producto sin nombre'),
                color: String(producto.color || 'Color por confirmar'),
                materialCorrea: String(producto.materialCorrea || ''),
                tipoCierre: String(producto.tipoCierre || ''),
                cantidadDisponible,
                precio,
                moneda: String(producto.moneda || 'COP'),
                talla: tallaTexto,
                sistemaTallas: accesorio ? '' : String(producto.sistemaTallas || 'EUR'),
                cantidad: 1,
                imagen
            });
        }

        const guardado = guardarCarrito();
        renderizar();
        mostrarAnuncio(accesorio
            ? `${producto.modelo || 'Accesorio'} agregado al carrito.`
            : `${producto.modelo || 'Producto'} — talla ${producto.sistemaTallas || 'EUR'} ${tallaTexto} agregado.`);
        return { ok: true, persistido: guardado };
    };

    const cambiarCantidad = (clave, cambio) => {
        const item = carrito.find((producto) => producto.clave === clave);

        if (!item) {
            return;
        }

        const nuevaCantidad = item.cantidad + cambio;

        if (nuevaCantidad <= 0) {
            carrito = carrito.filter((producto) => producto.clave !== clave);
        } else {
            item.cantidad = Math.min(obtenerMaximoItem(item), nuevaCantidad);
        }

        guardarCarrito();
        renderizar();
    };

    const eliminarItem = (clave) => {
        const item = carrito.find((producto) => producto.clave === clave);
        carrito = carrito.filter((producto) => producto.clave !== clave);
        guardarCarrito();
        renderizar();

        if (item) {
            mostrarAnuncio(`${item.modelo} fue eliminado del carrito.`);
        }
    };

    const vaciarCarrito = () => {
        if (carrito.length === 0) {
            return;
        }

        const confirmar = window.confirm('¿Deseas eliminar todos los productos del carrito?');

        if (!confirmar) {
            return;
        }

        carrito = [];
        guardarCarrito();
        renderizar();
        mostrarAnuncio('El carrito fue vaciado.');
    };

    const manejarAccionItem = (evento) => {
        const boton = evento.target.closest('[data-carrito-accion]');
        const item = boton?.closest('[data-carrito-clave]');

        if (!boton || !item || !elementos.lista.contains(item)) {
            return;
        }

        const clave = item.dataset.carritoClave;
        const accion = boton.dataset.carritoAccion;

        if (accion === 'aumentar') {
            cambiarCantidad(clave, 1);
        } else if (accion === 'disminuir') {
            cambiarCantidad(clave, -1);
        } else if (accion === 'eliminar') {
            eliminarItem(clave);
        }
    };

    const atraparFoco = (evento) => {
        if (evento.key !== 'Tab' || !carritoEstaAbierto()) {
            return;
        }

        const enfocables = Array.from(
            elementos.panel.querySelectorAll(
                'button:not([disabled]):not([hidden]), a[href], select:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    };

    const iniciar = () => {
        elementos = {
            panel: document.querySelector('#carrito'),
            fondo: document.querySelector('#carrito-fondo'),
            cerrar: document.querySelector('#carrito-cerrar'),
            lista: document.querySelector('#carrito-lista'),
            vacio: document.querySelector('#carrito-vacio'),
            pie: document.querySelector('#carrito-pie'),
            total: document.querySelector('#carrito-total'),
            vaciar: document.querySelector('#carrito-vaciar'),
            botonAbrir: document.querySelector('.accion-carrito'),
            contador: document.querySelector('.accion-carrito .contador'),
            anuncio: document.querySelector('#carrito-anuncio')
        };

        if (Object.values(elementos).some((elemento) => !elemento)) {
            console.warn('ATLAS: faltan elementos necesarios para iniciar el carrito.');
            return;
        }

        cargarCarrito();
        renderizar();

        elementos.botonAbrir.addEventListener('click', () => abrir(elementos.botonAbrir));
        elementos.cerrar.addEventListener('click', cerrar);
        elementos.fondo.addEventListener('click', cerrar);
        elementos.vaciar.addEventListener('click', vaciarCarrito);
        elementos.lista.addEventListener('click', manejarAccionItem);

        document.addEventListener('keydown', (evento) => {
            if (!carritoEstaAbierto()) {
                return;
            }

            if (evento.key === 'Escape') {
                cerrar();
                return;
            }

            atraparFoco(evento);
        });
    };

    window.ATLASCarrito = {
        agregarProducto,
        abrir,
        cerrar,
        obtenerItems: () => carrito.map((item) => ({ ...item })),
        obtenerTotal
    };

    const iniciarConCatalogo = async () => {
        try {
            if (window.ATLAS_CATALOGO_LISTO && typeof window.ATLAS_CATALOGO_LISTO.then === 'function') {
                await window.ATLAS_CATALOGO_LISTO;
            }
        } catch (error) {
            console.warn('ATLAS: carrito iniciado con el respaldo local.', error);
        }

        iniciar();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarConCatalogo);
    } else {
        iniciarConCatalogo();
    }
})();
