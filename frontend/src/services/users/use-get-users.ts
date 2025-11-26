import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export type UserAccountStatus = "pending" | "active" | "inactive";
export type UserAccountType = "free" | "premium";

export const useGetUsers = () => {
  const dataService = new DataServices();
  return useQuery<{ success: boolean; data: UserWithCounts[] }>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await dataService.api.users.get.call({});
      return response.data;
    },
  });
};
