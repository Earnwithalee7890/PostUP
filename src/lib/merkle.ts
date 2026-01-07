import { RewardClaim } from './distribution';

/**
 * Simple merkle tree implementation for reward claims
 * In production, use @openzeppelin/merkle-tree or similar
 */
export class SimpleMerkleTree {
    private leaves: string[];
    private tree: string[][];

    constructor(claims: RewardClaim[]) {
        // Create leaves from claims (hash of address + amount)
        this.leaves = claims.map(claim =>
            this.hash(`${claim.userAddress}:${claim.amount.toFixed(18)}`)
        );

        // Build tree
        this.tree = this.buildTree(this.leaves);
    }

    private hash(data: string): string {
        // Simple hash for demo - in production use keccak256
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(64, '0');
    }

    private buildTree(leaves: string[]): string[][] {
        if (leaves.length === 0) return [[]];

        const tree: string[][] = [leaves];
        let currentLevel = leaves;

        while (currentLevel.length > 1) {
            const nextLevel: string[] = [];

            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                const combined = this.hash(left + right);
                nextLevel.push(combined);
            }

            tree.push(nextLevel);
            currentLevel = nextLevel;
        }

        return tree;
    }

    getRoot(): string {
        if (this.tree.length === 0 || this.tree[this.tree.length - 1].length === 0) {
            return '0x0';
        }
        return '0x' + this.tree[this.tree.length - 1][0];
    }

    getProof(leafIndex: number): string[] {
        const proof: string[] = [];
        let index = leafIndex;

        for (let level = 0; level < this.tree.length - 1; level++) {
            const levelNodes = this.tree[level];
            const isRightNode = index % 2 === 1;
            const siblingIndex = isRightNode ? index - 1 : index + 1;

            if (siblingIndex < levelNodes.length) {
                proof.push('0x' + levelNodes[siblingIndex]);
            }

            index = Math.floor(index / 2);
        }

        return proof;
    }

    verify(proof: string[], leaf: string, root: string): boolean {
        let computed = leaf.startsWith('0x') ? leaf.slice(2) : leaf;

        for (const proofElement of proof) {
            const proofHash = proofElement.startsWith('0x') ? proofElement.slice(2) : proofElement;

            // Ensure consistent ordering
            if (computed < proofHash) {
                computed = this.hash(computed + proofHash);
            } else {
                computed = this.hash(proofHash + computed);
            }
        }

        const computedRoot = '0x' + computed;
        return computedRoot === root;
    }
}

/**
 * Generate merkle tree and return root + proofs
 */
export function generateMerkleDistribution(claims: RewardClaim[]) {
    const tree = new SimpleMerkleTree(claims);
    const root = tree.getRoot();

    const claimsWithProofs = claims.map((claim, index) => ({
        ...claim,
        proof: tree.getProof(index),
        leaf: tree['leaves'][index], // Access private for demo
    }));

    return {
        root,
        claims: claimsWithProofs,
        tree,
    };
}
