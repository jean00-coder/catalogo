/*=========================================================
PROYECTO: ATLAS
ARCHIVO: supabase-config.js
VERSIÓN: 0.8.0

FUNCIÓN:
Configuración pública del catálogo para consultar Supabase.
La Publishable Key es apta para frontend; la seguridad depende
sobre RLS. Nunca usar service_role ni sb_secret_ aquí.
=========================================================*/

(() => {
    'use strict';

    window.ATLASSupabaseConfig = Object.freeze({
        url: "https://lnypjlaayyxtmgpsxqyf.supabase.co",
        publishableKey: "sb_publishable__B19n83jtDr_cLvEXotcJg_le0k6N_B",
        bucketProductos: 'product-images'
    });
})();
