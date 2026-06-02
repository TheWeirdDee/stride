// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StrideRewardPool
 * @notice Manages the community reward pool for Stride.
 *         Receives forfeited stakes from users who failed commitments.
 *         Pays bonus rewards to users who succeed.
 */
contract StrideRewardPool is Ownable, ReentrancyGuard {

    // cUSD address is passed at deploy time so the same contract works on
    // Alfajores testnet, Celo Mainnet, and local Hardhat tests (MockERC20).
    IERC20 public immutable CUSD;

    address public commitmentContract;

    // Bonus = bonusPercent% of user's stake, capped at maxBonus
    uint256 public bonusPercent = 10;
    uint256 public maxBonus = 5e17; // 0.50 cUSD

    uint256 public totalReceived;
    uint256 public totalPaidOut;

    event ForfeitureReceived(uint256 amount, uint256 poolBalance);
    event RewardPaid(address indexed user, uint256 bonusAmount);
    event BonusParamsUpdated(uint256 bonusPercent, uint256 maxBonus);
    event CommitmentContractUpdated(address indexed newContract);

    modifier onlyCommitmentContract() {
        require(msg.sender == commitmentContract, "Pool: unauthorized caller");
        _;
    }

    constructor(address _commitmentContract, address _cusd) Ownable(msg.sender) {
        commitmentContract = _commitmentContract;
        CUSD = IERC20(_cusd);
    }

    /**
     * @notice Receive forfeited cUSD from the commitment contract
     */
    function receiveForfeiture(uint256 amount) external onlyCommitmentContract nonReentrant {
        require(
            CUSD.transferFrom(commitmentContract, address(this), amount),
            "Pool: forfeiture transfer failed"
        );
        totalReceived += amount;
        emit ForfeitureReceived(amount, getPoolBalance());
    }

    /**
     * @notice Release a bonus reward to a user who completed a commitment
     * @param user Recipient address
     * @param baseStake Their original stake amount (determines bonus size)
     * @return bonusAmount Amount of cUSD bonus paid
     */
    function releaseReward(address user, uint256 baseStake)
        external
        onlyCommitmentContract
        nonReentrant
        returns (uint256 bonusAmount)
    {
        uint256 poolBalance = getPoolBalance();
        if (poolBalance == 0) return 0;

        bonusAmount = (baseStake * bonusPercent) / 100;

        if (bonusAmount > maxBonus) bonusAmount = maxBonus;

        // Never drain more than 10% of pool in one payout
        uint256 poolCap = poolBalance / 10;
        if (bonusAmount > poolCap) bonusAmount = poolCap;

        if (bonusAmount == 0) return 0;

        totalPaidOut += bonusAmount;
        require(CUSD.transfer(user, bonusAmount), "Pool: reward transfer failed");

        emit RewardPaid(user, bonusAmount);
        return bonusAmount;
    }

    function getPoolBalance() public view returns (uint256) {
        return CUSD.balanceOf(address(this));
    }

    function getStats() external view returns (
        uint256 balance,
        uint256 received,
        uint256 paidOut,
        uint256 currentBonusPercent,
        uint256 currentMaxBonus
    ) {
        return (getPoolBalance(), totalReceived, totalPaidOut, bonusPercent, maxBonus);
    }

    // ─── Admin ─────────────────────────────────────────

    function setCommitmentContract(address _addr) external onlyOwner {
        commitmentContract = _addr;
        emit CommitmentContractUpdated(_addr);
    }

    function setBonusParams(uint256 _bonusPercent, uint256 _maxBonus) external onlyOwner {
        require(_bonusPercent <= 50, "Pool: bonus percent too high");
        bonusPercent = _bonusPercent;
        maxBonus = _maxBonus;
        emit BonusParamsUpdated(_bonusPercent, _maxBonus);
    }

    /**
     * @notice Seed the pool with initial cUSD (owner only, for launch bootstrapping)
     */
    function seedPool(uint256 amount) external onlyOwner {
        require(CUSD.transferFrom(msg.sender, address(this), amount), "Pool: seed transfer failed");
        totalReceived += amount;
        emit ForfeitureReceived(amount, getPoolBalance());
    }

    /**
     * @notice Emergency withdrawal — owner only
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = getPoolBalance();
        require(balance > 0, "Pool: empty");
        CUSD.transfer(owner(), balance);
    }
}
