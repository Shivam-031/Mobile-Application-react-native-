import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchProducts } from '../store/slices/productsSlice';

export const useProducts = (params = {}) => {
  const dispatch = useDispatch();
  const { list, loading, error, total, page, pages } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts(params));
  }, [JSON.stringify(params)]);

  const refetch = (newParams) => dispatch(fetchProducts(newParams || params));

  return { products: list, loading, error, total, page, pages, refetch };
};
