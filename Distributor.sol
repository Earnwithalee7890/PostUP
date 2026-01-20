// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Distributor is Ownable, ReentrancyGuard {
    address public constant PLATFORM_WALLET = 0xcf74BbBDDBB7ed5129a715F20d1cC34Fe1124fe4;
    uint256 public constant PLATFORM_FEE_BPS = 1500; // 15% (1500 / 10000)

    struct Campaign {
        address creator;
        bytes32 merkleRoot;
        uint256 totalBudget;
        uint256 remainingBudget;
        bool isActive;
        mapping(address => bool) hasClaimed;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public nextCampaignId = 1; // Start IDs at 1

    event CampaignCreated(uint256 indexed id, address indexed creator, uint256 totalBudget, uint256 netBudget);
    event RewardClaimed(uint256 indexed campaignId, address indexed claimer, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new campaign. msg.value is the total budget.
     * Merkle Root can be set 0x0 initially and updated later.
     */
    function createCampaign(bytes32 _merkleRoot) external payable nonReentrant {
        require(msg.value > 0, "No budget provided");
        
        uint256 fee = (msg.value * PLATFORM_FEE_BPS) / 10000;
        uint256 netBudget = msg.value - fee;

        (bool sent, ) = payable(PLATFORM_WALLET).call{value: fee}("");
        require(sent, "Failed to send platform fee");

        Campaign storage c = campaigns[nextCampaignId];
        c.creator = msg.sender;
        c.merkleRoot = _merkleRoot;
        c.totalBudget = msg.value;
        c.remainingBudget = netBudget;
        c.isActive = true;

        emit CampaignCreated(nextCampaignId, msg.sender, msg.value, netBudget);
        nextCampaignId++;
    }

    /**
     * @dev Set the Merkle Root after campaign ends (for dynamic participation).
     * Only the creator can set this.
     */
    function setMerkleRoot(uint256 _campaignId, bytes32 _merkleRoot) external {
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.creator, "Only creator can set root");
        c.merkleRoot = _merkleRoot;
    }

    /**
     * @dev Claim a reward from a specific campaign.
     * @param _campaignId The ID of the campaign.
     * @param _amount The amount to claim (wei).
     * @param _proof The Merkle Proof confirming the claim.
     */
    function claim(uint256 _campaignId, uint256 _amount, bytes32[] calldata _proof) external nonReentrant {
        Campaign storage c = campaigns[_campaignId];
        require(c.isActive, "Campaign not active");
        require(!c.hasClaimed[msg.sender], "Already claimed");

        // Verify Merkle Proof (Leaf: keccak256(abi.encodePacked(address, amount)))
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));
        require(MerkleProof.verify(_proof, c.merkleRoot, leaf), "Invalid Merkle proof");

        require(c.remainingBudget >= _amount, "Insufficient funds in campaign");
        
        // Update state before transfer
        c.hasClaimed[msg.sender] = true;
        c.remainingBudget -= _amount;
        
        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Failed to send reward");

        emit RewardClaimed(_campaignId, msg.sender, _amount);
    }

    /**
     * @dev Get campaign details (helper for frontend)
     */
    function getCampaign(uint256 _id) external view returns (
        address creator,
        bytes32 merkleRoot,
        uint256 totalBudget,
        uint256 remainingBudget,
        bool isActive
    ) {
        Campaign storage c = campaigns[_id];
        return (c.creator, c.merkleRoot, c.totalBudget, c.remainingBudget, c.isActive);
    }
    
    /**
     * @dev Check if a user has claimed from a campaign
     */
    function hasClaimed(uint256 _campaignId, address _user) external view returns (bool) {
        return campaigns[_campaignId].hasClaimed[_user];
    }
}
