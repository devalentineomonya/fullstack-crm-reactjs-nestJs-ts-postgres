import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";

export const useSignupService = () => {
  const dataService = new DataServices();

  const mutation = useMutation({
    mutationFn: async (createUserDto: CreateUserDto) => {
      const response = dataService.api.users.post.call({
        json: createUserDto,
      });
      return (await response).data;
    },
    onError: (error: Error) => {
      console.error("Signin error:", error.message);
    },
  });

  return mutation;
};
