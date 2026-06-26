require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// USDm contract addresses per network
const USDm_ADDRESSES = {
  celo: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  alfajores: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
};

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\nDeploying StrideRewardPool to ${network}`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} CELO\n`);

  const USDmAddress = USDm_ADDRESSES[network];
  if (!USDmAddress) {
    throw new Error(`No USDm address configured for network: ${network}`);
  }
  console.log(`USDm address: ${USDmAddress}`);

  const RewardPool = await hre.ethers.getContractFactory("StrideRewardPool");
  // Deploy with ZeroAddress for commitmentContract — linked on Day 2
  const rewardPool = await RewardPool.deploy(hre.ethers.ZeroAddress, USDmAddress);
  await rewardPool.waitForDeployment();
  const rewardPoolAddress = await rewardPool.getAddress();

  console.log(`\nStrideRewardPool deployed: ${rewardPoolAddress}`);

  // Save deployment record
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);

  const recordPath = path.join(deploymentsDir, `${network}.json`);
  const existing = fs.existsSync(recordPath)
    ? JSON.parse(fs.readFileSync(recordPath, "utf8"))
    : {};

  const record = {
    ...existing,
    network,
    deployer: deployer.address,
    USDm: USDmAddress,
    StrideRewardPool: rewardPoolAddress,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  console.log(`Saved to deployments/${network}.json`);

  console.log("\nAdd to contracts/.env:");
  console.log(`REWARD_POOL_ADDRESS=${rewardPoolAddress}`);

  if (network === "alfajores") {
    console.log(`\nView: https://alfajores.celoscan.io/address/${rewardPoolAddress}`);
  } else if (network === "celo") {
    console.log(`\nView: https://celoscan.io/address/${rewardPoolAddress}`);
  }
}

main().catch((err) => {
  console.error("\nDeployment failed:", err);
  process.exitCode = 1;
});
