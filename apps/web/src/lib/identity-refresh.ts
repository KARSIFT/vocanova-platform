export function createIdentityRefresh(
  setUserId: (userId: string | undefined) => void,
) {
  let latestRequest = 0;

  return async function refreshIdentity(
    loadUserId: () => Promise<string | undefined>,
  ): Promise<void> {
    const currentRequest = ++latestRequest;
    setUserId(undefined);
    try {
      const userId = await loadUserId();
      if (currentRequest === latestRequest) setUserId(userId);
    } catch {
      if (currentRequest === latestRequest) setUserId(undefined);
    }
  };
}
