import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, History, Save, X, Calendar as CalendarIcon, MapPin, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import type { Issue, Payment, User, SearchHistory } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchFilters {
  searchTerm: string;
  category: string;
  priority: string;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  location: string;
  ward: string;
  assignedTo: string;
  tags: string[];
}

interface SearchResult {
  type: "issue" | "payment" | "user";
  data: Issue | Payment | User;
  relevanceScore: number;
}

export function AdvancedSearch() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchType, setSearchType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    category: "all",
    priority: "all",
    status: "all",
    dateFrom: null,
    dateTo: null,
    location: "",
    ward: "all",
    assignedTo: "all",
    tags: [],
  });

  const { data: searchHistory = [] } = useQuery({
    queryKey: ["/api/search-history"],
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["/api/issues"],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: wards = [] } = useQuery({
    queryKey: ["/api/wards"],
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["/api/technicians"],
  });

  const saveSearchMutation = useMutation({
    mutationFn: (searchData: any) =>
      apiRequest("POST", "/api/search-history", searchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-history"] });
    },
  });

  const searchResults = useMemo(() => {
    if (!filters.searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const searchTerm = filters.searchTerm.toLowerCase();

    // Search issues
    if (searchType === "all" || searchType === "issues") {
      issues.forEach((issue: Issue) => {
        let relevanceScore = 0;
        const titleMatch = issue.title.toLowerCase().includes(searchTerm);
        const descMatch = issue.description.toLowerCase().includes(searchTerm);
        const locationMatch = issue.location.toLowerCase().includes(searchTerm);

        if (titleMatch) relevanceScore += 10;
        if (descMatch) relevanceScore += 5;
        if (locationMatch) relevanceScore += 3;

        // Apply filters
        if (filters.category !== "all" && issue.category !== filters.category) relevanceScore = 0;
        if (filters.priority !== "all" && issue.priority !== filters.priority) relevanceScore = 0;
        if (filters.status !== "all" && issue.status !== filters.status) relevanceScore = 0;
        if (filters.ward !== "all" && issue.ward !== filters.ward) relevanceScore = 0;
        if (filters.location && !issue.location.toLowerCase().includes(filters.location.toLowerCase())) relevanceScore = 0;

        // Date filters
        if (filters.dateFrom && new Date(issue.createdAt) < filters.dateFrom) relevanceScore = 0;
        if (filters.dateTo && new Date(issue.createdAt) > filters.dateTo) relevanceScore = 0;

        // Tag filters
        if (filters.tags.length > 0 && issue.tags) {
          const hasMatchingTag = filters.tags.some(tag => 
            issue.tags?.some(issueTag => issueTag.toLowerCase().includes(tag.toLowerCase()))
          );
          if (!hasMatchingTag) relevanceScore = 0;
        }

        if (relevanceScore > 0) {
          results.push({
            type: "issue",
            data: issue,
            relevanceScore,
          });
        }
      });
    }

    // Search payments
    if (searchType === "all" || searchType === "payments") {
      payments.forEach((payment: Payment) => {
        let relevanceScore = 0;
        const typeMatch = payment.type.toLowerCase().includes(searchTerm);
        const descMatch = payment.description?.toLowerCase().includes(searchTerm);
        const accountMatch = payment.accountNumber?.toLowerCase().includes(searchTerm);

        if (typeMatch) relevanceScore += 8;
        if (descMatch) relevanceScore += 5;
        if (accountMatch) relevanceScore += 10;

        if (relevanceScore > 0) {
          results.push({
            type: "payment",
            data: payment,
            relevanceScore,
          });
        }
      });
    }

    // Search users
    if (searchType === "all" || searchType === "users") {
      users.forEach((user: User) => {
        let relevanceScore = 0;
        const nameMatch = user.name.toLowerCase().includes(searchTerm);
        const usernameMatch = user.username.toLowerCase().includes(searchTerm);
        const emailMatch = user.email?.toLowerCase().includes(searchTerm);

        if (nameMatch) relevanceScore += 10;
        if (usernameMatch) relevanceScore += 8;
        if (emailMatch) relevanceScore += 6;

        if (relevanceScore > 0) {
          results.push({
            type: "user",
            data: user,
            relevanceScore,
          });
        }
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [filters, searchType, issues, payments, users]);

  const handleSearch = () => {
    if (filters.searchTerm.trim()) {
      saveSearchMutation.mutate({
        searchTerm: filters.searchTerm,
        searchType,
        filters: filters,
        resultsCount: searchResults.length,
      });
    }
  };

  const loadSavedSearch = (search: SearchHistory) => {
    setFilters({
      ...filters,
      searchTerm: search.searchTerm,
      ...(search.filters as any),
    });
    setSearchType(search.searchType || "all");
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      category: "all",
      priority: "all",
      status: "all",
      dateFrom: null,
      dateTo: null,
      location: "",
      ward: "all",
      assignedTo: "all",
      tags: [],
    });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>{t.advancedSearch || "Advanced Search"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder={t.searchPlaceholder || "Search issues, payments, users..."}
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all || "All"}</SelectItem>
                  <SelectItem value="issues">{t.issues || "Issues"}</SelectItem>
                  <SelectItem value="payments">{t.payments || "Payments"}</SelectItem>
                  <SelectItem value="users">{t.users || "Users"}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium">{t.category || "Category"}</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all || "All"}</SelectItem>
                      <SelectItem value="water_sanitation">{t.waterSanitation || "Water & Sanitation"}</SelectItem>
                      <SelectItem value="electricity">{t.electricity || "Electricity"}</SelectItem>
                      <SelectItem value="roads_transport">{t.roadsTransport || "Roads & Transport"}</SelectItem>
                      <SelectItem value="waste_management">{t.wasteManagement || "Waste Management"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">{t.priority || "Priority"}</label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all || "All"}</SelectItem>
                      <SelectItem value="urgent">{t.urgent || "Urgent"}</SelectItem>
                      <SelectItem value="high">{t.high || "High"}</SelectItem>
                      <SelectItem value="medium">{t.medium || "Medium"}</SelectItem>
                      <SelectItem value="low">{t.low || "Low"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">{t.status || "Status"}</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all || "All"}</SelectItem>
                      <SelectItem value="open">{t.open || "Open"}</SelectItem>
                      <SelectItem value="in_progress">{t.inProgress || "In Progress"}</SelectItem>
                      <SelectItem value="resolved">{t.resolved || "Resolved"}</SelectItem>
                      <SelectItem value="closed">{t.closed || "Closed"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">{t.ward || "Ward"}</label>
                  <Select value={filters.ward} onValueChange={(value) => setFilters(prev => ({ ...prev, ward: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all || "All"}</SelectItem>
                      {wards.map((ward: any) => (
                        <SelectItem key={ward.id} value={ward.wardNumber}>
                          {t.ward || "Ward"} {ward.wardNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">{t.location || "Location"}</label>
                  <Input
                    placeholder={t.enterLocation || "Enter location"}
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">{t.dateFrom || "Date From"}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filters.dateFrom ? filters.dateFrom.toLocaleDateString() : t.selectDate || "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom || undefined}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date || null }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium">{t.dateTo || "Date To"}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filters.dateTo ? filters.dateTo.toLocaleDateString() : t.selectDate || "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={filters.dateTo || undefined}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date || null }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-3 lg:col-span-4">
                  <label className="text-sm font-medium">{t.tags || "Tags"}</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {filters.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                    <Input
                      placeholder={t.addTag || "Add tag..."}
                      className="w-32 h-8"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 lg:col-span-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={clearFilters}>
                    {t.clearFilters || "Clear Filters"}
                  </Button>
                  <Button onClick={handleSearch}>
                    {t.search || "Search"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search History and Saved Searches */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>{t.searchHistory || "Search History"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {searchHistory.slice(0, 10).map((search: SearchHistory, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                    onClick={() => loadSavedSearch(search)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{search.searchTerm}</p>
                      <p className="text-xs text-gray-500">
                        {search.searchType} • {search.resultsCount} {t.results || "results"} • {new Date(search.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadSavedSearch(search);
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t.searchResults || "Search Results"} ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <SearchResultItem key={index} result={result} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {filters.searchTerm && searchResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">{t.noSearchResults || "No results found for your search"}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SearchResultItem({ result }: { result: SearchResult }) {
  const { t } = useLanguage();

  if (result.type === "issue") {
    const issue = result.data as Issue;
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline">{t.issue || "Issue"}</Badge>
              <Badge variant={issue.status === "open" ? "destructive" : "default"}>
                {issue.status}
              </Badge>
              <Badge variant="outline">{issue.priority}</Badge>
            </div>
            <h4 className="font-medium">{issue.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {issue.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{issue.location}</span>
              </span>
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {t.relevance || "Relevance"}: {result.relevanceScore}%
          </div>
        </div>
      </Card>
    );
  }

  if (result.type === "payment") {
    const payment = result.data as Payment;
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline">{t.payment || "Payment"}</Badge>
              <Badge variant={payment.status === "pending" ? "destructive" : "default"}>
                {payment.status}
              </Badge>
            </div>
            <h4 className="font-medium">{payment.type}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {payment.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>R{(payment.amount / 100).toFixed(2)}</span>
              <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {t.relevance || "Relevance"}: {result.relevanceScore}%
          </div>
        </div>
      </Card>
    );
  }

  if (result.type === "user") {
    const user = result.data as User;
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline">{t.user || "User"}</Badge>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <h4 className="font-medium">{user.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              @{user.username}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {user.email && <span>{user.email}</span>}
              {user.phone && <span>{user.phone}</span>}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {t.relevance || "Relevance"}: {result.relevanceScore}%
          </div>
        </div>
      </Card>
    );
  }

  return null;
}