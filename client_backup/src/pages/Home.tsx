import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileText, Shield, PenTool, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              AI-Powered Legal Drafting for Pakistan
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight text-foreground mb-6">
              Official Documents, <br className="hidden md:block" />
              <span className="text-primary">Drafted in Seconds.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              Generate RTI requests, complaints, tenancy agreements, and affidavits in 
              professional Urdu or English using advanced AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/generate">
                <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all rounded-full">
                  Create Document
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-2">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="h-8 w-8 text-primary" />}
              title="Official Formatting"
              description="Templates designed to meet Pakistani official standards for government and legal correspondence."
            />
            <FeatureCard 
              icon={<PenTool className="h-8 w-8 text-accent" />}
              title="Urdu & English"
              description="Draft effortlessly in formal Urdu or legal English. Our AI understands the nuances of both languages."
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Privacy First"
              description="Your documents are yours. We provide a secure platform to draft, save, and export your work."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display mb-12">Empowering Citizens</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrustItem text="RTI Requests" />
            <TrustItem text="Police Complaints" />
            <TrustItem text="Tenancy Notices" />
            <TrustItem text="Official Applications" />
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-background border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      <div className="mb-4 p-3 bg-muted/50 rounded-xl w-fit">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50">
      <CheckCircle className="h-5 w-5 text-primary" />
      <span className="font-medium">{text}</span>
    </div>
  );
}
