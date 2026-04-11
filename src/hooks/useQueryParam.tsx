import { useRouter, useSearchParams } from "next/navigation";

export const useQueryParam = (key: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = searchParams.get(key) || "";

  const setValue = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, newValue);
    router.push(`?${params.toString()}`);
  };

  return { value, setValue };
};