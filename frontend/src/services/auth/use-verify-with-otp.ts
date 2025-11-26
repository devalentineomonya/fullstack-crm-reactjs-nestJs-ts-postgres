import { useMutation } from "@tanstack/react-query";
import { DataServices } from "@/services/data/data-service";
import type { AxiosError } from "axios";

export const useVerifyWithOTP = () => {
  const dataService = new DataServices();

  const mutation = useMutation({
    mutationFn: async (activateOtpDto: ActivateOtpDto) => {
      const response = dataService.api.users["verify-with-otp"].post.call({
        json: activateOtpDto,
      });
      return (await response).data;
    },
    onError: (error: AxiosError) => {
      console.error(
        "Signin error:",
        (error.response?.data as { message: string }).message
      );
    },
  });

  return mutation;
};
