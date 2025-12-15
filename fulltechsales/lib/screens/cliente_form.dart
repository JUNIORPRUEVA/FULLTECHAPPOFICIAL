import 'package:flutter/material.dart';
import '../data/cliente_model.dart';
import '../data/local_db.dart';

class ClienteForm extends StatefulWidget {
  const ClienteForm({super.key});

  @override
  State<ClienteForm> createState() => _ClienteFormState();
}

class _ClienteFormState extends State<ClienteForm> {
  final nombreCtrl = TextEditingController();
  final telefonoCtrl = TextEditingController();
  final categoriaCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Nuevo Cliente")),

      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(controller: nombreCtrl, decoration: const InputDecoration(labelText: "Nombre")),
            TextField(controller: telefonoCtrl, decoration: const InputDecoration(labelText: "Teléfono")),
            TextField(controller: categoriaCtrl, decoration: const InputDecoration(labelText: "Categoría")),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: () async {
                final cliente = Cliente(
                  nombre: nombreCtrl.text,
                  telefono: telefonoCtrl.text,
                  categoria: categoriaCtrl.text,
                );

                await LocalDB.instance.insertCliente(cliente);
                Navigator.pop(context);
              },
              child: const Text("Guardar"),
            )
          ],
        ),
      ),
    );
  }
}
