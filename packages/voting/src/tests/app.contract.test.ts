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
    tallierContractAddress = tallierContract.address;

    voterContract = await deployVoterContract(owner, wallet, pxe);
    voterContractAddress = voterContract.address;
  }, 60000);

  test('try to vote option 0', async () => {
    await expect(
      voterContract.withWallet(wallets[0]).methods.vote(0, tallierContractAddress).send().wait(),
    ).rejects.toThrow("(JSON-RPC PROPAGATED) Assertion failed: vote should be greater than 0 'vote as u32 > 0'");
  }, 40000);

  test('sending a vote', async () => {
    const prevVote0 = await tallierContract.methods.readVoteCounter(1).view();
    const prevVote1 = await tallierContract.methods.readVoteCounter(2).view();

    expect(prevVote0).toBe(0n);
    expect(prevVote1).toBe(0n);

    await voterContract.withWallet(wallets[0]).methods.vote(1, tallierContractAddress).send().wait();
    await voterContract.withWallet(wallets[1]).methods.vote(2, tallierContractAddress).send().wait();

    await tallierContract.methods.calculateResult().send().wait();

    const vote0 = await tallierContract.methods.readVoteCounter(1).view();
    const vote1 = await tallierContract.methods.readVoteCounter(2).view();

    expect(vote0).toBe(1n);
    expect(vote1).toBe(1n);
  }, 40000);

  test('try to change my vote', async () => {
    await expect(
      voterContract.withWallet(wallets[0]).methods.vote(2, tallierContractAddress).send().wait(),
    ).rejects.toThrow("(JSON-RPC PROPAGATED) Assertion failed: already voted 'storage.votes.at(voterAddress).read() as u32 <= 0'");
  }, 40000);
});
