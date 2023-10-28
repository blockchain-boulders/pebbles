import { useEffect, useState } from "react";
import { AccountWalletWithPrivateKey, PXE, createPXEClient, getSandboxAccountsWallets } from "@aztec/aztec.js";

const PXE_URL: string = process.env.PXE_URL || "http://localhost:8080";
const pxe: PXE = createPXEClient(PXE_URL);

export const useAztecSandbox = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [organizerWallet, setOrganizerWallet] = useState<AccountWalletWithPrivateKey>();
  const [voterWallet, setVoterWallet] = useState<AccountWalletWithPrivateKey>();
  const [voter2Wallet, setVoter2Wallet] = useState<AccountWalletWithPrivateKey>();

  useEffect(() => {
    const getWallet = async () => {
      const wallets = await getSandboxAccountsWallets(pxe);
      setOrganizerWallet(wallets[0]);
      setVoterWallet(wallets[1]);
      setVoter2Wallet(wallets[2]);
      setIsReady(true);
    };
    getWallet();
  }, []);

  return {
    isReady,
    pxe,
    organizerWallet,
    voterWallet,
    voter2Wallet,
  };
};
