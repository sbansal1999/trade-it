import Head from "next/head";
import { createRef, FormEvent, useRef } from "react";

const fetchData = (searchQuery: string) => {};

export default function Home() {
  const searchRef = createRef<HTMLInputElement>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchRef.current) return;

    const searchQuery = searchRef.current.value;
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
      </main>
    </>
  );
}
