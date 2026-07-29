import { authClient } from "../auth-client";

const useGetSession = () => {
  const { data: session, isPending } = authClient.useSession();

  return { session, isPending };
};

export default useGetSession;
