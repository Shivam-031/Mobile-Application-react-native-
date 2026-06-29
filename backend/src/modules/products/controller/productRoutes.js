const express = require('express');
const router = express.Router();
const productService = require('../service/productService');
const { protect, authorize } = require('../../../middleware/authMiddleware');
const { uploadToCloudinary, upload } = require('../../../config/cloudinary');

// GET /api/v1/products - public
router.get('/', async (req, res) => {
  try {
    const { category, state, status, search, sort, page, limit } = req.query;
    const result = await productService.getProducts({ category, state, status, search, sort, page: +page, limit: +limit });
    res.json({ success: true, data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/v1/products/:id - public
router.get('/:id', async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) { res.status(404).json({ success: false, message: err.message }); }
});

// POST /api/v1/products - branch head or admin
router.post('/', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), upload.array('images', 5), async (req, res) => {
  try {
    const data = req.body;
    if (req.files?.length) {
      const uploads = await Promise.all(req.files.map((f) => uploadToCloudinary(f.buffer, 'green-yatra/products')));
      data.images = uploads.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
    }
    const product = await productService.createProduct(data, req.user._id);
    res.status(201).json({ success: true, message: 'Product submitted for approval', data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/v1/products/:id
router.put('/:id', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.user._id, req.user.role);
    res.json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PATCH /api/v1/products/:id/approve - admin only.
// authorize('MASTER_ADMIN') already blocks EMPLOYEE tokens with the
// generic 403 from the auth middleware — the explicit check below is just
// defence in depth + a clearer message if the middleware chain is ever
// changed (e.g., to add an EMPLOYEE-only approval flow later).
router.patch('/:id/approve', protect, authorize('MASTER_ADMIN'), async (req, res) => {
  try {
    if (req.user.role !== 'MASTER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can approve or reject product submissions',
      });
    }
    const { status, adminNote } = req.body;
    const product = await productService.approveProduct(req.params.id, status, adminNote);
    res.json({ success: true, message: `Product ${status}`, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/v1/products/:id
router.delete('/:id', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user._id, req.user.role);
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// GET /api/v1/products/branch/mine - branch head's own products
router.get('/branch/mine', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const products = await productService.getBranchProducts(req.user._id);
    res.json({ success: true, data: products });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
