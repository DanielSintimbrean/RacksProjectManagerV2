import { trpc } from "../utils/trpc";

export const useAuth = () => {
  const trpcUtils = trpc.useContext();
  const { mutateAsync: verifySignature } = trpc.auth.verify.useMutation({
    onSuccess: () => {
      // Refresh session
      trpcUtils.auth.invalidate();
    },
  });

  const { refetch: getNonce } = trpc.auth.nonce.useQuery(undefined, {
    enabled: false,
  });

  const { mutateAsync: logout, isLoading: isLoggingOut } =
    trpc.auth.logout.useMutation({
      onSuccess: () => {
        // Refresh session
        trpcUtils.auth.invalidate();
      },
    });

  return {
    verifySignature: verifySignature,
    getNonce,
    logout,
    isLoggingOut: isLoggingOut,
  };
};
