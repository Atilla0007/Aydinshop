import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { scrollToTop } from "@/utils/scroll";

const navItems = [
  { name: "صفحه اصلی", path: "/" },
  { name: "محصولات", path: "/catalog" },
  { name: "خدمات", path: "/services" },
  { name: "درباره ما", path: "/about" },
  { name: "تماس با ما", path: "/contact" },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <div className="flex items-center gap-8 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
        <Link to="/" onClick={scrollToTop} className="flex items-center gap-2">
          <img src="/static/img/logo-styra.png" alt="STYRA" className="h-8 w-auto" />
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={scrollToTop}
              className={cn(
                "text-sm font-medium transition-colors hover:text-rose-500",
                location.pathname === item.path ? "text-rose-500" : "text-white/60"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <Button size="sm" className="rounded-full bg-rose-600 hover:bg-rose-700 font-iran" asChild>
          <Link to="/consultation" onClick={scrollToTop}>مشاوره</Link>
        </Button>
      </div>
    </nav>
  );
}
