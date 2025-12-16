const service = require("./products.service");

async function getAll(req, res, next) {
  try {
    const products = await service.getAllProducts();
    res.json({ ok: true, products });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const product = await service.getProductById(req.params.id);
    res.json({ ok: true, product });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      data.imagen_url = `${baseUrl}/uploads/products/${req.file.filename}`;
      console.log(`Imagen subida: ${req.file.path}, URL: ${data.imagen_url}`);
    }
    const product = await service.createProduct(data);
    res.status(201).json({ ok: true, product });
  } catch (e) {
    console.error('Error creando producto:', e.message);
    res.status(400).json({ ok: false, message: e.message });
  }
}

async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      data.imagen_url = `${baseUrl}/uploads/products/${req.file.filename}`;
      console.log(`Imagen actualizada: ${req.file.path}, URL: ${data.imagen_url}`);
    }
    const product = await service.updateProduct(req.params.id, data);
    res.json({ ok: true, product });
  } catch (e) {
    console.error('Error actualizando producto:', e.message);
    res.status(400).json({ ok: false, message: e.message });
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteProduct(req.params.id);
    res.json({ ok: true, message: "Producto eliminado" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getById, create, update, remove };