'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ethers } from 'ethers';
import tradeReceiptAbi from '@/lib/abi/TradeReceipt.json';

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_TRADERECEIPT_ADDR || '0xAf94ad1A7c0C9F3f988217c46DCa5eA4665f57c0';
const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '0'); // 0 means "no check"

export default function Page() {
  const [acct, setAcct] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [chainId, setChainId] = useState<number | null>(null);

  // Demo form fields — change to match your function signature
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => { sdk.actions.ready().catch(()=>{}); }, []);

  async function getProvider(): Promise<any> {
    try {
      const p = await sdk.wallet.getEthereumProvider();
      if (p) return p;
    } catch {}
    if (typeof window !== 'undefined' && (window as any).ethereum) return (window as any).ethereum;
    throw new Error('No Ethereum provider. Open inside Warpcast or install a wallet.');
  }

  async function connect() {
    setStatus('Connecting…');
    try {
      const provider = await getProvider();
      const ethersProvider = new ethers.BrowserProvider(provider as any);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const net = await ethersProvider.getNetwork();
      setAcct(address);
      setChainId(Number(net.chainId));
      setStatus(`Connected: ${address.slice(0,6)}…${address.slice(-4)} on chain ${net.chainId.toString()}`);

      if (EXPECTED_CHAIN_ID && Number(net.chainId) !== EXPECTED_CHAIN_ID) {
        setStatus(prev => prev + ` | ⚠️ Expected chain ${EXPECTED_CHAIN_ID}.`);
        try {
          await (provider as any).request?.({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + EXPECTED_CHAIN_ID.toString(16) }],
          });
        } catch {}
      }
    } catch (e:any) {
      setStatus(`Connect failed: ${e?.message || String(e)}`);
    }
  }

  async function submit() {
    if (!note.trim()) return setStatus('Enter a note.');
    if (!/^\d+$/.test(amount.trim())) return setStatus('Amount must be an integer.');

    setStatus('Sending…');
    try {
      const provider = await getProvider();
      const ethersProvider = new ethers.BrowserProvider(provider as any);
      const signer = await ethersProvider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDR, tradeReceiptAbi as any, signer);

      // TODO: If your function name/args differ, edit below:
      // e.g. contract.recordTrade(note, amount)
      const tx = await contract.saveReceipt(note, BigInt(amount));
      setStatus(`Tx: ${tx.hash} (waiting…)`);
      await tx.wait();
      setStatus('✅ Confirmed!');
    } catch (e:any) {
      setStatus(`❌ Tx failed: ${e?.shortMessage || e?.message || String(e)}`);
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">TradeCast</h1>
      <p className="text-sm mt-1 break-words">Contract: {CONTRACT_ADDR}</p>
      {!acct ? (
        <button onClick={connect} className="mt-4 px-4 py-2 rounded bg-black text-white">Connect Wallet</button>
      ) : (
        <div className="mt-4 text-sm">Connected {acct.slice(0,6)}…{acct.slice(-4)} {chainId ? `(chain ${chainId})` : ''}</div>
      )}

      <div className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm">Note (string)</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
                 placeholder="e.g., Bought ETH on Base"
                 value={note} onChange={e=>setNote(e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Amount (uint256, integer)</span>
          <input className="mt-1 w-full border rounded px-3 py-2"
                 placeholder="e.g., 100"
                 inputMode="numeric" pattern="\d*"
                 value={amount} onChange={e=>setAmount(e.target.value)} />
        </label>

        <button onClick={submit} className="mt-2 px-4 py-2 rounded bg-indigo-600 text-white">Submit to Contract</button>
        <p className="text-sm text-gray-600 mt-2 break-words">{status}</p>
      </div>
    </main>
  );
}
