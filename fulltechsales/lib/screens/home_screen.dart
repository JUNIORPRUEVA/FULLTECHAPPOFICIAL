import 'package:flutter/material.dart';
import '../data/local_db.dart';
import '../widgets/cliente_card.dart';
import '../data/cliente_model.dart';
import '../config/app_colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Cliente> clientes = [];

  @override
  void initState() {
    super.initState();
    cargarClientes();
  }

  Future<void> cargarClientes() async {
    clientes = await LocalDB.instance.getClientes();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppColors.fondo,

      // ============================
      // APPBAR EJECUTIVO PREMIUM
      // ============================
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(size.height * 0.12),
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.azulOscuro, AppColors.azulMedio],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 6,
                offset: Offset(0, 3),
              ),
            ],
          ),
          child: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            centerTitle: true,
            title: const Text(
              "Seguimiento de Clientes",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 26,
                letterSpacing: 1,
              ),
            ),
          ),
        ),
      ),

      // ============================
      // CONTENIDO PRINCIPAL
      // ============================
      body: Padding(
        padding: EdgeInsets.only(
          left: size.width * 0.04,
          right: size.width * 0.04,
          top: size.height * 0.03,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ----------------------------
            // BOTÓN “NUEVO CLIENTE” PREMIUM
            // ----------------------------
            Align(
              alignment: Alignment.centerLeft,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.dorado,
                  foregroundColor: Colors.black87,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 22, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 2,
                ),
                onPressed: () {
                  Navigator.pushNamed(context, "/nuevo")
                      .then((_) => cargarClientes());
                },
                icon: const Icon(Icons.add, size: 22),
                label: const Text(
                  "Nuevo Cliente",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // ----------------------------
            // LISTA DE CLIENTES
            // ----------------------------
            Expanded(
              child: clientes.isEmpty
                  ? const Center(
                child: Text(
                  "No hay clientes registrados",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: AppColors.azulOscuro,
                  ),
                ),
              )
                  : ListView.separated(
                itemCount: clientes.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  return ClienteCard(cliente: clientes[i]);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
