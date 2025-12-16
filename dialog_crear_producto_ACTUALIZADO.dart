// lib/modules/productos/dialogs/dialog_crear_producto.dart
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../../data/remote_api.dart';
import '../../../utils/app_colors.dart';
import '../producto_model.dart';

class DialogCrearProducto extends StatefulWidget {
  final RemoteAPI remoteAPI;

  const DialogCrearProducto({
    super.key,
    required this.remoteAPI,
  });

  @override
  State<DialogCrearProducto> createState() => _DialogCrearProductoState();
}

class _DialogCrearProductoState extends State<DialogCrearProducto> {
  final _nombreCtrl = TextEditingController();
  final _precioCtrl = TextEditingController();
  final _costoCtrl = TextEditingController();
  final _cantidadCtrl = TextEditingController();

  String _categoria = "PRODUCTOS";
  String? _imagenLocalPath;
  bool _guardando = false;
  String? _mensajeError;

  final List<String> categorias = [
    "CAMARAS",
    "MOTORES",
    "POS",
    "PRODUCTOS",
    "CAPSULAS",
  ];

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _precioCtrl.dispose();
    _costoCtrl.dispose();
    _cantidadCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      titlePadding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
      contentPadding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
      title: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.azulPrimario.withOpacity(.12),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(
              Icons.inventory_2_outlined,
              color: AppColors.azulPrimario,
              size: 20,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            "NUEVO PRODUCTO",
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 18,
              letterSpacing: .6,
              color: AppColors.azulPrimario,
            ),
          ),
        ],
      ),
      content: SizedBox(
        width: 520,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ❌ Mensaje de error si existe
              if (_mensajeError != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _mensajeError!,
                          style: const TextStyle(
                            color: Colors.red,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              _inputTexto("Nombre del producto", _nombreCtrl),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _inputNumero(
                      label: "Precio (venta)",
                      controller: _precioCtrl,
                      hint: "0.00",
                      textInputAction: TextInputAction.next,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _inputNumero(
                      label: "Costo",
                      controller: _costoCtrl,
                      hint: "0.00",
                      textInputAction: TextInputAction.next,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _inputNumero(
                label: "Cantidad en inventario",
                controller: _cantidadCtrl,
                hint: "0",
                soloEnteros: true,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _onGuardar(),
              ),
              const SizedBox(height: 16),
              Text(
                "Categoría",
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.azulPrimario,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _categoria,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
                items: categorias
                    .map(
                      (c) => DropdownMenuItem(
                        value: c,
                        child: Text(
                          c,
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (value) =>
                    setState(() => _categoria = value ?? _categoria),
              ),
              const SizedBox(height: 18),
              Text(
                "Imagen del producto",
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.azulPrimario,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: AppColors.azulPrimario.withOpacity(.05),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.azulPrimario.withOpacity(.18),
                      ),
                    ),
                    child: _imagenLocalPath == null
                        ? Icon(
                          Icons.image_outlined,
                          color: AppColors.azulPrimario.withOpacity(.4),
                          size: 32,
                        )
                        : ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.file(
                            File(_imagenLocalPath!),
                            fit: BoxFit.cover,
                          ),
                        ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _guardando ? null : _pickImage,
                      icon: Icon(
                        Icons.upload_rounded,
                        color: AppColors.azulPrimario,
                        size: 18,
                      ),
                      label: Text(
                        _imagenLocalPath == null
                            ? "SUBIR DESDE EL ORDENADOR"
                            : "CAMBIAR IMAGEN",
                        style: TextStyle(
                          color: AppColors.azulPrimario,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        side: BorderSide(
                          color: AppColors.azulPrimario.withOpacity(.4),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      actionsPadding: const EdgeInsets.fromLTRB(24, 4, 24, 16),
      actions: [
        TextButton(
          child: const Text(
            "CANCELAR",
            style: TextStyle(
              fontWeight: FontWeight.w600,
              letterSpacing: .6,
            ),
          ),
          onPressed: _guardando ? null : () => Navigator.pop(context),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.azulPrimario,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          onPressed: _guardando ? null : _onGuardar,
          child: _guardando
              ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
              : const Text(
                "GUARDAR",
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1,
                ),
              ),
        ),
      ],
    );
  }

  Widget _inputTexto(String label, TextEditingController ctrl) {
    return TextField(
      controller: ctrl,
      textCapitalization: TextCapitalization.words,
      textInputAction: TextInputAction.next,
      inputFormatters: [
        FilteringTextInputFormatter.allow(
          RegExp(r"[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.,#]"),
        ),
      ],
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  Widget _inputNumero({
    required String label,
    required TextEditingController controller,
    String? hint,
    bool soloEnteros = false,
    TextInputAction textInputAction = TextInputAction.next,
    void Function(String)? onSubmitted,
  }) {
    return TextField(
      controller: controller,
      keyboardType: soloEnteros
          ? TextInputType.number
          : const TextInputType.numberWithOptions(decimal: true),
      textInputAction: textInputAction,
      onSubmitted: onSubmitted,
      inputFormatters: [
        FilteringTextInputFormatter.allow(
          soloEnteros ? RegExp(r"[0-9]") : RegExp(r"[0-9\.,]"),
        ),
      ],
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        labelStyle: const TextStyle(fontSize: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  Future<void> _pickImage() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    );
    
    if (result == null || result.files.single.path == null) return;

    final originalPath = result.files.single.path!;
    final docs = await getApplicationDocumentsDirectory();
    final imagesDir = Directory(p.join(docs.path, 'fulltech', 'productos'));

    if (!await imagesDir.exists()) {
      await imagesDir.create(recursive: true);
    }

    final ext = p.extension(originalPath);
    final fileName =
        'prod_${DateTime.now().millisecondsSinceEpoch}${ext.isEmpty ? '.jpg' : ext}';
    final newPath = p.join(imagesDir.path, fileName);

    final copied = await File(originalPath).copy(newPath);

    setState(() {
      _imagenLocalPath = copied.path;
      _mensajeError = null;
    });
  }

  void _onGuardar() async {
    if (_guardando) return;

    // 🔍 Validaciones
    final nombre = _nombreCtrl.text.trim();
    if (nombre.isEmpty) {
      setState(() => _mensajeError = "El nombre del producto es requerido");
      return;
    }

    final precio = double.tryParse(_precioCtrl.text.replaceAll(',', '.'));
    if (precio == null || precio <= 0) {
      setState(() => _mensajeError = "Ingresa un precio válido");
      return;
    }

    final cantidad = int.tryParse(_cantidadCtrl.text);
    if (cantidad == null || cantidad < 0) {
      setState(() => _mensajeError = "Ingresa una cantidad válida");
      return;
    }

    if (_imagenLocalPath == null) {
      setState(() => _mensajeError = "Debes seleccionar una imagen");
      return;
    }

    setState(() {
      _guardando = true;
      _mensajeError = null;
    });

    try {
      // 📤 Subir producto con imagen usando multipart
      final productoCreado = await widget.remoteAPI.crearProductoConImagen(
        nombre: nombre,
        categoria: _categoria,
        precio: precio,
        costo: double.tryParse(_costoCtrl.text.replaceAll(',', '.')) ?? 0,
        cantidad: cantidad,
        imagenPath: _imagenLocalPath!,
      );

      if (!mounted) return;

      // ✅ Éxito - Cerrar dialog y retornar producto
      Navigator.pop(context, productoCreado);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Producto "${productoCreado.nombre}" creado exitosamente'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      setState(() {
        _guardando = false;
        _mensajeError = e.toString().replaceAll('Exception: ', '');
      });
    }
  }
}
