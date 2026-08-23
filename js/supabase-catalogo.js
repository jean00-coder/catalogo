/*=========================================================
PROYECTO: ATLAS
ARCHIVO: supabase-catalogo.js
VERSIÓN: 0.8.0

FUNCIÓN:
Leer productos PUBLICADOS y ACTIVOS desde Supabase y combinarlos
con productos.js durante la transición. Si Supabase falla, el
catálogo local continúa funcionando como respaldo.
=========================================================*/

(() => {
    'use strict';

    const normalizarCodigo = (valor) => String(valor || '').trim().toLowerCase();
    const rutasFirmadas = new Map();

    const obtenerProductosLocales = () => {
        try {
            return (typeof productos !== 'undefined' && Array.isArray(productos))
                ? productos.map((producto) => ({ ...producto }))
                : [];
        } catch (error) {
            console.warn('ATLAS: no fue posible leer el respaldo local.', error);
            return [];
        }
    };

    const firmarRuta = async (cliente, bucket, ruta) => {
        if (!ruta) return '';
        if (rutasFirmadas.has(ruta)) return rutasFirmadas.get(ruta);

        const { data, error } = await cliente.storage
            .from(bucket)
            .createSignedUrl(ruta, 21600);

        if (error || !data?.signedUrl) {
            console.warn(`ATLAS: no fue posible preparar la imagen ${ruta}.`, error || 'Sin URL firmada');
            return '';
        }

        rutasFirmadas.set(ruta, data.signedUrl);
        return data.signedUrl;
    };

    const agruparImagenes = async (cliente, bucket, registros) => {
        const porProducto = new Map();
        const ordenados = [...registros].sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));

        await Promise.all(ordenados.map(async (imagen) => {
            const url = await firmarRuta(cliente, bucket, imagen.storage_path);
            if (!url) return;

            const lista = porProducto.get(imagen.product_id) || [];
            lista.push({
                orden: Number(imagen.orden || 0),
                url
            });
            porProducto.set(imagen.product_id, lista);
        }));

        for (const [productId, lista] of porProducto.entries()) {
            lista.sort((a, b) => a.orden - b.orden);
            porProducto.set(productId, lista.map((item) => item.url));
        }

        return porProducto;
    };

    const transformarProducto = (producto, imagenes) => ({
        // El catálogo histórico usa IDs numéricos; usar el código aquí mantiene
        // compatibles modal, carrito y enlaces sin exponer lógica interna UUID.
        id: producto.codigo,
        idSupabase: producto.id,
        codigo: producto.codigo,
        slug: producto.slug,
        familia: producto.familia || (/^ATL-ACC-/i.test(producto.codigo || '') ? 'Accesorios' : 'Calzado'),
        subcategoria: producto.subcategoria || (producto.familia === 'Accesorios' ? 'Relojes' : 'Tenis'),
        marca: producto.marca,
        modelo: producto.modelo,
        color: producto.color,
        tipo: producto.tipo || (producto.familia === 'Accesorios' ? 'Accesorio' : 'Réplica'),
        precio: Number(producto.precio),
        moneda: producto.moneda || 'COP',
        tallas: Array.isArray(producto.tallas) ? producto.tallas : [],
        sistemaTallas: producto.sistema_tallas || (producto.familia === 'Accesorios' ? null : 'EUR'),
        materialCorrea: producto.material_correa || '',
        tipoCierre: producto.tipo_cierre || '',
        cantidadDisponible: producto.cantidad_disponible,
        confirmarDisponibilidad: producto.confirmar_disponibilidad !== false,
        descripcion: producto.descripcion || '',
        categoria: producto.categoria || producto.subcategoria || '',
        imagenes: imagenes || [],
        estado: producto.estado_comercial || 'disponible',
        destacado: producto.destacado === true,
        fechaCreacion: producto.fecha_publicacion || producto.fecha_creacion || '',
        activo: producto.activo === true,
        estadoPublicacion: producto.estado_publicacion,
        fuenteDatos: 'supabase'
    });

    const reemplazarCatalogoGlobal = (productosFinales) => {
        if (typeof productos === 'undefined' || !Array.isArray(productos)) {
            throw new Error('No existe el arreglo global de productos locales.');
        }

        productos.splice(0, productos.length, ...productosFinales);
    };

    window.ATLAS_CATALOGO_LISTO = (async () => {
        const locales = obtenerProductosLocales();
        const config = window.ATLASSupabaseConfig;

        if (!config?.url || !config?.publishableKey || !window.supabase?.createClient) {
            console.warn('ATLAS: Supabase no está disponible. Se mantiene productos.js como respaldo.');
            window.ATLAS_CATALOGO_FUENTE = 'local';
            return { ok: false, fuente: 'local', locales: locales.length, online: 0 };
        }

        try {
            const cliente = window.supabase.createClient(
                config.url,
                config.publishableKey,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            );

            const { data: productosOnline, error: errorProductos } = await cliente
                .from('products')
                .select('id,codigo,slug,familia,subcategoria,marca,modelo,color,tipo,precio,moneda,tallas,sistema_tallas,material_correa,tipo_cierre,cantidad_disponible,confirmar_disponibilidad,descripcion,categoria,estado_comercial,destacado,estado_publicacion,activo,fecha_creacion,fecha_publicacion')
                .eq('estado_publicacion', 'publicado')
                .eq('activo', true)
                .order('fecha_publicacion', { ascending: false, nullsFirst: false });

            if (errorProductos) throw errorProductos;

            const online = Array.isArray(productosOnline) ? productosOnline : [];
            const ids = online.map((producto) => producto.id).filter(Boolean);
            let registrosImagenes = [];

            if (ids.length > 0) {
                const { data, error } = await cliente
                    .from('product_images')
                    .select('product_id,storage_path,orden,alt_text')
                    .in('product_id', ids)
                    .order('orden', { ascending: true });

                if (error) throw error;
                registrosImagenes = Array.isArray(data) ? data : [];
            }

            const imagenesPorProducto = await agruparImagenes(
                cliente,
                config.bucketProductos || 'product-images',
                registrosImagenes
            );

            const transformados = online.map((producto) => transformarProducto(
                producto,
                imagenesPorProducto.get(producto.id) || []
            ));

            // Durante la transición conservamos los 47 productos históricos de
            // productos.js. Cuando un mismo código exista en Supabase, Supabase
            // tiene prioridad para evitar duplicados y permitir migración gradual.
            const porCodigo = new Map();
            locales.forEach((producto) => {
                const codigo = normalizarCodigo(producto.codigo);
                if (codigo) porCodigo.set(codigo, producto);
            });
            transformados.forEach((producto) => {
                const codigo = normalizarCodigo(producto.codigo);
                if (codigo) porCodigo.set(codigo, producto);
            });

            const finales = Array.from(porCodigo.values());
            reemplazarCatalogoGlobal(finales);

            window.ATLAS_CATALOGO_FUENTE = transformados.length > 0 ? 'hibrido' : 'local+supabase';
            window.ATLAS_SUPABASE_CATALOGO = Object.freeze({
                cliente,
                productosOnline: transformados.length,
                productosLocales: locales.length,
                total: finales.length
            });

            console.info(`ATLAS: catálogo listo con ${locales.length} locales + ${transformados.length} publicados desde Supabase (${finales.length} totales).`);
            return {
                ok: true,
                fuente: window.ATLAS_CATALOGO_FUENTE,
                locales: locales.length,
                online: transformados.length,
                total: finales.length
            };
        } catch (error) {
            console.error('ATLAS: Supabase no respondió; se mantiene productos.js como respaldo.', error);
            window.ATLAS_CATALOGO_FUENTE = 'local';
            return { ok: false, fuente: 'local', locales: locales.length, online: 0, error };
        }
    })();
})();
