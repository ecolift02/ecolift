import { useEffect, useRef, useState } from "react";
import { searchLocation } from "../../api/mapService";
import { MapPin } from "lucide-react";

export default function SearchLocation({
  placeholder,
  value,
  onChange,
  onBlur,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const timeoutRef = useRef(null);
  const suppressNextQueryRef = useRef(false);

  // Sync state if parent changes it (handles both strings and full objects)
  useEffect(() => {
    if (value && typeof value === "object" && value.display_name) {
      setQuery(value.display_name);
    } else if (typeof value === "string") {
      setQuery(value);
    } else if (!value) {
      setQuery("");
    }
  }, [value]);

  useEffect(() => {
    if (suppressNextQueryRef.current) {
      suppressNextQueryRef.current = false;
      return;
    }

    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchLocation(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [query]);

  const handleSelect = (item) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    suppressNextQueryRef.current = true;

    setQuery(item.display_name);
    setResults([]);

    // THIS IS THE KEY FIX: Pass the full object up to the parent
    onChange(item);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value); // Fallback: Pass string while they type
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 text-gray-500" size={20} />

      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={onBlur}
        onFocus={() => {
          if (query.length >= 3) {
            setResults((prev) => prev);
          }
        }}
        autoComplete="off"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
      />

      {results.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full min-w-[16rem] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
          {results.map((item) => (
            <button
              key={item.place_id}
              type="button"
              className="block w-full cursor-pointer border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-green-50 last:border-b-0 truncate"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
            >
              {item.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
