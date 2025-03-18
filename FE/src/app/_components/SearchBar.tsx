import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { Media } from '../../../types';
import Loading from './Loading';
import { debounce } from 'lodash';
import NoContent from './NoContent';
import Link from 'next/link';
import { useSearchingResultState } from '../../../hooks/useSearchResultState';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState<string>('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [queryResult, setQueryResult] = useState<Media[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const searchState = useSearchingResultState((state) => state.searchState) 
  const setSearchState = useSearchingResultState((state) => state.setSearching)
  const router = useRouter()

  const debouncedSearch = useRef(
    debounce(async (searchQuery: string) => {
      // If the search query is empty then return the empty array
      if (!searchQuery.trim()) {
        setQueryResult([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/videos/query?query=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error(`Error fetching videos: ${res.statusText}`);

        const data = await res.json();
        console.log("Search results:", data);

        setQueryResult(data.body || []);
        setError('');
      } catch (error) {
        console.error(error);
        setError(error instanceof Error ? error.message : 'An error occurred');
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
    setSearchState(true)
    setQuery(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchState(false)
    setQuery('')
    debouncedSearch.flush();
    localStorage.setItem('queryResult',JSON.stringify(queryResult))
    router.push(`/search?query=${query}`)
  };

  console.log(query)

  return (
    <div className="relative w-[90%]">
      <form
        className="flex items-center p-2 rounded-medium justify-center"
        onSubmit={handleFormSubmit}
      >
        <input
          type="text"
          className="flex-1 text-white h-8 bg-gray-500 bg-opacity-20 placeholder-white border-none outline-none p-2 rounded-l-small"
          placeholder="search"
          value={query}
          ref={searchRef}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="bg-golden h-8 text-white px-4 py-2 rounded-r-medium"
          // onClick={HandleSearchSubmit}
        >
          <Image
            width={20}
            height={20}
            src='/search.svg'
            alt='searchBarIcon'
          />
        </button>
      </form>

      {loading && <div className="absolute top-12 w-full"><Loading /></div>}

      {error && <div className="text-red-500 mt-2 absolute top-12 w-full">{error}</div>}

      {!loading && !error && searchState && queryResult.length > 0 && (
        <div className="absolute top-14 bg-dark bg-opacity-90 w-full rounded p-2 shadow-lg z-10 border border-golden">
          <p className="text-golden mb-2">Found {queryResult.length} results</p>
          <div className="max-h-60 overflow-y-auto">
            {queryResult.map((item) => (
              <Link 
                className='flex justify-between cursor-pointer mt-4 border-l-1 border-yellow-500 hover:bg-gray-800 hover:bg-opacity-60'  
                href={`/video/${item.platform}/${item.id}`}
                key={item.id}
              >
                <p key={item.id} className="p-2 text-sm rounded cursor-pointer text-golden">
                  {item.title}
                </p>
                <Image
                  src={item.thumbnailUrl || ''}
                  alt=''
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