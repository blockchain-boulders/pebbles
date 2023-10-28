import { TallierContract } from '../artifacts/Tallier.js';
import { callContractFunction, deployContract, getWallet } from '../index.js';
import {
  AccountWallet,
  AztecAddress,
  CompleteAddress,
  Contract,
  Fr,
  PXE,
  TxStatus,
  Wallet,
  createPXEClient,
  waitForSandbox,
} from '@aztec/aztec.js';
import { createDebugLogger } from '@aztec/foundation/log';

const logger = createDebugLogger('aztec:blank-box-test');

// assumes sandbox is running locally, which this script does not trigger
// as well as anvil.  anvil can be started with yarn test:integration
const setupSandbox = async () => {
  const { PXE_URL = 'http://localhost:8080' } = process.env;
  const pxe = createPXEClient(PXE_URL);
  await waitForSandbox(pxe);
  return pxe;
};

async function deployZKContract(owner: CompleteAddress, wallet: Wallet, pxe: PXE) {
  logger('Deploying Voter contract...');
  const contractAddress = await deployContract(owner, TallierContract.artifact, [], Fr.random(), pxe);

  logger(`L2 contract deployed at ${contractAddress}`);
  return TallierContract.at(contractAddress, wallet);
}

describe('ZK Contract Tests', () => {
  let wallet: AccountWallet;
  let owner: CompleteAddress;
  let _account2: CompleteAddress;
  let _account3: CompleteAddress;
  let contract: TallierContract;
  let contractAddress: AztecAddress;
  let pxe: PXE;

  beforeAll(async () => {
    pxe = await setupSandbox();
    const accounts = await pxe.getRegisteredAccounts();
    [owner, _account2, _account3] = accounts;

    wallet = await getWallet(owner, pxe);

    contract = await deployZKContract(owner, wallet, pxe);
    contractAddress = contract.address;
  }, 60000);

  test('call succeeds after deploy', async () => {
    const callTxReceipt = await contract.methods.receive_vote(0).send().wait();


    const vote = await contract.methods.read_vote().view();
    console.log(vote)
    expect(callTxReceipt.status).toBe(TxStatus.MINED);
  }, 40000);
});
