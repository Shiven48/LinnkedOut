import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Media } from "@/services/common/types";
import Loading from "@/app/_components/shared/Loading";
import { debounce } from "lodash";
import NoContent from "@/app/_components/shared/NoContent";
import Link from "next/link";
import { useSearchingResultState } from "@/hooks/useSearchResultState";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [queryResult, setQueryResult] = useState<Media[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const searchState = useSearchingResultState((state) => state.searchState);
  const setSearchState = useSearchingResultState((state) => state.setSearching);
  const router = useRouter();

  const debouncedSearch = useRef(
    debounce(async (searchQuery: string) => {
      // If the search query is empty then return the empty array
      if (!searchQuery.trim()) {
        setQueryResult([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `/api/videos/query?query=${encodeURIComponent(searchQuery)}`
        );
        if (!res.ok)
          throw new Error(`Error fetching videos: ${res.statusText}`);

        const data = await res.json();
        console.log("Search results:", data);

        setQueryResult(data.body || []);
        setError("");
      } catch (error) {
        console.error(error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState(true);
    setQuery(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchState(false);
    setQuery("");
    debouncedSearch.flush();
    localStorage.setItem("queryResult", JSON.stringify(queryResult));
    router.push(`/search?query=${query}`);
  };

  console.log(query);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form
        className="flex items-center rounded-xl justify-center group"
        onSubmit={handleFormSubmit}
      >
        <input
          type="text"
          className="flex-1 text-white h-10 bg-white/5 placeholder-gray-400 border border-white/10 outline-none px-4 rounded-l-xl focus:bg-white/10 focus:border-[var(--col-dark-golden)] transition-all backdrop-blur-md shadow-inner"
          placeholder="Search..."
          value={query}
          ref={searchRef}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="bg-dark-golden h-10 text-white px-5 rounded-r-xl border border-l-0 border-white/10 transition-all shadow-md group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center cursor-pointer"
        >
          <Image width={18} height={18} src="/search.svg" alt="searchBarIcon" className="brightness-200" />
        </button>
      </form>

      {loading && (
        <div className="absolute top-12 w-full">
          <Loading />
        </div>
      )}

      {error && (
        <div className="text-red-500 mt-2 absolute top-12 w-full">{error}</div>
      )}

      {!loading && !error && searchState && queryResult.length > 0 && (
        <div className="absolute top-14 bg-dark/90 backdrop-blur-xl w-full rounded-xl p-3 shadow-2xl z-50 border border-white/10">
          <p className="text-[var(--col-dark-golden)] font-semibold mb-3 text-sm px-1">Found {queryResult.length} results</p>
          <div className="max-h-60 overflow-y-auto">
            {queryResult.map((item) => (
              <Link
                className="flex items-center justify-between cursor-pointer mt-2 p-2 rounded-lg border-l-2 border-transparent hover:border-[var(--col-dark-golden)] hover:bg-white/5 transition-all"
                href={`/video/${item.platform}/${item.platform === 'youtube' ? item.youtubeId : item.redditId}/${item.id}`}
                key={item.id}
              >
                <p
                  className="text-sm font-medium text-gray-200 line-clamp-2 pr-4"
                >
                  {item.title}
                </p>
                <Image
                  src={item.thumbnailUrl || ""}
                  alt=""
                  width={80}
                  height={80}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && query && queryResult.length === 0 && (
        <div className="absolute top-12 bg-dark w-full rounded-md p-2 shadow-lg z-10">
          <NoContent />
        </div>
      )}
    </div>
  );
}
