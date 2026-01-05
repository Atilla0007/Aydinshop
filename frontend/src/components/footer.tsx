import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  ArrowUpRight
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
              استیرا
            </Link>
            <p className="text-white/50 leading-relaxed max-w-xs">
              پیشرو در طراحی و اجرای آشپزخانه‌های صنعتی و تجهیزات استیل با بالاترین استانداردهای جهانی.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">دسترسی سریع</h3>
            <ul className="space-y-4">
              {[
                { name: "صفحه اصلی", path: "/" },
                { name: "درباره ما", path: "/about" },
                { name: "خدمات ما", path: "/services" },
                { name: "تماس با ما", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-white transition-colors flex items-center group"
                  >
                    <ArrowUpRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-6">پکیج‌های خدماتی</h3>
            <ul className="space-y-4">
              {[
                "پکیج اقتصادی (Normal)",
                "پکیج ویژه (VIP)",
                "پکیج سلطنتی (CIP)",
                "مشاوره تخصصی",
              ].map((service) => (
                <li key={service}>
                  <Link 
                    to="/services" 
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold mb-6">اطلاعات تماس</h3>
            <div className="space-y-4">
              <a 
                href="tel:09149911383" 
                className="flex items-start gap-3 text-white/50 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">تلفن تماس</p>
                  <p className="font-medium">۰۹۱۴۹۹۱۱۳۸۳</p>
                </div>
              </a>
              <a 
                href="mailto:styra.steel@gmail.com" 
                className="flex items-start gap-3 text-white/50 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">ایمیل</p>
                  <p className="font-medium">styra.steel@gmail.com</p>
                </div>
              </a>
              <div className="flex items-start gap-3 text-white/50 group">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 transition-all shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">آدرس</p>
                  <p className="font-medium">ایران، تهران، فردوسیه، خیابان شهریار</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © {currentYear} تمامی حقوق برای برند استیرا محفوظ است.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-white/30 hover:text-white text-sm transition-colors">قوانین و مقررات</a>
            <a href="#" className="text-white/30 hover:text-white text-sm transition-colors">حریم خصوصی</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
