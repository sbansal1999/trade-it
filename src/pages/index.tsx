import { Dialog, Listbox, Transition } from "@headlessui/react";
import Head from "next/head";
import { createRef, FormEvent, Fragment, useState } from "react";

type Result = {
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
  stocks: Result[];
};

export default function Home() {
  const [searchResults, setSearchResults] = useState<Result[]>([
    {
      ticker: "ASYS",
      name: "Amtech Systems Inc",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0000720500",
      composite_figi: "BBG000BCJDW6",
      share_class_figi: "BBG001S5NX89",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AMPG",
      name: "AMPLITECH GROUP INC. COM",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001518461",
      composite_figi: "BBG00394F954",
      share_class_figi: "BBG00394F9X3",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AUR",
      name: "Aurora Innovation, Inc. Class A Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001828108",
      composite_figi: "BBG00Z92Y6X1",
      share_class_figi: "BBG00Z92Y6Y0",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ANTX",
      name: "AN2 Therapeutics, Inc. Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001880438",
      composite_figi: "BBG00QYLYBK4",
      share_class_figi: "BBG00QYLYBL3",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ARCT",
      name: "Arcturus Therapeutics Holdings Inc. Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001768224",
      composite_figi: "BBG00NNW8JK1",
      share_class_figi: "BBG00NNW8JL0",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AVAV",
      name: "AeroVironment, Inc.",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001368622",
      composite_figi: "BBG000GX14P2",
      share_class_figi: "BBG001SPPWP6",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ALVR",
      name: "AlloVir, Inc. Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001754068",
      composite_figi: "BBG00P80SH34",
      share_class_figi: "BBG00P80SH43",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ALLR",
      name: "Allarity Therapeutics, Inc. Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001860657",
      composite_figi: "BBG012NXCZP8",
      share_class_figi: "BBG012NXCZQ7",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AGIL",
      name: "AgileThought, Inc. Class A Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001790625",
      composite_figi: "BBG00QYKZB43",
      share_class_figi: "BBG00RCQNY45",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ACHV",
      name: "Achieve Life Sciences, Inc.",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0000949858",
      composite_figi: "BBG000FB8S62",
      share_class_figi: "BBG001S8JF14",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ABCB",
      name: "Ameris Bancorp",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0000351569",
      composite_figi: "BBG000CDY3H5",
      share_class_figi: "BBG001S80PX7",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AMEH",
      name: "Apollo Medical Holdings, Inc. Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001083446",
      composite_figi: "BBG000H7ZK57",
      share_class_figi: "BBG001S96MS2",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AREC",
      name: "AMERICAN RESOURCES CORP",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001590715",
      composite_figi: "BBG005VQ4CM1",
      share_class_figi: "BBG005VQ4CN0",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AMWD",
      name: "American Woodmark Corp",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0000794619",
      composite_figi: "BBG000BBX657",
      share_class_figi: "BBG001S5NQ57",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ALLK",
      name: "Allakos Inc.",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001564824",
      composite_figi: "BBG003QBJKN0",
      share_class_figi: "BBG003QBJKP8",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "AVRO",
      name: "AVROBIO, Inc. Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001681087",
      composite_figi: "BBG00DJ4T7D1",
      share_class_figi: "BBG00DJ4T7F9",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ADBE",
      name: "Adobe Inc.",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0000796343",
      composite_figi: "BBG000BB5006",
      share_class_figi: "BBG001S5NCQ5",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ATRO",
      name: "Astronics Corp",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0000008063",
      composite_figi: "BBG000BCLBY5",
      share_class_figi: "BBG001S5NYK3",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
    {
      ticker: "ARCK",
      name: "Arbor Rapha Capital Bioholdings Corp. I Class A Common Stock",
      market: "stocks",
      locale: "us",
      primary_exchange: "XNAS",
      type: "CS",
      active: true,
      currency_name: "usd",
      cik: "0001855886",
      composite_figi: "BBG012LSNLP0",
      share_class_figi: "BBG012LSNMQ7",
      last_updated_utc: "2022-12-29T00:00:00Z",
    },
  ]);
  const searchRef = createRef<HTMLInputElement>();
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setShowModal(true);

    if (!searchRef.current) return;

    // const searchQuery = searchRef.current.value;
    // const searchData = await fetchStockSearchData(searchQuery);

    // setSearchResults(searchData);
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
            <button className="w-full rounded-md bg-blue-400 py-3 text-white hover:bg-blue-900">
              <span className="text-3xl">SEARCH</span>
            </button>
          </form>
        </div>
        <div>
          {showModal ? <ShowStocksModal stocks={searchResults} /> : null}
        </div>
      </main>
    </>
  );
}

const ShowStocksModal = ({ stocks }: AppProps) => {
  if (stocks.length === 0) return <div>No Stock Found</div>;

  return <></>;
};

const fetchStockSearchData = async (searchQuery: string) => {
  //TODO: handle rate-limit case
  const POLYGON_KEY = process.env.NEXT_PUBLIC_POLYGON_KEY;
  const resultLimit = 10;

  const nasdaqQuery = `https://api.polygon.io/v3/reference/tickers?type=CS&market=stocks&exchange=XNAS&search=${searchQuery}&active=true&limit=${resultLimit}&apiKey=${POLYGON_KEY}`;
  const nyseQuery = `https://api.polygon.io/v3/reference/tickers?type=CS&market=stocks&exchange=XNYS&search=${searchQuery}&active=true&limit=${resultLimit}&apiKey=${POLYGON_KEY}`;

  const responseNasdaq = await fetch(nasdaqQuery);
  const responseNasdaqJSON = await responseNasdaq.json();
  const dataNasdaq: Result[] = await responseNasdaqJSON.results;

  const responseNYSE = await fetch(nyseQuery);
  const responseNYSEJSON = await responseNYSE.json();
  const dataNYSE: Result[] = await responseNYSEJSON.results;

  return [...dataNasdaq, ...dataNYSE];
};
