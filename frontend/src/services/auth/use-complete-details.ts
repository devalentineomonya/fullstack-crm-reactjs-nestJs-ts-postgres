import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";

export const useCompleteDetailsService = () => {
  const dataService = new DataServices();

  const mutation = useMutation({
    mutationFn: async (
      updateUser: Omit<CreateUserDto, "provider" | "email"> & {
        password: string;
      }
    ) => {
      const userSessionString = localStorage.getItem("user-session");
      if (!userSessionString) {
        throw new Error("User session was not found in localStorage");
      }
      const userSession = JSON.parse(userSessionString) as {
        userId?: string;
        accessToken?: string;
        refreshToken?: string;
      };
      if (!userSession.userId) {
        throw new Error("User id was not found");
      }
      const response = dataService.api.users
        ._id(userSession.userId)
        .patch.call({
          json: updateUser,
        });
      return (await response).data;
    },
    onError: (error: Error) => {
      console.error("Signin error:", error.message);
    },
  });

  return mutation;
};
