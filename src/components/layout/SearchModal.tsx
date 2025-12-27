import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  type: "product" | "customer" | "supplier" | "invoice";
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const searchResults: SearchResult[] = [];

      // Search products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, sku")
        .or(`name.ilike.%${debouncedQuery}%,sku.ilike.%${debouncedQuery}%`)
        .limit(3);

      products?.forEach((p) => {
        searchResults.push({
          type: "product",
          id: p.id,
          title: p.name,
          subtitle: `SKU: ${p.sku}`,
          link: "/inventory",
        });
      });

      // Search customers
      const { data: customers } = await supabase
        .from("customers")
        .select("id, name, email")
        .or(`name.ilike.%${debouncedQuery}%,email.ilike.%${debouncedQuery}%`)
        .limit(3);

      customers?.forEach((c) => {
        searchResults.push({
          type: "customer",
          id: c.id,
          title: c.name,
          subtitle: c.email || "No email",
          link: "/customers",
        });
      });

      // Search suppliers
      const { data: suppliers } = await supabase
        .from("suppliers")
        .select("id, name, contact_person")
        .or(`name.ilike.%${debouncedQuery}%,contact_person.ilike.%${debouncedQuery}%`)
        .limit(3);

      suppliers?.forEach((s) => {
        searchResults.push({
          type: "supplier",
          id: s.id,
          title: s.name,
          subtitle: s.contact_person || "No contact",
          link: "/suppliers",
        });
      });

      // Search invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, total_amount")
        .ilike("invoice_number", `%${debouncedQuery}%`)
        .limit(3);

      invoices?.forEach((i) => {
        searchResults.push({
          type: "invoice",
          id: i.id,
          title: i.invoice_number,
          subtitle: `$${Number(i.total_amount).toLocaleString()}`,
          link: "/sales",
        });
      });

      return searchResults;
    },
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "product": return "bg-primary/20 text-primary";
      case "customer": return "bg-info/20 text-info";
      case "supplier": return "bg-warning/20 text-warning";
      case "invoice": return "bg-success/20 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, customers, suppliers, invoices..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : searchQuery.length < 2 ? (
            <div className="p-4 text-center text-muted-foreground">Type at least 2 characters to search</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No results found</div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.link}
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(result.type)}`}>
                    {result.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{result.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
