import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = ({ value, onChange, placeholder = "Search teams, leagues, predictions..." }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-9 text-sm text-white placeholder:text-slate-400"
    />
  </div>
);

export default SearchBar;
