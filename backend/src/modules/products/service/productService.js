const Product = require('../model/Product');

const getProducts = async ({ category, state, status, search, sort, page = 1, limit = 20 }) => {
  // Allow callers to filter by a specific status (pending, approved, rejected)
  // or pass 'all' to see every status — used by the admin approvals page.
  // Anything else (including undefined) defaults to 'approved' so the public
  // marketplace keeps its existing behavior.
  const query = { isActive: true };
  const allowedStatuses = ['pending', 'approved', 'rejected'];
  if (status === 'all') {
    // no status filter
  } else if (allowedStatuses.includes(status)) {
    query.status = status;
  } else {
    query.status = 'approved';
  }
  if (category && category !== 'all') query.category = category;
  if (state) query.state = state;
  if (search) query.$text = { $search: search };

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    carbon: { carbonSaved: -1 },
    newest: { createdAt: -1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('branchId', 'name state');

  return { products, total, page, pages: Math.ceil(total / limit) };
};

const getProductById = async (id) => {
  const product = await Product.findById(id).populate('branchId', 'name state');
  if (!product) throw new Error('Product not found');
  return product;
};

const createProduct = async (data, branchUserId) => {
  const product = await Product.create({ ...data, branchId: branchUserId, status: 'pending' });
  return product;
};

const updateProduct = async (id, data, userId, role) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  if (role !== 'MASTER_ADMIN' && product.branchId.toString() !== userId.toString()) {
    throw new Error('Not authorized to update this product');
  }
  Object.assign(product, data);
  await product.save();
  return product;
};

const approveProduct = async (id, status, adminNote) => {
  const product = await Product.findByIdAndUpdate(id, { status, adminNote }, { new: true });
  if (!product) throw new Error('Product not found');
  return product;
};

const deleteProduct = async (id, userId, role) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  if (role !== 'MASTER_ADMIN' && product.branchId.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }
  product.isActive = false;
  await product.save();
};

const getBranchProducts = async (branchUserId) => {
  return Product.find({ branchId: branchUserId, isActive: true }).sort({ createdAt: -1 });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, approveProduct, deleteProduct, getBranchProducts };
