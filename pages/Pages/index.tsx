import { useState, useMemo } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { setAuthority, AuthorityType, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";

require("@solana/wallet-adapter-react-ui/styles.css");

function SetAuthorityForm() {
  const wallet = useWallet();
  const [tokenAccount, setTokenAccount] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const connection = useMemo(
    () => new Connection("https://api.mainnet-beta.solana.com", "confirmed"),
    []
  );

  const handleSubmit = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert("กรุณาเชื่อม Glow Wallet ก่อน");
      return;
    }

    try {
      const tokenAcc = new PublicKey(tokenAccount);
      const newOwnerPk = new PublicKey(newOwner);

      const ix = setAuthority(
        tokenAcc,
        wallet.publicKey,
        AuthorityType.AccountOwner,
        newOwnerPk,
        [],
        TOKEN_PROGRAM_ID
      );

      const tx = new Transaction().add(ix);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      alert(`✅ ส่งธุรกรรมแล้ว: ${sig}`);
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาด: " + err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔐 เปลี่ยนเจ้าของบัญชี SPL Token</h2>
      <WalletMultiButton />
      <div style={{ marginTop: 20 }}>
        <input
          placeholder="📦 Token Account Address"
          value={tokenAccount}
          onChange={(e) => setTokenAccount(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          placeholder="👤 New Owner Public Key"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button onClick={handleSubmit} disabled={!wallet.connected}>
          🔄 เปลี่ยนเจ้าของ
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const wallets = useMemo(() => [new GlowWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SetAuthorityForm />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
