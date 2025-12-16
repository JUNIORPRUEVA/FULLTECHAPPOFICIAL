import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import '../data/producto_model.dart';
import '../data/remote_api.dart';

class ProductoFormScreen extends StatefulWidget {
  final Producto? producto;

  const ProductoFormScreen({Key? key, this.producto}) : super(key: key);

  @override
  _ProductoFormScreenState createState() => _ProductoFormScreenState();
}

class _ProductoFormScreenState extends State<ProductoFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _api = RemoteAPI();

  late TextEditingController _nombreController;
  late TextEditingController _categoriaController;
  late TextEditingController _costoController;
  late TextEditingController _precioController;
  late TextEditingController _cantidadController;
  late TextEditingController _codigoBarraController;

  File? _selectedImage;
  String? _imagenUrl;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nombreController = TextEditingController(text: widget.producto?.nombre ?? '');
    _categoriaController = TextEditingController(text: widget.producto?.categoria ?? '');
    _costoController = TextEditingController(text: widget.producto?.costo?.toString() ?? '');
    _precioController = TextEditingController(text: widget.producto?.precio?.toString() ?? '');
    _cantidadController = TextEditingController(text: widget.producto?.cantidad?.toString() ?? '');
    _codigoBarraController = TextEditingController(text: widget.producto?.codigoBarra ?? '');
    _imagenUrl = widget.producto?.imagenUrl;
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _categoriaController.dispose();
    _costoController.dispose();
    _precioController.dispose();
    _cantidadController.dispose();
    _codigoBarraController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      // Desktop: usar file_picker con extensiones limitadas
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        allowMultiple: false,
      );
      if (result != null) {
        setState(() {
          _selectedImage = File(result.files.single.path!);
        });
      }
    } else {
      // Mobile: usar image_picker
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: ImageSource.gallery);
      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
        });
      }
    }
  }

  Future<void> _saveProducto() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final producto = Producto(
        id: widget.producto?.id,
        nombre: _nombreController.text,
        categoria: _categoriaController.text.isEmpty ? null : _categoriaController.text,
        costo: double.tryParse(_costoController.text),
        precio: double.tryParse(_precioController.text),
        cantidad: int.tryParse(_cantidadController.text),
        codigoBarra: _codigoBarraController.text.isEmpty ? null : _codigoBarraController.text,
        estado: 'activo',
      );

      if (widget.producto == null) {
        // Crear
        await _api.createProducto(producto, _selectedImage);
      } else {
        // Actualizar
        await _api.updateProducto(widget.producto!.id!, producto, _selectedImage);
      }

      Navigator.of(context).pop(true); // Regresar con éxito
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.producto == null ? 'Crear Producto' : 'Editar Producto'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nombreController,
                decoration: const InputDecoration(labelText: 'Nombre'),
                validator: (value) => value!.isEmpty ? 'Requerido' : null,
              ),
              TextFormField(
                controller: _categoriaController,
                decoration: const InputDecoration(labelText: 'Categoría'),
              ),
              TextFormField(
                controller: _costoController,
                decoration: const InputDecoration(labelText: 'Costo'),
                keyboardType: TextInputType.number,
              ),
              TextFormField(
                controller: _precioController,
                decoration: const InputDecoration(labelText: 'Precio'),
                keyboardType: TextInputType.number,
              ),
              TextFormField(
                controller: _cantidadController,
                decoration: const InputDecoration(labelText: 'Cantidad'),
                keyboardType: TextInputType.number,
              ),
              TextFormField(
                controller: _codigoBarraController,
                decoration: const InputDecoration(labelText: 'Código de Barra'),
              ),
              const SizedBox(height: 16),
              const Text('Imagen del Producto'),
              const SizedBox(height: 8),
              if (_imagenUrl != null && _selectedImage == null)
                Image.network(_imagenUrl!, height: 100, width: 100, fit: BoxFit.cover)
              else if (_selectedImage != null)
                Image.file(_selectedImage!, height: 100, width: 100, fit: BoxFit.cover)
              else
                Container(
                  height: 100,
                  width: 100,
                  color: Colors.grey[300],
                  child: const Icon(Icons.image, size: 50),
                ),
              ElevatedButton(
                onPressed: _pickImage,
                child: const Text('Seleccionar Imagen'),
              ),
              const SizedBox(height: 16),
              _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _saveProducto,
                      child: Text(widget.producto == null ? 'Crear' : 'Actualizar'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}