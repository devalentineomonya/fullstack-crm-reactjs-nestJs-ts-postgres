import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetAdminActivityLogs = () => {
  const dataService = new DataServices();
  return useQuery({
    queryKey: [`logs`],
    queryFn: async () => {
      const response = await dataService.api.logs.get.call({});
      return response.data;
    },
  });
};
