import { Redirect } from "expo-router";

import { useAuthSession } from "@/hooks/useAuthSession";

export default function Index() {
  const { user, loading } = useAuthSession();

  if (loading) {
    return null;
  }

  return <Redirect href={user ? "/games" : "/account"} />;
}
