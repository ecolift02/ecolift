import { useEffect, useRef, useState } from "react";
import { searchLocation } from "../../api/mapService";
import { MapPin } from "lucide-react";

export default function SearchLocation({
  placeholder,
  value,
  onChange,
  onBlur,
  hasError,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const timeoutRef = useRef(null);
  const suppressNextQueryRef = useRef(false);

  // 1. Create a ref to detect outside clicks
  const wrapperRef = useRef(null);

  // 2. Add useEffect to handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside this component, clear results to hide dropdown
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    onChange(item);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
  };

  return (
    // 3. Attach the ref to the outermost div
    <div className="relative" ref={wrapperRef}>
      <MapPin
        className={`absolute left-3 top-3.5 z-10 pointer-events-none ${
          hasError ? "text-red-500" : "text-slate-400"
        }`}
        size={20}
      />

      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={onBlur}
        autoComplete="off"
        placeholder={placeholder}
        className={`relative w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition text-sm text-slate-800 bg-transparent focus:ring-2 focus:ring-green-600 focus:border-transparent ${
          hasError
            ? "border-red-500"
            : "border-slate-300 hover:border-slate-400"
        }`}
      />

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 min-w-[16rem] overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl py-1">
          {results.map((item) => (
            <button
              key={item.place_id}
              type="button"
              className="block w-full cursor-pointer border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-green-50 last:border-b-0 truncate"
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
