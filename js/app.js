/*=========================================================
PROYECTO: ATLAS

ARCHIVO: app.js

VERSIÓN: 0.8.0

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

    /** Determina la categoría principal sin romper productos antiguos. */
    const obtenerFamiliaProducto = (producto) => {
        const familia = String(producto?.familia || '').trim();
        if (familia) return familia;
        return /^ATL-ACC-/i.test(String(producto?.codigo || '')) ? 'Accesorios' : 'Calzado';
    };

    const esAccesorio = (producto) => normalizarTexto(obtenerFamiliaProducto(producto)) === 'accesorios';

    const obtenerSubcategoria = (producto) => {
        const valor = String(producto?.subcategoria || '').trim();
        if (valor) return valor;
        return esAccesorio(producto) ? 'Relojes' : 'Tenis';
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
        const accesorio = esAccesorio(producto);
        const estado = String(producto.estado || 'disponible').toLowerCase();
        const estadoVisible = estado === 'disponible' ? 'Disponible' : escaparHTML(producto.estado);
        const imagenPrincipal = escaparHTML(obtenerImagenes(producto.imagenes)[0] || '');
        const rangoTallas = escaparHTML(obtenerRangoTallas(producto.tallas, producto.sistemaTallas));
        const precio = escaparHTML(formatearPrecio(producto.precio, producto.moneda));
        const avisoDisponibilidad = producto.confirmarDisponibilidad
            ? 'Disponibilidad sujeta a confirmación antes del pedido.'
            : 'Disponibilidad registrada en el catálogo.';
        const etiquetaDestacado = producto.destacado === true
            ? '<span class="producto-badge producto-badge-destacado">Destacado</span>'
            : '';
        const detalleProducto = accesorio
            ? `<strong>${escaparHTML(obtenerSubcategoria(producto))}</strong><small>${escaparHTML(avisoDisponibilidad)}</small>`
            : `<strong>Tallas ${rangoTallas}</strong><small>${escaparHTML(avisoDisponibilidad)}</small>`;
        const accionCarrito = accesorio ? 'agregar-directo' : 'seleccionar-talla';
        const textoCarrito = accesorio ? 'Agregar al carrito' : 'Elegir talla';

        return `
            <article class="producto-card" data-producto-id="${idSeguro}">
                <div class="producto-media" data-accion="abrir-producto" data-producto-id="${idSeguro}" role="button" tabindex="0" aria-label="Ver detalles de ${modelo}">
                    <img src="${imagenPrincipal}" alt="${modelo}, color ${color}" width="900" height="900" loading="lazy" decoding="async" fetchpriority="low">
                    <div class="producto-imagen-placeholder" aria-hidden="true">
                        <div><i class="fa-regular fa-image"></i><span>Imagen no disponible</span></div>
                    </div>
                    <div class="producto-badges" aria-hidden="true">
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
                    <div class="producto-tallas">${detalleProducto}</div>
                    <div class="producto-acciones">
                        <button class="producto-btn producto-btn-detalles" type="button" data-accion="abrir-producto" data-producto-id="${idSeguro}">
                            <i class="fa-regular fa-images" aria-hidden="true"></i><span>Ver detalles</span>
                        </button>
                        <button class="producto-btn producto-btn-carrito" type="button" data-accion="${accionCarrito}" data-producto-id="${idSeguro}" ${estado === 'agotado' ? 'disabled' : ''}>
                            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i><span>${textoCarrito}</span>
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
        const familiasContenedor = document.querySelector('#catalogo-familias');
        const avisoReplicas = document.querySelector('#catalogo-aviso-replicas');
        const filtrosToggle = document.querySelector('#catalogo-filtros-toggle');
        const filtrosContador = document.querySelector('#catalogo-filtros-contador');
        const filtrosPanel = document.querySelector('#catalogo-filtros-panel');
        const filtrosCerrar = document.querySelector('#catalogo-filtros-cerrar');
        const filtrosActivos = document.querySelector('#catalogo-filtros-activos');
        const marcaSelect = document.querySelector('#catalogo-marca');
        const tallaControl = document.querySelector('#catalogo-talla-control');
        const tallaSelect = document.querySelector('#catalogo-talla');
        const colorControl = document.querySelector('#catalogo-color-control');
        const colorSelect = document.querySelector('#catalogo-color');
        const materialControl = document.querySelector('#catalogo-material-control');
        const materialSelect = document.querySelector('#catalogo-material');
        const estadoSelect = document.querySelector('#catalogo-estado');
        const precioMinInput = document.querySelector('#catalogo-precio-min');
        const precioMaxInput = document.querySelector('#catalogo-precio-max');
        const ordenSelect = document.querySelector('#catalogo-orden');
        const destacadoControl = document.querySelector('#catalogo-destacados-control');
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
        const bloqueTallasModal = document.querySelector('#producto-modal-tallas-bloque');
        const seleccionTallaModal = document.querySelector('#producto-modal-seleccion');
        const selectorTalla = document.querySelector('#producto-modal-talla');
        const errorTalla = document.querySelector('#producto-modal-talla-error');
        const botonAgregarCarrito = document.querySelector('#producto-modal-agregar-carrito');

        const camposModal = {
            marca: document.querySelector('#producto-modal-marca'),
            codigo: document.querySelector('#producto-modal-codigo'),
            estado: document.querySelector('#producto-modal-estado'),
            titulo: document.querySelector('#producto-modal-titulo'),
            color: document.querySelector('#producto-modal-color'),
            precio: document.querySelector('#producto-modal-precio'),
            tallas: document.querySelector('#producto-modal-rango-tallas'),
            disponibilidad: document.querySelector('#producto-modal-disponibilidad'),
            descripcion: document.querySelector('#producto-modal-descripcion'),
            categoria: document.querySelector('#producto-modal-categoria'),
            tipoDato: document.querySelector('#producto-modal-tipo-dato'),
            codigoDato: document.querySelector('#producto-modal-codigo-dato'),
            materialItem: document.querySelector('#producto-modal-material-item'),
            materialCorrea: document.querySelector('#producto-modal-material-correa'),
            cierreItem: document.querySelector('#producto-modal-cierre-item'),
            tipoCierre: document.querySelector('#producto-modal-tipo-cierre')
        };

        const elementosRequeridos = [
            grid,
            resumen,
            estadoVacio,
            estadoVacioTitulo,
            estadoVacioTexto,
            buscador,
            botonLimpiarBusqueda,
            familiasContenedor,
            avisoReplicas,
            filtrosToggle,
            filtrosContador,
            filtrosPanel,
            filtrosCerrar,
            filtrosActivos,
            marcaSelect,
            tallaControl,
            tallaSelect,
            colorControl,
            colorSelect,
            materialControl,
            materialSelect,
            estadoSelect,
            precioMinInput,
            precioMaxInput,
            ordenSelect,
            destacadoControl,
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
            bloqueTallasModal,
            seleccionTallaModal,
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
            estadoVacioTexto.textContent = 'Recarga la página. Si el problema continúa, revisa la conexión del catálogo.';
            return;
        }

        const productosActivos = productos.filter((producto) => producto?.activo === true);
        const estadoFiltros = {
            busqueda: '',
            familia: 'todas',
            marca: 'todas',
            talla: 'todas',
            color: 'todos',
            material: 'todos',
            estado: 'todos',
            precioMin: null,
            precioMax: null,
            soloDestacados: false,
            orden: 'recientes'
        };

        let productosVisibles = [];
        let productoActual = null;
        let imagenesActuales = [];
        let indiceImagenActual = 0;
        let botonQueAbrioModal = null;
        let modalAbiertoDesdeURL = false;
        let tokenCargaGaleria = 0;
        let agregandoAlCarrito = false;

        const HTML_BOTON_AGREGAR = botonAgregarCarrito.innerHTML;
        const interfazTactil = window.matchMedia('(pointer: coarse)').matches;

        const modalEstaAbierto = () => modal.getAttribute('aria-hidden') === 'false';

        /** Ejecuta tareas secundarias sin bloquear la apertura del modal. */
        const programarTareaLigera = (tarea) => {
            if ('requestIdleCallback' in window) {
                return window.requestIdleCallback(tarea, { timeout: 350 });
            }

            return window.setTimeout(tarea, 40);
        };

        /** Productos incluidos en la categoría principal seleccionada. */
        const productosDeFamilia = () => productosActivos.filter((producto) => (
            estadoFiltros.familia === 'todas'
            || normalizarTexto(obtenerFamiliaProducto(producto)) === normalizarTexto(estadoFiltros.familia)
        ));

        /** Crea una lista única y ordenada sin distinguir mayúsculas. */
        const obtenerValoresUnicos = (campo, lista = productosDeFamilia()) => {
            const mapa = new Map();
            lista.forEach((producto) => {
                const valor = String(producto?.[campo] || '').trim();
                const clave = normalizarTexto(valor);
                if (valor && clave && !mapa.has(clave)) mapa.set(clave, valor);
            });
            return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b, 'es-CO', { sensitivity: 'base' }));
        };

        const llenarSelect = (select, valores, valorTodos, textoTodos, valorActual) => {
            const fragmento = document.createDocumentFragment();
            const opcionInicial = document.createElement('option');
            opcionInicial.value = valorTodos;
            opcionInicial.textContent = textoTodos;
            fragmento.append(opcionInicial);

            valores.forEach((valor) => {
                const opcion = document.createElement('option');
                opcion.value = String(valor);
                opcion.textContent = String(valor);
                fragmento.append(opcion);
            });

            select.replaceChildren(fragmento);
            const existeActual = [...select.options].some((opcion) => opcion.value === String(valorActual));
            select.value = existeActual ? String(valorActual) : valorTodos;
            return select.value;
        };

        /** Actualiza las opciones disponibles según la familia elegida. */
        const crearOpcionesFiltros = () => {
            const base = productosDeFamilia();
            const familia = normalizarTexto(estadoFiltros.familia);
            const esCalzado = familia === 'calzado';
            const esAccesorios = familia === 'accesorios';

            estadoFiltros.marca = llenarSelect(
                marcaSelect,
                obtenerValoresUnicos('marca', base),
                'todas',
                'Todas las marcas',
                estadoFiltros.marca
            );

            const tallas = [...new Set(base.flatMap((producto) => (
                Array.isArray(producto.tallas) ? producto.tallas : []
            )).map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
            estadoFiltros.talla = llenarSelect(tallaSelect, tallas, 'todas', 'Todas las tallas', estadoFiltros.talla);

            estadoFiltros.color = llenarSelect(
                colorSelect,
                obtenerValoresUnicos('color', base),
                'todos',
                'Todos los colores',
                estadoFiltros.color
            );

            estadoFiltros.material = llenarSelect(
                materialSelect,
                obtenerValoresUnicos('materialCorrea', base),
                'todos',
                'Todos los materiales',
                estadoFiltros.material
            );

            tallaControl.hidden = !esCalzado;
            colorControl.hidden = !esAccesorios;
            materialControl.hidden = !esAccesorios;
            destacadoControl.hidden = esAccesorios;

            if (!esCalzado) estadoFiltros.talla = 'todas';
            if (!esAccesorios) {
                estadoFiltros.color = 'todos';
                estadoFiltros.material = 'todos';
            }
            if (esAccesorios) {
                estadoFiltros.soloDestacados = false;
                destacadoCheckbox.checked = false;
            }

            tallaSelect.value = estadoFiltros.talla;
            colorSelect.value = estadoFiltros.color;
            materialSelect.value = estadoFiltros.material;
        };

        const abrirFiltros = () => {
            filtrosPanel.hidden = false;
            filtrosToggle.setAttribute('aria-expanded', 'true');
            filtrosToggle.classList.add('activo');
        };

        const cerrarFiltros = () => {
            filtrosPanel.hidden = true;
            filtrosToggle.setAttribute('aria-expanded', 'false');
            filtrosToggle.classList.remove('activo');
        };

        const sincronizarPanelFiltros = () => {
            if (window.matchMedia('(min-width: 901px)').matches) abrirFiltros();
            else cerrarFiltros();
        };

        const actualizarFamiliaActiva = () => {
            familiasContenedor.querySelectorAll('[data-familia]').forEach((boton) => {
                const activo = normalizarTexto(boton.dataset.familia) === normalizarTexto(estadoFiltros.familia);
                boton.classList.toggle('activo', activo);
                boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
            });
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
                obtenerFamiliaProducto(producto),
                obtenerSubcategoria(producto),
                producto.categoria,
                producto.materialCorrea,
                producto.tipoCierre,
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
                case 'destacados':
                    return resultado.sort((a, b) => (
                        Number(Boolean(b.destacado)) - Number(Boolean(a.destacado))
                        || obtenerTiempoCreacion(b) - obtenerTiempoCreacion(a)
                        || Number(b.id || 0) - Number(a.id || 0)
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
                const coincideFamilia = estadoFiltros.familia === 'todas'
                    || normalizarTexto(obtenerFamiliaProducto(producto)) === normalizarTexto(estadoFiltros.familia);
                const coincideMarca = estadoFiltros.marca === 'todas'
                    || normalizarTexto(producto.marca) === normalizarTexto(estadoFiltros.marca);
                const coincideTalla = estadoFiltros.talla === 'todas'
                    || (Array.isArray(producto.tallas) && producto.tallas.some((talla) => String(talla) === String(estadoFiltros.talla)));
                const coincideColor = estadoFiltros.color === 'todos'
                    || normalizarTexto(producto.color) === normalizarTexto(estadoFiltros.color);
                const coincideMaterial = estadoFiltros.material === 'todos'
                    || normalizarTexto(producto.materialCorrea) === normalizarTexto(estadoFiltros.material);
                const coincideEstado = estadoFiltros.estado === 'todos'
                    || normalizarTexto(producto.estado) === normalizarTexto(estadoFiltros.estado);
                const precio = Number(producto.precio);
                const coincidePrecioMin = estadoFiltros.precioMin === null
                    || (Number.isFinite(precio) && precio >= estadoFiltros.precioMin);
                const coincidePrecioMax = estadoFiltros.precioMax === null
                    || (Number.isFinite(precio) && precio <= estadoFiltros.precioMax);
                const coincideDestacado = !estadoFiltros.soloDestacados
                    || producto.destacado === true;

                return coincideBusqueda(producto)
                    && coincideFamilia
                    && coincideMarca
                    && coincideTalla
                    && coincideColor
                    && coincideMaterial
                    && coincideEstado
                    && coincidePrecioMin
                    && coincidePrecioMax
                    && coincideDestacado;
            });

            return ordenarProductos(filtrados);
        };

        const obtenerCantidadFiltrosActivos = () => [
            estadoFiltros.marca !== 'todas',
            estadoFiltros.talla !== 'todas',
            estadoFiltros.color !== 'todos',
            estadoFiltros.material !== 'todos',
            estadoFiltros.estado !== 'todos',
            estadoFiltros.precioMin !== null,
            estadoFiltros.precioMax !== null,
            estadoFiltros.soloDestacados
        ].filter(Boolean).length;

        const crearChipFiltro = (clave, texto) => {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'catalogo-filtro-chip';
            boton.dataset.quitarFiltro = clave;
            boton.innerHTML = `<span>${escaparHTML(texto)}</span><i class="fa-solid fa-xmark" aria-hidden="true"></i>`;
            return boton;
        };

        const renderizarFiltrosActivos = () => {
            const fragmento = document.createDocumentFragment();
            if (estadoFiltros.marca !== 'todas') fragmento.append(crearChipFiltro('marca', estadoFiltros.marca));
            if (estadoFiltros.talla !== 'todas') fragmento.append(crearChipFiltro('talla', `Talla ${estadoFiltros.talla}`));
            if (estadoFiltros.color !== 'todos') fragmento.append(crearChipFiltro('color', estadoFiltros.color));
            if (estadoFiltros.material !== 'todos') fragmento.append(crearChipFiltro('material', estadoFiltros.material));
            if (estadoFiltros.estado !== 'todos') {
                fragmento.append(crearChipFiltro('estado', estadoFiltros.estado === 'disponible' ? 'Disponible' : 'Agotado'));
            }
            if (estadoFiltros.precioMin !== null) {
                fragmento.append(crearChipFiltro('precioMin', `Desde ${formatearPrecio(estadoFiltros.precioMin)}`));
            }
            if (estadoFiltros.precioMax !== null) {
                fragmento.append(crearChipFiltro('precioMax', `Hasta ${formatearPrecio(estadoFiltros.precioMax)}`));
            }
            if (estadoFiltros.soloDestacados) fragmento.append(crearChipFiltro('destacados', 'Destacados'));
            filtrosActivos.replaceChildren(fragmento);
            filtrosActivos.hidden = filtrosActivos.childElementCount === 0;
        };

        /** Actualiza contador, chips y estado de los controles. */
        const actualizarEstadoControles = () => {
            const cantidad = productosVisibles.length;
            const total = productosActivos.length;
            const cantidadFiltros = obtenerCantidadFiltrosActivos();
            const hayFiltros = Boolean(
                estadoFiltros.busqueda
                || estadoFiltros.familia !== 'todas'
                || cantidadFiltros > 0
                || estadoFiltros.orden !== 'recientes'
            );

            resumen.textContent = cantidad === total && !hayFiltros
                ? `${total} ${total === 1 ? 'producto encontrado' : 'productos encontrados'}`
                : `${cantidad} ${cantidad === 1 ? 'producto encontrado' : 'productos encontrados'} de ${total}`;

            filtrosContador.textContent = String(cantidadFiltros);
            filtrosContador.hidden = cantidadFiltros === 0;
            filtrosToggle.classList.toggle('tiene-filtros', cantidadFiltros > 0);
            botonLimpiarBusqueda.hidden = buscador.value.length === 0;
            botonRestablecer.disabled = !hayFiltros;
            renderizarFiltrosActivos();
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
            avisoReplicas.hidden = estadoFiltros.familia === 'Accesorios';
            actualizarFamiliaActiva();
            actualizarEstadoControles();

            if (productosVisibles.length === 0) {
                grid.replaceChildren();
                estadoVacio.hidden = false;
                const sinAccesoriosTodavia = estadoFiltros.familia === 'Accesorios' && productosDeFamilia().length === 0;
                estadoVacioTitulo.textContent = sinAccesoriosTodavia ? 'Accesorios próximamente' : 'No encontramos productos';
                estadoVacioTexto.textContent = sinAccesoriosTodavia
                    ? 'Próximamente agregaremos nuevos accesorios a ATLAS.'
                    : 'Prueba con otra marca, modelo, color o restablece los filtros.';
                return;
            }

            estadoVacio.hidden = true;
            grid.innerHTML = productosVisibles.map(crearTarjetaProducto).join('');
            prepararImagenesTarjetas();
        };

        /** Marca visualmente la miniatura correspondiente a la imagen actual. */
        const actualizarMiniaturaActiva = () => {
            miniaturas.querySelectorAll('.producto-modal-miniatura').forEach((boton, indice) => {
                const estaActiva = indice === indiceImagenActual;
                boton.classList.toggle('activa', estaActiva);
                boton.setAttribute('aria-current', estaActiva ? 'true' : 'false');
            });
        };

        /** Prepara en segundo plano la siguiente fotografía de la galería. */
        const prepararSiguienteImagen = (token, rutaActual) => {
            if (imagenesActuales.length <= 1) {
                return;
            }

            const siguienteRuta = imagenesActuales[(indiceImagenActual + 1) % imagenesActuales.length];

            if (!siguienteRuta || siguienteRuta === rutaActual) {
                return;
            }

            programarTareaLigera(() => {
                if (token !== tokenCargaGaleria || !modalEstaAbierto()) {
                    return;
                }

                const precarga = new Image();
                precarga.decoding = 'async';
                precarga.fetchPriority = 'low';
                precarga.src = siguienteRuta;
            });
        };

        /** Muestra una fotografía sin bloquear la interfaz mientras se decodifica. */
        const mostrarImagenModal = (nuevoIndice, token = tokenCargaGaleria) => {
            if (!productoActual || imagenesActuales.length === 0) {
                imagenModal.removeAttribute('src');
                imagenModal.alt = '';
                marcoImagen.classList.remove('cargando');
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
            marcoImagen.classList.add('cargando');
            imagenModal.hidden = false;
            imagenModal.decoding = 'async';
            imagenModal.loading = 'eager';
            imagenModal.fetchPriority = indiceImagenActual === 0 ? 'high' : 'auto';
            imagenModal.alt = `${productoActual.modelo}, fotografía ${indiceImagenActual + 1} de ${imagenesActuales.length}`;

            imagenModal.onload = () => {
                if (token !== tokenCargaGaleria || imagenModal.getAttribute('src') !== ruta) {
                    return;
                }

                marcoImagen.classList.remove('cargando');
                prepararSiguienteImagen(token, ruta);
            };

            imagenModal.onerror = () => {
                if (token !== tokenCargaGaleria || imagenModal.getAttribute('src') !== ruta) {
                    return;
                }

                marcoImagen.classList.remove('cargando');
                marcoImagen.classList.add('imagen-error');
            };

            imagenModal.src = ruta;

            const hayVarias = imagenesActuales.length > 1;
            botonAnterior.hidden = !hayVarias;
            botonSiguiente.hidden = !hayVarias;
            contadorImagen.hidden = !hayVarias;
            contadorImagen.textContent = `${indiceImagenActual + 1} / ${imagenesActuales.length}`;

            actualizarMiniaturaActiva();
        };

        /** Crea las miniaturas después de mostrar el modal. */
        const crearMiniaturasDiferidas = (token) => {
            miniaturas.replaceChildren();
            miniaturas.hidden = imagenesActuales.length <= 1;

            if (imagenesActuales.length <= 1) {
                return;
            }

            programarTareaLigera(() => {
                if (token !== tokenCargaGaleria || !modalEstaAbierto()) {
                    return;
                }

                const fragmento = document.createDocumentFragment();

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
                    imagen.decoding = 'async';
                    imagen.fetchPriority = 'low';

                    imagen.addEventListener('error', () => {
                        boton.hidden = true;
                    }, { once: true });

                    boton.append(imagen);
                    fragmento.append(boton);
                });

                miniaturas.replaceChildren(fragmento);
                actualizarMiniaturaActiva();
            });
        };

        /** Carga las tallas del producto dentro del selector del modal. */
        const cargarSelectorTallas = (producto) => {
            if (esAccesorio(producto)) {
                selectorTalla.replaceChildren();
                selectorTalla.disabled = true;
                errorTalla.hidden = true;
                botonAgregarCarrito.disabled = String(producto.estado || '').toLowerCase() === 'agotado';
                botonAgregarCarrito.title = botonAgregarCarrito.disabled ? 'Producto agotado' : '';
                return;
            }

            const sistema = String(producto.sistemaTallas || 'EUR');
            const tallas = Array.isArray(producto.tallas)
                ? [...new Set(producto.tallas.map(Number).filter(Number.isFinite))].sort((a, b) => a - b)
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
            botonAgregarCarrito.title = tallas.length === 0 ? 'No hay tallas configuradas para este producto' : '';
        };

        /** Abre la ventana con los datos de un producto. */
        const abrirModal = (producto, botonOrigen, enfocarTalla = false) => {
            productoActual = producto;
            imagenesActuales = obtenerImagenes(producto.imagenes);
            indiceImagenActual = 0;
            botonQueAbrioModal = botonOrigen;

            const accesorio = esAccesorio(producto);
            const tipo = producto.tipo || (accesorio ? 'Accesorio' : 'Réplica');
            const estadoOriginal = String(producto.estado || 'disponible');
            const estadoVisible = estadoOriginal.toLowerCase() === 'disponible'
                ? 'Disponible'
                : estadoOriginal;
            const codigo = producto.codigo || 'Sin código';
            const disponibilidad = producto.confirmarDisponibilidad
                ? (accesorio ? 'Disponibilidad sujeta a confirmación antes del pedido.' : 'Disponibilidad de cada talla sujeta a confirmación.')
                : 'Disponibilidad registrada en el catálogo.';

            camposModal.marca.textContent = producto.marca || 'ATLAS';
            camposModal.codigo.textContent = codigo;
            camposModal.estado.textContent = estadoVisible;
            camposModal.titulo.textContent = producto.modelo || 'Producto sin nombre';
            camposModal.color.textContent = producto.color || 'Color por confirmar';
            camposModal.precio.textContent = formatearPrecio(producto.precio, producto.moneda);
            bloqueTallasModal.hidden = accesorio;
            seleccionTallaModal.hidden = accesorio;
            if (!accesorio) {
                camposModal.tallas.textContent = `Tallas ${obtenerRangoTallas(producto.tallas, producto.sistemaTallas)}`;
                camposModal.disponibilidad.textContent = disponibilidad;
            }
            camposModal.descripcion.textContent = producto.descripcion || 'Descripción por confirmar.';
            camposModal.categoria.textContent = accesorio
                ? `${obtenerFamiliaProducto(producto)} · ${obtenerSubcategoria(producto)}`
                : (producto.categoria || 'Sin categoría');
            camposModal.materialItem.hidden = !accesorio;
            camposModal.cierreItem.hidden = !accesorio;
            camposModal.materialCorrea.textContent = producto.materialCorrea || 'Por confirmar';
            camposModal.tipoCierre.textContent = producto.tipoCierre || 'Por confirmar';
            camposModal.tipoDato.textContent = tipo;
            camposModal.codigoDato.textContent = codigo;

            cargarSelectorTallas(producto);

            tokenCargaGaleria += 1;
            const tokenActual = tokenCargaGaleria;
            miniaturas.replaceChildren();
            miniaturas.hidden = true;
            imagenModal.removeAttribute('src');
            imagenModal.alt = '';
            marcoImagen.classList.remove('imagen-error');
            marcoImagen.classList.add('cargando');

            // Iniciamos la imagen antes de mostrar el panel para evitar un cuadro vacío.
            mostrarImagenModal(0, tokenActual);

            modal.classList.add('activo');
            fondoModal.classList.add('activo');
            modal.setAttribute('aria-hidden', 'false');
            fondoModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-producto-abierto');

            crearMiniaturasDiferidas(tokenActual);

            // En pantallas táctiles no forzamos el foco: puede provocar un cálculo
            // de diseño y un pequeño salto perceptible en algunos navegadores móviles.
            if (!interfazTactil) {
                window.requestAnimationFrame(() => {
                    if (enfocarTalla && !accesorio && !selectorTalla.disabled) {
                        selectorTalla.focus({ preventScroll: true });
                    } else {
                        botonCerrar.focus({ preventScroll: true });
                    }
                });
            }
        };

        /** Cierra el modal y devuelve el foco a la tarjeta. */
        const cerrarModal = () => {
            if (!modalEstaAbierto()) {
                return;
            }

            tokenCargaGaleria += 1;
            imagenModal.onload = null;
            imagenModal.onerror = null;
            marcoImagen.classList.remove('cargando');

            modal.classList.remove('activo');
            fondoModal.classList.remove('activo');
            modal.setAttribute('aria-hidden', 'true');
            fondoModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-producto-abierto');

            if (!interfazTactil) {
                botonQueAbrioModal?.focus({ preventScroll: true });
            }
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
            estadoFiltros.familia = 'todas';
            estadoFiltros.marca = 'todas';
            estadoFiltros.talla = 'todas';
            estadoFiltros.color = 'todos';
            estadoFiltros.material = 'todos';
            estadoFiltros.estado = 'todos';
            estadoFiltros.precioMin = null;
            estadoFiltros.precioMax = null;
            estadoFiltros.soloDestacados = false;
            estadoFiltros.orden = 'recientes';

            buscador.value = '';
            estadoSelect.value = 'todos';
            precioMinInput.value = '';
            precioMaxInput.value = '';
            destacadoCheckbox.checked = false;
            ordenSelect.value = 'recientes';
            crearOpcionesFiltros();
            renderizarCatalogo();
        };

        crearOpcionesFiltros();
        sincronizarPanelFiltros();

        if (productosActivos.length === 0) {
            grid.replaceChildren();
            resumen.textContent = '0 productos disponibles';
            estadoVacio.hidden = false;
            estadoVacioTitulo.textContent = 'No hay productos disponibles';
            estadoVacioTexto.textContent = 'Publica productos desde ATLAS Gestor para mostrarlos aquí.';
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

        familiasContenedor.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-familia]');
            if (!boton || !familiasContenedor.contains(boton)) return;
            estadoFiltros.familia = boton.dataset.familia || 'todas';
            estadoFiltros.marca = 'todas';
            estadoFiltros.talla = 'todas';
            estadoFiltros.color = 'todos';
            estadoFiltros.material = 'todos';
            crearOpcionesFiltros();
            renderizarCatalogo();
        });

        filtrosToggle.addEventListener('click', () => {
            if (filtrosPanel.hidden) abrirFiltros();
            else cerrarFiltros();
        });

        filtrosCerrar.addEventListener('click', cerrarFiltros);

        marcaSelect.addEventListener('change', () => {
            estadoFiltros.marca = marcaSelect.value;
            renderizarCatalogo();
        });

        tallaSelect.addEventListener('change', () => {
            estadoFiltros.talla = tallaSelect.value;
            renderizarCatalogo();
        });

        colorSelect.addEventListener('change', () => {
            estadoFiltros.color = colorSelect.value;
            renderizarCatalogo();
        });

        materialSelect.addEventListener('change', () => {
            estadoFiltros.material = materialSelect.value;
            renderizarCatalogo();
        });

        estadoSelect.addEventListener('change', () => {
            estadoFiltros.estado = estadoSelect.value;
            renderizarCatalogo();
        });

        const actualizarPrecio = () => {
            const minimo = Number(precioMinInput.value);
            const maximo = Number(precioMaxInput.value);
            estadoFiltros.precioMin = precioMinInput.value && Number.isFinite(minimo) ? Math.max(0, minimo) : null;
            estadoFiltros.precioMax = precioMaxInput.value && Number.isFinite(maximo) ? Math.max(0, maximo) : null;
            renderizarCatalogo();
        };

        precioMinInput.addEventListener('input', actualizarPrecio);
        precioMaxInput.addEventListener('input', actualizarPrecio);

        destacadoCheckbox.addEventListener('change', () => {
            estadoFiltros.soloDestacados = destacadoCheckbox.checked;
            renderizarCatalogo();
        });

        ordenSelect.addEventListener('change', () => {
            estadoFiltros.orden = ordenSelect.value;
            renderizarCatalogo();
        });

        filtrosActivos.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-quitar-filtro]');
            if (!boton) return;

            const clave = boton.dataset.quitarFiltro;
            if (clave === 'marca') { estadoFiltros.marca = 'todas'; marcaSelect.value = 'todas'; }
            if (clave === 'talla') { estadoFiltros.talla = 'todas'; tallaSelect.value = 'todas'; }
            if (clave === 'color') { estadoFiltros.color = 'todos'; colorSelect.value = 'todos'; }
            if (clave === 'material') { estadoFiltros.material = 'todos'; materialSelect.value = 'todos'; }
            if (clave === 'estado') { estadoFiltros.estado = 'todos'; estadoSelect.value = 'todos'; }
            if (clave === 'precioMin') { estadoFiltros.precioMin = null; precioMinInput.value = ''; }
            if (clave === 'precioMax') { estadoFiltros.precioMax = null; precioMaxInput.value = ''; }
            if (clave === 'destacados') { estadoFiltros.soloDestacados = false; destacadoCheckbox.checked = false; }
            renderizarCatalogo();
        });

        let modoPanelEscritorio = window.matchMedia('(min-width: 901px)').matches;
        window.addEventListener('resize', () => {
            const ahoraEsEscritorio = window.matchMedia('(min-width: 901px)').matches;
            if (ahoraEsEscritorio !== modoPanelEscritorio) {
                modoPanelEscritorio = ahoraEsEscritorio;
                sincronizarPanelFiltros();
            }
        });

        botonRestablecer.addEventListener('click', restablecerFiltros);

        grid.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-accion]');

            if (!boton || !grid.contains(boton)) {
                return;
            }

            const accion = boton.dataset.accion;

            if (!['abrir-producto', 'seleccionar-talla', 'agregar-directo'].includes(accion)) {
                return;
            }

            const idProducto = boton.dataset.productoId;
            const producto = productosActivos.find(
                (item) => String(item.id) === String(idProducto)
            );

            if (producto) {
                if (accion === 'agregar-directo') {
                    if (!window.ATLASCarrito || typeof window.ATLASCarrito.agregarProducto !== 'function') return;
                    const resultado = window.ATLASCarrito.agregarProducto(producto, '');
                    if (resultado?.ok) window.ATLASCarrito.abrir(boton);
                    else window.alert(resultado?.mensaje || 'No fue posible agregar el producto.');
                    return;
                }
                abrirModal(producto, boton, accion === 'seleccionar-talla');
            }
        });

        grid.addEventListener('keydown', (evento) => {
            if (!['Enter', ' '].includes(evento.key)) {
                return;
            }

            const media = evento.target.closest('.producto-media[data-accion="abrir-producto"]');
            if (!media || !grid.contains(media)) {
                return;
            }

            evento.preventDefault();
            media.click();
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
            if (!productoActual || agregandoAlCarrito) {
                return;
            }

            const accesorio = esAccesorio(productoActual);
            const talla = accesorio ? '' : selectorTalla.value;

            if (!accesorio && !talla) {
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

            agregandoAlCarrito = true;
            botonAgregarCarrito.disabled = true;
            botonAgregarCarrito.setAttribute('aria-busy', 'true');
            botonAgregarCarrito.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                Agregando…
            `;

            const resultado = window.ATLASCarrito.agregarProducto(productoActual, talla);

            if (!resultado?.ok) {
                agregandoAlCarrito = false;
                botonAgregarCarrito.removeAttribute('aria-busy');
                botonAgregarCarrito.innerHTML = HTML_BOTON_AGREGAR;
                botonAgregarCarrito.disabled = accesorio ? String(productoActual.estado || '').toLowerCase() === 'agotado' : selectorTalla.disabled;
                errorTalla.textContent = resultado?.mensaje || 'No fue posible agregar el producto.';
                errorTalla.hidden = false;
                return;
            }

            // Cerramos el detalle y abrimos el carrito en la misma interacción.
            // Evitamos dos requestAnimationFrame consecutivos, que añadían espera.
            cerrarModal();
            window.ATLASCarrito.abrir();

            agregandoAlCarrito = false;
            botonAgregarCarrito.removeAttribute('aria-busy');
            botonAgregarCarrito.innerHTML = HTML_BOTON_AGREGAR;
            botonAgregarCarrito.disabled = accesorio ? String(productoActual.estado || '').toLowerCase() === 'agotado' : selectorTalla.disabled;
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

    const iniciarCatalogoConDatos = async () => {
        try {
            if (window.ATLAS_CATALOGO_LISTO && typeof window.ATLAS_CATALOGO_LISTO.then === 'function') {
                await window.ATLAS_CATALOGO_LISTO;
            }
        } catch (error) {
            // supabase-catalogo.js conserva productos.js como respaldo.
            console.warn('ATLAS: se inicia el catálogo con el respaldo local.', error);
        }

        iniciarCatalogo();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarCatalogoConDatos);
    } else {
        iniciarCatalogoConDatos();
    }
})();


/*=========================================================
GUIA DE TALLAS RESPONSIVE - v0.6.2
=========================================================*/

(() => {
    'use strict';

    const iniciarGuiaTallas = () => {
        const modal = document.querySelector('#guia-tallas-modal');
        const fondo = document.querySelector('#guia-tallas-fondo');
        const botonCerrar = document.querySelector('#guia-tallas-cerrar');

        if (!modal || !fondo || !botonCerrar) {
            return;
        }

        let botonOrigen = null;
        const interfazTactil = window.matchMedia('(pointer: coarse)').matches;
        const estaAbierta = () => modal.getAttribute('aria-hidden') === 'false';

        const abrir = (boton) => {
            botonOrigen = boton || null;
            modal.classList.add('activo');
            fondo.classList.add('activo');
            modal.setAttribute('aria-hidden', 'false');
            fondo.setAttribute('aria-hidden', 'false');
            document.body.classList.add('guia-tallas-abierta');

            if (!interfazTactil) {
                window.requestAnimationFrame(() => {
                    botonCerrar.focus({ preventScroll: true });
                });
            }
        };

        const cerrar = () => {
            if (!estaAbierta()) {
                return;
            }

            modal.classList.remove('activo');
            fondo.classList.remove('activo');
            modal.setAttribute('aria-hidden', 'true');
            fondo.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('guia-tallas-abierta');

            if (!interfazTactil) {
                botonOrigen?.focus({ preventScroll: true });
            }

            botonOrigen = null;
        };

        document.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-guia-tallas-abrir]');

            if (!boton) {
                return;
            }

            evento.preventDefault();
            abrir(boton);
        });

        botonCerrar.addEventListener('click', cerrar);
        fondo.addEventListener('click', cerrar);

        document.addEventListener('keydown', (evento) => {
            if (!estaAbierta()) {
                return;
            }

            if (evento.key === 'Escape') {
                evento.preventDefault();
                evento.stopImmediatePropagation();
                cerrar();
                return;
            }

            if (evento.key === 'Tab') {
                const enfocables = Array.from(
                    modal.querySelectorAll(
                        'button:not([disabled]), summary, a[href], [tabindex]:not([tabindex="-1"])'
                    )
                ).filter((elemento) => elemento.offsetParent !== null);

                if (enfocables.length > 0) {
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
            }

            evento.stopImmediatePropagation();
        }, true);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarGuiaTallas);
    } else {
        iniciarGuiaTallas();
    }
})();
