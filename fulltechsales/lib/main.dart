import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/cliente_form.dart';
import 'screens/cliente_detalle.dart';
import 'screens/cliente_estado.dart';
import 'data/cliente_model.dart';

void main() {
  runApp(const FulltechCRM());
}

class FulltechCRM extends StatelessWidget {
  const FulltechCRM({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Fulltech CRM',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),

      // Ruta inicial
      initialRoute: "/",

      routes: {
        "/": (context) => const HomeScreen(),
        "/nuevo": (context) => const ClienteForm(),
      },

      // Manejo de rutas con argumentos (detalle, editar, estado)
      onGenerateRoute: (settings) {
        if (settings.name == "/detalle") {
          final cliente = settings.arguments as Cliente;
          return MaterialPageRoute(
            builder: (_) => ClienteDetalle(cliente: cliente),
          );
        }

        if (settings.name == "/estado") {
          final cliente = settings.arguments as Cliente;
          return MaterialPageRoute(
            builder: (_) => ClienteEstadoScreen(cliente: cliente),
          );
        }

        return null;
      },
    );
  }
}
