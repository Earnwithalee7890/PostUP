import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/lib/supabaseService';
import { Campaign } from '@/lib/types';

export function useCampaigns(includeEnded: boolean = false) {
    return useQuery({
        queryKey: ['campaigns', includeEnded],
        queryFn: () => SupabaseService.getCampaigns(includeEnded),
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

export function useSubmitScreenshot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ campaignId, taskId, screenshot, userFid, address }: { campaignId: string, taskId: string, screenshot: string, userFid: number, address: string }) =>
            SupabaseService.submitScreenshot(campaignId, taskId, screenshot, userFid, address),
        onSuccess: (_, variables) => {
            // Invalidate user submissions for this campaign
            queryClient.invalidateQueries({ queryKey: ['userSubmissions', variables.campaignId, variables.userFid] });
        },
    });
}

export function useVerifyScreenshot() {
    return useMutation({
        mutationFn: ({ campaignId, userFid, taskId, status }: { campaignId: string, userFid: number, taskId: string, status: 'approved' | 'rejected' }) =>
            SupabaseService.verifyScreenshot(campaignId, userFid, taskId, status),
    });
}

export function useUserSubmissions(campaignId: string, userFid: number | undefined) {
    return useQuery({
        queryKey: ['userSubmissions', campaignId, userFid],
        queryFn: () => SupabaseService.getUserSubmissions(campaignId, userFid!),
        enabled: !!campaignId && !!userFid,
    });
}

export function useCampaignSubmissions(campaignId: string) {
    return useQuery({
        queryKey: ['campaignSubmissions', campaignId],
        queryFn: () => SupabaseService.getSubmissions(campaignId),
        enabled: !!campaignId,
    });
}

export function useAllUserSubmissions(userFid: number | undefined) {
    return useQuery({
        queryKey: ['allUserSubmissions', userFid],
        queryFn: () => SupabaseService.getAllUserSubmissions(userFid!),
        enabled: !!userFid,
    });
}

export function useUserCompletedCampaignIds(userFid: number | undefined) {
    return useQuery({
        queryKey: ['userCompletedCampaignIds', userFid],
        queryFn: () => SupabaseService.getUserCompletedCampaignIds(userFid!),
        enabled: !!userFid,
    });
}

export function useFinalizeCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ campaignId, merkleRoot, totalWeight }: { campaignId: string, merkleRoot: string, totalWeight: number }) =>
            SupabaseService.finalizeCampaign(campaignId, merkleRoot, totalWeight),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] });
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

