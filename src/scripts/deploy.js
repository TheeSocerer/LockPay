// const hre = require("hardhat");

// async function main() {
//   const [deployer] = await hre.ethers.getSigners();

//   console.log("Deploying contracts with account:", deployer.address);

//   const USDC = await hre.ethers.getContractFactory("ERC20StableCoinMock");
//   const usdc = await USDC.deploy();
//   await usdc.deployed();
//   console.log("USDC deployed at:", usdc.address);

//   const Vault = await hre.ethers.getContractFactory("LockPayVault");
//   const vault = await Vault.deploy(usdc.address);
//   await vault.deployed();
//   console.log("Vault deployed at:", vault.address);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
