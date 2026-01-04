import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";

export type FiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilters: string[];
  badWordsFilters: string[];
  onApplyAll: () => void;
  onClearAll: () => void;
  onAddFilter: (word: string) => void;
  onRemoveFilter: (word: string) => void;
};

export function MessageFilters({
  searchQuery,
  onSearchChange,
  activeFilters,
  badWordsFilters,
  onApplyAll,
  onClearAll,
  onAddFilter,
  onRemoveFilter,
}: FiltersProps) {
  return (
    <div className="bg-card rounded-lg border border-border/30 shadow-sm p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">Search Messages</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by message content, sender name, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1 pl-10 pr-10 ring-primary border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div>
        <div className="flex items-center justify-between my-3">
          <div className="text-sm font-medium text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <p className="mt-1">Quick Filters</p>
          </div>
          <div className="flex items-center gap-2">
            {activeFilters.length < badWordsFilters.length && (
              <Button variant="default" size="sm" onClick={onApplyAll} className="text-xs">
                Apply All
              </Button>
            )}
            {activeFilters.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClearAll} className="text-xs">
                Clear All
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {badWordsFilters.map((word) => {
            const isActive = activeFilters.includes(word);
            return (
              <button
                key={word}
                onClick={() => onAddFilter(word)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-red-500 text-white shadow-md" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                }`}
              >
                {word}
                {isActive && (
                  <X
                    className="inline-block ml-1 w-3 h-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFilter(word);
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/20 cursor-pointer">
          <p className="text-xs text-muted-foreground mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <div key={filter} className=" px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1">
                <p className="mt-1">{filter}</p>
                <button onClick={() => onRemoveFilter(filter)} className="hover:text-primary/70">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
