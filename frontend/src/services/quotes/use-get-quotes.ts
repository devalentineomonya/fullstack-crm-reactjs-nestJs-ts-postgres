import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";

export const useGetQuotes = () => {
  const dataService = new DataServices();
  return useQuery({
    queryKey: [`quotations`],
    queryFn: async () => {
      const response = await dataService.api.quotes.get.call({});
      return response.data;
    },
  });
};
