// contracts/test/StrideCommitment.test.js
// npx hardhat test
const { expect } = require("chai");
const { ethers } = require("hardhat");

const MOCK_CUSD_AMOUNT = ethers.parseUnits("100", 18);
const MIN_STAKE = ethers.parseUnits("0.01", 18);
const ONE_DOLLAR = ethers.parseUnits("1", 18);

describe("StrideCommitment + StrideRewardPool", function () {
  let commitment, rewardPool, mockCUSD;
  let owner, verifier, user1, user2;

  beforeEach(async function () {
    [owner, verifier, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 (stands in for cUSD on local Hardhat network)
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockCUSD = await MockERC20.deploy("Celo Dollar", "cUSD", 18);
    const cusdAddress = await mockCUSD.getAddress();

    await mockCUSD.mint(user1.address, MOCK_CUSD_AMOUNT);
    await mockCUSD.mint(user2.address, MOCK_CUSD_AMOUNT);

    // Deploy RewardPool — pass ZeroAddress for commitment (linked after), mockCUSD as token
    const RewardPool = await ethers.getContractFactory("StrideRewardPool");
    rewardPool = await RewardPool.deploy(ethers.ZeroAddress, cusdAddress);

    // Deploy Commitment — pass verifier, rewardPool, and mockCUSD addresses
    const Commitment = await ethers.getContractFactory("StrideCommitment");
    commitment = await Commitment.deploy(
      verifier.address,
      await rewardPool.getAddress(),
      cusdAddress
    );

    // Link RewardPool → Commitment
    await rewardPool.setCommitmentContract(await commitment.getAddress());
  });

  // ─── Commitment Creation ────────────────────────────────

  describe("createCommitment", function () {
    it("should create a commitment with valid parameters", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR);

      const tx = await commitment.connect(user1).createCommitment(
        3000,      // 3km in meters
        0,         // no step goal
        3600,      // 1 hour window
        ONE_DOLLAR
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "CommitmentCreated");
      expect(event).to.not.be.undefined;
    });

    it("should reject stake below minimum (0.01 cUSD)", async function () {
      const tooLow = ethers.parseUnits("0.001", 18);
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), tooLow);

      await expect(
        commitment.connect(user1).createCommitment(3000, 0, 3600, tooLow)
      ).to.be.revertedWith("Stride: stake below 0.01 cUSD minimum");
    });

    it("should reject when both distance and steps are set", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR);

      await expect(
        commitment.connect(user1).createCommitment(3000, 5000, 3600, ONE_DOLLAR)
      ).to.be.revertedWith("Stride: set only one goal type");
    });

    it("should reject when neither goal is set", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR);

      await expect(
        commitment.connect(user1).createCommitment(0, 0, 3600, ONE_DOLLAR)
      ).to.be.revertedWith("Stride: set distance or steps goal");
    });

    it("should reject a second active commitment from same user", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR * 2n);
      await commitment.connect(user1).createCommitment(3000, 0, 3600, ONE_DOLLAR);

      await expect(
        commitment.connect(user1).createCommitment(5000, 0, 3600, ONE_DOLLAR)
      ).to.be.revertedWith("Stride: active commitment exists");
    });
  });

  // ─── Cancel ────────────────────────────────────────────

  describe("cancelCommitment", function () {
    it("should allow cancel within grace period and refund stake", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR);
      const tx = await commitment.connect(user1).createCommitment(3000, 0, 3600, ONE_DOLLAR);
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "CommitmentCreated");
      const commitmentId = event.args[0];

      const balanceBefore = await mockCUSD.balanceOf(user1.address);
      await commitment.connect(user1).cancelCommitment(commitmentId);
      const balanceAfter = await mockCUSD.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(ONE_DOLLAR);
    });

    it("should reject cancel after grace period", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR);
      const tx = await commitment.connect(user1).createCommitment(3000, 0, 3600, ONE_DOLLAR);
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "CommitmentCreated");
      const commitmentId = event.args[0];

      // Fast forward past grace period (60s)
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");

      await expect(
        commitment.connect(user1).cancelCommitment(commitmentId)
      ).to.be.revertedWith("Stride: grace period expired");
    });
  });

  // ─── Forfeit ────────────────────────────────────────────

  describe("forfeitExpiredCommitment", function () {
    it("should forfeit an expired commitment and send to reward pool", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR);
      const tx = await commitment.connect(user1).createCommitment(3000, 0, 3600, ONE_DOLLAR);
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "CommitmentCreated");
      const commitmentId = event.args[0];

      // Fast forward past expiry
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");

      const poolBefore = await rewardPool.getPoolBalance();
      await commitment.connect(user2).forfeitExpiredCommitment(commitmentId);
      const poolAfter = await rewardPool.getPoolBalance();

      expect(poolAfter - poolBefore).to.equal(ONE_DOLLAR);
    });

    it("should reject forfeit of non-expired commitment", async function () {
      await mockCUSD.connect(user1).approve(await commitment.getAddress(), ONE_DOLLAR);
      const tx = await commitment.connect(user1).createCommitment(3000, 0, 3600, ONE_DOLLAR);
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "CommitmentCreated");
      const commitmentId = event.args[0];

      await expect(
        commitment.connect(user2).forfeitExpiredCommitment(commitmentId)
      ).to.be.revertedWith("Stride: not expired");
    });
  });

  // ─── Complete ───────────────────────────────────────────

  describe("completeCommitment", function () {
    async function createAndGetId(user, stake) {
      await mockCUSD.connect(user).approve(await commitment.getAddress(), stake);
      const tx = await commitment.connect(user).createCommitment(3000, 0, 3600, stake);
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "CommitmentCreated");
      return event.args[0];
    }

    async function buildProof(commitmentId, actualDistance, actualSteps) {
      const proofNonce = ethers.randomBytes(32);
      const messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "uint256", "uint256", "bytes32"],
        [commitmentId, actualDistance, actualSteps, proofNonce]
      );
      const sig = await verifier.signMessage(ethers.getBytes(messageHash));
      return { proofNonce, sig };
    }

    it("should complete and return stake with valid verifier signature", async function () {
      const commitmentId = await createAndGetId(user1, ONE_DOLLAR);
      const { proofNonce, sig } = await buildProof(commitmentId, 3000, 0);

      const balanceBefore = await mockCUSD.balanceOf(user1.address);
      await commitment.connect(user1).completeCommitment(commitmentId, 3000, 0, proofNonce, sig);
      const balanceAfter = await mockCUSD.balanceOf(user1.address);

      // User gets stake back (at minimum)
      expect(balanceAfter - balanceBefore).to.be.gte(ONE_DOLLAR);
    });

    it("should reject invalid verifier signature", async function () {
      const commitmentId = await createAndGetId(user1, ONE_DOLLAR);
      const proofNonce = ethers.randomBytes(32);
      const messageHash = ethers.solidityPackedKeccak256(
        ["bytes32", "uint256", "uint256", "bytes32"],
        [commitmentId, 3000, 0, proofNonce]
      );
      // Sign with wrong key (user1 instead of verifier)
      const fakeSig = await user1.signMessage(ethers.getBytes(messageHash));

      await expect(
        commitment.connect(user1).completeCommitment(commitmentId, 3000, 0, proofNonce, fakeSig)
      ).to.be.revertedWith("Stride: invalid signature");
    });

    it("should reject if goal not met (distance short)", async function () {
      const commitmentId = await createAndGetId(user1, ONE_DOLLAR);
      const { proofNonce, sig } = await buildProof(commitmentId, 1000, 0); // Only 1km, goal is 3km

      await expect(
        commitment.connect(user1).completeCommitment(commitmentId, 1000, 0, proofNonce, sig)
      ).to.be.revertedWith("Stride: goal not met");
    });

    it("should reject replay of used proof nonce", async function () {
      const commitmentId = await createAndGetId(user1, ONE_DOLLAR);
      const { proofNonce, sig } = await buildProof(commitmentId, 3000, 0);

      await commitment.connect(user1).completeCommitment(commitmentId, 3000, 0, proofNonce, sig);

      // Try to replay with a different commitment — should fail
      const commitmentId2 = await createAndGetId(user2, ONE_DOLLAR);
      await expect(
        commitment.connect(user2).completeCommitment(commitmentId2, 3000, 0, proofNonce, sig)
      ).to.be.revertedWith("Stride: proof already used");
    });
  });
});
