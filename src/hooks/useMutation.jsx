import { useState, useEffect, useCallback, useRef } from "react";

export const useMutation = ({ mutationFn, onSuccess }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutationFnRef = useRef(mutationFn);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    mutationFnRef.current = mutationFn;
    onSuccessRef.current = onSuccess;
  });

  const mutate = useCallback(async (variables) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await mutationFnRef.current(variables);
      onSuccessRef.current?.(data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, error, isLoading };
};
