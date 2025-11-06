// Use relative URLs for Vercel deployment, or absolute URL for local development
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? '' : 'http://localhost:3000'
);

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    const errorMessage = error.error?.message || error.message || 'Request failed';
    const apiError = new Error(errorMessage);
    (apiError as any).status = response.status;
    (apiError as any).code = error.error?.code;
    throw apiError;
  }

  return response;
};
