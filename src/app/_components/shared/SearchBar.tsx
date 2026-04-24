import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Media } from "@/services/common/types";
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
          `/api/videos/query?query=${encodeURIComponent(searchQuery)}`,
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
    }, 300),
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
    <div className="relative w-[90%]">
      <form
        className="flex items-center p-2 rounded-medium justify-center"
        onSubmit={handleFormSubmit}
      >
        <input
          type="text"
          className="flex-1 text-white h-8 bg-gray-700 bg-opacity-30 placeholder-gray-400 border-none outline-none pl-4 rounded-l-medium"
          placeholder="Explore your curated universe..."
          value={query}
          ref={searchRef}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="bg-golden h-8 text-white px-4 py-2 rounded-r-medium"
          // onClick={HandleSearchSubmit}
        >
          <Image width={20} height={20} src="/search.svg" alt="searchBarIcon" />
        </button>
      </form>

      {loading && (
        <div className="absolute top-14 bg-dark bg-opacity-95 w-full rounded-xl p-4 shadow-lg z-10 border border-golden flex items-center justify-center gap-3">
          <div className="w-5 h-5 rounded-full animate-spin border-2 border-[var(--col-dark-golden)] border-t-transparent" />
          <span className="text-gray-400 text-sm">Searching...</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 mt-2 absolute top-14 w-full bg-dark bg-opacity-95 rounded-xl p-4 shadow-lg z-10 border border-red-500/30">
          {error}
        </div>
      )}

      {!loading && !error && searchState && queryResult.length > 0 && (
        <div className="absolute top-14 bg-dark bg-opacity-95 w-full rounded-xl p-3 shadow-lg z-10 border border-golden">
          <p className="text-golden text-sm mb-3 px-2">
            Found {queryResult.length} results
          </p>
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {queryResult.map((item) => (
              <Link
                className="flex items-center gap-3 cursor-pointer px-3 py-3 rounded-lg hover:bg-gray-800/60 transition-colors group"
                href={`/video/${item.platform}/${item.platform === "youtube" ? item.youtubeId : item.redditId}/${item.id}`}
                key={item.id}
              >
                {/* Clock/History SVG icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 flex-shrink-0 text-gray-500 group-hover:text-[var(--col-dark-golden)] transition-colors"
                >
                  <path
                    d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Title */}
                <p className="flex-1 text-base text-gray-300 group-hover:text-[var(--col-dark-golden)] transition-colors line-clamp-1">
                  {item.title}
                </p>

                {/* Thumbnail */}
                <Image
                  src={item.thumbnailUrl || ""}
                  alt=""
                  width={80}
                  height={45}
                  className="rounded-md object-cover flex-shrink-0"
                  style={{ width: 80, height: 45 }}
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
