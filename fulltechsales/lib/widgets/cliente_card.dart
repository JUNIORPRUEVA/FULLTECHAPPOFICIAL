import 'package:flutter/material.dart';
import '../data/cliente_model.dart';
import '../screens/cliente_detalle.dart';
import '../config/app_colors.dart';

class ClienteCard extends StatelessWidget {
  final Cliente cliente;

  const ClienteCard({super.key, required this.cliente});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 6,
            offset: Offset(0, 3),
          )
        ],
      ),

      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),

        leading: CircleAvatar(
          radius: 26,
          backgroundColor: AppColors.azulMedio,
          child: const Icon(Icons.person, color: Colors.white),
        ),

        title: Text(
          cliente.nombre,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.azulOscuro,
          ),
        ),

        subtitle: Text(
          cliente.telefono,
          style: const TextStyle(
            fontSize: 15,
            color: Colors.black54,
          ),
        ),

        trailing: const Icon(Icons.arrow_forward_ios, size: 18, color: AppColors.azulMedio),

        onTap: () {
          Navigator.pushNamed(context, "/detalle", arguments: cliente);
        },
      ),
    );
  }
}
