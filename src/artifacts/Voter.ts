
/* Autogenerated file, do not edit! */

/* eslint-disable */
import {
  AztecAddress,
  AztecAddressLike,
  CompleteAddress,
  Contract,
  ContractArtifact,
  ContractBase,
  ContractFunctionInteraction,
  ContractMethod,
  DeployMethod,
  EthAddress,
  EthAddressLike,
  FieldLike,
  Fr,
  Point,
  PublicKey,
  Wallet,
} from '@aztec/aztec.js';
import VoterContractArtifactJson from './Voter.json' assert { type: 'json' };
export const VoterContractArtifact = VoterContractArtifactJson as ContractArtifact;

/**
 * Type-safe interface for contract Voter;
 */
export class VoterContract extends ContractBase {
  
  private constructor(
    completeAddress: CompleteAddress,
    wallet: Wallet,
    portalContract = EthAddress.ZERO
  ) {
    super(completeAddress, VoterContractArtifact, wallet, portalContract);
  }
  

  
  /**
   * Creates a contract instance.
   * @param address - The deployed contract's address.
   * @param wallet - The wallet to use when interacting with the contract.
   * @returns A promise that resolves to a new Contract instance.
   */
  public static async at(
    address: AztecAddress,
    wallet: Wallet,
  ) {
    return Contract.at(address, VoterContract.artifact, wallet) as Promise<VoterContract>;
  }

  
  /**
   * Creates a tx to deploy a new instance of this contract.
   */
  public static deploy(wallet: Wallet, ) {
    return new DeployMethod<VoterContract>(Point.ZERO, wallet, VoterContractArtifact, Array.from(arguments).slice(1));
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified public key to derive the address.
   */
  public static deployWithPublicKey(publicKey: PublicKey, wallet: Wallet, ) {
    return new DeployMethod<VoterContract>(publicKey, wallet, VoterContractArtifact, Array.from(arguments).slice(2));
  }
  

  
  /**
   * Returns this contract's artifact.
   */
  public static get artifact(): ContractArtifact {
    return VoterContractArtifact;
  }
  

  /** Type-safe wrappers for the public methods exposed by the contract. */
  public methods!: {
    
    /** vote(vote: field, tallierAddress: struct) */
    vote: ((vote: FieldLike, tallierAddress: AztecAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;
  };
}
