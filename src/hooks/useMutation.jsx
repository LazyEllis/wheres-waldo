import { useState } from "react";

export const useMutation = ({ mutationFn, onSuccess }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (variables) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await mutationFn(variables);
      onSuccess(data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, error, isLoading };
};
