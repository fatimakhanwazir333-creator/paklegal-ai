import { Layout } from "@/components/Layout";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { useDocuments, useDeleteDocument } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Loader2, Plus, FileQuestion } from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: documents, isLoading: isDocsLoading } = useDocuments();
  const { mutate: deleteDocument } = useDeleteDocument();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading || isDocsLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-primary">Your Documents</h1>
            <p className="text-muted-foreground">Manage your generated legal drafts.</p>
          </div>
          <Link href="/generate">
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>

        {documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                document={doc} 
                onDelete={deleteDocument} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
              <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-center">
              You haven't generated any documents yet. Create your first official draft now.
            </p>
            <Link href="/generate">
              <Button>Start Drafting</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
