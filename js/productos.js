/*=========================================================
PROYECTO: ATLAS

ARCHIVO: productos.js

FUNCIÓN:
Almacena la información del catálogo.
Este archivo puede ser actualizado por ATLAS Gestor Local.
=========================================================*/

const productos = [
    {
        "id": 1,
        "codigo": "ATL-SNK-001",
        "marca": "Nike",
        "modelo": "Nike Retro 1 Dior",
        "color": "Azul, gris y blanco",
        "tipo": "Réplica",
        "precio": 210000,
        "moneda": "COP",
        "tallas": [
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44
        ],
        "sistemaTallas": "EUR",
        "confirmarDisponibilidad": true,
        "descripcion": "Sneaker de estilo urbano con silueta retro y una combinación de tonos azules, grises y blancos.",
        "categoria": "Urbano",
        "imagenes": [
            "img/productos/atl-snk-001/atl-snk-001-01.jpeg",
            "img/productos/atl-snk-001/atl-snk-001-02.jpeg",
            "img/productos/atl-snk-001/atl-snk-001-03.jpeg"
        ],
        "estado": "disponible",
        "destacado": true,
        "fechaCreacion": "2026-07-27",
        "activo": true
    },
    {
        "id": 2,
        "codigo": "ATL-SNK-002",
        "marca": "Adidas",
        "modelo": "Adidas Yeezy",
        "color": "Gris, negro, verde, azul y naranja",
        "tipo": "Réplica",
        "precio": 200000,
        "moneda": "COP",
        "tallas": [
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44
        ],
        "sistemaTallas": "EUR",
        "confirmarDisponibilidad": true,
        "descripcion": "Sneaker de perfil robusto y estética deportiva, presentado en una combinación multicolor.",
        "categoria": "Deportivo",
        "imagenes": [
            "img/productos/atl-snk-002/atl-snk-002-01.jpeg",
            "img/productos/atl-snk-002/atl-snk-002-02.jpeg",
            "img/productos/atl-snk-002/atl-snk-002-03.jpeg",
            "img/productos/atl-snk-002/atl-snk-002-04.jpeg"
        ],
        "estado": "disponible",
        "destacado": true,
        "fechaCreacion": "2026-07-27",
        "activo": true
    },
    {
        "id": 3,
        "codigo": "ATL-SNK-003",
        "marca": "Clemont",
        "modelo": "Clemont",
        "color": "Negro y rojo",
        "tipo": "Réplica",
        "precio": 200000,
        "moneda": "COP",
        "tallas": [
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44
        ],
        "sistemaTallas": "EUR",
        "confirmarDisponibilidad": true,
        "descripcion": "Sneaker urbano negro con detalles rojos de alto contraste y una estética fuerte y distintiva.",
        "categoria": "Urbano",
        "imagenes": [
            "img/productos/atl-snk-003/atl-snk-003-01.jpeg",
            "img/productos/atl-snk-003/atl-snk-003-02.jpeg",
            "img/productos/atl-snk-003/atl-snk-003-03.jpeg"
        ],
        "estado": "disponible",
        "destacado": false,
        "fechaCreacion": "2026-07-27",
        "activo": true
    },
    {
        "id": 4,
        "codigo": "ATL-SNK-004",
        "marca": "Vans",
        "modelo": "Vans Old Skool",
        "color": "Negro",
        "tipo": "Réplica",
        "precio": 210000,
        "moneda": "COP",
        "tallas": [
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44
        ],
        "sistemaTallas": "EUR",
        "confirmarDisponibilidad": true,
        "descripcion": "Sneaker urbano en color negro total, con diseño clásico y acabado monocromático.",
        "categoria": "Urbano",
        "imagenes": [
            "img/productos/atl-snk-004/atl-snk-004-01.jpeg",
            "img/productos/atl-snk-004/atl-snk-004-02.jpeg",
            "img/productos/atl-snk-004/atl-snk-004-03.jpeg",
            "img/productos/atl-snk-004/atl-snk-004-04.jpeg"
        ],
        "estado": "disponible",
        "destacado": false,
        "fechaCreacion": "2026-07-28",
        "activo": true
    },
    {
        "id": 5,
        "codigo": "ATL-SNK-005",
        "marca": "Timberland",
        "modelo": "Boots Timberland",
        "color": "Amarillo Trigo",
        "tipo": "Réplica",
        "precio": 200000,
        "moneda": "COP",
        "tallas": [
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44
        ],
        "sistemaTallas": "EUR",
        "confirmarDisponibilidad": true,
        "descripcion": "Botas Timberland clásicas en color amarillo trigo, con un diseño icónico de caña alta, estilo robusto y versátil, ideal para combinar con atuendos urbanos y casuales.",
        "categoria": "Urbano",
        "imagenes": [
            "img/productos/atl-snk-005/atl-snk-005-01.jpeg",
            "img/productos/atl-snk-005/atl-snk-005-02.jpeg",
            "img/productos/atl-snk-005/atl-snk-005-03.jpeg",
            "img/productos/atl-snk-005/atl-snk-005-04.jpeg"
        ],
        "estado": "disponible",
        "destacado": false,
        "fechaCreacion": "2026-07-29",
        "activo": true
    },
    {
        "id": 6,
        "codigo": "ATL-SNK-006",
        "marca": "Nike",
        "modelo": "Air Jordan Retro 3",
        "color": "blanco, beige, gris",
        "tipo": "Réplica",
        "precio": 200000,
        "moneda": "COP",
        "tallas": [
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44
        ],
        "sistemaTallas": "EUR",
        "confirmarDisponibilidad": true,
        "descripcion": "Los Air Jordán 3 Retro combinan el legendario estampado de elefante con la máxima comodidad del Streetwear.",
        "categoria": "Urbano",
        "imagenes": [
            "img/productos/atl-snk-006/atl-snk-006-01.jpeg",
            "img/productos/atl-snk-006/atl-snk-006-02.jpeg",
            "img/productos/atl-snk-006/atl-snk-006-03.jpeg",
            "img/productos/atl-snk-006/atl-snk-006-04.jpeg"
        ],
        "estado": "disponible",
        "destacado": false,
        "fechaCreacion": "2026-07-29",
        "activo": true
    }
];
