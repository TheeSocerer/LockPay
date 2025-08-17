const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying LPUSD Faucet contract...");

  // Get the contract factory
  const LPUSDFaucet = await ethers.getContractFactory("LPUSDFaucet");
  
  // Deploy the contract
  const faucet = await LPUSDFaucet.deploy();
  
  // Wait for deployment to finish
  await faucet.waitForDeployment();
  
  const address = await faucet.getAddress();
  
  console.log("LPUSD Faucet deployed to:", address);
  console.log("Contract owner:", await faucet.owner());
  
  // Get faucet info
  const info = await faucet.getFaucetInfo();
  console.log("Faucet Info:");
  console.log("- Available tokens:", ethers.formatEther(info[0]), "LPUSD");
  console.log("- Amount per request:", ethers.formatEther(info[1]), "LPUSD");
  console.log("- Cooldown period:", Number(info[2]) / 3600, "hours");
  
  console.log("\nDeployment completed successfully!");
  console.log("Update the FAUCET_CONTRACT_ADDRESS in src/components/LPUSDFaucet.tsx with:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
