import { type NextPage } from "next";
import Head from "next/head";
import Layout from "../componests/Layout";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const trpcUtils = trpc.useContext();
  const hello = trpc.example.hello.useQuery({ text: "from tRPC" });
  const secret = trpc.auth.getSecretMessage.useQuery(undefined, {
    retry(_, error) {
      if (error?.shape?.data.code === "UNAUTHORIZED") {
        trpcUtils.auth.getSecretMessage.setData(undefined, "Not logged in");
        return false;
      }
      return true;
    },
  });

  return (
    <Layout>
      <main className="flex h-full min-h-[90vh] flex-col items-center justify-center bg-gradient-to-b from-base-100 to-base-300">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-neutral-content sm:text-[5rem]">
            Racks <span className="text-primary">Community</span>
          </h1>

          <p className="text-2xl text-neutral-content">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>

          <p className="text-2xl text-neutral-content">
            Secret Message <br />
            {secret.data}
          </p>
        </div>
      </main>
    </Layout>
  );
};

export default Home;
