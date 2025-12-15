import 'package:flutter/material.dart';
import '../data/cliente_model.dart';

class ClienteDetalle extends StatelessWidget {
  final Cliente cliente;

  const ClienteDetalle({super.key, required this.cliente});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(cliente.nombre)),

      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Tel: ${cliente.telefono}", style: const TextStyle(fontSize: 18)),
            Text("Categoría: ${cliente.categoria}", style: const TextStyle(fontSize: 18)),
            Text("Estado: ${cliente.estado}", style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 20),
            Text("Notas:", style: TextStyle(fontSize: 18)),
            Text(cliente.notas)
          ],
        ),
      ),
    );
  }
}
