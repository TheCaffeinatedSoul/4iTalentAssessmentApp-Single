import { useEffect, useState } from "react";
import axios from "axios";
import { generateSearchParams } from "../util/helper";
import { API_URL } from "../api/api";

function useLookupType({ LOOKUP_TYPE }) {
  const [lookupValues, setLookupValues] = useState([]);

  useEffect(() => {
    const searchParams = generateSearchParams({ lookup_type: LOOKUP_TYPE });

    axios
      .get(`${API_URL}/testapplookup/noauthlookupvalues?${searchParams}`)
      .then((response) => {
        setLookupValues(response.data || []);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [LOOKUP_TYPE]);

  return [lookupValues];
}

export default useLookupType;
