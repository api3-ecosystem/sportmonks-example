## Getting Started with Sportmonks F1 Airnode

This repo contains some basic contracts and scripts to get started with using Sportmonks F1 Airnode.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

[API3 Docs](https://docs.api3.org)

[Guides for QRNG, Airnode and dAPIs](https://docs.api3.org/guides/)

[API3 Discord](https://discord.com/channels/758003776174030948/765618225144266793)

## Installation and Setup

Clone the repo:
```shell
git clone https://github.com/api3-ecosystem/sportmonks-example.git && cd sportmonks-example
```

To install all the dependencies, run the following command:
```shell
yarn
```

- Make `credentials.json` and add your mnemonic for the network/s you will work with. This wallet needs to be funded to cover the gas costs to deploy/use the contracts.

```bash
$ cp credentials.example.json credentials.json
```

## Making a request to the SportMonks F1 Airnode

For the Hackathon, we've integrated and deployed an Airnode for [SportMonks F1 API](https://docs.sportmonks.com/formula-one/) on Goerli Testnet. The following steps are used to deploy a requester that calls the [GET Track Winners by Season ID](https://docs.sportmonks.com/formula-one/our-api/winners/get-track-winners-by-season-id) endpoint.

#### 1. Setup
Please follow the setup instructions [here](#installation-and-setup) before going to step 2

#### 2. Deploy the Requester contract
run the following command to deploy a requester contract

```
yarn deploy-rrp-requester
```

this will deploy the `RrpRequester` contract. You can use this contract as a template to make calls to the Sportsmonk API.

Make sure to change your RRP Address in the `deploy/deploy_RrpRequester.js` file. Check out the RRP Address for your chain [here](https://docs.api3.org/reference/airnode/latest/)

Once you run the command note down the `RrpRequester` address.

#### 3. Deriving the sponsorWallet and funding it

The `sponsorWallet` covers the gas costs for the fulfillment of the request, so we need to derive and fund it. Run the following command to derive the sponsorWallet making sure that you replaced `<YOUR-REQUESTER_CONTRACT-ADDRESS>` with the RrpRequester address you deployed in step 3

```
npx @api3/airnode-admin derive-sponsor-wallet-address \
  --airnode-xpub xpub6C9hFCLsUsU1dPMDaf5cDKiFwxUsET6zmAHxqLWaUBW2jJejjW2GpAxMY4HAeHkBGxeu9hdSyDoLJM7R23jGTfYekWjMcLvtvzrKszarDGY \
  --airnode-address 0xB0B2C57c67aB89c3c65480C4aDE37b66d418c68e \
  --sponsor-address <YOUR-REQUESTER_CONTRACT-ADDRESS>
```
- You now need to fund the outputted `sponsorWallet` with some Goerli ETH (around 0.2) for the Airnode to be able to fulfill the request.

#### 4. Making the Request

- To make a request to an Airnode, you'll have to update `script/request_rrp.js` with your `airnodeAddress`, `endpointId` and `encodedParameters`.

The airnode address will always be `0xB0B2C57c67aB89c3c65480C4aDE37b66d418c68e`

For the [GET Track Winners by Season ID](https://docs.sportmonks.com/formula-one/our-api/winners/get-track-winners-by-season-id) endpoint, the endpointId is `0x6e58ace4ab94d28da59ec1da675b513cc21a3ca9656228c0b052563a2eb88b3e`

You'll have to encode your API parameters using `@api3/airnode-abi` and pass them to the `makeRequest` function of the Airnode.

For example, the [GET Track Winners by Season ID](https://docs.sportmonks.com/formula-one/our-api/winners/get-track-winners-by-season-id) endpoint takes in a `seasonId` as a parameter. You would also have to specify the `_path` of the returned json object that needs to be picked up by the Airnode and `_type` specifies the datatype of the returned object.



```
const params = [
      {type: 'string', name: 'seasonID', value: '6'}, 
      { type: 'string', name: '_path', value: 'data.0.id' }, 
      { type: 'string', name: '_type', value: 'int256' }
    ];
```

the following params are then encoded in the [`/scripts/request_rrp.js`](https://github.com/api3-ecosystem/getting-started/blob/3ba99782013dd98513f0a16db36138da1a6eaeaa/scripts/request_rrp.js#L36) script before being used to make the request to the airnode. If you want to use different parameters or `endpointIds` you can modify the params object as needed.

run the following command to make the request:
```
yarn request-rrp
```
this will make the request, within 100 seconds the sports monk airnode should reply with the response.

#### 5. Using different endpoints

you can use other endpoints apart from [Track Winners by Season ID](https://docs.sportmonks.com/formula-one/our-api/winners/get-track-winners-by-season-id). Here is a list of endpoints and `endpointIds`

| endpointId                                                          | endpointName                      |
|--------------------------------------------------------------------|----------------------------------|
| 0x57c5bb899a5c043fce53a6e07d9fea61a4a45cca235394643940b97448581775 | GET Seasons                       |
| 0xeb2cbbf54641ec2ea238d7642d2cdab5f05d1d7b8c0e01eebb980e2efc404ef6 | GET Season by ID                  |
| 0xb6bca02f1581caa90ab6c87699bac03f7d3ee3800fd577daa308d5f0c46705c6 | GET Track by ID                   |
| 0x55cb4b96d5d43ef148afdb952b9086be1eba294f3ea8eedd1f56d042f86caf71 | GET Livescores                    |
| 0x5e411363a56d65ab806e2f6b1e01d0728d6548f9c8b39e64001b67ffe6c76ef9 | GET All Tracks                    |
| 0x3f2a4b351484dcfd3d2b1eae4fc568958cba6634bc6da4942d4e2063ce616785 | GET Track by Season ID            |
| 0x2269f02ca8f88f591c31c680a7ede6b98fced99b1bdc9aea0af34ef80188e165 | Get All Stages                    |
| 0x57f1f9e6abfe7fcb9f4866c14a6d9383e35592c29204618920e54db5bc545d34 | Get Stage By ID                   |
| 0x1f2fae21194ceb6d20f80288a416d2830fe253723febefea6c9d0e2e74ca9ab7 | Get Stages By Season ID           |
| 0xeed59ffe3675fc3575aea2be9cd1b5c6899b4aef5e58b402c3315c1f610c0cc6 | Get Team By ID                    |
| 0x2fe92cab42077a7a758127a9762d6426108cd3fe45221a19a1d32ae768c49f0d | GET Teams By Season ID            |
| 0x538a8c4c2ec3eb39a13eb5fdacdc1fc08f645a545759f3826c8314cfef91caec | Get Season Race Result            |
| 0xaf120a9318bb29bd07bfa61babd4cdbeb4f09c50e2efc6ad798dedc6fbad43ce | Get Driver By ID                  |
| 0x2fb81fe04e44ace4c883cfbd7c6a14d607dafbee71c428d00abda1465697eb13 | Get Season Race Results           |
| 0x04437039d9785dce6043d591ced7866930670e6dc36c5ab11de860f20315a456 | GET Drivers By Season ID          |
| 0x6e58ace4ab94d28da59ec1da675b513cc21a3ca9656228c0b052563a2eb88b3e | GET Track Winners by Season ID    |

when choosing a different `endpointId` make sure to modify the [`/scripts/request_rrp.js`](https://github.com/api3-ecosystem/getting-started/blob/3ba99782013dd98513f0a16db36138da1a6eaeaa/scripts/request_rrp.js) script with the appropriate `endpointId` and params