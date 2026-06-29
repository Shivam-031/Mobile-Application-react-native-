import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchMyOrders } from '../store/slices/ordersSlice';

export const useOrders = () => {
  const dispatch = useDispatch();
  const { list, loading, error, lastOrder } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, []);

  const refetch = () => dispatch(fetchMyOrders());
  const totalCarbonSaved = list.reduce((acc, o) => acc + (o.totalCarbonSaved || 0), 0);

  return { orders: list, loading, error, lastOrder, totalCarbonSaved, refetch };
};
