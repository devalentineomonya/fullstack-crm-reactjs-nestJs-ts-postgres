import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetProfiles = () => {
  const dataService = new DataServices();
  return useQuery<{ success: boolean; count:number,data: CreateProfileDto[] }>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await dataService.api.profiles.get.call({});
      return response.data;
    },
  });
};
