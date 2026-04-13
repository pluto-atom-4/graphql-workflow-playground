import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export function createApolloClient(): ApolloClient<unknown> {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL ?? "http://localhost:8080/v1/graphql",
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });
}
