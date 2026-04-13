import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: {
    "http://localhost:8080/v1/graphql": {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET ?? "myadminsecret",
      },
    },
  },
  documents: [
    "../../practice-3-nextjs-graphql/lib/graphql/**/*.gql",
    "../../practice-2-hasura-graphql/graphql/**/*.gql",
  ],
  generates: {
    "src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        strictScalars: true,
        scalars: {
          uuid: "string",
          timestamptz: "string",
        },
      },
    },
  },
};

export default config;
