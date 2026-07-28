/*=========================================================
PROYECTO: ATLAS

ARCHIVO: productos.js

VERSIÓN: 0.3.1

FUNCIÓN:
Almacena la información inicial del catálogo.
=========================================================*/

const productos = [
    {
        id: 1,
        codigo: "ATL-SNK-001",
        marca: "Nike",
        modelo: "Nike Retro 1 Dior",
        color: "Azul, gris y blanco",
        tipo: "Réplica",
        precio: 210000,
        moneda: "COP",

        tallas: [36, 37, 38, 39, 40, 41, 42, 43, 44],
        sistemaTallas: "EUR",
        confirmarDisponibilidad: true,

        descripcion:
            "Sneaker de estilo urbano con silueta retro y una combinación de tonos azules, grises y blancos.",

        categoria: "Urbano",

        imagenes: [
            "img/productos/atl-snk-001/atl-snk-001-01.jpeg",
            "img/productos/atl-snk-001/atl-snk-001-02.jpeg",
            "img/productos/atl-snk-001/atl-snk-001-03.jpeg"
        ],

        estado: "disponible",
        destacado: true,
        fechaCreacion: "2026-07-27",
        activo: true
    },

    {
        id: 2,
        codigo: "ATL-SNK-002",
        marca: "Adidas",
        modelo: "Adidas Yeezy",
        color: "Gris, negro, verde, azul y naranja",
        tipo: "Réplica",
        precio: 200000,
        moneda: "COP",

        tallas: [36, 37, 38, 39, 40, 41, 42, 43, 44],
        sistemaTallas: "EUR",
        confirmarDisponibilidad: true,

        descripcion:
            "Sneaker de perfil robusto y estética deportiva, presentado en una combinación multicolor.",

        categoria: "Deportivo",

        imagenes: [
            "img/productos/atl-snk-002/atl-snk-002-01.jpeg",
            "img/productos/atl-snk-002/atl-snk-002-02.jpeg",
            "img/productos/atl-snk-002/atl-snk-002-03.jpeg",
            "img/productos/atl-snk-002/atl-snk-002-04.jpeg"
        ],

        estado: "disponible",
        destacado: true,
        fechaCreacion: "2026-07-27",
        activo: true
    },

    {
        id: 3,
        codigo: "ATL-SNK-003",
        marca: "Clemont",
        modelo: "Clemont",
        color: "Negro y rojo",
        tipo: "Réplica",
        precio: 200000,
        moneda: "COP",

        tallas: [36, 37, 38, 39, 40, 41, 42, 43, 44],
        sistemaTallas: "EUR",
        confirmarDisponibilidad: true,

        descripcion:
            "Sneaker urbano negro con detalles rojos de alto contraste y una estética fuerte y distintiva.",

        categoria: "Urbano",

        imagenes: [
            "img/productos/atl-snk-003/atl-snk-003-01.jpeg",
            "img/productos/atl-snk-003/atl-snk-003-02.jpeg",
            "img/productos/atl-snk-003/atl-snk-003-03.jpeg"
        ],

        estado: "disponible",
        destacado: false,
        fechaCreacion: "2026-07-27",
        activo: true
    }
];
