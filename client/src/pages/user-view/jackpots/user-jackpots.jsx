import { fetchJackpots } from "@/features/slices/jackpotSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTrophy, FaFrown, FaClock, FaFilter, FaTimes, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import Loader from "@/components/common/Loader";

const JACKPOT_TYPE_COLORS = {
  odibets: "bg-blue-100 text-blue-800",
  sportpesaMid: "bg-purple-100 text-purple-800",
  sportpesaMega: "bg-indigo-100 text-indigo-800",
  mozzart: "bg-amber-100 text-amber-800",
  betikaMid: "bg-green-100 text-green-800",
  betikaMega: "bg-teal-100 text-teal-800",
};

const JACKPOT_TYPE_NAMES = {
  odibets: "Odibets",
  sportpesaMid: "SportPesa Midweek",
  sportpesaMega: "SportPesa Mega",
  mozzart: "Mozzart",
  betikaMid: "Betika Midweek",
  betikaMega: "Betika Mega",
};

const UserJackpots = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.jackpots.status);
  const error = useSelector((state) => state.jackpots.error);
  const jackpots = useSelector((state) => state.jackpots.list);
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  useEffect(() => {
    dispatch(fetchJackpots());
  }, [dispatch]);

  const getResultIcon = (result) => {
    switch (result) {
      case "win":
        return <FaTrophy className="text-green-500" />;
      case "loss":
        return <FaFrown className="text-red-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  // Get all unique jackpot types for filter options
  const allJackpotTypes = [...new Set(jackpots?.map(jp => jp.jackpotType))];

  // Sort jackpots
  const sortedJackpots = [...(jackpots || [])].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Filter jackpots based on active filter
  const filteredJackpots = sortedJackpots?.filter(jp => {
    if (activeFilter === "all") return true;
    return jp.jackpotType === activeFilter;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 opacity-30" />;
    return sortConfig.direction === "asc" 
      ? <FaSortUp className="ml-1" /> 
      : <FaSortDown className="ml-1" />;
  };

  return (
    <div className="container max-w-6xl p-4 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Current Jackpots</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {filteredJackpots?.length} {filteredJackpots?.length === 1 ? "entry" : "entries"}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                activeFilter !== "all" 
                  ? JACKPOT_TYPE_COLORS[activeFilter]?.replace("text-", "text-white ") || "bg-gray-800 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
              aria-label="Filter jackpots"
            >
              <FaFilter className="mr-2" />
              {activeFilter === "all" ? "All Jackpots" : JACKPOT_TYPE_NAMES[activeFilter] || activeFilter}
            </button>
            
            {showFilters && (
              <div className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setActiveFilter("all");
                      setShowFilters(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm rounded-md ${
                      activeFilter === "all" 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Jackpot Types
                  </button>
                  {allJackpotTypes?.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveFilter(type);
                        setShowFilters(false);
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm rounded-md ${
                        activeFilter === type
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span 
                        className={`w-3 h-3 mr-2 rounded-full ${
                          JACKPOT_TYPE_COLORS[type]?.split(" ")[0] || "bg-gray-400"
                        }`}
                      />
                      {JACKPOT_TYPE_NAMES[type] || type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chip */}
      {activeFilter !== "all" && (
        <div className="flex items-center mb-6">
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              JACKPOT_TYPE_COLORS[activeFilter] || "bg-gray-100 text-gray-800"
            }`}
          >
            {JACKPOT_TYPE_NAMES[activeFilter] || activeFilter}
            <button 
              onClick={() => setActiveFilter("all")}
              className="ml-2 rounded-full hover:bg-black/10 p-0.5"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {status === "pending" && (
        <div className="flex justify-center py-8">
          <Loader className="w-8 h-8" />
        </div>
      )}

      {status === "rejected" && (
        <div className="p-4 mb-4 text-red-700 rounded-lg bg-red-50">
          Error loading jackpots: {error}
        </div>
      )}

      {filteredJackpots?.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("jackpotType")}
                >
                  <div className="flex items-center">
                    Type
                    {getSortIcon("jackpotType")}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("match")}
                >
                  <div className="flex items-center">
                    Match
                    {getSortIcon("match")}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Prediction
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("results")}
                >
                  <div className="flex items-center">
                    Result
                    {getSortIcon("results")}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon("createdAt")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJackpots.map((jp) => (
                <tr key={jp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span 
                        className={`w-3 h-3 mr-2 rounded-full ${
                          JACKPOT_TYPE_COLORS[jp.jackpotType]?.split(" ")[0] || "bg-gray-400"
                        }`}
                      />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        JACKPOT_TYPE_COLORS[jp.jackpotType] || "bg-gray-100 text-gray-800"
                      }`}>
                        {JACKPOT_TYPE_NAMES[jp.jackpotType] || jp.jackpotType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{jp.match}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{jp.prediction}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getResultIcon(jp.results)}
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        jp.results === "win"
                          ? "bg-green-100 text-green-700"
                          : jp.results === "loss"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {jp.results || "pending"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(jp.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : status === "succeeded" ? (
        <div className="col-span-2 py-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <FaTrophy className="text-xl text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-gray-900">
            {activeFilter === "all" 
              ? "No jackpots available" 
              : `No ${JACKPOT_TYPE_NAMES[activeFilter] || activeFilter} jackpots available`}
          </h3>
          <p className="text-gray-500">
            {activeFilter === "all"
              ? "Check back later for new jackpot predictions"
              : "Try another filter or check back later"}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default UserJackpots;