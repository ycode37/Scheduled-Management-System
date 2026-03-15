const BASE_URL = import.meta.env.VITE_API_URL;

// Create and export an async function called apiFetch
// It takes a URL path and optional fetch options (default is an empty object)
export const apiFetch = async (path, options = {}) => {

  // Get the saved token from localStorage (used for authentication)
  const token = localStorage.getItem("token");

  // Send a request using fetch
  // Combine BASE_URL with the provided path
  const res = await fetch(`${BASE_URL}${path}`, {

    // Spread in any extra options passed into the function (method, body, etc.)
    ...options,

    // Set up request headers
    headers: {
      // Tell the server we are sending JSON data
      "Content-Type": "application/json",

      // If a token exists, add an Authorization header
      // This sends the token as a Bearer token for protected routes
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // If the response is not successful (status not 200–299),
  // throw an error to stop execution
  if (!res.ok) throw new Error("Request failed");

  // Convert the response to JSON and return it
  return res.json();
};