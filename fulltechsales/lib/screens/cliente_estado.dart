import 'package:flutter/material.dart';
import '../data/cliente_model.dart';
import '../data/local_db.dart';

class ClienteEstadoScreen extends StatefulWidget {
  final Cliente cliente;

  const ClienteEstadoScreen({super.key, required this.cliente});

  @override
  State<ClienteEstadoScreen> createState() => _ClienteEstadoScreenState();
}

class _ClienteEstadoScreenState extends State<ClienteEstadoScreen> {
  String estado = "";

  @override
  void initState() {
    super.initState();
    estado = widget.cliente.estado;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Cambiar Estado")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            estadoItem("interesado"),
            estadoItem("reserva"),
            estadoItem("comprado"),
            estadoItem("cancelado"),
          ],
        ),
      ),
    );
  }

  Widget estadoItem(String value) {
    return RadioListTile(
      title: Text(value.toUpperCase()),
      value: value,
      groupValue: estado,
      onChanged: (newVal) async {
        setState(() => estado = newVal!);

        final c = widget.cliente;
        c.estado = estado;

        await LocalDB.instance.updateCliente(c);

        Navigator.pop(context);
      },
    );
  }
}
