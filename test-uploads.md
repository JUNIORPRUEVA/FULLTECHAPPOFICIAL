# Pruebas de Subida de Imágenes

## 1. Probar subir imagen de producto

```bash
curl -X POST \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -F "nombre=Producto Test" \
  -F "precio=100" \
  -F "stock=10" \
  -F "image=@./ruta/a/imagen.jpg" \
  https://fulltechsales-api-importante-fulltechappoficial.gcdndd.easypanel.host/api/products
```

**Respuesta esperada:**
```json
{
  "ok": true,
  "product": {
    "id": 1,
    "nombre": "Producto Test",
    "precio": 100,
    "stock": 10,
    "imagen_url": "https://fulltechsales-api-importante-fulltechappoficial.gcdndd.easypanel.host/uploads/products/1734345678901-123456789.jpg"
  }
}
```

## 2. Verificar que la imagen es accesible

Copia la URL `imagen_url` de la respuesta y ábrela en el navegador o usa curl:

```bash
curl -I https://fulltechsales-api-importante-fulltechappoficial.gcdndd.easypanel.host/uploads/products/1734345678901-123456789.jpg
```

**Respuesta esperada:** `HTTP/1.1 200 OK`

## 3. Verificar dentro del contenedor (EasyPanel Console)

Accede a la consola del contenedor en EasyPanel y ejecuta:

```bash
ls -la /app/uploads
ls -la /app/uploads/products
```

**Esperado:** Ver archivos de imágenes con timestamps.

## 4. Si hay error de permisos (EACCES)

Si el error es de permisos, añade al Dockerfile (si existe):

```dockerfile
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads
```

Y vuelve a hacer deploy.

## 5. Verificar logs al iniciar la app

En los logs de EasyPanel deberías ver:

```
📁 Directorio de uploads creado: /app/uploads/products
📂 Sirviendo archivos estáticos desde: /app/uploads
```

## Variables de Entorno Requeridas en EasyPanel

```bash
UPLOAD_DIR=/app/uploads
PUBLIC_BASE_URL=https://fulltechsales-api-importante-fulltechappoficial.gcdndd.easypanel.host
```

## Volumen en EasyPanel

Asegúrate de tener un volumen montado en:
- **Punto de montaje:** `/app/uploads`
- **Tipo:** Persistent Volume

Esto garantiza que las imágenes sobrevivan a los reinicios del contenedor.
