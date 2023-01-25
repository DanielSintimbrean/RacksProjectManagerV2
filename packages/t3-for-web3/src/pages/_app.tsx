import { type AppType } from "next/app";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { polygon, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { trpc } from "../utils/trpc";
import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";

import "../styles/globals.css";
import { useSession } from "../hooks/useSession";
import { useMemo } from "react";
import { SiweMessage } from "siwe";
import { env } from "../env/client.mjs";
import { useAuth } from "../hooks/useAuth";

// Wagmi configuration
// ===================
export const { chains, provider } = configureChains(
  [env.NEXT_PUBLIC_LOCAL_BLOCKCHAIN ? localhost : polygon],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  let sessionStatus: AuthenticationStatus = "unauthenticated";
  const { authenticated, loading } = useSession();

  const { getNonce, logout, verifySignature } = useAuth();

  const authenticationAdapter = useMemo(
    () =>
      createAuthenticationAdapter({
        getNonce: async () => {
          const { data: nonceData } = await getNonce();
          return nonceData?.nonce ?? "";
        },

        createMessage: ({ nonce, address, chainId }) => {
          return new SiweMessage({
            domain: window.location.host,
            address,
            statement: "Sign in with Ethereum to the app.",
            uri: window.location.origin,
            version: "1",
            chainId,
            nonce,
          });
        },

        getMessageBody: ({ message }) => {
          return message.prepareMessage();
        },

        verify: async ({ message, signature }) => {
          const verifyRes = await verifySignature({
            message,
            signature,
          });
          return verifyRes.ok;
        },

        signOut: async () => {
          const res = await logout();

          if (!res.ok) {
            throw new Error("Failed to logout");
          }
        },
      }),
    [getNonce, verifySignature, logout]
  );

  if (loading) sessionStatus = "loading";
  if (authenticated) sessionStatus = "authenticated";

  return (
    <WagmiConfig client={client}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={sessionStatus}
      >
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme()}
          modalSize={"compact"}
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </RainbowKitAuthenticationProvider>
    </WagmiConfig>
  );
};

export default trpc.withTRPC(MyApp);
