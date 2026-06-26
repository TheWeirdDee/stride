// npx hardhat run deploy/02_deploy_commitment.js --network celo
// npx hardhat run deploy/02_deploy_commitment.js --network alfajores

require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const USDm_ADDRESSES = {
  celo: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  alfajores: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
};

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\nDeploying StrideCommitment to ${network}`);
  console.log(`Deployer: ${deployer.address}`);

  const verifierAddress = process.env.VERIFIER_ADDRESS;
  const rewardPoolAddress = process.env.REWARD_POOL_ADDRESS;
  const USDmAddress = USDm_ADDRESSES[network];

  if (!verifierAddress) throw new Error("Missing VERIFIER_ADDRESS in .env");
  if (!rewardPoolAddress) throw new Error("Missing REWARD_POOL_ADDRESS in .env");
  if (!USDmAddress) throw new Error(`No USDm address for network: ${network}`);

  console.log(`Verifier:   ${verifierAddress}`);
  console.log(`RewardPool: ${rewardPoolAddress}`);
  console.log(`USDm:       ${USDmAddress}\n`);

  const Commitment = await hre.ethers.getContractFactory("StrideCommitment");
  const commitment = await Commitment.deploy(verifierAddress, rewardPoolAddress, USDmAddress);
  await commitment.waitForDeployment();
  const commitmentAddress = await commitment.getAddress();
  console.log(`StrideCommitment deployed: ${commitmentAddress}`);

  // Link RewardPool → Commitment
  console.log("\nLinking RewardPool → Commitment...");
  const RewardPool = await hre.ethers.getContractAt("StrideRewardPool", rewardPoolAddress);
  const tx = await RewardPool.setCommitmentContract(commitmentAddress);
  await tx.wait();
  console.log("Linked");

  // Save deployment record
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);

  const recordPath = path.join(deploymentsDir, `${network}.json`);
  const existing = fs.existsSync(recordPath)
    ? JSON.parse(fs.readFileSync(recordPath, "utf8"))
    : {};

  const record = {
    ...existing,
    StrideCommitment: commitmentAddress,
    verifier: verifierAddress,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  console.log(`\nSaved to deployments/${network}.json`);
  console.log(`\nAdd to .env.local:\nNEXT_PUBLIC_COMMITMENT_CONTRACT=${commitmentAddress}`);

  if (network === "celo") {
    console.log(`\nView: https://celoscan.io/address/${commitmentAddress}`);
  } else {
    console.log(`\nView: https://alfajores.celoscan.io/address/${commitmentAddress}`);
  }
}

main().catch((err) => {
  console.error("\nDeployment failed:", err);
  process.exitCode = 1;
});
