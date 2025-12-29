import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.user.path],
    queryFn: async () => {
      const res = await fetch(api.auth.user.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.user.responses[200].parse(await res.json());
    },
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: Pick<InsertUser, "username" | "password">) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
      
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.user.path], data);
      toast({ title: "Welcome back!", description: `Logged in as ${data.username}` });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({ 
        title: "Login Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const validated = api.auth.register.input.parse(credentials);
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.auth.register.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Registration failed");
      }

      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Auto login after register (optional, but typical)
      // For now, we just redirect to login or dashboard if the backend auto-logs in
      // Assuming backend auto-logs in session on register:
      queryClient.setQueryData([api.auth.user.path], data);
      toast({ title: "Account Created", description: "Welcome to PakLegal AI!" });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({ 
        title: "Registration Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, { 
        method: api.auth.logout.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.user.path], null);
      setLocation("/");
      toast({ title: "Logged out", description: "See you next time!" });
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
