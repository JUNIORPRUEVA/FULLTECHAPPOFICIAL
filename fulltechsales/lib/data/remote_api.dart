import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';
import 'cliente_model.dart';
import 'producto_model.dart';

class RemoteAPI {
  static const String baseUrl = "https://fulltechsales-api-importante-fulltechappoficial.gcdndd.easypanel.host/api";

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse("$baseUrl/auth/login");
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['ok'] == true) {
        _token = data['token'];
        return data;
      }
    }
    throw Exception('Login failed');
  }

  Future<List<Producto>> getProductos() async {
    final url = Uri.parse("$baseUrl/products");
    final response = await http.get(
      url,
      headers: {"Authorization": "Bearer $_token"},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['ok'] == true) {
        return (data['products'] as List).map((p) => Producto.fromJson(p)).toList();
      }
    }
    throw Exception('Failed to load products');
  }

  Future<Producto> createProducto(Producto producto, File? image) async {
    final url = Uri.parse("$baseUrl/products");
    var request = http.MultipartRequest('POST', url);
    request.headers['Authorization'] = 'Bearer $_token';

    // Agregar campos
    request.fields['nombre'] = producto.nombre;
    if (producto.categoria != null) request.fields['categoria'] = producto.categoria!;
    if (producto.costo != null) request.fields['costo'] = producto.costo!.toString();
    if (producto.precio != null) request.fields['precio'] = producto.precio!.toString();
    if (producto.cantidad != null) request.fields['cantidad'] = producto.cantidad!.toString();
    if (producto.codigoBarra != null) request.fields['codigo_barra'] = producto.codigoBarra!;
    if (producto.estado != null) request.fields['estado'] = producto.estado!;

    // Agregar imagen
    if (image != null) {
      final mimeType = lookupMimeType(image.path);
      final mediaType = mimeType != null ? MediaType.parse(mimeType) : MediaType('image', 'jpeg');
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        image.path,
        contentType: mediaType,
      ));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      if (data['ok'] == true) {
        return Producto.fromJson(data['product']);
      }
    } else if (response.statusCode == 400) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Error al crear producto');
    }
    throw Exception('Failed to create product');
  }

  Future<Producto> updateProducto(int id, Producto producto, File? image) async {
    final url = Uri.parse("$baseUrl/products/$id");
    var request = http.MultipartRequest('PUT', url);
    request.headers['Authorization'] = 'Bearer $_token';

    // Agregar campos
    request.fields['nombre'] = producto.nombre;
    if (producto.categoria != null) request.fields['categoria'] = producto.categoria!;
    if (producto.costo != null) request.fields['costo'] = producto.costo!.toString();
    if (producto.precio != null) request.fields['precio'] = producto.precio!.toString();
    if (producto.cantidad != null) request.fields['cantidad'] = producto.cantidad!.toString();
    if (producto.codigoBarra != null) request.fields['codigo_barra'] = producto.codigoBarra!;
    if (producto.estado != null) request.fields['estado'] = producto.estado!;

    // Agregar imagen
    if (image != null) {
      final mimeType = lookupMimeType(image.path);
      final mediaType = mimeType != null ? MediaType.parse(mimeType) : MediaType('image', 'jpeg');
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        image.path,
        contentType: mediaType,
      ));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['ok'] == true) {
        return Producto.fromJson(data['product']);
      }
    } else if (response.statusCode == 400) {
      final data = jsonDecode(response.body);
      throw Exception(data['message'] ?? 'Error al actualizar producto');
    }
    throw Exception('Failed to update product');
  }

  Future<void> deleteProducto(int id) async {
    final url = Uri.parse("$baseUrl/products/$id");
    final response = await http.delete(
      url,
      headers: {"Authorization": "Bearer $_token"},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete product');
    }
  }

  Future<void> enviarCliente(Cliente cliente) async {
    final url = Uri.parse("$baseUrl/customers");

    await http.post(
      url,
      headers: {"Content-Type": "application/json", "Authorization": "Bearer $_token"},
      body: jsonEncode(cliente.toMap()),
    );
  }
}
