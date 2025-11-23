import { useState, useEffect, useRef } from "react";

export const useQuery = ({ queryFn, onError, enabled = true }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const queryRef = useRef(queryFn);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const data = await queryRef.current();
        setData(data);
      } catch (error) {
        setError(error);
        if (onErrorRef.current) onErrorRef.current(error);
      } finally {
        setIsLoading(false);
      }
    };

    setData(null);
    setError(null);
    if (enabled) fetchData();
  }, [enabled]);

  return { data, error, isLoading, setData };
};
