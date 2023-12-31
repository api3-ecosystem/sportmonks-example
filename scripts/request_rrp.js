const hre = require("hardhat");
const airnodeAdmin = require("@api3/airnode-admin");
const { encode } = require("@api3/airnode-abi");
const { decode } = require("@api3/airnode-abi");

async function main() {
  const RrpRequester = await hre.deployments.get("RrpRequester");
  const RrpRequesterContract = new hre.ethers.Contract(
    RrpRequester.address,
    RrpRequester.abi,
    (await hre.ethers.getSigners())[0]
  );

  // Set the request parameters for your Airnode Request.
  const airnodeAddress = "0x750eA4B9515c3757661A006C945Af33bbe0A9f91";
  const airnodeXpub =
    "xpub6Bn1nb3T1Sb3GDuJSStALbvokzTykfLVz6LnfecQ5TZENHFSy8vgS4yKTd6krP5hNYCJedxVQ1FUFCsCLx1sKSYkwiKey4EesbyHMgH11pt";
  const endpointId =
    "0x5e411363a56d65ab806e2f6b1e01d0728d6548f9c8b39e64001b67ffe6c76ef9";
  const sponsor = RrpRequester.address;
  const sponsorWallet = await airnodeAdmin.deriveSponsorWalletAddress(
    airnodeXpub,
    airnodeAddress,
    sponsor
  );
  
  console.log(`Sponsor wallet address: ${sponsorWallet}`);
  // Encode your API Params. Check out the docs for more info https://docs.api3.org/reference/airnode/latest/specifications/airnode-abi.html
  //   const params = [
  //     { type: 'string', name: 'param1', value: 'value1' }, { type: 'string', name: 'param2', value: 'value2' }, { type: 'string', name: '_path', value: '' }, { type: 'string', name: '_type', value: 'int256' }
  //     ];
  const params = [
    { type: "string", name: "_path", value: "data.0.country_id" },
    { type: "string", name: "_type", value: "int256" },
  ];
  const encodedParameters = encode(params);

  // Make a request...
  const receipt = await RrpRequesterContract.makeRequest(
    airnodeAddress,
    endpointId,
    sponsor,
    sponsorWallet,
    encodedParameters,
    { gasLimit: 500000 }
  );
  console.log(
    "Created a request transaction, waiting for it to be confirmed..."
  );
  // and read the logs once it gets confirmed to get the request ID
  const requestId = await new Promise((resolve) =>
    hre.ethers.provider.once(receipt.hash, (tx) => {
      // We want the log from RrpRequesterContract
      const log = tx.logs.find(
        (log) => log.address === RrpRequesterContract.address
      );
      const parsedLog = RrpRequesterContract.interface.parseLog(log);
      resolve(parsedLog.args.requestId);
    })
  );
  console.log(`Transaction is confirmed, request ID is ${requestId}`);

  // Wait for the fulfillment transaction to be confirmed and read the logs to get the random number
  console.log("Waiting for the fulfillment transaction...");
  const log = await new Promise((resolve) =>
    hre.ethers.provider.once(
      RrpRequesterContract.filters.RequestFulfilled(requestId, null),
      resolve
    )
  );
  const parsedLog = RrpRequesterContract.interface.parseLog(log);
  const decodedData = parsedLog.args.response;
  console.log(
    `Fulfillment is confirmed, response is ${decodedData.toString()}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
