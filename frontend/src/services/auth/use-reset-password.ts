import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";

export const useResetPasswordService = () => {
  const dataService = new DataServices();

  const mutation = useMutation({
    mutationFn: async (credentials: RequestResetPasswordDto) => {
      const response = dataService.api.auth["request-reset-password"].post.call(
        {
          json: credentials,
        }
      );
      return (await response).data;
    },
    onError: (error: Error) => {
      console.error("Reset password error:", error.message);
    },
  });

  return mutation;
};
