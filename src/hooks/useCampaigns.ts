import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/lib/supabaseService';
import { Campaign } from '@/lib/types';

export function useCampaigns() {
    return useQuery({
        queryKey: ['campaigns'],
        queryFn: SupabaseService.getCampaigns,
    });
}

export function useCampaign(id: string) {
    return useQuery({
        queryKey: ['campaign', id],
        queryFn: () => SupabaseService.getCampaign(id),
        enabled: !!id,
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: SupabaseService.createCampaign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

export function useCompleteTask() {
    return useMutation({
        mutationFn: ({ campaignId, taskType }: { campaignId: string, taskType: any }) =>
            SupabaseService.completeTask(campaignId, taskType),
    });
}
