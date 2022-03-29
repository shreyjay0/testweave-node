import React, { useEffect } from "react";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { wkey } from "../wkey/wkey";
import useFetchGraph from "../useFetchGraph";
import { Buffer } from "buffer";

const wallet = "0xaknsdiasf87ads98cbaisdf";
const fundWallet = async (arweave: Arweave, jwk: JWKInterface) => {
  const addr = await arweave.wallets.jwkToAddress(jwk);

  const balance = await arweave.wallets.getBalance(addr);
  console.log("Balance: ", balance);
  if (Number(balance) < 100000000) {
    try {
      await arweave.api.get(`mint/${addr}/10000000000`);
    } catch (e) {
      console.log(e);
    }
  }
};
const ConnectAr = async () => {
  const arweave = Arweave.init({
    host: "localhost",
    port: 1984,
    protocol: "http",
  });
  const jwk = wkey;
  const addr = await arweave.wallets.jwkToAddress(jwk);
  fundWallet(arweave, jwk);
  return { arweave, jwk, addr };
};

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
  | "Stroke"
  | "Heart Attack"
  | "Asthma"
  | "Respiratory Infection"
  | "Transplant"
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
  id: string;
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

function Onboard() {
  const [organiserInfo, setOrganiserInfo] = React.useState<OrganiserTypes>({
    organiserName: "",
    organiserPubkey: "",
    organiserEmail: "",
    organiserId: "",
    organiserCountry: "",
    organiserPin: "",
  });
  const [campaignInfo, setCampaignInfo] = React.useState<CampaignDetails>({
    id: "",
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

  const { graph, error, loading } = useFetchGraph(
    "POST",
    "http://localhost:1984/graphql",
    `query Campaigns($tags: [TagFilter!]) {
        transactions(tags: $tags) {
            edges { 
                node{
                    id
                    data {
                      type
                      size
                    }
                    tags {
                      name
                      value
                    }
                    block {
                        timestamp
                        height
                    }
                }
            }
        }
    }`,

    {
      tags: [
        {
          name: "Content-Code",
          values: ["campaign"],
        },
      ],
    }
  );

  const generateId = (title: string) => {
    const id =
      title.toLowerCase().replace(/\s/g, "-") +
      "-" +
      wallet.substring(0, 4) +
      wallet.substring(wallet.length - 4, wallet.length) +
      "-" +
      Date.now();
    return id;
  };
  const [uploadStatus, setUploadStatus] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const handleFileUploadToArweave = async (fileblb: Blob, fname: string) => {
    const { arweave, jwk } = await ConnectAr();
    const fileread = new window.FileReader();
    fileread.readAsArrayBuffer(fileblb);
    fileread.onloadend = () => {
      uploadAsBuffer(fileread.result as ArrayBuffer);
    };
    const uploadAsBuffer = async (fr: ArrayBuffer) => {
      const fileBuffer = await Buffer.from(fr);
      const fileType = fileblb?.type;
      const fileSize = fileblb?.size;
      if (fileSize < 1024 * 1024 * 1024 * 8) {
        const txn = await arweave.createTransaction(
          {
            data: fileBuffer,
          },
          jwk
        );
        txn.addTag("App-Name", "Beneficence");
        txn.addTag("App-Version", "1.0");
        txn.addTag("Content-Type", fileType);
        txn.addTag("Content-Code", "image");
        txn.addTag("Content-Name", fname);
        txn.addTag("Campaign-Id", campaignInfo.id);
        txn.addTag("Campaign-author", wallet);
        await arweave.transactions.sign(txn, jwk);
        setIsUploading(true);

        const uploadr = await arweave.transactions.getUploader(txn);
        while (uploadr.isComplete === false) {
          await uploadr.uploadChunk();
          setUploadStatus(`Uploading... ${uploadr.pctComplete}%`);
        }
        console.log(uploadr);
        await arweave.api.get("mine");
        const mined = await arweave.transactions.get(txn.id);
        const block = mined.block;
        console.log("Block: ", block);
        setUploadStatus("");
      } else {
        alert("File size is too large");
      }
    };
  };

  const handleTxn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCampaignInfo({
      ...campaignInfo,
      id: generateId(campaignInfo.title),
    });
    console.log("submitting campaign data");
    const { arweave, jwk, addr } = await ConnectAr();
    const data = JSON.stringify({
      organiser: organiserInfo,
      campaign: campaignInfo,
      pon: ponInfo,
      pou: pouInfo,
      whyDonate: whyDonateInfo,
    });
    console.log("JWK: ", jwk);
    const txn = await arweave.createTransaction(
      {
        data,
      },
      jwk
    );
    console.log("txn: ", txn);
    txn.addTag("App-Name", "Beneficence");
    txn.addTag("App-Version", "1.0");
    txn.addTag("Content-Type", "application/json");
    txn.addTag("Content-Code", "campaign");
    txn.addTag("Campaign-Id", campaignInfo.id);
    txn.addTag("Organiser", organiserInfo.organiserPubkey);
    if (campaignInfo.tags.length > 0) {
      txn.addTag(`Campaign-Category`, campaignInfo.tags.join(","));
    } else {
      txn.addTag(`Campaign-Category`, "None");
    }

    await arweave.transactions.sign(txn, jwk);
    const txn_success = await arweave.transactions.post(txn);
    console.log("txn id: ", txn.id);
    await arweave.api.get("mine");
    const mined = await arweave.transactions.get(txn.id);
    const block = mined.block;
    console.log("Block: ", block);
  };

  const fetchTxnData = async (txnId: string) => {
    const { arweave } = await ConnectAr();
    const txn = await arweave.transactions.get(txnId);
    const data = txn.get("data", { decode: true, string: true });
    const parsedData = JSON.parse(data);
    console.log("parsedData: ", parsedData);
  };

  return (
    <div>
      <form className="form-onboard" onSubmit={handleTxn}>
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e && e.target && e.target.files && e.target.files.length > 0) {
              const file = e.target.files[0];
              const fname = file.name;
              handleFileUploadToArweave(file, fname);
            }
          }}
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            if (e && e.target && e.target.files && e.target.files.length > 0) {
              const file = e.target.files[0];
              const fname = file.name;
              handleFileUploadToArweave(file, fname);
            }
          }}
        />
        <div>{uploadStatus}</div>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : error !== "" ? (
        <div>{error}</div>
      ) : (
        <div>{JSON.stringify(graph)}</div>
      )}
    </div>
  );
}

export default Onboard;
