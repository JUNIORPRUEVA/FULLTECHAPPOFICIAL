class Cliente {
  int? id;
  String nombre;
  String telefono;
  String estado;        // interesado, reserva, comprado, cancelado
  String categoria;     // camaras, pos, motores, suplementos…
  String notas;

  Cliente({
    this.id,
    required this.nombre,
    required this.telefono,
    this.estado = "interesado",
    this.categoria = "",
    this.notas = "",
  });

  // Convertir a Map para SQLite / API
  Map<String, dynamic> toMap() {
    return {
      "id": id,
      "nombre": nombre,
      "telefono": telefono,
      "estado": estado,
      "categoria": categoria,
      "notas": notas,
    };
  }

  factory Cliente.fromMap(Map<String, dynamic> map) {
    return Cliente(
      id: map["id"],
      nombre: map["nombre"],
      telefono: map["telefono"],
      estado: map["estado"],
      categoria: map["categoria"],
      notas: map["notas"],
    );
  }
}
