export default function Head() {
  const embed = {
    version: "1",
    imageUrl: "https://trade-cast-v1.vercel.app/og.png",
    button: {
      title: "Open TradeCast",
      action: { type: "launch_frame", url: "https://trade-cast-v1.vercel.app/tradecast" }
    }
  };
  return (
    <>
      <meta name="fc:miniapp" content={JSON.stringify(embed)} />
      <meta name="fc:frame" content={JSON.stringify(embed)} />
      <meta property="og:title" content="TradeCast" />
      <meta property="og:description" content="TradeCast — submit and view onchain trade receipts." />
      <meta property="og:image" content="https://trade-cast-v1.vercel.app/og.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <title>TradeCast</title>
    </>
  );
}
