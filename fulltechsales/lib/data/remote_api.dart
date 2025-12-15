import 'dart:convert';
import 'package:http/http.dart' as http;
import 'cliente_model.dart';

class RemoteAPI {
  static const String baseUrl = "https://TU_SERVIDOR/fulltech/api";

  Future<void> enviarCliente(Cliente cliente) async {
    final url = Uri.parse("$baseUrl/clientes");

    await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(cliente.toMap()),
    );
  }
}
