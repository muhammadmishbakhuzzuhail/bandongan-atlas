/**
 * fetchApi is a utility wrapper around the native fetch API.
 * It ensures that cookies (credentials) are always included in the request.
 * On the client side (browser), it relies on relative URLs for perfect domain matching.
 */
export async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let finalInput = input;

  if (typeof window === 'undefined' && typeof finalInput === 'string' && finalInput.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    finalInput = `${baseUrl}${finalInput}`;
  }

  const options: RequestInit = {
    ...init,
    credentials: init?.credentials || 'include',
  };

  return fetch(finalInput, options);
}
