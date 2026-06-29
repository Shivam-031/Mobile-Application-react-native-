import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateCartQty, clearCart, selectCartTotal, selectCartCount, selectCartCarbon } from '../store/slices/productsSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.products.cart);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const carbonSaved = useSelector(selectCartCarbon);

  return {
    cart,
    total,
    count,
    carbonSaved,
    addItem: (product) => dispatch(addToCart(product)),
    removeItem: (id) => dispatch(removeFromCart(id)),
    updateQty: (id, qty) => dispatch(updateCartQty({ id, qty })),
    clear: () => dispatch(clearCart()),
  };
};
