const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying CreatorTipping contract to Hemi Network...");

  // Check if private key is set
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in environment variables");
    console.error("Please set PRIVATE_KEY in your .env file");
    process.exit(1);
  }

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Insufficient balance. Please fund your account with ETH on Hemi Network");
    process.exit(1);
  }

  console.log("Getting contract factory...");
  const CreatorTipping = await hre.ethers.getContractFactory("CreatorTipping");
  
  console.log("Deploying contract...");
  const creatorTipping = await CreatorTipping.deploy();

  await creatorTipping.waitForDeployment();

  const contractAddress = await creatorTipping.getAddress();
  console.log("CreatorTipping deployed to:", contractAddress);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress,
    network: "hemi",
    chainId: 43111,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment.json");

  // Verify contract (if supported)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await creatorTipping.deploymentTransaction().wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });