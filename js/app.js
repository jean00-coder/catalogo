/*=========================================================
PROYECTO: ATLAS

ARCHIVO: app.js

VERSIÓN: 0.5.1

FUNCIÓN:
Controlar el Hero, menú móvil, Header, catálogo, modal y conexión con el carrito.

=========================================================*/

(() => {
    'use strict';

    const iniciarHeroSlider = () => {
        const hero = document.querySelector('#hero');
        const slides = Array.from(document.querySelectorAll('.hero-slide'));
        const indicadores = Array.from(document.querySelectorAll('.hero-indicador'));

        // Si el Hero no existe o no contiene imágenes, detenemos la función.
        if (!hero || slides.length === 0) {
            return;
        }

        const TIEMPO_CAMBIO = 5000;
        const reduceMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

        let indiceActual = 0;
        let temporizador = null;

        /**
         * Muestra una diapositiva y oculta las demás.
         * @param {number} nuevoIndice Posición de la imagen que se mostrará.
         */
        const mostrarSlide = (nuevoIndice) => {
            indiceActual = (nuevoIndice + slides.length) % slides.length;

            slides.forEach((slide, indice) => {
                const estaActivo = indice === indiceActual;

                slide.classList.toggle('activo', estaActivo);
                slide.setAttribute('aria-hidden', String(!estaActivo));
            });

            indicadores.forEach((indicador, indice) => {
                const estaActivo = indice === indiceActual;

                indicador.classList.toggle('activo', estaActivo);

                if (estaActivo) {
                    indicador.setAttribute('aria-current', 'true');
                } else {
                    indicador.removeAttribute('aria-current');
                }
            });
        };

        /** Detiene el cambio automático. */
        const detenerSlider = () => {
            if (temporizador !== null) {
                window.clearInterval(temporizador);
                temporizador = null;
            }
        };

        /** Inicia el cambio automático cada cinco segundos. */
        const iniciarSlider = () => {
            detenerSlider();

            // No necesitamos temporizador con una sola imagen.
            // Tampoco reproducimos automáticamente si el usuario pidió menos movimiento.
            if (slides.length <= 1 || reduceMovimiento.matches) {
                return;
            }

            temporizador = window.setInterval(() => {
                mostrarSlide(indiceActual + 1);
            }, TIEMPO_CAMBIO);
        };

        // Cambio manual al presionar los indicadores.
        indicadores.forEach((indicador) => {
            indicador.addEventListener('click', () => {
                const indiceSeleccionado = Number(indicador.dataset.slide);

                if (Number.isNaN(indiceSeleccionado)) {
                    return;
                }

                mostrarSlide(indiceSeleccionado);
                iniciarSlider();
            });
        });

        // En computador, pausamos cuando el usuario apunta o navega dentro del Hero.
        hero.addEventListener('mouseenter', detenerSlider);
        hero.addEventListener('mouseleave', iniciarSlider);
        hero.addEventListener('focusin', detenerSlider);
        hero.addEventListener('focusout', iniciarSlider);

        // Evita que el temporizador siga trabajando en una pestaña oculta.
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                detenerSlider();
            } else {
                iniciarSlider();
            }
        });

        // Si el usuario cambia su preferencia de movimiento, actualizamos el slider.
        reduceMovimiento.addEventListener('change', iniciarSlider);

        mostrarSlide(0);
        iniciarSlider();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarHeroSlider);
    } else {
        iniciarHeroSlider();
    }
})();


/*=========================================================
MENÚ HAMBURGUESA
=========================================================*/

(() => {
    'use strict';

    const iniciarMenuMovil = () => {
        const botonMenu = document.querySelector('#boton-menu');
        const menu = document.querySelector('#menu-principal');
        const fondoMenu = document.querySelector('#menu-fondo');

        // Si falta alguno de los elementos, evitamos generar errores.
        if (!botonMenu || !menu || !fondoMenu) {
            return;
        }

        const enlacesMenu = Array.from(menu.querySelectorAll('a'));
        const vistaMovil = window.matchMedia('(max-width: 900px)');

        const menuEstaAbierto = () => (
            botonMenu.getAttribute('aria-expanded') === 'true'
        );

        /** Abre el panel lateral y bloquea el desplazamiento de la página. */
        const abrirMenu = () => {
            if (!vistaMovil.matches) {
                return;
            }

            menu.classList.add('abierto');
            fondoMenu.classList.add('activo');
            botonMenu.classList.add('activo');
            document.body.classList.add('menu-movil-abierto');

            botonMenu.setAttribute('aria-expanded', 'true');
            botonMenu.setAttribute('aria-label', 'Cerrar menú');

            // Después de la animación inicial, llevamos el foco al primer enlace.
            window.requestAnimationFrame(() => {
                enlacesMenu[0]?.focus();
            });
        };

        /**
         * Cierra el panel lateral.
         * @param {boolean} devolverFoco Indica si el foco vuelve al botón.
         */
        const cerrarMenu = (devolverFoco = false) => {
            menu.classList.remove('abierto');
            fondoMenu.classList.remove('activo');
            botonMenu.classList.remove('activo');
            document.body.classList.remove('menu-movil-abierto');

            botonMenu.setAttribute('aria-expanded', 'false');
            botonMenu.setAttribute('aria-label', 'Abrir menú');

            if (devolverFoco) {
                botonMenu.focus();
            }
        };

        botonMenu.addEventListener('click', () => {
            if (menuEstaAbierto()) {
                cerrarMenu();
            } else {
                abrirMenu();
            }
        });

        // Tocar la capa oscura equivale a tocar fuera del menú.
        fondoMenu.addEventListener('click', () => cerrarMenu());

        // Al elegir una sección, cerramos el panel antes de navegar.
        enlacesMenu.forEach((enlace) => {
            enlace.addEventListener('click', () => cerrarMenu());
        });

        // La tecla Escape cierra el menú y devuelve el foco al botón.
        document.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape' && menuEstaAbierto()) {
                cerrarMenu(true);
            }
        });

        // Si la pantalla vuelve a tamaño de computador, restauramos el estado.
        vistaMovil.addEventListener('change', (evento) => {
            if (!evento.matches) {
                cerrarMenu();
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarMenuMovil);
    } else {
        iniciarMenuMovil();
    }
})();

/*=========================================================
HEADER AL HACER SCROLL
=========================================================*/

(() => {
    'use strict';

    const iniciarHeaderScroll = () => {
        const header = document.querySelector('#header');

        // Si el Header no existe, evitamos generar errores.
        if (!header) {
            return;
        }

        const DISTANCIA_ACTIVACION = 32;
        let actualizacionPendiente = false;

        /**
         * Agrega o elimina la clase visual según la posición de la página.
         */
        const actualizarHeader = () => {
            const paginaDesplazada = window.scrollY > DISTANCIA_ACTIVACION;

            header.classList.toggle('header-scroll', paginaDesplazada);
            actualizacionPendiente = false;
        };

        /**
         * requestAnimationFrame evita ejecutar cambios visuales demasiadas veces
         * durante un desplazamiento rápido.
         */
        const solicitarActualizacion = () => {
            if (actualizacionPendiente) {
                return;
            }

            actualizacionPendiente = true;
            window.requestAnimationFrame(actualizarHeader);
        };

        window.addEventListener('scroll', solicitarActualizacion, { passive: true });

        // Establece el estado correcto incluso si la página abre ya desplazada.
        actualizarHeader();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarHeaderScroll);
    } else {
        iniciarHeaderScroll();
    }
})();


/*=========================================================
CATÁLOGO DINÁMICO, BÚSQUEDA, FILTROS Y MODAL DE PRODUCTO
=========================================================*/

(() => {
    'use strict';

    /** Convierte texto en contenido seguro para insertarlo dentro de HTML. */
    const escaparHTML = (valor) => String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    /** Normaliza texto para búsquedas sin distinguir mayúsculas ni tildes. */
    const normalizarTexto = (valor) => String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('es-CO')
        .trim();

    /** Formatea un precio en pesos colombianos. */
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

    /** Resume el arreglo de tallas como un rango sencillo. */
    const obtenerRangoTallas = (tallas, sistema = 'EUR') => {
        if (!Array.isArray(tallas) || tallas.length === 0) {
            return `${sistema} por confirmar`;
        }

        const tallasValidas = tallas
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b);

        if (tallasValidas.length === 0) {
            return `${sistema} por confirmar`;
        }

        const primera = tallasValidas[0];
        const ultima = tallasValidas[tallasValidas.length - 1];

        return primera === ultima
            ? `${sistema} ${primera}`
            : `${sistema} ${primera}–${ultima}`;
    };

    /** Obtiene solamente rutas de imagen válidas. */
    const obtenerImagenes = (imagenes) => (
        Array.isArray(imagenes)
            ? imagenes.filter((ruta) => typeof ruta === 'string' && ruta.trim() !== '')
            : []
    );

    /** Convierte la fecha del producto en un valor comparable. */
    const obtenerTiempoCreacion = (producto) => {
        const tiempo = Date.parse(producto?.fechaCreacion || '');
        return Number.isFinite(tiempo) ? tiempo : 0;
    };

    /** Construye el HTML de una tarjeta a partir de un producto. */
    const crearTarjetaProducto = (producto) => {
        const id = Number(producto.id);
        const idSeguro = Number.isInteger(id) ? id : escaparHTML(producto.codigo);
        const codigo = escaparHTML(producto.codigo || 'Sin código');
        const marca = escaparHTML(producto.marca || 'ATLAS');
        const modelo = escaparHTML(producto.modelo || 'Producto sin nombre');
        const color = escaparHTML(producto.color || 'Color por confirmar');
        const tipo = escaparHTML(producto.tipo || 'Réplica');
        const estado = String(producto.estado || 'disponible').toLowerCase();
        const estadoVisible = estado === 'disponible' ? 'Disponible' : escaparHTML(producto.estado);
        const imagenPrincipal = escaparHTML(obtenerImagenes(producto.imagenes)[0] || '');
        const rangoTallas = escaparHTML(
            obtenerRangoTallas(producto.tallas, producto.sistemaTallas)
        );
        const precio = escaparHTML(formatearPrecio(producto.precio, producto.moneda));
        const avisoDisponibilidad = producto.confirmarDisponibilidad
            ? 'Confirma disponibilidad antes de solicitar.'
            : 'Disponibilidad registrada en el catálogo.';
        const etiquetaDestacado = producto.destacado === true
            ? '<span class="producto-badge producto-badge-destacado">Destacado</span>'
            : '';

        return `
            <article class="producto-card" data-producto-id="${idSeguro}">

                <div class="producto-media">
                    <img
                        src="${imagenPrincipal}"
                        alt="${modelo}, color ${color}"
                        width="900"
                        height="900"
                        loading="lazy"
                    >

                    <div class="producto-imagen-placeholder" aria-hidden="true">
                        <div>
                            <i class="fa-regular fa-image"></i>
                            <span>Imagen no disponible</span>
                        </div>
                    </div>

                    <div class="producto-badges" aria-hidden="true">
                        <span class="producto-badge">${tipo}</span>
                        <span class="producto-badge producto-badge-estado">${estadoVisible}</span>
                        ${etiquetaDestacado}
                    </div>
                </div>

                <div class="producto-info">

                    <div class="producto-meta-superior">
                        <span class="producto-marca">${marca}</span>
                        <span class="producto-codigo">${codigo}</span>
                    </div>

                    <h3>${modelo}</h3>
                    <p class="producto-color">${color}</p>

                    <p class="producto-precio">${precio}</p>

                    <div class="producto-tallas">
                        <strong>Tallas ${rangoTallas}</strong>
                        <small>${escaparHTML(avisoDisponibilidad)}</small>
                    </div>

                    <div class="producto-acciones">
                        <button
                            class="producto-btn producto-btn-detalles"
                            type="button"
                            data-accion="abrir-producto"
                            data-producto-id="${idSeguro}"
                        >
                            <i class="fa-regular fa-images" aria-hidden="true"></i>
                            <span>Ver detalles</span>
                        </button>

                        <button
                            class="producto-btn producto-btn-carrito"
                            type="button"
                            data-accion="seleccionar-talla"
                            data-producto-id="${idSeguro}"
                        >
                            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                            <span>Elegir talla</span>
                        </button>
                    </div>

                </div>

            </article>
        `;
    };

    const iniciarCatalogo = () => {
        const grid = document.querySelector('#catalogo-grid');
        const resumen = document.querySelector('#catalogo-resumen');
        const estadoVacio = document.querySelector('#catalogo-vacio');
        const estadoVacioTitulo = estadoVacio?.querySelector('h3');
        const estadoVacioTexto = estadoVacio?.querySelector('p');

        const buscador = document.querySelector('#catalogo-buscador');
        const botonLimpiarBusqueda = document.querySelector('#catalogo-busqueda-limpiar');
        const botonBuscarHeader = document.querySelector('.accion-buscar');
        const marcasContenedor = document.querySelector('#catalogo-marcas');
        const categoriaSelect = document.querySelector('#catalogo-categoria');
        const estadoSelect = document.querySelector('#catalogo-estado');
        const ordenSelect = document.querySelector('#catalogo-orden');
        const destacadoCheckbox = document.querySelector('#catalogo-destacados');
        const botonRestablecer = document.querySelector('#catalogo-restablecer');

        const modal = document.querySelector('#producto-modal');
        const fondoModal = document.querySelector('#producto-modal-fondo');
        const botonCerrar = document.querySelector('#producto-modal-cerrar');
        const marcoImagen = document.querySelector('#producto-modal-marco');
        const imagenModal = document.querySelector('#producto-modal-imagen');
        const miniaturas = document.querySelector('#producto-modal-miniaturas');
        const botonAnterior = document.querySelector('#producto-modal-anterior');
        const botonSiguiente = document.querySelector('#producto-modal-siguiente');
        const contadorImagen = document.querySelector('#producto-modal-contador');
        const selectorTalla = document.querySelector('#producto-modal-talla');
        const errorTalla = document.querySelector('#producto-modal-talla-error');
        const botonAgregarCarrito = document.querySelector('#producto-modal-agregar-carrito');

        const camposModal = {
            marca: document.querySelector('#producto-modal-marca'),
            codigo: document.querySelector('#producto-modal-codigo'),
            tipo: document.querySelector('#producto-modal-tipo'),
            estado: document.querySelector('#producto-modal-estado'),
            titulo: document.querySelector('#producto-modal-titulo'),
            color: document.querySelector('#producto-modal-color'),
            precio: document.querySelector('#producto-modal-precio'),
            tallas: document.querySelector('#producto-modal-rango-tallas'),
            disponibilidad: document.querySelector('#producto-modal-disponibilidad'),
            descripcion: document.querySelector('#producto-modal-descripcion'),
            categoria: document.querySelector('#producto-modal-categoria'),
            tipoDato: document.querySelector('#producto-modal-tipo-dato'),
            codigoDato: document.querySelector('#producto-modal-codigo-dato')
        };

        const elementosRequeridos = [
            grid,
            resumen,
            estadoVacio,
            estadoVacioTitulo,
            estadoVacioTexto,
            buscador,
            botonLimpiarBusqueda,
            marcasContenedor,
            categoriaSelect,
            estadoSelect,
            ordenSelect,
            destacadoCheckbox,
            botonRestablecer,
            modal,
            fondoModal,
            botonCerrar,
            marcoImagen,
            imagenModal,
            miniaturas,
            botonAnterior,
            botonSiguiente,
            contadorImagen,
            selectorTalla,
            errorTalla,
            botonAgregarCarrito,
            ...Object.values(camposModal)
        ];

        if (elementosRequeridos.some((elemento) => !elemento)) {
            return;
        }

        if (typeof productos === 'undefined' || !Array.isArray(productos)) {
            grid.replaceChildren();
            resumen.textContent = 'No fue posible cargar el catálogo.';
            estadoVacio.hidden = false;
            estadoVacioTitulo.textContent = 'No fue posible cargar los productos';
            estadoVacioTexto.textContent = 'Revisa el archivo js/productos.js.';
            return;
        }

        const productosActivos = productos.filter((producto) => producto?.activo === true);
        const estadoFiltros = {
            busqueda: '',
            marca: 'todas',
            categoria: 'todas',
            estado: 'todos',
            soloDestacados: false,
            orden: 'recientes'
        };

        let productosVisibles = [];
        let productoActual = null;
        let imagenesActuales = [];
        let indiceImagenActual = 0;
        let botonQueAbrioModal = null;
        let modalAbiertoDesdeURL = false;

        const modalEstaAbierto = () => modal.getAttribute('aria-hidden') === 'false';

        /** Crea una lista única y ordenada sin distinguir mayúsculas. */
        const obtenerValoresUnicos = (campo) => {
            const mapa = new Map();

            productosActivos.forEach((producto) => {
                const valor = String(producto?.[campo] || '').trim();
                const clave = normalizarTexto(valor);

                if (valor && clave && !mapa.has(clave)) {
                    mapa.set(clave, valor);
                }
            });

            return Array.from(mapa.values()).sort((a, b) => (
                a.localeCompare(b, 'es-CO', { sensitivity: 'base' })
            ));
        };

        /** Genera los botones de marca automáticamente desde productos.js. */
        const crearFiltrosMarca = () => {
            const marcas = obtenerValoresUnicos('marca');
            const fragmento = document.createDocumentFragment();

            const crearBoton = (texto, valor, cantidad) => {
                const boton = document.createElement('button');
                boton.type = 'button';
                boton.className = 'catalogo-marca-btn';
                boton.dataset.marca = valor;
                boton.setAttribute('aria-pressed', valor === 'todas' ? 'true' : 'false');
                boton.innerHTML = `
                    <span>${escaparHTML(texto)}</span>
                    <small>${cantidad}</small>
                `;
                return boton;
            };

            fragmento.append(crearBoton('Todas', 'todas', productosActivos.length));

            marcas.forEach((marca) => {
                const cantidad = productosActivos.filter(
                    (producto) => normalizarTexto(producto.marca) === normalizarTexto(marca)
                ).length;
                fragmento.append(crearBoton(marca, marca, cantidad));
            });

            marcasContenedor.replaceChildren(fragmento);
        };

        /** Genera las categorías disponibles automáticamente. */
        const crearFiltroCategorias = () => {
            const categorias = obtenerValoresUnicos('categoria');
            const fragmento = document.createDocumentFragment();

            const opcionTodas = document.createElement('option');
            opcionTodas.value = 'todas';
            opcionTodas.textContent = 'Todas las categorías';
            fragmento.append(opcionTodas);

            categorias.forEach((categoria) => {
                const opcion = document.createElement('option');
                opcion.value = categoria;
                opcion.textContent = categoria;
                fragmento.append(opcion);
            });

            categoriaSelect.replaceChildren(fragmento);
        };

        /** Indica si un producto coincide con el texto escrito. */
        const coincideBusqueda = (producto) => {
            if (!estadoFiltros.busqueda) {
                return true;
            }

            const contenido = [
                producto.codigo,
                producto.marca,
                producto.modelo,
                producto.color,
                producto.categoria,
                producto.descripcion,
                producto.tipo
            ].map(normalizarTexto).join(' ');

            return contenido.includes(estadoFiltros.busqueda);
        };

        /** Ordena una copia del resultado según la opción elegida. */
        const ordenarProductos = (lista) => {
            const resultado = [...lista];

            switch (estadoFiltros.orden) {
                case 'precio-asc':
                    return resultado.sort((a, b) => Number(a.precio) - Number(b.precio));
                case 'precio-desc':
                    return resultado.sort((a, b) => Number(b.precio) - Number(a.precio));
                case 'nombre':
                    return resultado.sort((a, b) => String(a.modelo || '').localeCompare(
                        String(b.modelo || ''),
                        'es-CO',
                        { sensitivity: 'base' }
                    ));
                case 'marca':
                    return resultado.sort((a, b) => String(a.marca || '').localeCompare(
                        String(b.marca || ''),
                        'es-CO',
                        { sensitivity: 'base' }
                    ));
                case 'recientes':
                default:
                    return resultado.sort((a, b) => (
                        obtenerTiempoCreacion(b) - obtenerTiempoCreacion(a)
                        || Number(b.id || 0) - Number(a.id || 0)
                    ));
            }
        };

        /** Aplica todos los filtros activos. */
        const obtenerProductosFiltrados = () => {
            const filtrados = productosActivos.filter((producto) => {
                const coincideMarca = estadoFiltros.marca === 'todas'
                    || normalizarTexto(producto.marca) === normalizarTexto(estadoFiltros.marca);
                const coincideCategoria = estadoFiltros.categoria === 'todas'
                    || normalizarTexto(producto.categoria) === normalizarTexto(estadoFiltros.categoria);
                const coincideEstado = estadoFiltros.estado === 'todos'
                    || normalizarTexto(producto.estado) === normalizarTexto(estadoFiltros.estado);
                const coincideDestacado = !estadoFiltros.soloDestacados
                    || producto.destacado === true;

                return coincideBusqueda(producto)
                    && coincideMarca
                    && coincideCategoria
                    && coincideEstado
                    && coincideDestacado;
            });

            return ordenarProductos(filtrados);
        };

        /** Activa visualmente el botón de marca seleccionado. */
        const actualizarMarcaActiva = () => {
            marcasContenedor.querySelectorAll('[data-marca]').forEach((boton) => {
                const activo = normalizarTexto(boton.dataset.marca) === normalizarTexto(estadoFiltros.marca);
                boton.classList.toggle('activo', activo);
                boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
            });
        };

        /** Actualiza el contador y la visibilidad del botón para limpiar búsqueda. */
        const actualizarEstadoControles = () => {
            const cantidad = productosVisibles.length;
            const total = productosActivos.length;
            const hayFiltros = Boolean(
                estadoFiltros.busqueda
                || estadoFiltros.marca !== 'todas'
                || estadoFiltros.categoria !== 'todas'
                || estadoFiltros.estado !== 'todos'
                || estadoFiltros.soloDestacados
                || estadoFiltros.orden !== 'recientes'
            );

            resumen.textContent = cantidad === total && !hayFiltros
                ? `${total} ${total === 1 ? 'producto disponible' : 'productos disponibles'}`
                : `Mostrando ${cantidad} de ${total} ${total === 1 ? 'producto' : 'productos'}`;

            botonLimpiarBusqueda.hidden = buscador.value.length === 0;
            botonRestablecer.disabled = !hayFiltros;
        };

        /** Registra el control de error para las imágenes recién renderizadas. */
        const prepararImagenesTarjetas = () => {
            grid.querySelectorAll('.producto-media img').forEach((imagen) => {
                imagen.addEventListener('error', () => {
                    const contenedor = imagen.closest('.producto-media');
                    contenedor?.classList.add('imagen-error');
                    imagen.remove();
                }, { once: true });
            });
        };

        /** Dibuja el catálogo según la búsqueda y filtros actuales. */
        const renderizarCatalogo = () => {
            productosVisibles = obtenerProductosFiltrados();
            actualizarMarcaActiva();
            actualizarEstadoControles();

            if (productosVisibles.length === 0) {
                grid.replaceChildren();
                estadoVacio.hidden = false;
                estadoVacioTitulo.textContent = 'No encontramos productos';
                estadoVacioTexto.textContent = 'Prueba con otra marca, modelo, color o restablece los filtros.';
                return;
            }

            estadoVacio.hidden = true;
            grid.innerHTML = productosVisibles.map(crearTarjetaProducto).join('');
            prepararImagenesTarjetas();
        };

        /** Muestra una fotografía de la galería. */
        const mostrarImagenModal = (nuevoIndice) => {
            if (!productoActual || imagenesActuales.length === 0) {
                imagenModal.removeAttribute('src');
                imagenModal.alt = '';
                marcoImagen.classList.add('imagen-error');
                botonAnterior.hidden = true;
                botonSiguiente.hidden = true;
                contadorImagen.hidden = true;
                return;
            }

            indiceImagenActual = (
                nuevoIndice + imagenesActuales.length
            ) % imagenesActuales.length;

            const ruta = imagenesActuales[indiceImagenActual];
            marcoImagen.classList.remove('imagen-error');
            imagenModal.hidden = false;
            imagenModal.src = ruta;
            imagenModal.alt = `${productoActual.modelo}, fotografía ${indiceImagenActual + 1} de ${imagenesActuales.length}`;

            const hayVarias = imagenesActuales.length > 1;
            botonAnterior.hidden = !hayVarias;
            botonSiguiente.hidden = !hayVarias;
            contadorImagen.hidden = !hayVarias;
            contadorImagen.textContent = `${indiceImagenActual + 1} / ${imagenesActuales.length}`;

            miniaturas.querySelectorAll('.producto-modal-miniatura').forEach((boton, indice) => {
                const estaActiva = indice === indiceImagenActual;
                boton.classList.toggle('activa', estaActiva);
                boton.setAttribute('aria-current', estaActiva ? 'true' : 'false');
            });
        };

        /** Crea las miniaturas del producto actual. */
        const crearMiniaturas = () => {
            miniaturas.replaceChildren();

            imagenesActuales.forEach((ruta, indice) => {
                const boton = document.createElement('button');
                const imagen = document.createElement('img');

                boton.type = 'button';
                boton.className = 'producto-modal-miniatura';
                boton.dataset.indiceImagen = String(indice);
                boton.setAttribute(
                    'aria-label',
                    `Mostrar fotografía ${indice + 1} de ${imagenesActuales.length}`
                );

                imagen.src = ruta;
                imagen.alt = '';
                imagen.width = 120;
                imagen.height = 120;
                imagen.loading = 'lazy';

                imagen.addEventListener('error', () => {
                    boton.hidden = true;
                }, { once: true });

                boton.append(imagen);
                miniaturas.append(boton);
            });

            miniaturas.hidden = imagenesActuales.length <= 1;
        };

        /** Carga las tallas del producto dentro del selector del modal. */
        const cargarSelectorTallas = (producto) => {
            const sistema = String(producto.sistemaTallas || 'EUR');
            const tallas = Array.isArray(producto.tallas)
                ? [...new Set(producto.tallas.map(Number).filter(Number.isFinite))]
                    .sort((a, b) => a - b)
                : [];

            const fragmento = document.createDocumentFragment();
            const opcionInicial = document.createElement('option');
            opcionInicial.value = '';
            opcionInicial.textContent = `Elige una talla ${sistema}`;
            fragmento.append(opcionInicial);

            tallas.forEach((talla) => {
                const opcion = document.createElement('option');
                opcion.value = String(talla);
                opcion.textContent = `${sistema} ${talla}`;
                fragmento.append(opcion);
            });

            selectorTalla.replaceChildren(fragmento);
            selectorTalla.disabled = tallas.length === 0;
            selectorTalla.value = '';
            selectorTalla.removeAttribute('aria-invalid');
            errorTalla.textContent = 'Selecciona una talla para continuar.';
            errorTalla.hidden = true;

            botonAgregarCarrito.disabled = tallas.length === 0;
            botonAgregarCarrito.title = tallas.length === 0
                ? 'No hay tallas configuradas para este producto'
                : '';
        };

        /** Abre la ventana con los datos de un producto. */
        const abrirModal = (producto, botonOrigen, enfocarTalla = false) => {
            productoActual = producto;
            imagenesActuales = obtenerImagenes(producto.imagenes);
            indiceImagenActual = 0;
            botonQueAbrioModal = botonOrigen;

            const tipo = producto.tipo || 'Réplica';
            const estadoOriginal = String(producto.estado || 'disponible');
            const estadoVisible = estadoOriginal.toLowerCase() === 'disponible'
                ? 'Disponible'
                : estadoOriginal;
            const codigo = producto.codigo || 'Sin código';
            const disponibilidad = producto.confirmarDisponibilidad
                ? 'Disponibilidad de cada talla sujeta a confirmación.'
                : 'Disponibilidad registrada en el catálogo.';

            camposModal.marca.textContent = producto.marca || 'ATLAS';
            camposModal.codigo.textContent = codigo;
            camposModal.tipo.textContent = tipo;
            camposModal.estado.textContent = estadoVisible;
            camposModal.titulo.textContent = producto.modelo || 'Producto sin nombre';
            camposModal.color.textContent = producto.color || 'Color por confirmar';
            camposModal.precio.textContent = formatearPrecio(producto.precio, producto.moneda);
            camposModal.tallas.textContent = `Tallas ${obtenerRangoTallas(producto.tallas, producto.sistemaTallas)}`;
            camposModal.disponibilidad.textContent = disponibilidad;
            camposModal.descripcion.textContent = producto.descripcion || 'Descripción por confirmar.';
            camposModal.categoria.textContent = producto.categoria || 'Sin categoría';
            camposModal.tipoDato.textContent = tipo;
            camposModal.codigoDato.textContent = codigo;

            cargarSelectorTallas(producto);
            crearMiniaturas();
            mostrarImagenModal(0);

            modal.classList.add('activo');
            fondoModal.classList.add('activo');
            modal.setAttribute('aria-hidden', 'false');
            fondoModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-producto-abierto');

            window.requestAnimationFrame(() => {
                if (enfocarTalla && !selectorTalla.disabled) {
                    selectorTalla.focus();
                } else {
                    botonCerrar.focus();
                }
            });
        };

        /** Cierra el modal y devuelve el foco a la tarjeta. */
        const cerrarModal = () => {
            if (!modalEstaAbierto()) {
                return;
            }

            modal.classList.remove('activo');
            fondoModal.classList.remove('activo');
            modal.setAttribute('aria-hidden', 'true');
            fondoModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-producto-abierto');

            botonQueAbrioModal?.focus();
            botonQueAbrioModal = null;

            if (modalAbiertoDesdeURL) {
                const url = new URL(window.location.href);
                url.searchParams.delete('producto');
                window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
                modalAbiertoDesdeURL = false;
            }
        };

        /** Restablece todos los controles a su estado inicial. */
        const restablecerFiltros = () => {
            estadoFiltros.busqueda = '';
            estadoFiltros.marca = 'todas';
            estadoFiltros.categoria = 'todas';
            estadoFiltros.estado = 'todos';
            estadoFiltros.soloDestacados = false;
            estadoFiltros.orden = 'recientes';

            buscador.value = '';
            categoriaSelect.value = 'todas';
            estadoSelect.value = 'todos';
            destacadoCheckbox.checked = false;
            ordenSelect.value = 'recientes';

            renderizarCatalogo();
        };

        crearFiltrosMarca();
        crearFiltroCategorias();

        if (productosActivos.length === 0) {
            grid.replaceChildren();
            resumen.textContent = '0 productos disponibles';
            estadoVacio.hidden = false;
            estadoVacioTitulo.textContent = 'No hay productos disponibles';
            estadoVacioTexto.textContent = 'Agrega productos activos desde ATLAS Gestor Local.';
            return;
        }

        buscador.addEventListener('input', () => {
            estadoFiltros.busqueda = normalizarTexto(buscador.value);
            renderizarCatalogo();
        });

        botonLimpiarBusqueda.addEventListener('click', () => {
            buscador.value = '';
            estadoFiltros.busqueda = '';
            buscador.focus();
            renderizarCatalogo();
        });

        botonBuscarHeader?.addEventListener('click', () => {
            document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' });
            window.setTimeout(() => buscador.focus(), 450);
        });

        marcasContenedor.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-marca]');

            if (!boton || !marcasContenedor.contains(boton)) {
                return;
            }

            estadoFiltros.marca = boton.dataset.marca || 'todas';
            renderizarCatalogo();
        });

        categoriaSelect.addEventListener('change', () => {
            estadoFiltros.categoria = categoriaSelect.value;
            renderizarCatalogo();
        });

        estadoSelect.addEventListener('change', () => {
            estadoFiltros.estado = estadoSelect.value;
            renderizarCatalogo();
        });

        destacadoCheckbox.addEventListener('change', () => {
            estadoFiltros.soloDestacados = destacadoCheckbox.checked;
            renderizarCatalogo();
        });

        ordenSelect.addEventListener('change', () => {
            estadoFiltros.orden = ordenSelect.value;
            renderizarCatalogo();
        });

        botonRestablecer.addEventListener('click', restablecerFiltros);

        grid.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-accion]');

            if (!boton || !grid.contains(boton)) {
                return;
            }

            const accion = boton.dataset.accion;

            if (!['abrir-producto', 'seleccionar-talla'].includes(accion)) {
                return;
            }

            const idProducto = boton.dataset.productoId;
            const producto = productosActivos.find(
                (item) => String(item.id) === String(idProducto)
            );

            if (producto) {
                abrirModal(producto, boton, accion === 'seleccionar-talla');
            }
        });

        selectorTalla.addEventListener('change', () => {
            const tieneTalla = selectorTalla.value !== '';

            if (tieneTalla) {
                selectorTalla.removeAttribute('aria-invalid');
                errorTalla.hidden = true;
            } else {
                selectorTalla.setAttribute('aria-invalid', 'true');
            }
        });

        botonAgregarCarrito.addEventListener('click', () => {
            if (!productoActual) {
                return;
            }

            const talla = selectorTalla.value;

            if (!talla) {
                selectorTalla.setAttribute('aria-invalid', 'true');
                errorTalla.hidden = false;
                selectorTalla.focus();
                return;
            }

            if (!window.ATLASCarrito || typeof window.ATLASCarrito.agregarProducto !== 'function') {
                errorTalla.textContent = 'No fue posible iniciar el carrito. Recarga la página e inténtalo nuevamente.';
                errorTalla.hidden = false;
                return;
            }

            const resultado = window.ATLASCarrito.agregarProducto(productoActual, talla);

            if (!resultado?.ok) {
                errorTalla.textContent = resultado?.mensaje || 'No fue posible agregar el producto.';
                errorTalla.hidden = false;
                return;
            }

            cerrarModal();
            window.ATLASCarrito.abrir();
        });

        miniaturas.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-indice-imagen]');

            if (!boton || !miniaturas.contains(boton)) {
                return;
            }

            const indice = Number(boton.dataset.indiceImagen);

            if (Number.isInteger(indice)) {
                mostrarImagenModal(indice);
            }
        });

        imagenModal.addEventListener('error', () => {
            marcoImagen.classList.add('imagen-error');
        });

        botonAnterior.addEventListener('click', () => {
            mostrarImagenModal(indiceImagenActual - 1);
        });

        botonSiguiente.addEventListener('click', () => {
            mostrarImagenModal(indiceImagenActual + 1);
        });

        botonCerrar.addEventListener('click', cerrarModal);
        fondoModal.addEventListener('click', cerrarModal);

        document.addEventListener('keydown', (evento) => {
            if (!modalEstaAbierto()) {
                return;
            }

            if (evento.key === 'Escape') {
                cerrarModal();
                return;
            }

            if (evento.key === 'ArrowLeft' && imagenesActuales.length > 1) {
                mostrarImagenModal(indiceImagenActual - 1);
                return;
            }

            if (evento.key === 'ArrowRight' && imagenesActuales.length > 1) {
                mostrarImagenModal(indiceImagenActual + 1);
                return;
            }

            if (evento.key === 'Tab') {
                const enfocables = Array.from(
                    modal.querySelectorAll(
                        'button:not([disabled]):not([hidden]), a[href], [tabindex]:not([tabindex="-1"])'
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

        renderizarCatalogo();

        /** Abre automáticamente un producto cuando la URL contiene ?producto=CODIGO. */
        const codigoDesdeURL = new URLSearchParams(window.location.search).get('producto');

        if (codigoDesdeURL) {
            const productoEnlazado = productosActivos.find(
                (producto) => normalizarTexto(producto.codigo) === normalizarTexto(codigoDesdeURL)
            );

            if (productoEnlazado) {
                const botonOrigen = grid.querySelector(
                    `[data-producto-id="${String(productoEnlazado.id)}"]`
                );
                modalAbiertoDesdeURL = true;
                abrirModal(productoEnlazado, botonOrigen || null);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarCatalogo);
    } else {
        iniciarCatalogo();
    }
})();
