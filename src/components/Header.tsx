import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Code, LogOut, User, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutNotification from "@/components/notifications/LogoutNotification";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutNotification, setShowLogoutNotification] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowLogoutNotification(true);
    navigate('/', { state: { justLoggedOut: true } });
  };

  const getDashboardLink = () => {
    if (!profile) return '/candidate-dashboard';
    
    switch (profile.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'recruiter':
        return '/recruiter-dashboard';
      case 'candidate':
        return '/candidate-dashboard';
      default:
        return '/candidate-dashboard';
    }
  };
  
  // Check if we're on the homepage
  const isHomepage = location.pathname === '/';

  return (
    <header 
      className={`border-b border-border-dark backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-dark-secondary/95 shadow-lg shadow-black/10' 
          : isHomepage 
            ? 'bg-transparent border-transparent' 
            : 'bg-dark-secondary/90'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              isScrolled || !isHomepage ? 'bg-tech-green' : 'bg-dark-secondary border border-border-dark group-hover:bg-tech-green'
            }`}>
              <Code className={`h-5 w-5 ${
                isScrolled || !isHomepage ? 'text-dark-primary' : 'text-tech-green group-hover:text-dark-primary'
              }`} />
            </div>
            <span className="text-xl font-bold text-text-primary">CodeInterview</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/#features" 
              className="px-4 py-2 text-text-secondary hover:text-tech-green transition-colors relative group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-tech-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
            <Link 
              to="/#pricing" 
              className="px-4 py-2 text-text-secondary hover:text-tech-green transition-colors relative group"
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-tech-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 text-text-secondary hover:text-tech-green transition-colors flex items-center">
                  Resources
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-dark-secondary border-border-dark w-56">
                <DropdownMenuItem className="text-text-secondary hover:text-text-primary">
                  Documentation
                </DropdownMenuItem>
                <DropdownMenuItem className="text-text-secondary hover:text-text-primary">
                  Blog
                </DropdownMenuItem>
                <DropdownMenuItem className="text-text-secondary hover:text-text-primary">
                  Case Studies
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link 
              to="/#about" 
              className="px-4 py-2 text-text-secondary hover:text-tech-green transition-colors relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-tech-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4 pl-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-tech-green border-2 text-tech-green hover:bg-tech-green hover:text-dark-primary font-medium shadow-sm shadow-tech-green/10 hover:shadow-tech-green/20"
                >
                  <Link to={getDashboardLink()}>Dashboard</Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-text-primary hover:bg-dark-primary hover:text-tech-green rounded-full h-9 w-9 p-0"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-dark-secondary border-border-dark">
                    <DropdownMenuLabel className="text-text-primary">
                      {profile?.first_name} {profile?.last_name}
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className="text-text-secondary text-xs font-normal">
                      {profile?.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border-dark" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-text-secondary hover:text-text-primary cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-4 pl-4">
                <Button
                  asChild
                  variant="ghost"
                  className="text-text-primary hover:text-tech-green"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-tech-green hover:bg-tech-green/90 text-dark-primary font-medium shadow-sm shadow-tech-green/20 hover:shadow-tech-green/30"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-primary hover:text-tech-green"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-dark animate-in slide-in-from-top">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/#features" 
                className="text-text-secondary hover:text-tech-green transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/#pricing" 
                className="text-text-secondary hover:text-tech-green transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/#resources" 
                className="text-text-secondary hover:text-tech-green transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                to="/#about" 
                className="text-text-secondary hover:text-tech-green transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-border-dark">
                  <Button
                    asChild
                    variant="outline"
                    className="border-tech-green border-2 text-tech-green hover:bg-tech-green hover:text-dark-primary justify-start font-medium"
                  >
                    <Link to={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    variant="ghost"
                    className="text-text-secondary hover:text-tech-green justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-border-dark">
                  <Button
                    asChild
                    variant="outline"
                    className="border-tech-green border-2 text-tech-green hover:bg-tech-green hover:text-dark-primary justify-start font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-tech-green hover:bg-tech-green/90 text-dark-primary justify-start font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Logout Notification */}
      {showLogoutNotification && (
        <LogoutNotification 
          onClose={() => setShowLogoutNotification(false)}
        />
      )}
    </header>
  );
};

export default Header;
