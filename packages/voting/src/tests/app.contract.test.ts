import { TallierContract } from '../artifacts/Tallier.js';
import { VoterContract } from '../artifacts/Voter.js';
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
  getSandboxAccountsWallets,
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

async function deployTallierContract(owner: CompleteAddress, wallet: Wallet, pxe: PXE) {
  logger('Deploying Tallier contract...');
  const tallierContractAddress = await deployContract(owner, TallierContract.artifact, [], Fr.random(), pxe);

  logger(`L2 contract deployed at ${tallierContractAddress}`);
  return TallierContract.at(tallierContractAddress, wallet);
}

async function deployVoterContract(owner: CompleteAddress, wallet: Wallet, pxe: PXE) {
  logger('Deploying Voter contract...');
  const voterContractAddress = await deployContract(owner, VoterContract.artifact, [], Fr.random(), pxe);

  logger(`L2 contract deployed at ${voterContractAddress}`);
  return VoterContract.at(voterContractAddress, wallet);
}

describe('ZK Contract Tests', () => {
  let wallet: AccountWallet;
  let owner: CompleteAddress;
  let _account2: CompleteAddress;
  let _account3: CompleteAddress;
  let voterContract: VoterContract;
  let tallierContract: TallierContract;
  let voterContractAddress: AztecAddress;
  let tallierContractAddress: AztecAddress;
  let pxe: PXE;
  let wallets: AccountWallet[];

  beforeAll(async () => {
    pxe = await setupSandbox();
    const accounts = await pxe.getRegisteredAccounts();
    [owner, _account2, _account3] = accounts;

    wallet = await getWallet(owner, pxe);
    wallets = await getSandboxAccountsWallets(pxe);

    tallierContract = await deployTallierContract(owner, wallet, pxe);
    tallierContractAddress = tallierContract.address

    voterContract = await deployVoterContract(owner, wallet, pxe);
    voterContractAddress = voterContract.address;
    console.log(voterContractAddress.toBigInt())
    console.log(tallierContractAddress.toBigInt())
  }, 60000);

  test('sending a vote', async () => {
    console.log(wallets.map(x=> x.getAddress().toBigInt()))
    const prevVote0 = await tallierContract.methods.readVoteCounter(0).view();
    const prevVote1 = await tallierContract.methods.readVoteCounter(1).view();    
    console.log("PREV VALUE: ", prevVote0, prevVote1)
    
    const callTxReceipt = await voterContract.withWallet(wallets[0]).methods.vote(1, tallierContractAddress).send().wait()
    const callTxReceipt2 = await voterContract.withWallet(wallets[1]).methods.vote(0, tallierContractAddress).send().wait()
    console.log("WALLET 0: ", await tallierContract.methods.readVote(0).view())
    console.log("WALLET 1: ", await tallierContract.methods.readVote(1).view())
    // await voterContract.withWallet()
    const callTxReceipt3 = await tallierContract.methods.calculateResult().send().wait()

    const vote0 = await tallierContract.methods.readVoteCounter(0).view();
    const vote1 = await tallierContract.methods.readVoteCounter(1).view();
    console.log("RESULTS: ", vote0, vote1)

    expect(callTxReceipt.status).toBe(TxStatus.MINED);
  }, 40000);
});
