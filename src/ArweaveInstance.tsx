import React, { useEffect } from "react";
import Arweave from "arweave";
import TestWeave from "testweave-sdk";
import { JWKInterface } from "arweave/node/lib/wallet";
import { wkey } from "./wkey/wkey";

const ArweaveInstance = async () => {
  console.log("Connecting to Arweave");
  const arweave = Arweave.init({
    host: "localhost",
    port: 1984,
    protocol: "http",
    // timeout: 10000,
    // logging: true,
  });
  console.log("arweave connected ", arweave);

  const tw = await TestWeave.init(arweave);
  console.log("TestWeave is now initialized");
  console.log(tw);
  const jwk = wkey;
  const generatedAddr = await arweave.wallets.getAddress(jwk);
  console.log("Ar Address: ", generatedAddr);
  await tw.drop(generatedAddr, "1000000000");
  const generatedAddressBalance = await arweave.wallets.getBalance(
    generatedAddr
  );
  console.log("Ar Address Balance: ", generatedAddressBalance);
  return { tw, jwk, arweave };
};

export default ArweaveInstance;
