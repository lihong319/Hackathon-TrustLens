"use client";

import {
  DAppKitProvider,
  type DAppKitProviderProps,
} from "@mysten/dapp-kit-react";
import { ConnectButton as SuiConnectButton } from "@mysten/dapp-kit-react/ui";
import type { PropsWithChildren } from "react";
import { dAppKit } from "./dapp-kit";

export function DAppKitClientProvider({ children }: PropsWithChildren) {
  return <DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>;
}

export function ConnectButton(
  props: React.ComponentProps<typeof SuiConnectButton>,
) {
  return <SuiConnectButton {...props} />;
}
