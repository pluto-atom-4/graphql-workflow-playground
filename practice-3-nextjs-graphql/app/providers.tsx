"use client";

import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@/lib/apollo/client";

const client = createApolloClient();

export function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
