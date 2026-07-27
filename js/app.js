/*=========================================================
PROYECTO: ATLAS

ARCHIVO: app.js

VERSIÓN: 0.2.3 Alpha

FUNCIÓN:
Controlar el slider del Hero, el menú móvil y el efecto del Header al hacer scroll.

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

