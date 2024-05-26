const { ethers } = require("hardhat");

async function main() {
  // Retrieve the deployer's account
  const [deployer] = await ethers.getSigners();

  // Output the address of the deployer
  console.log("Deploying contracts with the account:", deployer.address);

  // Output the balance of the deployer's account
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Set the deployment parameters
  const beneficiary = deployer.address; // You can change this to the actual beneficiary address
  const startTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
  const durationSeconds = 31556926; // One year in seconds
  const tokenName = "MyToken";
  const tokenSymbol = "MTK";
  const tokenInitialSupply = 1000000; // Initial token supply

  // Get the VestingWallet contract factory
  const VestingWallet = await ethers.getContractFactory("VestingWallet");

  // Deploy the contract
  const vestingWallet = await VestingWallet.deploy(
    beneficiary,
    startTimestamp,
    durationSeconds,
    tokenName,
    tokenSymbol,
    tokenInitialSupply,
    { value: ethers.utils.parseEther("0.1") } // Optional: send some initial Ether to the contract
  );

  // Wait for the contract to be deployed
  await vestingWallet.deployed();

  // Output the address of the deployed contract
  console.log("VestingWallet deployed to:", vestingWallet.address);
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
