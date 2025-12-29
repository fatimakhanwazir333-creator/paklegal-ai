import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useGenerateDocument, useCreateDocument } from "@/hooks/use-documents";
import { useLocation } from "wouter";
import { Loader2, Wand2, Save, Download, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

const DOCUMENT_TYPES = [
  "RTI Request",
  "Police Complaint",
  "Tenancy Notice",
  "General Application",
  "Affidavit",
  "Legal Notice"
];

export default function Generate() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const generateMutation = useGenerateDocument();
  const createMutation = useCreateDocument();

  const [formData, setFormData] = useState({
    type: "",
    language: "English" as "English" | "Urdu",
    department: "",
    issue: ""
  });

  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [user, isAuthLoading, setLocation]);

  const handleGenerate = () => {
    if (!formData.type || !formData.issue) {
      toast({
        title: "Missing Information",
        description: "Please select a document type and describe your issue.",
        variant: "destructive"
      });
      return;
    }

    generateMutation.mutate(formData, {
      onSuccess: (data) => {
        setGeneratedContent(data.content);
        setIsGenerated(true);
      }
    });
  };

  const handleSave = () => {
    if (!generatedContent) return;
    createMutation.mutate({
      title: `${formData.type} - ${formData.department || "Untitled"}`,
      type: formData.type,
      language: formData.language,
      department: formData.department || null,
      content: generatedContent
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Copied", description: "Text copied to clipboard." });
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(generatedContent, 180);
    doc.text(splitText, 15, 15);
    doc.save("document.pdf");
    toast({ title: "Downloaded", description: "PDF has been generated." });
  };

  if (isAuthLoading) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold font-display text-primary">Generate Document</h1>
          <p className="text-muted-foreground">Fill in the details to draft your official document.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="h-fit shadow-md border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(val: "Urdu" | "English") => setFormData({...formData, language: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Urdu">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department / Authority (Optional)</Label>
                  <Input 
                    placeholder="e.g. Wapda, Police Station" 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Details / Issue Description</Label>
                <Textarea 
                  placeholder="Describe your issue in detail. Include names, dates, and specific grievances..."
                  className="min-h-[200px] resize-none"
                  value={formData.issue}
                  onChange={(e) => setFormData({...formData, issue: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full h-12 text-lg shadow-lg shadow-primary/20" 
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Drafting...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Preview */}
          <Card className={`flex flex-col h-full min-h-[500px] shadow-md border-border/50 transition-all duration-500 ${isGenerated ? 'opacity-100 translate-x-0' : 'opacity-50 lg:opacity-100'}`}>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-base font-semibold text-primary">Generated Draft</Label>
                {isGenerated && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setIsGenerated(false); setGeneratedContent(""); }}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                )}
              </div>

              <Textarea 
                className={`flex-1 p-6 font-mono text-sm leading-relaxed resize-none mb-4 bg-muted/20 ${formData.language === 'Urdu' ? 'font-urdu text-right text-lg' : ''}`}
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                placeholder={isGenerated ? "" : "Your generated document will appear here..."}
                readOnly={!isGenerated}
              />

              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" onClick={handleCopy} disabled={!isGenerated}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={!isGenerated}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={handleSave} disabled={!isGenerated || createMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
