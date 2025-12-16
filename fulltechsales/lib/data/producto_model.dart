class Producto {
  final int? id;
  final String nombre;
  final String? categoria;
  final double? costo;
  final double? precio;
  final int? cantidad;
  final String? codigoBarra;
  final String? imagenUrl;
  final String? estado;
  final DateTime? fechaCreado;

  Producto({
    this.id,
    required this.nombre,
    this.categoria,
    this.costo,
    this.precio,
    this.cantidad,
    this.codigoBarra,
    this.imagenUrl,
    this.estado,
    this.fechaCreado,
  });

  factory Producto.fromJson(Map<String, dynamic> json) {
    return Producto(
      id: json['id'],
      nombre: json['nombre'],
      categoria: json['categoria'],
      costo: json['costo']?.toDouble(),
      precio: json['precio']?.toDouble(),
      cantidad: json['cantidad'],
      codigoBarra: json['codigo_barra'],
      imagenUrl: json['imagen_url'],
      estado: json['estado'],
      fechaCreado: json['fecha_creado'] != null ? DateTime.parse(json['fecha_creado']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'categoria': categoria,
      'costo': costo,
      'precio': precio,
      'cantidad': cantidad,
      'codigo_barra': codigoBarra,
      'imagen_url': imagenUrl,
      'estado': estado,
      'fecha_creado': fechaCreado?.toIso8601String(),
    };
  }

  Producto copyWith({
    int? id,
    String? nombre,
    String? categoria,
    double? costo,
    double? precio,
    int? cantidad,
    String? codigoBarra,
    String? imagenUrl,
    String? estado,
    DateTime? fechaCreado,
  }) {
    return Producto(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      categoria: categoria ?? this.categoria,
      costo: costo ?? this.costo,
      precio: precio ?? this.precio,
      cantidad: cantidad ?? this.cantidad,
      codigoBarra: codigoBarra ?? this.codigoBarra,
      imagenUrl: imagenUrl ?? this.imagenUrl,
      estado: estado ?? this.estado,
      fechaCreado: fechaCreado ?? this.fechaCreado,
    );
  }
}