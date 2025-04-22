
import React from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { useFilteredLocations, allOptions } from "./useFilteredLocations";

type OptionType = { label: string; value: string; type: "province" | "city"; lat?: number; lng?: number };

type Props = {
  search: string;
  setSearch: (v: string) => void;
  searching: boolean;
  setSearching: (v: boolean) => void;
  onSelect: (option: OptionType) => void;
  onSubmit: (event: React.FormEvent) => void;
};

const SearchBar: React.FC<Props> = ({
  search, setSearch, searching, setSearching, onSelect, onSubmit
}) => {
  const { filteredProvinces, filteredCities } = useFilteredLocations(search);

  return (
    <form onSubmit={onSubmit} className="flex gap-2 mt-2 items-center z-10">
      <div className="w-full relative">
        <Command shouldFilter={false} className="bg-black/70 rounded-md">
          <CommandInput
            value={search}
            onValueChange={v => { setSearch(v); setSearching(true); }}
            placeholder="Cerca una città o provincia italiana..."
            className="bg-black/70 border-projectx-deep-blue py-2"
            onFocus={() => setSearching(true)}
            onBlur={() => setTimeout(() => setSearching(false), 200)}
          />
          {(searching && !!search) && (
            <div className="absolute left-0 mt-1 w-full z-50 bg-background rounded-md border max-h-52 overflow-y-auto shadow-lg">
              {filteredProvinces.length > 0 || filteredCities.length > 0 ? (
                <CommandList>
                  {filteredProvinces.length > 0 && (
                    <CommandGroup heading="Province">
                      {filteredProvinces.map(opt => (
                        <CommandItem
                          key={"pr_"+opt.value}
                          onSelect={() => onSelect(opt)}
                          className="cursor-pointer"
                        >
                          {opt.label}
                          <span className="ml-2 text-xs text-muted-foreground">Provincia</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {filteredCities.length > 0 && (
                    <CommandGroup heading="Città">
                      {filteredCities.map(opt => (
                        <CommandItem
                          key={"ct_"+opt.value}
                          onSelect={() => onSelect(opt)}
                          className="cursor-pointer"
                        >
                          {opt.label}
                          <span className="ml-2 text-xs text-muted-foreground">Città</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              ) : (
                <div className="py-6 text-center text-sm">Nessun risultato trovato</div>
              )}
            </div>
          )}
        </Command>
      </div>
      <Button
        type="submit"
        variant="outline"
        className="bg-projectx-deep-blue hover:bg-projectx-blue"
      >
        Cerca
      </Button>
    </form>
  );
};

export default SearchBar;
