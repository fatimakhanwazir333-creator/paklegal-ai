import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Scale, User, FileText, LogOut, PlusCircle } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 mb-8 md:mb-0">
        <Scale className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold font-display tracking-tight text-primary">PakLegal AI</span>
      </div>

      <div className="flex-1 md:flex md:justify-center">
        {user ? (
          <nav className="flex flex-col md:flex-row gap-2 md:gap-6 w-full md:w-auto">
            <Link href="/dashboard">
              <Button 
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className={`w-full md:w-auto justify-start ${isActive("/dashboard") ? "bg-primary text-primary-foreground shadow-md" : ""}`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/generate">
              <Button 
                variant={isActive("/generate") ? "default" : "ghost"}
                className={`w-full md:w-auto justify-start ${isActive("/generate") ? "bg-primary text-primary-foreground shadow-md" : ""}`}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </Link>
          </nav>
        ) : (
          <nav className="flex flex-col md:flex-row gap-2 md:gap-6 w-full md:w-auto">
            <Link href="/">
              <Button variant="ghost" className="w-full md:w-auto justify-start">Home</Button>
            </Link>
          </nav>
        )}
      </div>

      <div className="mt-auto md:mt-0 flex flex-col md:flex-row gap-2">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden md:inline-block">
              {user.name || user.username}
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="w-full md:w-auto">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="w-full md:w-auto shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2 w-full justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold font-display text-primary">PakLegal AI</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full py-4">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex w-full items-center justify-between">
            <NavContent />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t bg-card py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 PakLegal AI. Empowering Pakistan with legal accessibility.</p>
          <div className="mt-2 flex justify-center gap-4">
            <span className="text-xs">Not legal advice. For drafting purposes only.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
