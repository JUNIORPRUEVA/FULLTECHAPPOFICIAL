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
      // APPBAR CORPORATIVO PREMIUM
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
            leading: Padding(
              padding: const EdgeInsets.only(left: 12),
              child: Icon(Icons.shield, color: AppColors.dorado, size: 32),
            ),
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
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.only(
              left: size.width * 0.04,
              right: size.width * 0.04,
              top: size.height * 0.03,
              bottom: 10,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ----------------------------
                // BOTÓN “NUEVO CLIENTE”
                // ----------------------------
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.dorado,
                    foregroundColor: Colors.black87,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 22, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 3,
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

                const SizedBox(height: 20),
              ],
            ),
          ),

          // ----------------------------
          // LISTA DE CLIENTES
          // ----------------------------
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: size.width * 0.04),
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
          ),
        ],
      ),

      // ============================
      // FOOTER CORPORATIVO
      // ============================
      bottomNavigationBar: Container(
        height: 55,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.white, AppColors.plateado],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          border: Border(
            top: BorderSide(color: AppColors.plateado, width: 1),
          ),
        ),
        alignment: Alignment.center,
        child: const Text(
          "Fulltech SRL © Todos los derechos reservados",
          style: TextStyle(
            color: AppColors.azulOscuro,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
