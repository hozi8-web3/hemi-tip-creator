const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Testing Hemi Network connection...\n");

  // Check environment variables
  console.log("Environment Variables:");
  console.log("- PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✅ Set" : "❌ Not set");
  console.log("- Network:", hre.network.name);
  console.log("- RPC URL:", hre.network.config.url);
  console.log("- Chain ID:", hre.network.config.chainId);

  if (!process.env.PRIVATE_KEY) {
    console.error("\n❌ PRIVATE_KEY not found in environment variables");
    console.error("Please set PRIVATE_KEY in your .env file");
    process.exit(1);
  }

  try {
    // Test network connection
    console.log("\n🌐 Testing network connection...");
    const provider = hre.ethers.provider;
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name, "Chain ID:", network.chainId.toString());

    // Test signer
    console.log("\n🔑 Testing signer...");
    const [signer] = await hre.ethers.getSigners();
    console.log("✅ Signer address:", signer.address);

    // Check balance
    console.log("\n💰 Checking balance...");
    const balance = await provider.getBalance(signer.address);
    const balanceEth = hre.ethers.formatEther(balance);
    console.log("✅ Balance:", balanceEth, "ETH");

    if (balance === 0n) {
      console.warn("⚠️  Warning: Account has 0 ETH. You'll need ETH to deploy contracts.");
      console.log("   Get ETH from Hemi Network faucet or bridge from another network.");
    }

    // Test contract factory
    console.log("\n📄 Testing contract compilation...");
    const CreatorTipping = await hre.ethers.getContractFactory("CreatorTipping");
    console.log("✅ Contract factory created successfully");

    console.log("\n🎉 All tests passed! You can now deploy the contract:");
    console.log("   npm run deploy");

  } catch (error) {
    console.error("\n❌ Connection test failed:", error.message);
    
    if (error.message.includes("invalid private key")) {
      console.error("   Check that your PRIVATE_KEY is valid (64 hex characters)");
    } else if (error.message.includes("network")) {
      console.error("   Check your internet connection and RPC URL");
    }
    
    process.exit(1);
  }
}

main().catch(console.error);