require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version:"0.8.4",
    optimizer:{
      enabled:true,
      runs:200
    }
  },
  networks: {
    hardhat: {
        accounts: {
            count: 1005,
            accountsBalance:"1000000000000000000000000"

        }
    }
},
gasReporter: {
  enabled: true,
  gasPriceApi : "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  currency:"USD",
  token:"ETH",
  showTimeSpent:true,

}
};
