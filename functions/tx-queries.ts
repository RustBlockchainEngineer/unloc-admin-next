import { allocateLiqMinRwds, getVotingSessionKey } from "@/utils/spl-utils/unloc-voting";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair } from "@solana/web3.js";
import { VotingSessionInfo } from "@unloc-dev/unloc-sdk-voting";

/*
sending transactions from backend.
*/
const CLUSTER_URL = process.env.CLUSTER_URL ?? 'https://solana-api.projectserum.com';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY ?? bs58.encode(Keypair.generate().secretKey);
const signer = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));
const CONNECTION = new Connection(CLUSTER_URL, 'finalized');


//for vote contract. repeated regularly
export const repeatCheckAndAllocateLiqMinRwds = () => {
  const VOTING_INTERVAL = process.env.VOTING_INTERVAL ?? '300';
  const interval = parseInt(VOTING_INTERVAL);
  setInterval(checkAndAllocateLiqMinRwds,interval);
}


//for vote contract
export const checkAndAllocateLiqMinRwds = async (): Promise<number> => {
  //get all projects/collections
  const votingSessionInfo = getVotingSessionKey();
  let allocatedCount = 0;
  try{
    const votingSessionData = await VotingSessionInfo.fromAccountAddress(CONNECTION, votingSessionInfo);
    const emissionsData = votingSessionData.emissions;
    const projectsData = votingSessionData.projects;
    if(emissionsData.allocationsUpdatedCount === projectsData.totalProjects){
      console.log("All is already allocated!");
      return 0;
    }
    for(const project of projectsData.projects){
      if(project.active && project.allocationUpdatedAt < emissionsData.udpatedAt){
        const projectId = project.id;
        const collectionNft = project.collectionNft;
        try {
          const tx = await allocateLiqMinRwds(signer.publicKey, projectId, collectionNft);
          const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
          } = await CONNECTION.getLatestBlockhashAndContext()
          const signature = await CONNECTION.sendTransaction(tx, [signer], {minContextSlot, skipPreflight: true});
          const result = await CONNECTION.confirmTransaction(
            { blockhash, lastValidBlockHeight, signature },
            'finalized'
          )
          if(!result.value.err){
            allocatedCount++;
          }
        } catch(e){
          console.log("failed for this collectionNft: ", collectionNft.toString());
        }
      }
    }
  } catch(e){
    console.log("allocateLiqMinRwds error: ", e);
  }
  return allocatedCount;
}
