const { ethers } = require("hardhat");

describe("VestingWallet", function () {
  let vestingWallet;
  let owner;
  let oneYear;

  beforeEach(async () => {
    const [account] = await ethers.getSigners();
    owner = account.address;
    oneYear = 31556926; // One year in seconds

    const VestingWallet = await ethers.getContractFactory("VestingWallet");
    vestingWallet = await VestingWallet.deploy(
      owner,
      block.timestamp,
      oneYear,
      "MyToken",
      "MTK",
      1000000
    );
    await vestingWallet.deployed();
  });

  describe("deployment", function () {
    it("should have the correct owner", async () => {
      const contractOwner = await vestingWallet.owner();
      expect(contractOwner).to.equal(owner);
    });

    it("should have the correct start time", async () => {
      const expectedStart = block.timestamp;
      const actualStart = await vestingWallet.start();
      expect(expectedStart).to.be.closeTo(actualStart, 1); // Allow for slight time difference
    });

    it("should have the correct duration", async () => {
      const expectedDuration = oneYear;
      const actualDuration = await vestingWallet.duration();
      expect(expectedDuration).to.equal(actualDuration);
    });
  });

  describe("released", function () {
    it("should be 0 after deployment", async () => {
      const released = await vestingWallet.released();
      expect(released).to.equal(0);
    });

    // Add more tests for released function after funding and time manipulation
  });

  describe("vestedAmount", function () {
    it("should be 0 before start time", async () => {
      const newTimestamp = block.timestamp - 100; // Simulate time before start
      const vestedAmount = await vestingWallet.vestedAmount(newTimestamp);
      expect(vestedAmount).to.equal(0);
    });

    it("should be the entire allocation after end time", async () => {
      const newTimestamp = block.timestamp + oneYear + 100; // Simulate time after end
      const vestedAmount = await vestingWallet.vestedAmount(newTimestamp);
      expect(vestedAmount).to.equal(1000000);
    });

    // Add more tests for vestedAmount function with different time manipulations
  });

  describe("release", function () {
    it("should not release anything before the start time", async () => {
      await expect(vestingWallet.release()).to.be.revertedWith("No releasable amount");
    });

    // Add more tests for release function after funding and time manipulation
  });
});
