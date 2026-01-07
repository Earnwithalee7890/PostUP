import { useAccount } from 'wagmi';
import { isAdmin } from '@/lib/admin';

export function useIsAdmin() {
    const { address } = useAccount();
    return isAdmin(address);
}
