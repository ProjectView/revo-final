import { useEffect, useRef, useState } from 'react';
import { logError } from '../lib/logger';

export interface AddressSuggestion {
  label: string;
  score?: number;
  id: string;
  name: string;
  postcode: string;
  city: string;
  geometry: {
    coordinates: [number, number];
  };
}

interface UseAddressSearchOptions {
  initialValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: AddressSuggestion) => void;
}

const ADDRESS_API_URL = 'https://api-adresse.data.gouv.fr/search/';
const MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 5;

export function useAddressSearch(options: UseAddressSearchOptions = {}) {
  const { initialValue = '', onChange, onSelect } = options;

  const [addressSearch, setAddressSearch] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressChange = async (val: string) => {
    setAddressSearch(val);
    onChange?.(val);

    if (val.length > MIN_QUERY_LENGTH) {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(`${ADDRESS_API_URL}?q=${encodeURIComponent(val)}&limit=${MAX_RESULTS}`);
        const data = await response.json();
        setSuggestions(data.features.map((f: any) => ({ ...f.properties, geometry: f.geometry })));
        setShowSuggestions(true);
      } catch (error) {
        logError('useAddressSearch.handleAddressChange', error);
      } finally {
        setIsLoadingAddress(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectAddress = (s: AddressSuggestion) => {
    setAddressSearch(s.label);
    onSelect?.(s);
    setShowSuggestions(false);
  };

  return {
    addressSearch,
    setAddressSearch,
    suggestions,
    isLoadingAddress,
    showSuggestions,
    setShowSuggestions,
    suggestionRef,
    handleAddressChange,
    selectAddress,
  };
}
