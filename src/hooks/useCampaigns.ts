import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MockService } from '@/lib/mockService';
import { Campaign } from '@/lib/types';

export function useCampaigns() {
    return useQuery({
        queryKey: ['campaigns'],
        queryFn: MockService.getCampaigns,
    });
}

export function useCampaign(id: string) {
    return useQuery({
        queryKey: ['campaign', id],
        queryFn: () => MockService.getCampaign(id),
        enabled: !!id,
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: MockService.createCampaign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

export function useCompleteTask() {
    return useMutation({
        mutationFn: ({ campaignId, taskType }: { campaignId: string, taskType: any }) =>
            MockService.completeTask(campaignId, taskType),
    });
}
