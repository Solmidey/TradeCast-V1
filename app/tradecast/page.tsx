const CONTRACT_ADDR = process.env.NEXT_PUBLIC_TRADERECEIPT_ADDR || '0xAf94ad1A7c0C9F3f988217c46DCa5eA4665f57c0';
export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">TradeCast</h1>
      <p className="mt-2">Your Mini App is live. Cast this URL to open it inside Farcaster.</p>
    </main>
  );
}
