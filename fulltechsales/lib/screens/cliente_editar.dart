import 'package:flutter/material.dart';
import '../widgets/input_field.dart';
import '../data/local_db.dart';
import '../data/cliente_model.dart';

class ClienteEditar extends StatefulWidget {
  final Cliente cliente;

  const ClienteEditar({super.key, required this.cliente});

  @override
  State<ClienteEditar> createState() => _ClienteEditarState();
}

class _ClienteEditarState extends State<ClienteEditar> {
  late TextEditingController nombreCtrl;
  late TextEditingController telefonoCtrl;
  late TextEditingController categoriaCtrl;
  late TextEditingController notasCtrl;

  @override
  void initState() {
    super.initState();
    nombreCtrl = TextEditingController(text: widget.cliente.nombre);
    telefonoCtrl = TextEditingController(text: widget.cliente.telefono);
    categoriaCtrl = TextEditingController(text: widget.cliente.categoria);
    notasCtrl = TextEditingController(text: widget.cliente.notas);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Editar Cliente")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            InputField(label: "Nombre", controller: nombreCtrl),
            InputField(label: "Teléfono", controller: telefonoCtrl),
            InputField(label: "Categoría", controller: categoriaCtrl),
            InputField(label: "Notas", controller: notasCtrl),

            ElevatedButton(
              onPressed: () async {
                final c = widget.cliente;

                c.nombre = nombreCtrl.text;
                c.telefono = telefonoCtrl.text;
                c.categoria = categoriaCtrl.text;
                c.notas = notasCtrl.text;

                await LocalDB.instance.updateCliente(c);
                Navigator.pop(context);
              },
              child: const Text("Guardar cambios"),
            )
          ],
        ),
      ),
    );
  }
}
