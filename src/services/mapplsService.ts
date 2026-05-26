import axios from 'axios';

const BASE_URL =
  'https://atlas.mappls.com/api/places/nearby/json';

export const fetchNearbyPlaces =
  async (
    latitude: number,
    longitude: number,
    keyword: string,
  ) => {
    const response = await axios.get(
      BASE_URL,
      {
        params: {
          keywords: keyword,
          refLocation:
            `${latitude},${longitude}`,

          radius: 5000,
        },
      },
    );

    return response.data.suggestedLocations;
  };