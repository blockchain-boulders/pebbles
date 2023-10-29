import { TallierContract, TallierContractArtifact } from './artifacts/Tallier.js';
import { VoterContractArtifact } from './artifacts/Voter.js';
import {
  AccountWallet,
  AztecAddress,
  CompleteAddress,
  Contract,
  DeployMethod,
  Fr,
  PXE,
  TxReceipt,
  createPXEClient,
  getSandboxAccountsWallets,
} from '@aztec/aztec.js';
import { ContractArtifact, FunctionArtifact, encodeArguments } from '@aztec/foundation/abi';
import { FieldsOf } from '@aztec/foundation/types';
interface ContractsAddresses {
  tallierContractAztecAddress: string;
  voteContractAztecAddress: string;
}

export const tallierContractArtifact: ContractArtifact = TallierContractArtifact;
export const voteContractArtifact: ContractArtifact = VoterContractArtifact;

export const PXE_URL: string = process.env.PXE_URL || 'http://localhost:8080';
export const pxe: PXE = createPXEClient(PXE_URL);

let contractAddresses: ContractsAddresses = { tallierContractAztecAddress: '', voteContractAztecAddress: '' };
const WALLETS = await getSandboxAccountsWallets(pxe);
let selectedWallet: any;

const isContractDeployed = (): boolean => {
  if (contractAddresses.voteContractAztecAddress === '') {
    alert('Please deploy contracts first');
    return false;
  }
  return true;
};
// interaction with the buttons, but conditional check so node env can also import from this file
if (typeof document !== 'undefined') {
  document.getElementById('deploy')?.addEventListener('click', async () => {
    contractAddresses = await handleDeployContractsClicks();
    // eslint-disable-next-line no-console
    console.log('Deploy Succeeded, contract deployed at', contractAddresses);
  });

  document.getElementById('vote1')?.addEventListener('click', async () => {
    if (!isContractDeployed()) return;
    const interactionResult = await handleVoteClick(1);
    // eslint-disable-next-line no-console
    console.log('Interaction transaction succeeded', interactionResult);
  });

  document.getElementById('vote2')?.addEventListener('click', async () => {
    if (!isContractDeployed()) return;
    const interactionResult = await handleVoteClick(2);
    // eslint-disable-next-line no-console
    console.log('Interaction transaction succeeded', interactionResult);
  });
  // Get a reference to the select element
  const dropdown = document.getElementById('dropdown') as HTMLSelectElement;

  // Populate the select element with options from the array
  for (var i = 0; i < WALLETS.length; i++) {
    var option = document.createElement('option');
    option.value = '' + i;
    option.text = '' + i;
    dropdown.appendChild(option);
  }

  dropdown.addEventListener('change', () => {
    const selectedText = dropdown.options[dropdown.selectedIndex].text;
    selectedWallet = WALLETS[Number(selectedText)];
  });

  document.getElementById('getResults')?.addEventListener('click', async () => {
    const result = await handleGetResultsClick(contractAddresses.tallierContractAztecAddress);
    console.log(result)
  });
}

export async function handleDeployContractsClicks(): Promise<ContractsAddresses> {
  // eslint-disable-next-line no-console
  console.log('🔄 - Deploying Tallier Contract');
  const [wallet, ..._rest] = await getSandboxAccountsWallets(pxe);

  const tallierContractAztecAddress = await deployContract(
    wallet.getCompleteAddress(),
    TallierContractArtifact,
    [],
    Fr.random(),
    pxe,
  );
  console.log('✅ - Tallier Contract Deployed ');
  console.log('🔄 - Deploying Voter Contract');

  const voteContractAztecAddress = await deployContract(
    wallet.getCompleteAddress(),
    VoterContractArtifact,
    [],
    Fr.random(),
    pxe,
  );
  console.log('✅ - Vote Contract Deployed ');
  return {
    tallierContractAztecAddress: tallierContractAztecAddress.toString(),
    voteContractAztecAddress: voteContractAztecAddress.toString(),
  };
}

export async function handleVoteClick(vote: 1 | 2) {
  console.log('🔄 - Voting');
  const contractFunctionName = 'vote';
  const callArgs = { vote: vote, tallierAddress: contractAddresses.tallierContractAztecAddress };
  const getPkAbi = getFunctionAbi(VoterContractArtifact, contractFunctionName);
  console.log(getPkAbi);
  const typedArgs = convertArgs(getPkAbi, callArgs);

  // eslint-disable-next-line no-console
  console.log('Interacting with Contract');

  return await callContractFunction(
    AztecAddress.fromString(contractAddresses.voteContractAztecAddress),
    voteContractArtifact,
    contractFunctionName,
    typedArgs,
    pxe,
    selectedWallet.getCompleteAddress(),
  );
}
export async function handleGetResultsClick(contractAddress: string) {
  await calculateResult(contractAddress)
  const votes1 = await readVotingCounter(contractAddress, '1');
  const votes2 = await readVotingCounter(contractAddress, '2');
  return {
    1: votes1,
    2: votes2
  }
}

export async function calculateResult(contractAddress: string) {
  const callArgs = {};
  const getPkAbi = getFunctionAbi(TallierContractArtifact, 'calculateResult');
  const typedArgs = convertArgs(getPkAbi, callArgs);

  // eslint-disable-next-line no-console
  console.log('Calculating result');

  await callContractFunction(
    AztecAddress.fromString(contractAddress),
    tallierContractArtifact,
    'calculateResult',
    typedArgs,
    pxe,
    selectedWallet.getCompleteAddress(),
  );
}

export async function readVotingCounter(contractAddress: string, value: string) {
  const callArgs = { value: value };
  const getPkAbi = getFunctionAbi(TallierContractArtifact, 'readVoteCounter');
  const typedArgs = convertArgs(getPkAbi, callArgs);

  return await callContractFunction(
    AztecAddress.fromString(contractAddress),
    tallierContractArtifact,
    'readVoteCounter',
    typedArgs,
    pxe,
    selectedWallet.getCompleteAddress(),
    true
  );
}

export const getFunctionAbi = (contractAbi: any, functionName: string) => {
  const functionAbi = contractAbi.functions.find((f: FunctionArtifact) => f.name === functionName);
  if (!functionAbi) throw new Error(`Function ${functionName} not found in abi`);
  return functionAbi;
};

export async function callContractFunction(
  address: AztecAddress,
  artifact: ContractArtifact,
  functionName: string,
  typedArgs: any[], // for the exposed functions, this is an array of field elements Fr[]
  pxe: PXE,
  wallet: CompleteAddress,
  viewFunction: boolean = false,
): Promise<FieldsOf<TxReceipt>> {
  // selectedWallet is how we specify the "sender" of the transaction
  const selectedWallet = await getWallet(wallet, pxe);

  // Note: when you start implementing the contract with more methods, it may be useful
  // to use the typescript class for your contract generated by the `yarn compile` command,
  // which provides an object with methods corresponding to the noir contract functions
  // that are named and typed and can be called directly.
  const contract = await Contract.at(address, artifact, selectedWallet);

  return viewFunction
    ? contract.methods[functionName](...typedArgs).view()
    : contract.methods[functionName](...typedArgs)
        .send()
        .wait();
}

/**
 * terminology is confusing, but the `account` points to a smart contract's public key information
 * while the "wallet" has the account's private key and is used to sign transactions
 * we need the "wallet" to actually submit transactions using the "account" identity
 * @param account
 * @param pxe
 * @returns
 */
export async function getWallet(account: CompleteAddress, pxe: PXE): Promise<AccountWallet> {
  const accountWallets: AccountWallet[] = await getSandboxAccountsWallets(pxe);
  const selectedWallet: AccountWallet = accountWallets.find(w => w.getAddress().equals(account.address))!;
  if (!selectedWallet) {
    throw new Error(`Wallet for account ${account.address.toShortString()} not found in the PXE.`);
  }
  return selectedWallet;
}

export async function deployContract(
  activeWallet: CompleteAddress,
  artifact: ContractArtifact,
  typedArgs: Fr[], // encode prior to passing in
  salt: Fr,
  client: PXE,
): Promise<AztecAddress> {
  const tx = new DeployMethod(activeWallet.publicKey, client, artifact, typedArgs).send({
    contractAddressSalt: salt,
  });
  await tx.wait();
  const receipt = await tx.getReceipt();
  if (receipt.contractAddress) {
    return receipt.contractAddress;
  } else {
    throw new Error(`Contract not deployed (${receipt.toJSON()})`);
  }
}

export function convertArgs(functionArtifact: FunctionArtifact, args: any): Fr[] {
  const untypedArgs = functionArtifact.parameters.map(param => {
    switch (param.type.kind) {
      case 'field':
        // hack: addresses are stored as string in the form to avoid bigint compatibility issues with formik
        // convert those back to bigints before turning into Fr
        return BigInt(args[param.name]);
      case 'struct':
        return AztecAddress.fromString(args[param.name]);
      default:
        // need more testing on other types
        return args[param.name];
    }
  });
  return encodeArguments(functionArtifact, untypedArgs);
}
