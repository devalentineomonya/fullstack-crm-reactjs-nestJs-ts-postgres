import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";

export const useSignInService = () => {
  const dataService = new DataServices();

  const mutation = useMutation({
    mutationFn: async (credentials: CreateAuthDto) => {
      const response = dataService.api.auth.signin.post.call({
        json: credentials,
      });
      return (await response).data;
    },
    onError: (error: Error) => {
      console.error("Signin error:", error.message);
    },
  });

  return mutation;
};
