import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const YOUR_LOCAL_WALLET_ADDRESS = "0x50807f51f84094756a9fbb50275c5db882B2C522";

const deployVotingManager: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const votingManager = YOUR_LOCAL_WALLET_ADDRESS;

  await deploy("VotingRoom", {
    from: deployer,
    args: [votingManager],
    log: true,
    autoMine: true,
  });
};

export default deployVotingManager;

deployVotingManager.tags = ["VotingRoom"];
