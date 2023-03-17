const { ethers } = require("ethers");
const { Network, Alchemy } = require("alchemy-sdk");
const { resolveName, resolveAddress } = require("sns-namechecker");
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const app = express(),
  DEFAULT_PORT = process.env.PORT;
app.use(cors());
app.use(express.json());

/////////// Alchemy//////////////////////////////////
const settings = {
  apiKey: "m2kl19Y9cKqyHK6UlvQa_MvZ7kqPdOwL",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);
///////////////////////////////////////////////////////

async function main() {
  const generateNewWallet = () => {
    const newWallet = ethers.Wallet.createRandom();
    return newWallet;
  };

  const restoreWallet = async (pk) => {
    const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
    const wallet = new ethers.Wallet(pk, provider);
    return wallet;
  };

  const fetchTokenBalances = async (account) => {
    const balances = await alchemy.core.getTokenBalances(account);
    return balances;
  };

  // APIS
  app.get("/api/newwallet", async (req, res) => {
    const wallet = generateNewWallet();
    const privateKey = wallet.privateKey;
    const parsedWallet = JSON.parse(JSON.stringify({ wallet, privateKey }));

    res.status(200).json(parsedWallet);
  });

  app.post("/api/restorewallet/", async (req, res) => {
    const privateKey = req.body.pk;
    try {
      const newWallet = await restoreWallet(privateKey);
      const parsedWallet = JSON.parse(
        JSON.stringify({ newWallet, privateKey })
      );

      res.status(200).json(parsedWallet);
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/api/gettokenbalances/", async (req, res) => {
    try {
      const balances = await fetchTokenBalances(req.body.account);
      res.status(200).send(balances);
    } catch (error) {
      console.log(error);
    }
  });

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
