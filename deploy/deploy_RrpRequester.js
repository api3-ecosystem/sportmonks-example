const hre = require("hardhat");
const airnodeAdmin = require('@api3/airnode-admin');

module.exports = async () => {
    // AirnodeRRP Contract address. Get the address for your chain from the https://docs.api3.org/
    airnodeRrp = "0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd";
    const RrpRequester = await hre.deployments.deploy("RrpRequester", {
        args: [airnodeRrp],
        from: (await hre.getUnnamedAccounts())[0],
        log: true,
        gasLimit: 2100000,
    });
    console.log(`Deployed RrpRequester at ${RrpRequester.address}`);
    console.log(`RrpRequester contract deployed!`);
    const RrpRequesterContract = new hre.ethers.Contract(
        RrpRequester.address,
        RrpRequester.abi,
        hre.ethers.provider.getSigner()
    );
};

module.exports.tags = ['RrpRequester'];