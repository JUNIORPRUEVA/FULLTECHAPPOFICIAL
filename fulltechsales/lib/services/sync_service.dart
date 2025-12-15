import 'package:flutter/material.dart';
import '../data/local_db.dart';
import '../data/remote_api.dart';
import '../data/cliente_model.dart';

class SyncService {
  final LocalDB local = LocalDB.instance;
  final RemoteAPI remote = RemoteAPI();

  /// Enviar todos los clientes que no están sincronizados
  Future<void> syncClientes() async {
    final clientes = await local.getClientes();

    for (var c in clientes) {
      try {
        await remote.enviarCliente(c);
      } catch (e) {
        debugPrint("❌ Error sincronizando cliente ${c.nombre}: $e");
      }
    }
  }
}
