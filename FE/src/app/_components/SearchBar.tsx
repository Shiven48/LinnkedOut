import Image from 'next/image';
// import { useState } from 'react';

export default function SearchBar() {
//   const [query, setQuery] = useState('');

  return (
    <form 
      className="flex items-center p-2 rounded-medium w-[90%] justify-center"
    >
      {/* Input field */}
      <input
        type="text"
        className="flex-1 text-white h-8 bg-gray-500 brightness-[40%] placeholder-white border-none outline-none p-2 rounded-l-small"
        placeholder="search"
        // value={query}
      />

      <button
        type="submit"
        className="bg-golden h-8 text-white px-4 py-2 rounded-r-medium"
      >
        <Image 
            className=''
            width={20}
            height={20}
            src='/search.svg'
            alt='searchBarIcon'
        >
        </Image>
      </button>
    </form>
  );
};