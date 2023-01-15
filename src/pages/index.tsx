import { Dialog, Transition } from "@headlessui/react";
import Head from "next/head";
import { createRef, FormEvent, Fragment, useEffect, useState } from "react";
import { PresentationChartLineIcon } from "@heroicons/react/24/outline";
import { ITickersQuery, referenceClient } from "@polygon.io/client-js";
import { ITickersResults } from "@polygon.io/client-js/lib/rest/reference/tickers.js";

import { env } from "../env/client.mjs";
import { getCents, getDollars } from "../utils/utils";

type AppProps = {
  stocks: ITickersResults[];
  showModal: boolean;
  setShowModal: (arg: boolean) => void;
  setSelectedStock: (arg: ITickersResults | null) => void;
  setSelectedStockQuote: (arg: StockQuote | null) => void;
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
  const [searchResults, setSearchResults] = useState<ITickersResults[]>([]);
  const searchRef = createRef<HTMLInputElement>();
  const [showModal, setShowModal] = useState(true);
  const [selectedStock, setSelectedStock] = useState<ITickersResults | null>();
  const [showSearchSpinner, setShowSearchSpinner] = useState(false);
  const [selectedStockQuote, setSelectedStockQuote] =
    useState<StockQuote | null>();

  const [userData, setUserData] = useState<UserData>();

  //Initial fetching of userData
  useEffect(() => {
    const getUserData = async () => {
      const dummyData: UserData = {
        balance: 10000,
        email: "dummy@gmail.com",
        firstName: "Dummy",
        lastName: "User",
        id: "some-random-id-will-come-here",
      };

      setUserData(dummyData);
    };

    getUserData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchRef.current) {
      return;
    }

    const searchQuery = searchRef.current.value;
    setShowSearchSpinner(true);
    const searchData = await fetchStockSearchData(searchQuery);
    setShowSearchSpinner(false);
    setSearchResults(searchData);
    setShowModal(true);
  };

  return (
    <>
      <Head>
        <title>Trade IT</title>
      </Head>
      <main>
        <div className="w-fw mt-10 flex justify-center">
          {JSON.stringify(userData)}
          <form onSubmit={handleSubmit}>
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
            <button className="w-full rounded-full bg-blue-400 py-3 text-white hover:bg-blue-900">
              {showSearchSpinner ? (
                <div className="flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <span className="text-3xl">SEARCH</span>
              )}
            </button>
          </form>
        </div>
        <div>
          {showModal ? (
            <ShowStocksModal
              stocks={searchResults}
              showModal={showModal}
              setShowModal={setShowModal}
              setSelectedStock={setSelectedStock}
              setSelectedStockQuote={setSelectedStockQuote}
            />
          ) : null}
        </div>
        {selectedStock && (
          <div className="m-5 text-5xl text-teal-500 lg:w-1/2">
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
          <div className="m-5 flex flex-col gap-4 md:w-5/6 lg:w-5/12">
            <div className="flex">
              <div className="w-2/3">
                <PriceCard
                  text={"Open Price"}
                  priceInCents={selectedStockQuote.o}
                />
              </div>
              <div className="mx-5" />
              <div className="w-2/3">
                <PriceCard
                  text={"High Price"}
                  priceInCents={selectedStockQuote.h}
                />
              </div>
            </div>
            <div className="flex">
              <div className="w-2/3">
                <PriceCard
                  text={"Low Price"}
                  priceInCents={selectedStockQuote.l}
                />
              </div>
              <div className="mx-5" />
              <div className="w-2/3">
                <PriceCard
                  text={"Last Traded Price"}
                  priceInCents={selectedStockQuote.c}
                />
              </div>
            </div>
          </div>
        ) : (
          selectedStock && <div>Loading</div>
        )}

        <div className="m-5" />
        <div className="flex">
          {userData && (
            <PriceCard text="Current Balance" priceInCents={userData.balance} />
          )}
        </div>

        <div className="w-1/6">
          <input className={inputField} type="number" />
        </div>
      </main>
    </>
  );
}

const ShowStocksModal = ({
  stocks,
  showModal,
  setShowModal,
  setSelectedStock,
  setSelectedStockQuote,
}: AppProps) => {
  if (stocks.length === 0) return <div>No Stock Found</div>;

  setSelectedStock(null);
  setSelectedStockQuote(null);

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
                        <Dialog.Description className="w-fw">
                          <div className="mt-2 max-h-[40rem] overflow-auto rounded-md">
                            {stocks.map((stock, idx) => (
                              <button
                                className="mt-1 w-full bg-slate-300 p-5 text-left hover:bg-slate-600"
                                key={idx}
                                onClick={() => {
                                  handleStockSelect(idx);
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

const Spinner = () => {
  return (
    <svg
      className="-ml-1 mr-3 h-9 w-8 animate-spin text-white"
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
        stroke-width="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

const PriceCard: React.FC<{ text: string; priceInCents?: number }> = ({
  text,
  priceInCents,
}) => {
  return (
    <div className="flex rounded-md border-2 p-4 shadow-md ">
      <div className="flex w-full content-center ">
        <div className="text-xl font-semibold">{text}</div>
        {priceInCents && (
          <div className="ml-2 font-mono text-xl ">
            : $ {getDollars(priceInCents)}
          </div>
        )}
      </div>
    </div>
  );
};

const Card: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="rounded-md border-2 py-10 px-5 shadow-md">
      <div className="text-3xl font-semibold text-gray-700">{text}</div>
    </div>
  );
};

const fetchStockSearchData = async (searchQuery: string) => {
  //TODO: handle rate-limit case
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

  const dataNasdaq = (
    await reference.tickers({ ...queryObject, exchange: "XNAS" })
  ).results;

  const dataNYSE = (
    await reference.tickers({ ...queryObject, exchange: "XNYS" })
  ).results;

  return [...dataNasdaq, ...dataNYSE];
};

const fetchStockQuote = async (stockTicker: string) => {
  const FINNHUB_KEY = env.NEXT_PUBLIC_FINNHUB_KEY;

  const stockQuoteQuery = `https://finnhub.io/api/v1/quote?symbol=${stockTicker}&token=${FINNHUB_KEY}`;

  const stockQuoteQueryResponse = await fetch(stockQuoteQuery);
  const queryJSON = (await stockQuoteQueryResponse.json()) as StockQuote;

  //convert dollars into cents
  queryJSON.c = getCents(queryJSON.c);
  queryJSON.h = getCents(queryJSON.h);
  queryJSON.l = getCents(queryJSON.l);
  queryJSON.o = getCents(queryJSON.o);
  queryJSON.pc = getCents(queryJSON.pc);

  return queryJSON;
};
