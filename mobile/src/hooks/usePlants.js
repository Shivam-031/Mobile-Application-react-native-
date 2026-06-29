import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchPlants, fetchPlantStats } from '../store/slices/plantsSlice';

export const usePlants = (params = {}) => {
  const dispatch = useDispatch();
  const { list, stats, loading, error, savedPlants } = useSelector((s) => s.plants);

  useEffect(() => {
    dispatch(fetchPlants(params));
    dispatch(fetchPlantStats());
  }, [JSON.stringify(params)]);

  const refetch = () => dispatch(fetchPlants(params));

  return { plants: list, stats, loading, error, savedPlants, refetch };
};
