import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const navItems = [
  { name: "صفحه اصلی", path: "/" },
  { name: "محصولات", path: "/catalog" },
  { name: "خدمات", path: "/services" },
  { name: "درباره ما", path: "/about" },
  { name: "تماس با ما", path: "/contact" },
];

export function Navbar() {
  const location = useLocation();
  const [isStaff, setIsStaff] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    axios
      .get("/api/user/status/")
      .then((res) => {
        setIsStaff(res.data.is_staff || false);
      })
      .catch(() => {
        setIsStaff(false);
      });
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6">
        <div className="flex items-center justify-between md:justify-start w-full max-w-7xl md:w-auto gap-4 md:gap-8 px-4 md:px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2">
            <img src="/static/img/logo-styra.png" alt="styra" className="h-8 w-auto" />
            <span className="text-xl font-bold text-white font-divan">styra</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-rose-500",
                  location.pathname === item.path ? "text-rose-500" : "text-white/60"
                )}
              >
                {item.name}
              </Link>
            ))}
            {isStaff && (
              <a
                href="/catalog/invoice/manual/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium transition-colors hover:text-rose-500 text-white/60 flex items-center gap-1"
              >
                <FileText size={16} />
                <span>فاکتور دستی</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="hidden md:flex rounded-full bg-rose-600 hover:bg-rose-700 font-iran" asChild>
              <Link to="/consultation">مشاوره</Link>
            </Button>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/60 hover:text-white md:hidden transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-[#0a0a0a] border-l border-white/10 z-[70] p-8 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-2">
                    <img src="/static/img/logo-styra.png" alt="styra" className="h-8 w-auto" />
                    <span className="text-xl font-bold text-white font-divan">styra</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "text-lg font-medium transition-colors py-2 border-b border-white/5",
                        location.pathname === item.path ? "text-rose-500" : "text-white/60"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {isStaff && (
                    <a
                      href="/catalog/invoice/manual/"
                      className="text-lg font-medium text-white/60 flex items-center gap-2 py-2 border-b border-white/5"
                    >
                      <FileText size={20} />
                      <span>فاکتور دستی</span>
                    </a>
                  )}
                </div>

                <div className="mt-auto">
                  <Button className="w-full rounded-2xl bg-rose-600 hover:bg-rose-700 h-12 text-lg font-iran" asChild>
                    <Link to="/consultation">درخواست مشاوره</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
