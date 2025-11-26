import { useQuery } from "@tanstack/react-query";
import { DataServices } from "../data/data-service";



export const useGetTickets = () => {
  const dataService = new DataServices();
  return useQuery<{ success: boolean; data: CreateTicketDto[] }>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const response = await dataService.api.tickets.get.call({});
      return response.data;
    },
  });
};
