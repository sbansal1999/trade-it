import { trpc } from "../utils/trpc";

export default function IndexPage() {
  const createdTrade = trpc.trades.create.useMutation();

  const handleLogin = () => {
    const data = { price: 5000, quantity: 100, ticker: "aapl" };

    createdTrade.mutate(data);
  };

  const allTrades = trpc.trades.show.useQuery();

  if (!allTrades) return <div>Loading trades...</div>;

  const trades = allTrades.data;

  return (
    <>
      <button onClick={handleLogin} disabled={createdTrade.isLoading}>
        Login
      </button>
      {createdTrade.error && (
        <p>Something went wrong! {createdTrade.error.message}</p>
      )}
      {JSON.stringify(createdTrade.data)}
      <div>
        Your trades are
        <div>
          {trades?.map((trade) => {
            return <p>{trade.price}</p>;
          })}
        </div>
      </div>
    </>
  );
}
