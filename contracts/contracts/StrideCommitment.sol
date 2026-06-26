// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IStrideRewardPool {
    function receiveForfeiture(uint256 amount) external;
    function releaseReward(address user, uint256 baseStake) external returns (uint256);
}

contract StrideCommitment is Ownable, ReentrancyGuard {

    IERC20 public immutable USDm;
    IStrideRewardPool public immutable rewardPool;
    address public immutable verifier;

    uint256 public constant MIN_STAKE = 10 ** 16; // 0.01 USDm
    uint256 public constant GRACE_PERIOD = 60;    // seconds

    struct Commitment {
        address user;
        uint256 distanceGoal;
        uint256 stepGoal;
        uint256 stakeAmount;
        uint256 deadline;
        uint256 createdAt;
        bool completed;
        bool cancelled;
    }

    mapping(bytes32 => Commitment) public commitments;
    mapping(address => bytes32) public activeCommitment;
    mapping(bytes32 => bool) public usedNonces;

    uint256 private _nonce;

    event CommitmentCreated(
        bytes32 indexed commitmentId,
        address indexed user,
        uint256 distanceGoal,
        uint256 stepGoal,
        uint256 stakeAmount,
        uint256 deadline
    );
    event CommitmentCompleted(bytes32 indexed commitmentId, address indexed user, uint256 bonusEarned);
    event CommitmentCancelled(bytes32 indexed commitmentId, address indexed user);
    event CommitmentForfeited(bytes32 indexed commitmentId, address indexed user, uint256 amount);

    constructor(address _verifier, address _rewardPool, address _USDm) Ownable(msg.sender) {
        verifier = _verifier;
        rewardPool = IStrideRewardPool(_rewardPool);
        USDm = IERC20(_USDm);
    }

    function createCommitment(
        uint256 distanceGoalMeters,
        uint256 stepGoal,
        uint256 timeWindowSeconds,
        uint256 stakeAmount
    ) external nonReentrant {
        require(stakeAmount >= MIN_STAKE, "Stride: stake below 0.01 USDm minimum");
        require(!(distanceGoalMeters > 0 && stepGoal > 0), "Stride: set only one goal type");
        require(distanceGoalMeters > 0 || stepGoal > 0, "Stride: set distance or steps goal");
        require(activeCommitment[msg.sender] == bytes32(0), "Stride: active commitment exists");

        require(USDm.transferFrom(msg.sender, address(this), stakeAmount), "Stride: transfer failed");

        bytes32 commitmentId = keccak256(abi.encodePacked(msg.sender, block.timestamp, _nonce++));

        uint256 deadline = block.timestamp + timeWindowSeconds;

        commitments[commitmentId] = Commitment({
            user: msg.sender,
            distanceGoal: distanceGoalMeters,
            stepGoal: stepGoal,
            stakeAmount: stakeAmount,
            deadline: deadline,
            createdAt: block.timestamp,
            completed: false,
            cancelled: false
        });

        activeCommitment[msg.sender] = commitmentId;

        emit CommitmentCreated(commitmentId, msg.sender, distanceGoalMeters, stepGoal, stakeAmount, deadline);
    }

    function cancelCommitment(bytes32 commitmentId) external nonReentrant {
        Commitment storage c = commitments[commitmentId];
        require(c.user == msg.sender, "Stride: not your commitment");
        require(!c.completed && !c.cancelled, "Stride: already resolved");
        require(block.timestamp <= c.createdAt + GRACE_PERIOD, "Stride: grace period expired");

        c.cancelled = true;
        activeCommitment[msg.sender] = bytes32(0);

        require(USDm.transfer(msg.sender, c.stakeAmount), "Stride: refund failed");
        emit CommitmentCancelled(commitmentId, msg.sender);
    }

    function completeCommitment(
        bytes32 commitmentId,
        uint256 actualDistance,
        uint256 actualSteps,
        bytes32 proofNonce,
        bytes calldata signature
    ) external nonReentrant {
        Commitment storage c = commitments[commitmentId];
        require(c.user == msg.sender, "Stride: not your commitment");
        require(!c.completed && !c.cancelled, "Stride: already resolved");
        require(block.timestamp <= c.deadline, "Stride: commitment expired");
        require(!usedNonces[proofNonce], "Stride: proof already used");

        if (c.distanceGoal > 0) require(actualDistance >= c.distanceGoal, "Stride: goal not met");
        if (c.stepGoal > 0) require(actualSteps >= c.stepGoal, "Stride: goal not met");

        bytes32 msgHash = keccak256(abi.encodePacked(commitmentId, actualDistance, actualSteps, proofNonce));
        address recovered = ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(msgHash), signature);
        require(recovered == verifier, "Stride: invalid signature");

        usedNonces[proofNonce] = true;
        c.completed = true;
        activeCommitment[msg.sender] = bytes32(0);

        require(USDm.transfer(msg.sender, c.stakeAmount), "Stride: stake return failed");

        // Bonus from pool — never block completion if pool call fails
        try rewardPool.releaseReward(msg.sender, c.stakeAmount) returns (uint256 bonus) {
            emit CommitmentCompleted(commitmentId, msg.sender, bonus);
        } catch {
            emit CommitmentCompleted(commitmentId, msg.sender, 0);
        }
    }

    function forfeitExpiredCommitment(bytes32 commitmentId) external nonReentrant {
        Commitment storage c = commitments[commitmentId];
        require(!c.completed && !c.cancelled, "Stride: already resolved");
        require(block.timestamp > c.deadline, "Stride: not expired");

        c.cancelled = true;
        activeCommitment[c.user] = bytes32(0);

        // Approve RewardPool to pull the forfeited stake via transferFrom
        USDm.approve(address(rewardPool), c.stakeAmount);
        rewardPool.receiveForfeiture(c.stakeAmount);

        emit CommitmentForfeited(commitmentId, c.user, c.stakeAmount);
    }

    function getCommitment(bytes32 commitmentId) external view returns (Commitment memory) {
        return commitments[commitmentId];
    }

    function getActiveCommitmentId(address user) external view returns (bytes32) {
        return activeCommitment[user];
    }
}
