# FULLTECH API - Instrucciones para Easypanel

## Persistencia de Imágenes

Para que las imágenes de productos persistan al reiniciar el contenedor en Easypanel:

1. Ve a tu proyecto en Easypanel.
2. En "Volumes", crea un nuevo volumen:
   - **Container Path**: `/workspace/uploads`
   - Elige un volumen persistente (no temporal).

Esto montará un directorio persistente en `/workspace/uploads`, donde se guardan las imágenes.

## Verificación

Después de desplegar:
- Las imágenes se guardan en `/workspace/uploads/products/`
- URLs públicas: `https://tu-dominio/uploads/products/<archivo>`
- Accede sin token: Abre la URL en navegador.

## Problemas Comunes

- **Cannot find module 'multer'**: Asegúrate de que `multer` esté en `package.json` y se instale en el build. Si persiste, fuerza un redeploy.
- **Error 500 en uploads**: Verifica que el volumen esté montado correctamente en `/workspace/uploads`.
- **Imágenes no visibles**: Confirma que `/uploads` esté servido como estático.