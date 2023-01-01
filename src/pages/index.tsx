import { Dialog, Listbox, Transition } from "@headlessui/react";
import Head from "next/head";
import { createRef, FormEvent, Fragment, useRef, useState } from "react";
import { PresentationChartLineIcon } from "@heroicons/react/24/outline";

type Stock = {
  active: boolean;
  cik: string;
  composite_figi: string;
  currency_name: string;
  last_updated_utc: string;
  locale: string;
  market: string;
  name: string;
  primary_exchange: string;
  share_class_figi: string;
  ticker: string;
  type: string;
};

type AppProps = {
  stocks: Stock[];
  showModal: boolean;
  setShowModal: (arg: boolean) => void;
  setSelectedStock: (arg: Stock) => void;
};

export default function Home() {
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const searchRef = createRef<HTMLInputElement>();
  const [showModal, setShowModal] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock>();
  const [showSearchSpinner, setShowSearchSpinner] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchRef.current) return;

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
                className="text-md placeholder-grey-500 disbled focus:ring-slate-400focus:invalid:border-pink-500 mt-1 block w-full rounded-md border-2
                border-slate-400 bg-white p-2 focus:border-sky-500  focus:outline-none focus:ring-1"
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
            />
          ) : null}
        </div>
        {selectedStock && (
          <div className="text-3xl">
            {selectedStock.ticker + " - " + selectedStock.name}
          </div>
        )}
      </main>
    </>
  );
}

const ShowStocksModal = ({
  stocks,
  showModal,
  setShowModal,
  setSelectedStock,
}: AppProps) => {
  if (stocks.length === 0) return <div>No Stock Found</div>;

  const handleStockSelect = (idx: number) => {
    setSelectedStock(stocks[idx]);
    setShowModal(false);
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

const fetchStockSearchData = async (searchQuery: string) => {
  //TODO: handle rate-limit case
  const POLYGON_KEY = process.env.NEXT_PUBLIC_POLYGON_KEY;
  const resultLimit = 10;

  const nasdaqQuery = `https://api.polygon.io/v3/reference/tickers?type=CS&market=stocks&exchange=XNAS&search=${searchQuery}&active=true&limit=${resultLimit}&apiKey=${POLYGON_KEY}`;
  const nyseQuery = `https://api.polygon.io/v3/reference/tickers?type=CS&market=stocks&exchange=XNYS&search=${searchQuery}&active=true&limit=${resultLimit}&apiKey=${POLYGON_KEY}`;

  const responseNasdaq = await fetch(nasdaqQuery);
  const responseNasdaqJSON = await responseNasdaq.json();
  const dataNasdaq: Stock[] = await responseNasdaqJSON.results;

  const responseNYSE = await fetch(nyseQuery);
  const responseNYSEJSON = await responseNYSE.json();
  const dataNYSE: Stock[] = await responseNYSEJSON.results;

  return [...dataNasdaq, ...dataNYSE];
};
