import { PhasedVotingContract } from '../artifacts/PhasedVoting.js';
import { deployContract, getWallet } from '../index.js';
import {
  AccountWallet,
  AztecAddress,
  CompleteAddress,
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

describe('ZK Contract Tests', () => {
  let wallet: AccountWallet;
  let wallets: AccountWallet[];
  let owner: CompleteAddress;
  let _account2: CompleteAddress;
  let _account3: CompleteAddress;
  let contract: PhasedVotingContract;
  let contractAddress: AztecAddress;
  let pxe: PXE;

  beforeAll(async () => {
    pxe = await setupSandbox();
    const accounts = await pxe.getRegisteredAccounts();
    [owner, _account2, _account3] = accounts;

    wallet = await getWallet(owner, pxe);
    wallets = await getSandboxAccountsWallets(pxe);

    contract = await PhasedVotingContract.deploy(wallets[0], accounts[0]).send().deployed();
    contractAddress = contract.address;
  }, 60000);

  test('user can lock vote', async () => {
    const receipt = await contract.withWallet(wallets[1]).methods.lock_vote(1n).send().wait();
    expect(receipt.status).toBe(TxStatus.MINED);
  }, 40000);

  test('user cannot lock vote twice', async () => {
    const lockVote = contract.withWallet(wallets[1]).methods.lock_vote(1n);
    await expect(lockVote.send().wait()).rejects.toThrow();
  }, 40000);

  test('result cannot be viewed before voting is closed', async () => {
    const result = contract.withWallet(wallets[1]).methods.get_result(1);
    await expect(result.view()).rejects.toThrow();
  }, 40000);

  test('voting room cannot be closed by account which is not the owner', async () => {
    const closingTransaction = contract.withWallet(wallets[1]).methods.close_voting_room();
    await expect(closingTransaction.send().wait()).rejects.toThrow();
  }, 4000);

  test('result should reflect votes', async () => {
    const voteReceipt = await contract.withWallet(wallets[2]).methods.lock_vote(1n).send().wait();
    expect(voteReceipt.status).toBe(TxStatus.MINED);

    const closingReceipt = await contract.withWallet(wallets[0]).methods.close_voting_room().send().wait();
    expect(closingReceipt.status).toBe(TxStatus.MINED);

    const burnedReceipt = await contract.withWallet(wallets[1]).methods.burn_vote().send().wait();
    expect(burnedReceipt.status).toBe(TxStatus.MINED);

    const result = await contract.withWallet(wallets[1]).methods.get_result(1).view();
    expect(result).toBe(BigInt(2));
  }, 40000);
});
