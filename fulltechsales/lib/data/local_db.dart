import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'cliente_model.dart';

class LocalDB {
  static final LocalDB instance = LocalDB._init();
  static Database? _db;

  LocalDB._init();

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDB("clientes.db");
    return _db!;
  }

  Future<Database> _initDB(String file) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, file);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createTables,
    );
  }

  Future _createTables(Database db, int version) async {
    await db.execute("""
      CREATE TABLE clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT NOT NULL,
        estado TEXT,
        categoria TEXT,
        notas TEXT
      );
    """);
  }

  // Insertar
  Future<int> insertCliente(Cliente c) async {
    final db = await instance.database;
    return await db.insert("clientes", c.toMap());
  }

  // Obtener todos
  Future<List<Cliente>> getClientes() async {
    final db = await instance.database;
    final res = await db.query("clientes", orderBy: "id DESC");
    return res.map((e) => Cliente.fromMap(e)).toList();
  }

  // Actualizar
  Future<int> updateCliente(Cliente c) async {
    final db = await instance.database;
    return await db.update("clientes", c.toMap(),
        where: "id = ?", whereArgs: [c.id]);
  }

  // Eliminar
  Future<int> deleteCliente(int id) async {
    final db = await instance.database;
    return await db.delete("clientes", where: "id = ?", whereArgs: [id]);
  }
}
