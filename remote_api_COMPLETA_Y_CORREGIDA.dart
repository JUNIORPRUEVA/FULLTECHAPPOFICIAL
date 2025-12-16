// lib/data/remote_api.dart - VERSIÓN COMPLETA CORREGIDA

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';
import 'cliente_model.dart';
import 'producto_model.dart';

class RemoteAPI {
  // ✅ baseUrl ya incluye /api
  static const String baseUrl = "https://fulltechsales-api-importante-fulltechappoficial.gcdndd.easypanel.host/api";

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  String get token => _token ?? '';
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  // ====================
  // 🔐 AUTENTICACIÓN
  // ====================

  Future<Map<String, dynamic>> login(String usuario, String password) async {
    final url = Uri.parse("$baseUrl/auth/login");
    
    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"usuario": usuario, "password": password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          _token = data['token'];
          return data;
        } else {
          throw Exception(data['message'] ?? 'Login failed');
        }
      } else {
        throw Exception('Error ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  // ====================
  // 📦 PRODUCTOS
  // ====================

  Future<List<Producto>> getProductos() async {
    final url = Uri.parse("$baseUrl/products");
    
    try {
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $_token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          final products = (data['products'] as List? ?? []);
          return products.map((p) => Producto.fromJson(p as Map<String, dynamic>)).toList();
        }
      }
      throw Exception('Failed to load products: ${response.statusCode}');
    } catch (e) {
      throw Exception('Error fetching products: $e');
    }
  }

  Future<Producto> getProducto(int id) async {
    final url = Uri.parse("$baseUrl/products/$id");
    
    try {
      final response = await http.get(
        url,
        headers: {"Authorization": "Bearer $_token"},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return Producto.fromJson(data['product']);
        }
      }
      throw Exception('Failed to load product');
    } catch (e) {
      throw Exception('Error fetching product: $e');
    }
  }

  // 📤 Crear producto con imagen (multipart)
  Future<Producto> crearProductoConImagen({
    required String nombre,
    required String categoria,
    required double precio,
    required double costo,
    required int cantidad,
    required String imagenPath,
  }) async {
    final url = Uri.parse("$baseUrl/products");
    var request = http.MultipartRequest('POST', url);
    request.headers['Authorization'] = 'Bearer $_token';

    // Agregar campos de texto
    request.fields['nombre'] = nombre;
    request.fields['categoria'] = categoria;
    request.fields['precio'] = precio.toString();
    request.fields['costo'] = costo.toString();
    request.fields['cantidad'] = cantidad.toString();

    // Agregar imagen con MIME type correcto
    try {
      final imageFile = File(imagenPath);
      if (!await imageFile.exists()) {
        throw Exception('Image file not found: $imagenPath');
      }

      final mimeType = lookupMimeType(imageFile.path) ?? 'image/jpeg';
      final mediaType = MediaType.parse(mimeType);
      
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        imageFile.path,
        contentType: mediaType,
      ));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return Producto.fromJson(data['product']);
        } else {
          throw Exception(data['message'] ?? 'Error al crear producto');
        }
      } else if (response.statusCode == 400) {
        final data = jsonDecode(response.body);
        throw Exception(data['message'] ?? 'Error de validación');
      } else {
        throw Exception('Error HTTP ${response.statusCode}');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // 📝 Actualizar producto
  Future<Producto> updateProducto(
    int id,
    String nombre,
    String categoria,
    double precio,
    double costo,
    int cantidad, {
    String? imagenPath,
  }) async {
    final url = Uri.parse("$baseUrl/products/$id");
    var request = http.MultipartRequest('PUT', url);
    request.headers['Authorization'] = 'Bearer $_token';

    request.fields['nombre'] = nombre;
    request.fields['categoria'] = categoria;
    request.fields['precio'] = precio.toString();
    request.fields['costo'] = costo.toString();
    request.fields['cantidad'] = cantidad.toString();

    if (imagenPath != null) {
      final mimeType = lookupMimeType(imagenPath) ?? 'image/jpeg';
      final mediaType = MediaType.parse(mimeType);
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        imagenPath,
        contentType: mediaType,
      ));
    }

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return Producto.fromJson(data['product']);
        }
      }
      throw Exception('Failed to update product');
    } catch (e) {
      throw Exception('Error updating product: $e');
    }
  }

  // 🗑️ Eliminar producto
  Future<void> deleteProducto(int id) async {
    final url = Uri.parse("$baseUrl/products/$id");
    
    try {
      final response = await http.delete(
        url,
        headers: {"Authorization": "Bearer $_token"},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete product');
      }
    } catch (e) {
      throw Exception('Error deleting product: $e');
    }
  }

  // ====================
  // 👥 CRM - LEADS (CLIENTES)
  // ====================

  Future<List<Map<String, dynamic>>> getClientes() async {
    // ✅ CORRECTED: /crm/leads en lugar de /crm/clientes
    final url = Uri.parse("$baseUrl/crm/leads");
    
    try {
      final response = await http.get(
        url,
        headers: {"Authorization": "Bearer $_token"},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return List<Map<String, dynamic>>.from(data['leads'] ?? []);
        }
      }
      throw Exception('Failed to load clients: ${response.statusCode}');
    } catch (e) {
      throw Exception('Error fetching clients: $e');
    }
  }

  Future<Map<String, dynamic>> crearCliente(Map<String, dynamic> cliente) async {
    final url = Uri.parse("$baseUrl/crm/leads");
    
    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $_token",
        },
        body: jsonEncode(cliente),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return data['lead'] ?? {};
        }
      }
      throw Exception('Failed to create client');
    } catch (e) {
      throw Exception('Error creating client: $e');
    }
  }

  // ====================
  // 👤 USUARIOS
  // ====================

  Future<List<Map<String, dynamic>>> getUsuarios() async {
    // ✅ CORRECTED: /auth/usuarios
    final url = Uri.parse("$baseUrl/auth/usuarios");
    
    try {
      final response = await http.get(
        url,
        headers: {"Authorization": "Bearer $_token"},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return List<Map<String, dynamic>>.from(data['usuarios'] ?? []);
        }
      }
      throw Exception('Failed to load users: ${response.statusCode}');
    } catch (e) {
      throw Exception('Error fetching users: $e');
    }
  }

  // ====================
  // 💬 COTIZACIONES
  // ====================

  Future<List<Map<String, dynamic>>> getCotizaciones() async {
    final url = Uri.parse("$baseUrl/quotes");
    
    try {
      final response = await http.get(
        url,
        headers: {"Authorization": "Bearer $_token"},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return List<Map<String, dynamic>>.from(data['quotes'] ?? []);
        }
      }
      throw Exception('Failed to load quotes');
    } catch (e) {
      throw Exception('Error fetching quotes: $e');
    }
  }

  // ====================
  // 💰 VENTAS
  // ====================

  Future<List<Map<String, dynamic>>> getVentas() async {
    final url = Uri.parse("$baseUrl/sales");
    
    try {
      final response = await http.get(
        url,
        headers: {"Authorization": "Bearer $_token"},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return List<Map<String, dynamic>>.from(data['sales'] ?? []);
        }
      }
      throw Exception('Failed to load sales');
    } catch (e) {
      throw Exception('Error fetching sales: $e');
    }
  }

  Future<Map<String, dynamic>> crearVenta(Map<String, dynamic> venta) async {
    final url = Uri.parse("$baseUrl/sales");
    
    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $_token",
        },
        body: jsonEncode(venta),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ok'] == true) {
          return data['sale'] ?? {};
        }
      }
      throw Exception('Failed to create sale');
    } catch (e) {
      throw Exception('Error creating sale: $e');
    }
  }
}
