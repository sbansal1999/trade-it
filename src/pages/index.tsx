import Head from "next/head";
import { createRef, FormEvent, useRef, useState } from "react";

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

export default function Home() {
  const [searchResults, setSearchResults] = useState<Result[]>();

  const searchRef = createRef<HTMLInputElement>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchRef.current) return;

    const searchQuery = searchRef.current.value;

    searchRef.current.value = "";

    const searchData = await fetchData(searchQuery);

    setSearchResults(searchData);
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

        <div className="m-10">
          {searchResults &&
            searchResults.map((result, idx) => {
              return (
                <p key={idx}>
                  {result.name +
                    " " +
                    result.ticker +
                    " " +
                    result.primary_exchange}
                </p>
              );
            })}

          {searchResults?.length}
        </div>
      </main>
    </>
  );
}

const fetchData = async (searchQuery: string) => {
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
