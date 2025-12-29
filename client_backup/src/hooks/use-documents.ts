import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDocument } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useDocuments() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async () => {
      const res = await fetch(api.documents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: [api.documents.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.documents.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch document");
      return api.documents.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useGenerateDocument() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { 
      type: string; 
      language: "Urdu" | "English"; 
      department?: string; 
      issue: string; 
    }) => {
      // Validate input manually or with schema if exported
      const res = await fetch(api.generate.document.path, {
        method: api.generate.document.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = await res.json();
          throw new Error(err.message || "Validation failed");
        }
        throw new Error("Failed to generate document");
      }
      return api.generate.document.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: InsertDocument) => {
      const validated = api.documents.create.input.parse(data);
      const res = await fetch(api.documents.create.path, {
        method: api.documents.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to save document");
      return api.documents.create.responses[201].parse(await res.json());
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({
        title: "Document Saved",
        description: "Your document has been saved to the dashboard.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.documents.delete.path, { id });
      const res = await fetch(url, { 
        method: api.documents.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({
        title: "Deleted",
        description: "Document removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
