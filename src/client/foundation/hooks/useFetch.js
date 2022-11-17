import { useEffect, useState } from "react";

export function useFetch(apiPath) {
  const [result, setResult] = useState({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiPath);
        const data = await res.json();

        if (res.status !== 200) {
          throw {
            response: res,
          }; // XXX
        }

        setResult({
          data: data,
          error: null,
          loading: false,
        });
      } catch (error) {
        setResult({
          error,
          loading: false,
        });
      }
    };
    fetchData();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);
  return result;
}
