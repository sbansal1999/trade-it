import { Dialog, Transition } from "@headlessui/react";
import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { ITickersQuery, referenceClient } from "@polygon.io/client-js";
import { ITickersResults } from "@polygon.io/client-js/lib/rest/reference/tickers";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { FormEvent, Fragment, createRef, useState } from "react";

import { env } from "../env/client.mjs";
import { trpc } from "../utils/trpc";
import { getCents, getDollars, getRandomID } from "../utils/utils";

type ShowStocksModalProps = {
  stocks: ITickersResults[];
  showModal: boolean;
  setShowModal: (arg: boolean) => void;
  setSelectedStock: (arg: ITickersResults | null) => void;
  setSelectedStockQuote: (arg: StockQuote | null) => void;
};

type ShowQuoteProps = {
  quote: StockQuote;
  handleBuy: (quantity: number) => void;
};

type StockQuote = {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
  d: number;
  dp: number;
};

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
};

const inputField =
  "mt-1 block w-full rounded-md border-2 border-slate-400 bg-white p-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:invalid:border-pink-500";

export default function Home() {
  const searchRef = createRef<HTMLInputElement>();
  const [quantity, setQuantity] = useState(0);
  const [animateRefreshIcon, setAnimateRefreshIcon] = useState(false);

  const [searchResults, setSearchResults] = useState<ITickersResults[]>([]);
  const [showStocksListModal, setShowStocksListModal] = useState(true);
  const [selectedStock, setSelectedStock] = useState<ITickersResults | null>();
  const [showSearchSpinner, setShowSearchSpinner] = useState(false);
  const [selectedStockQuote, setSelectedStockQuote] =
    useState<StockQuote | null>();
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);
  const [brokerageInCents, setBrokerageInCents] = useState(0);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] =
    useState(false);

  const tradeMutation = trpc.trades.create.useMutation();

  const userQuery = trpc.users.getUserByID;

  // Initial fetching of userData
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
  });

  function fetchUserData() {
    const dummyData: UserData = {
      firstName: "John",
      lastName: "Wick",
      balance: 10000,
      email: "john@wick.com",
      id: "818cf69e-b17c-41e8-929c-01b79b502f49",
    };

    return dummyData;
  }

  const handleBuy = (e: FormEvent) => {
    e.preventDefault();
    tradeMutation.reset();

    setShowConfirmOrderModal(true);
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchRef.current) {
      return;
    }

    const searchQuery = searchRef.current.value;
    setShowSearchSpinner(true);

    try {
      const searchData = await fetchStockSearchData(searchQuery);
      setShowSearchSpinner(false);

      if (searchData.length === 0) {
        return;
      }

      setSearchResults(searchData);
      setShowStocksListModal(true);
    } catch {
      setShowSearchSpinner(false);
      setShowRateLimitModal(true);
    }
  };

  const handleRefresh = async () => {
    if (!selectedStock) {
      return;
    }

    setAnimateRefreshIcon(true);
    const quoteData = await fetchStockQuote(selectedStock.ticker);
    setSelectedStockQuote(quoteData);
    setAnimateRefreshIcon(false);
  };

  const handleConfirmOrder = async () => {
    if (!selectedStock || !selectedStockQuote) {
      return;
    }

    if (!userData) {
      return;
    }

    const latestQuote = await fetchStockQuote(selectedStock.ticker);

    const orderValue = latestQuote.c * quantity;

    if (orderValue > userData.balance) {
      setShowInsufficientFundsModal(true);
      setShowConfirmOrderModal(false);
      return;
    }

    tradeMutation.mutate(
      {
        symbol: selectedStock.ticker,
        quantity,
        price: latestQuote.c,
        userId: userData.id,
        action: "BUY",
        orderId: getRandomID(),
      },
      {
        onSuccess() {
          userData.balance -= orderValue;
        },
      }
    );

    setShowConfirmOrderModal(false);
  };

  return (
    <>
      <Head>
        <title>Trade IT</title>
      </Head>
      <main>
        <div className="w-fw mt-10 flex justify-center">
          <form onSubmit={handleSearch}>
            <label>
              <span className="text-md font-medium text-slate-700">
                Stock Name
              </span>
              <div className="mt-3" />
              <input
                type="text"
                placeholder="AAPL"
                ref={searchRef}
                className={inputField}
                required
              />
            </label>
            <div className="m-5" />
            <div className="flex justify-center">
              <button className="rounded-md bg-blue-400 px-7 py-3 text-white hover:bg-blue-900">
                {showSearchSpinner ? (
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <span className="text-3xl">SEARCH</span>
                )}
              </button>
            </div>
          </form>
        </div>
        <div>
          {showStocksListModal ? (
            <StocksListModal
              stocks={searchResults}
              showModal={showStocksListModal}
              setShowModal={setShowStocksListModal}
              setSelectedStock={setSelectedStock}
              setSelectedStockQuote={setSelectedStockQuote}
            />
          ) : null}
        </div>

        <div>
          {selectedStock && (
            <div className="ml-2 mt-2 text-5xl text-teal-500 lg:w-1/2">
              <Card
                text={
                  "Showing Data For: " +
                  selectedStock.name +
                  " - " +
                  selectedStock.ticker
                }
              />
            </div>
          )}

          {selectedStockQuote ? (
            <div className="ml-5">
              <div className="mt-5">
                <ShowQuote quote={selectedStockQuote} />
              </div>
              <div className="mt-5 ">
                <div className="flex">
                  <form onSubmit={handleBuy}>
                    <span className="text-xl font-medium text-slate-700">
                      Enter Quantity
                    </span>
                    <div className="mt-3 w-[15vw] border-2 p-2">
                      <input
                        type="number"
                        placeholder="1"
                        className="mt-1 block w-full rounded-md border-2 border-slate-400 bg-white p-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:invalid:border-pink-500"
                        required
                        value={quantity === 0 ? "" : quantity}
                        onChange={(e) => {
                          if (e.target.value === "") {
                            setQuantity(0);
                            return;
                          }
                          setQuantity(Number.parseInt(e.target.value));
                        }}
                        min={1}
                      />

                      <div className="m-5 flex justify-center">
                        <button className="rounded-md bg-green-400 px-7 py-3 text-white hover:bg-blue-900">
                          <span className="text-2xl">BUY</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  <div>
                    {tradeMutation.isSuccess && (
                      <div className="flex items-center rounded-md bg-green-600 py-3 pl-5 pr-3 text-lg font-light tracking-tight text-white">
                        Your order has been executed successfully. We will mail
                        you the exact details shortly.
                        <button
                          onClick={() => tradeMutation.reset()}
                          className="ml-2 rounded-md bg-green-300 hover:bg-green-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-8 w-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    {tradeMutation.isError && (
                      <div>
                        <div className="flex items-center rounded-md bg-red-600 py-3 pl-5 pr-3 text-lg font-light tracking-tight text-white">
                          Something went wrong. Please try again.
                          <button
                            onClick={() => tradeMutation.reset()}
                            className="ml-2 rounded-md bg-red-300 hover:bg-red-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-8 w-8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {tradeMutation.isLoading && (
                      <div>
                        <div className="flex items-center rounded-md bg-yellow-500 py-3 pl-5 pr-3 text-lg font-light tracking-tight text-white">
                          Your trade is being processed. Please wait.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            selectedStock && <div>Loading</div>
          )}
        </div>

        <div className="m-5" />

        <div className="m-5 flex">
          {userData && (
            <PriceCard text="Current Balance" value={userData.balance} />
          )}
        </div>

        {JSON.stringify(userData)}
        <br />
        {JSON.stringify(selectedStock)}
        <br />
        {JSON.stringify(selectedStockQuote)}
        <br />
        {JSON.stringify(tradeMutation)}

        <br />

        {/* Modals are here */}
        {showConfirmOrderModal && selectedStock && selectedStockQuote && (
          <>
            <Transition.Root show={showConfirmOrderModal} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10"
                onClose={() => setShowConfirmOrderModal(false)}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10">
                  <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      enterTo="opacity-100 translate-y-0 sm:scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-2/5 sm:max-w-max">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-300 sm:mx-0 sm:h-10 sm:w-10">
                              <CheckBadgeIcon className="w-6" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <Dialog.Title
                                as="h3"
                                className="p-2 text-xl font-medium leading-6 text-gray-900"
                              >
                                <div className="flex justify-between">
                                  Confirm Your Order
                                  <div
                                    className={
                                      "rounded-md px-2 " +
                                      (animateRefreshIcon
                                        ? " animate-spin hover:bg-white"
                                        : "hover:bg-slate-500")
                                    }
                                    onClick={handleRefresh}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      className={
                                        "h-6 w-6 stroke-black hover:stroke-white" +
                                        (animateRefreshIcon
                                          ? "stroke-black"
                                          : "stroke-white")
                                      }
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </Dialog.Title>
                              <Dialog.Description
                                className="w-fw mt-2"
                                as="div"
                              >
                                <div className="flex flex-col">
                                  <div>Symbol : {selectedStock.ticker}</div>
                                  <div>Stock Name: {selectedStock.name}</div>
                                  <div>
                                    LTP: $ {getDollars(selectedStockQuote?.c)}
                                  </div>
                                  <div>Quantity: {quantity}</div>
                                  <div>
                                    Order Value: ${" "}
                                    {getDollars(
                                      selectedStockQuote?.c * quantity
                                    )}
                                  </div>
                                  <div>
                                    Brokerage: $ {getDollars(brokerageInCents)}
                                  </div>
                                  <div>
                                    Total Order Value: ${" "}
                                    {getDollars(
                                      selectedStockQuote?.c * quantity +
                                        brokerageInCents
                                    )}
                                  </div>
                                  <div>
                                    Last Updated:{" "}
                                    {formatToEST(selectedStockQuote.t)}
                                  </div>
                                </div>
                              </Dialog.Description>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleConfirmOrder}
                          >
                            Confirm Order
                          </button>
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => setShowConfirmOrderModal(false)}
                          >
                            Go Back
                          </button>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
          </>
        )}

        {showRateLimitModal && (
          <RateLimitModal
            setShowRateLimitModal={setShowRateLimitModal}
            showRateLimitModal={showRateLimitModal}
          />
        )}

        {showInsufficientFundsModal && userData && (
          <InsufficientFundsModal
            setShowInsufficientFundsModal={setShowInsufficientFundsModal}
            showInsufficientFundsModal={showInsufficientFundsModal}
            userData={userData}
          />
        )}
      </main>
    </>
  );
}

const StocksListModal = ({
  stocks,
  showModal,
  setShowModal,
  setSelectedStock,
  setSelectedStockQuote,
}: ShowStocksModalProps) => {
  if (stocks.length === 0) {return <div>No Stock Found</div>;}

  // setSelectedStock(null);
  // setSelectedStockQuote(null);

  const handleStockSelect = async (idx: number) => {
    setSelectedStock(stocks[idx]);
    setShowModal(false);

    const quote = await fetchStockQuote(stocks[idx].ticker);

    setSelectedStockQuote(quote);
  };

  return (
    <>
      <Transition.Root show={showModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-2/5 sm:max-w-max">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <PresentationChartLineIcon className="w-6" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          <p className="text-xl">
                            These are the results for the search.
                            <br />
                            Select the stock you would like to trade.
                          </p>
                        </Dialog.Title>
                        <Dialog.Description className="w-fw mt-5" as="div">
                          <div className="mt-2 max-h-[60vh] overflow-auto rounded-md">
                            {stocks.map((stock, idx) => (
                              <button
                                className="mt-1 w-full bg-slate-300 p-5 text-left hover:bg-slate-600"
                                key={idx}
                                onClick={() => {
                                  void handleStockSelect(idx);
                                }}
                              >
                                {stock.ticker + " - " + stock.name}
                              </button>
                            ))}
                          </div>
                        </Dialog.Description>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Go Back
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

const ShowQuote: React.FC<{ quote: StockQuote }> = ({ quote }) => {
  const timeStamp = new Date(quote.t * 1000);
  const timeStampInEST =
    timeStamp.toLocaleString("en-US", {
      timeZone: "America/New_York",
    }) + " EST";
  const timeStampInIST =
    timeStamp.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }) + " IST";

  const [isTimeInIST, setIsTimeInIST] = useState(false);

  return (
    <div className="flex flex-col gap-4 tracking-tight md:w-5/6 lg:w-6/12">
      <div className="flex">
        <div className="w-2/3">
          <PriceCard text={"Open Price"} value={quote.o} />
        </div>
        <div className="mx-5" />
        <div className="w-2/3">
          <PriceCard text={"High Price"} value={quote.h} />
        </div>
      </div>
      <div className="flex">
        <div className="w-2/3">
          <PriceCard text={"Low Price"} value={quote.l} />
        </div>
        <div className="mx-5" />
        <div className="w-2/3">
          <PriceCard text={"Last Traded Price"} value={quote.c} />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border-2 p-4 shadow-md">
        <div className="text-xl font-light">
          Last Updated: {isTimeInIST ? timeStampInIST : timeStampInEST}
        </div>
        <div>
          <button
            className="rounded-md bg-gray-500 px-5 py-2 text-xl hover:bg-gray-400 hover:text-white hover:ring-2 hover:ring-gray-500"
            onClick={() => setIsTimeInIST((val) => !val)}
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
};

const Spinner = () => (
    <svg
      className="ml-2 mr-3 h-9 w-8 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

const PriceCard: React.FC<{
  text: string;
  value?: number;
  noDollars?: boolean;
}> = ({ text, value, noDollars }) => (
    <div className="flex rounded-md border-2 p-4 shadow-md ">
      <div className="text-xl font-semibold">{text}</div>
      {value && (
        <div className="ml-2 font-mono text-xl ">
          : {noDollars ? value : "$" + getDollars(value)}
        </div>
      )}
    </div>
  );

const Card: React.FC<{ text: string }> = ({ text }) => (
    <div className="rounded-md border-2 py-10 px-5 shadow-md">
      <div className="text-3xl font-semibold text-gray-700">{text}</div>
    </div>
  );

const fetchStockSearchData = async (searchQuery: string) => {
  // TODO: handle rate-limit case
  const POLYGON_KEY = env.NEXT_PUBLIC_POLYGON_KEY;
  const resultLimit = 10;

  const reference = referenceClient(POLYGON_KEY);

  const queryObject: ITickersQuery = {
    type: "CS",
    market: "stocks",
    search: searchQuery,
    active: "true",
    limit: resultLimit,
  };

  const promiseNasdaq = reference.tickers({ ...queryObject, exchange: "XNAS" });
  const promiseNYSE = reference.tickers({ ...queryObject, exchange: "XNYS" });

  // eslint-disable-next-line no-useless-catch
  try {
    const [dataNasdaq, dataNYSE] = await Promise.all([
      promiseNasdaq,
      promiseNYSE,
    ]);
    const data = [...dataNasdaq.results, ...dataNYSE.results];
    return data;
  } catch (error) {
    throw error;
  }
};

const fetchStockQuote = async (stockTicker: string) => {
  const FINNHUB_KEY = env.NEXT_PUBLIC_FINNHUB_KEY;

  const stockQuoteQuery = `https://finnhub.io/api/v1/quote?symbol=${stockTicker}&token=${FINNHUB_KEY}`;

  const stockQuoteQueryResponse = await fetch(stockQuoteQuery);
  const queryJSON = (await stockQuoteQueryResponse.json()) as StockQuote;

  // convert dollars into cents
  queryJSON.c = getCents(queryJSON.c);
  queryJSON.h = getCents(queryJSON.h);
  queryJSON.l = getCents(queryJSON.l);
  queryJSON.o = getCents(queryJSON.o);
  queryJSON.pc = getCents(queryJSON.pc);

  return queryJSON;
};

const formatToEST = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const dateInEST = date.toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  return dateInEST;
};

const RateLimitModal: React.FC<{
  showRateLimitModal: boolean;
  setShowRateLimitModal: (val: boolean) => void;
}> = ({ showRateLimitModal, setShowRateLimitModal }) => (
    <>
      <Transition.Root show={showRateLimitModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowRateLimitModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-2/5 sm:max-w-max">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationCircleIcon className="w-6" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          <p className="text-xl text-red-600">
                            You have exceeded the rate limit for this API.
                          </p>
                          <p className="text-md text-slate-700">
                            Kindly try again after 5 minutes.
                          </p>
                        </Dialog.Title>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowRateLimitModal(false)}
                    >
                      Go Back
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );

const InsufficientFundsModal: React.FC<{
  showInsufficientFundsModal: boolean;
  setShowInsufficientFundsModal: (val: boolean) => void;
  userData: UserData;
}> = ({
  showInsufficientFundsModal,
  setShowInsufficientFundsModal,
  userData,
}) => (
    <>
      <Transition.Root show={showInsufficientFundsModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowInsufficientFundsModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-2/5 sm:max-w-max">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationCircleIcon className="w-6" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title as="h3" className="text-lg font-medium">
                          <p className="text-xl text-red-600">
                            You have insufficient funds to make this payment.
                          </p>
                          <p className="text-md text-slate-700">
                            Dear {`${userData.firstName} ${userData.lastName}`},
                            you have a balance of ${``}{" "}
                            {getDollars(userData.balance)} in your account.
                            <br />
                            If you want to continue, kindly mail us at {` `}
                            <a
                              href="mailto:tradeit15help@gmail.com"
                              className="tracking-tighter text-red-400 hover:text-red-900"
                            >
                              tradeit15help@gmail.com
                            </a>{" "}
                            {` `} to top up your account OR you can sell some of
                            your stocks to raise funds.
                          </p>
                        </Dialog.Title>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowInsufficientFundsModal(false)}
                    >
                      Go Back
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
