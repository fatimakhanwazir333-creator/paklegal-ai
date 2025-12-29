import { type Document } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Download, Copy, Calendar } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: number) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    toast({ title: "Copied!", description: "Document content copied to clipboard." });
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    // Basic PDF gen - for advanced use standard font or addFont for Urdu
    const splitText = doc.splitTextToSize(document.content, 180);
    doc.text(splitText, 15, 15);
    doc.save(`${document.title.replace(/\s+/g, "_")}.pdf`);
    toast({ title: "Downloaded", description: "PDF generation started." });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-primary line-clamp-1">{document.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {document.type}
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                {document.language}
              </Badge>
            </div>
          </div>
          <div className="p-2 bg-primary/5 rounded-full text-primary">
            <FileText className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className={`text-sm text-muted-foreground line-clamp-3 ${document.language === 'Urdu' ? 'font-urdu text-right' : ''}`}>
          {document.content}
        </p>
      </CardContent>
      <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between items-center">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          {format(new Date(document.createdAt), "MMM d, yyyy")}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy Content">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download PDF">
            <Download className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
              onClick={() => onDelete(document.id)}
              title="Delete Document"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
