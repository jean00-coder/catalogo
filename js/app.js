/*=========================================================
PROYECTO: ATLAS

ARCHIVO: app.js

VERSIÓN: 0.3.3 Alpha

FUNCIÓN:
Controlar el Hero, menú móvil, Header, catálogo y modal de producto.

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
CATÁLOGO DINÁMICO Y MODAL DE PRODUCTO
=========================================================*/

(() => {
    'use strict';

    /**
     * Convierte texto en contenido seguro para insertarlo dentro de HTML.
     * @param {unknown} valor Texto original.
     * @returns {string} Texto escapado.
     */
    const escaparHTML = (valor) => String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    /**
     * Formatea un precio en pesos colombianos.
     * @param {number} precio Valor numérico del producto.
     * @param {string} moneda Código de moneda.
     * @returns {string} Precio listo para mostrar.
     */
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

    /**
     * Resume el arreglo de tallas como un rango sencillo.
     * @param {number[]} tallas Lista de tallas.
     * @param {string} sistema Sistema de tallaje.
     * @returns {string} Ejemplo: EUR 36–44.
     */
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

    /**
     * Obtiene solamente rutas de imagen válidas.
     * @param {unknown} imagenes Posible arreglo de rutas.
     * @returns {string[]} Lista limpia de fotografías.
     */
    const obtenerImagenes = (imagenes) => (
        Array.isArray(imagenes)
            ? imagenes.filter((ruta) => typeof ruta === 'string' && ruta.trim() !== '')
            : []
    );

    /**
     * Construye el HTML de una tarjeta a partir de un producto.
     * @param {object} producto Información registrada en productos.js.
     * @returns {string} Tarjeta HTML.
     */
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
                            disabled
                            title="El carrito se habilitará en la siguiente etapa"
                        >
                            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                            <span>Próximamente</span>
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

        const modal = document.querySelector('#producto-modal');
        const fondoModal = document.querySelector('#producto-modal-fondo');
        const botonCerrar = document.querySelector('#producto-modal-cerrar');
        const marcoImagen = document.querySelector('#producto-modal-marco');
        const imagenModal = document.querySelector('#producto-modal-imagen');
        const miniaturas = document.querySelector('#producto-modal-miniaturas');
        const botonAnterior = document.querySelector('#producto-modal-anterior');
        const botonSiguiente = document.querySelector('#producto-modal-siguiente');
        const contadorImagen = document.querySelector('#producto-modal-contador');

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
            modal,
            fondoModal,
            botonCerrar,
            marcoImagen,
            imagenModal,
            miniaturas,
            botonAnterior,
            botonSiguiente,
            contadorImagen,
            ...Object.values(camposModal)
        ];

        if (elementosRequeridos.some((elemento) => !elemento)) {
            return;
        }

        if (typeof productos === 'undefined' || !Array.isArray(productos)) {
            grid.replaceChildren();
            resumen.textContent = 'No fue posible cargar el catálogo.';
            estadoVacio.hidden = false;
            return;
        }

        const productosActivos = productos.filter((producto) => producto?.activo === true);
        let productoActual = null;
        let imagenesActuales = [];
        let indiceImagenActual = 0;
        let botonQueAbrioModal = null;

        const modalEstaAbierto = () => modal.getAttribute('aria-hidden') === 'false';

        /**
         * Muestra una fotografía de la galería.
         * @param {number} nuevoIndice Posición solicitada.
         */
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

        /**
         * Abre la ventana con los datos de un producto.
         * @param {object} producto Producto seleccionado.
         * @param {HTMLElement} botonOrigen Botón que abrió la ventana.
         */
        const abrirModal = (producto, botonOrigen) => {
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

            crearMiniaturas();
            mostrarImagenModal(0);

            modal.classList.add('activo');
            fondoModal.classList.add('activo');
            modal.setAttribute('aria-hidden', 'false');
            fondoModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-producto-abierto');

            window.requestAnimationFrame(() => botonCerrar.focus());
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
        };

        if (productosActivos.length === 0) {
            grid.replaceChildren();
            resumen.textContent = '0 productos disponibles';
            estadoVacio.hidden = false;
            return;
        }

        estadoVacio.hidden = true;
        resumen.textContent = `${productosActivos.length} ${
            productosActivos.length === 1 ? 'producto disponible' : 'productos disponibles'
        }`;

        grid.innerHTML = productosActivos.map(crearTarjetaProducto).join('');

        // Si una ruta está mal escrita, mostramos una tarjeta estable en lugar del icono roto.
        grid.querySelectorAll('.producto-media img').forEach((imagen) => {
            imagen.addEventListener('error', () => {
                const contenedor = imagen.closest('.producto-media');

                contenedor?.classList.add('imagen-error');
                imagen.remove();
            }, { once: true });
        });

        grid.addEventListener('click', (evento) => {
            const boton = evento.target.closest('[data-accion="abrir-producto"]');

            if (!boton || !grid.contains(boton)) {
                return;
            }

            const idProducto = boton.dataset.productoId;
            const producto = productosActivos.find(
                (item) => String(item.id) === String(idProducto)
            );

            if (producto) {
                abrirModal(producto, boton);
            }
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

            // Mantiene la navegación por teclado dentro del modal.
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
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarCatalogo);
    } else {
        iniciarCatalogo();
    }
})();
