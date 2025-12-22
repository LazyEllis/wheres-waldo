const baseURL = import.meta.env.VITE_API_URL;

const request = async (endpoint, options = {}) => {
  const url = `${baseURL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw data.errors || new Error(data.message);
  }

  return data;
};

export const listCharacters = () => request("/characters");

export const placeMarker = ({ id, coordinate }) =>
  request(`/characters/${id}/markers`, {
    method: "POST",
    body: JSON.stringify(coordinate),
  });
