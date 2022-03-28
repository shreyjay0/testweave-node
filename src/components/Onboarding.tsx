import React, { useEffect } from "react";
import Arweave from "arweave";
import TestWeave from "testweave-sdk";
import { JWKInterface } from "arweave/node/lib/wallet";
import { wkey } from "../wkey/wkey";
import ArweaveInstance from "../ArweaveInstance";

type OrganiserTypes = {
  organiserName: string;
  organiserPubkey: string;
  organiserEmail: string;
  organiserId: string;
  organiserCountry: string;
  organiserPin: string;
};
type CampaignTags =
  | "Diabetes"
  | "Cancer"
  | "Cardiovascular"
  | "Alzheimer"
  | "Hypertension"
  | "Obesity"
  | "Old Age"
  | "Infection"
  | "Cerebral palsy"
  | "Mental Disorder"
  | "Schizophrenia"
  | "Autism"
  | "Depression"
  | "HIV"
  | "Hemorrhage"
  | "Tumomur"
  | "Kidney"
  | "Brain"
  | "Addiction"
  | "Stroke"
  | "Operation"
  | "Medicine"
  | "Treatment"
  | "Dementia"
  | "Pneumonia";

type CampaignDetails = {
  title: string;
  description: string;
  goal: number;
  createdDate: string;
  startDate: string;
  stoppedDate: string;
  status: string;
  cover: string;
  tags: Array<CampaignTags>;
};

type PONTypes = {
  description?: string;
  imgArr: string[];
};

type POUTypes = {
  description: string;
  imgArr: string[];
};

type WhyDonateType = { hasContent: boolean; text?: string };

interface CampaignArweaveTypes {
  id: string;
  organiser: OrganiserTypes;
  campaign: CampaignDetails;
  pon: PONTypes;
  pou?: POUTypes;
  whyDonate: WhyDonateType;
}

function Onboarding() {
  const [organiserInfo, setOrganiserInfo] = React.useState<OrganiserTypes>({
    organiserName: "",
    organiserPubkey: "",
    organiserEmail: "",
    organiserId: "",
    organiserCountry: "",
    organiserPin: "",
  });
  const [campaignInfo, setCampaignInfo] = React.useState<CampaignDetails>({
    title: "",
    description: "",
    goal: 0,
    createdDate: "",
    startDate: "",
    stoppedDate: "",
    status: "",
    cover: "",
    tags: [],
  });

  const [ponInfo, setPonInfo] = React.useState<PONTypes>({
    description: "",
    imgArr: [],
  });

  const [pouInfo, setPouInfo] = React.useState<POUTypes>({
    description: "",
    imgArr: [],
  });

  const [whyDonateInfo, setWhyDonateInfo] = React.useState<WhyDonateType>({
    hasContent: false,
  });

  // const [address, setAddress] = React.useState("");
  // const [balance, setBalance] = React.useState("");
  // const setData = async (jwk: JWKInterface) => {
  //   console.log("Setting address...");
  //   console.log("jwk: ", jwk);
  //   const addr = await arweave.wallets.jwkToAddress(jwk);
  //   setAddress(addr);
  //   const bal = await arweave.wallets.getBalance(addr);
  //   setBalance(bal);
  //   console.log("Address: ", addr);
  //   console.log("Balance: ", bal);
  // };

  useEffect(() => {
    try {
      console.log("ok");
    } catch (error) {
      console.log("Error fetching from arweave ", error);
    }
  }, []);

  const handleTxn = async () => {
    const arInstnce = await ArweaveInstance();
    const { tw, jwk, arweave } = arInstnce;

    const data = JSON.stringify({
      organiser: organiserInfo,
      campaign: campaignInfo,
      pon: ponInfo,
      pou: pouInfo,
      whyDonate: whyDonateInfo,
    });
    console.log("Data: ", data);
    console.log("JWK: ", jwk);
    const txn = await arweave.createTransaction({ data }, jwk);
    txn.addTag("App-Name", "Beneficence");
    txn.addTag("App-Version", "1.0");
    txn.addTag("Content-Type", "application/json");
    await arweave.transactions.sign(txn, jwk);
    const onSign = await arweave.transactions.getStatus(txn.id);
    console.log(onSign);

    console.log("Signed txn: ", txn);
    console.log("Signed txn id: ", txn.id);
    const res = await arweave.transactions.post(txn);
    console.log("Posted txn: ", res);
    console.log("started mining");
    const mined = await tw.mine();
    console.log("Mined obj: ", mined);
    console.log("Result of mined block: ", mined);
  };

  return (
    <div>
      <form
        className="form-onboard"
        onSubmit={() => {
          console.log("submitting");
          handleTxn();
        }}
      >
        <input
          className="organiser-name"
          type="text"
          placeholder="Name"
          onChange={(e) => {
            setOrganiserInfo({
              ...organiserInfo,
              organiserName: e.target.value,
            });
          }}
        />
        <input
          className="organiser-pubkey"
          type="text"
          placeholder="Pubkey"
          onChange={(e) => {
            setOrganiserInfo({
              ...organiserInfo,
              organiserPubkey: e.target.value,
            });
          }}
        />
        <input
          className="organiser-email"
          type="text"
          placeholder="Email"
          onChange={(e) => {
            setOrganiserInfo({
              ...organiserInfo,
              organiserEmail: e.target.value,
            });
          }}
        />
        <input
          className="organiser-id"
          type="text"
          placeholder="Organiser Id"
          onChange={(e) => {
            setOrganiserInfo({ ...organiserInfo, organiserId: e.target.value });
          }}
        />
        <input
          className="organiser-country"
          type="text"
          placeholder="Country"
          onChange={(e) => {
            setOrganiserInfo({
              ...organiserInfo,
              organiserCountry: e.target.value,
            });
          }}
        />
        <input
          className="organiser-pin"
          type="text"
          placeholder="Pin"
          onChange={(e) => {
            setOrganiserInfo({
              ...organiserInfo,
              organiserPin: e.target.value,
            });
          }}
        />

        <input
          className="campaign-title"
          type="text"
          placeholder="Campaign Title"
          onChange={(e) => {
            setCampaignInfo({ ...campaignInfo, title: e.target.value });
          }}
        />
        <input
          className="campaign-description"
          type="text"
          placeholder="Description"
          onChange={(e) => {
            setCampaignInfo({ ...campaignInfo, description: e.target.value });
          }}
        />
        <input
          className="campaign-img"
          type="text"
          placeholder="Image link"
          onChange={(e) => {
            setCampaignInfo({ ...campaignInfo, cover: e.target.value });
          }}
        />
        <input
          className="campaign-goal"
          type="number"
          placeholder="Goal"
          onChange={(e) => {
            setCampaignInfo({ ...campaignInfo, goal: Number(e.target.value) });
          }}
        />
        <input type="submit" value="Submit details" />
      </form>
    </div>
  );
}

export default Onboarding;
