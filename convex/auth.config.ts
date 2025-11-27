import { convexAuth } from "@convex-dev/auth/server";
import WorkOS from "@workos-inc/node";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    {
      id: "workos",
      type: "oauth" as const,
      domain: process.env.WORKOS_DOMAIN!,
      client_id: process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID!,
      client_secret: process.env.WORKOS_CLIENT_SECRET!,
      redirect_uri: process.env.WORKOS_REDIRECT_URI!,
    },
  ],
});
