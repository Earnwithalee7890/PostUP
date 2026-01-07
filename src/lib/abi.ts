export const DISTRIBUTOR_ABI = [
    {
        "inputs": [{ "internalType": "bytes32", "name": "_merkleRoot", "type": "bytes32" }],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "uint256", "name": "_amount", "type": "uint256" },
            { "internalType": "bytes32[]", "name": "_proof", "type": "bytes32[]" }
        ],
        "name": "claim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
        "name": "getCampaign",
        "outputs": [
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "bytes32", "name": "merkleRoot", "type": "bytes32" },
            { "internalType": "uint256", "name": "totalBudget", "type": "uint256" },
            { "internalType": "uint256", "name": "remainingBudget", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_campaignId", "type": "uint256" },
            { "internalType": "address", "name": "_user", "type": "address" }
        ],
        "name": "hasClaimed",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextCampaignId",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
