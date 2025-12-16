// EJEMPLO DE CÓMO LLAMAR EL DIALOG ACTUALIZADO
// Pegalo en el archivo/widget donde llamas el DialogCrearProducto

import 'package:fulltechsale/data/remote_api.dart';

// En tu clase/widget que tiene productos
class MiPantallaProductos {
  final RemoteAPI remoteAPI = RemoteAPI(); // ← Instancia de RemoteAPI
  
  void abrirDialogCrearProducto(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => DialogCrearProducto(
        remoteAPI: remoteAPI,  // ← Pasar la instancia
      ),
    ).then((producto) {
      if (producto != null) {
        // Producto fue creado exitosamente
        print('Producto creado: ${producto.nombre}');
        print('Imagen URL: ${producto.imagenUrl}');
        
        // Aquí puedes:
        // - Agregar a lista local
        // - Refrescar lista desde servidor
        // - Mostrar confirmación
        setState(() {
          // agregar producto a tu lista
          // miListaProductos.add(producto);
        });
      }
    });
  }
}

// ============================================
// SI USAS PROVIDER O GET_IT PARA INYECTAR DEPENDENCIAS:

// 📌 EN main.dart O setup_dependencies.dart:
void setupDependencies() {
  // Si usas GetIt
  getIt.registerSingleton<RemoteAPI>(RemoteAPI());
  
  // O si usas Provider
  providers: [
    ChangeNotifierProvider(create: (_) => RemoteAPI()),
  ],
}

// 📌 EN tu widget:
class MiPantallaProductos extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () {
        // Si usas GetIt
        final remoteAPI = getIt<RemoteAPI>();
        
        // Si usas Provider
        final remoteAPI = Provider.of<RemoteAPI>(context, listen: false);
        
        showDialog(
          context: context,
          builder: (_) => DialogCrearProducto(remoteAPI: remoteAPI),
        );
      },
      child: Icon(Icons.add),
    );
  }
}

// ============================================
// RESPUESTA ESPERADA AL CREAR PRODUCTO:

/*
✅ RESPUESTA 200/201 DEL SERVIDOR:

{
  "ok": true,
  "message": "Producto creado exitosamente",
  "product": {
    "id": 123,
    "nombre": "Producto Test 164501",
    "categoria": "PRODUCTOS",
    "precio": 99.99,
    "costo": 50,
    "cantidad": 10,
    "imagen_url": "https://fulltechsales-api.../uploads/products/1234567890_uuid.jpg",
    "estado": "activo",
    "fecha_creado": "2025-12-16T16:45:01.000Z"
  }
}

✅ RESPUESTA 400 - ERROR DE VALIDACIÓN:

{
  "ok": false,
  "message": "Validación fallida: precio debe ser mayor a 0"
}

✅ RESPUESTA 404 - ENDPOINT NO ENCONTRADO:

{
  "ok": false,
  "message": "Cannot POST /api/products"
}
*/

// ============================================
// FLUJO DE DATOS COMPLETO:

/*
1. Usuario abre dialog
   ↓
2. Selecciona imagen con FilePicker
   ↓
3. Ingresa nombre, precio, costo, cantidad
   ↓
4. Presiona "GUARDAR"
   ↓
5. Dialog valida todos los campos localmente
   ↓
6. Envía multipart/form-data a POST /api/products
   - nombre (texto)
   - categoria (texto)
   - precio (número)
   - costo (número)
   - cantidad (número)
   - image (archivo binario)
   ↓
7. Backend valida y sube imagen a /workspace/uploads/products/
   ↓
8. Backend devuelve respuesta 200 con URL pública
   ↓
9. Flutter mapea respuesta a Producto
   ↓
10. Dialog cierra
    ↓
11. SnackBar muestra mensaje de éxito
    ↓
12. Producto está disponible en app
*/
