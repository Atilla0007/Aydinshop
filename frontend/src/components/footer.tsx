import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Twitter, 
  Linkedin,
  ArrowUpRight,
  ChevronLeft,
  MessageCircle,
  Clock
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050505] border-t border-white/5 pt-24 pb-12 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/5 blur-[120px] rounded-full -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block flex items-center gap-3">
              <img src="/static/img/logo-styra.png" alt="styra" className="h-10 w-auto" />
              <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 font-divan">
                styra
              </span>
            </Link>
            <p className="text-white/40 leading-relaxed text-lg max-w-sm">
              پیشرو در طراحی، مهندسی و تجهیز آشپزخانه‌های صنعتی با تکیه بر استانداردهای بین‌المللی و متریال درجه یک استیل.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: MessageCircle, href: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 transition-all group"
                >
                  <social.Icon size={20} className="text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
              <div className="w-1 h-4 bg-rose-500 rounded-full" />
              لینک‌های سریع
            </h3>
            <ul className="space-y-4">
              {[
                { name: "صفحه اصلی", path: "/" },
                { name: "محصولات ما", path: "/catalog/" },
                { name: "پکیج‌های خدماتی", path: "/services" },
                { name: "درباره ما", path: "/about" },
                { name: "تماس با ما", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-white/40 hover:text-rose-500 transition-all flex items-center group gap-2"
                  >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services/Products */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
              <div className="w-1 h-4 bg-rose-500 rounded-full" />
              خدمات استیرا
            </h3>
            <ul className="space-y-4">
              {[
                "طراحی سه بعدی",
                "آشپزخانه صنعتی",
                "تجهیزات فست‌فود",
                "کترینگ و هتل",
                "سردخانه صنعتی",
              ].map((service) => (
                <li key={service}>
                  <Link 
                    to="/services" 
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
              <div className="w-1 h-4 bg-rose-500 rounded-full" />
              اطلاعات تماس
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">تلفن مستقیم</p>
                    <p className="font-bold text-lg dir-ltr text-white/90">۰۹۱۴ ۹۹۱ ۱۳۸۳</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">ساعات پاسخگویی</p>
                    <p className="font-bold text-white/90">همه روزه ۹:۰۰ الی ۲۱:۰۰</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">آدرس دفتر مرکزی</p>
                    <p className="font-bold text-sm text-white/90">تبریز، آبرسان، فلکه دانشگاه، برج بلور، طبقه سوم اداری، واحد D</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">آدرس کارخانه</p>
                    <p className="font-bold text-sm text-white/90">تهران، فردوسیه، خیابان شهریار</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
            <p className="text-white/20 text-sm">
              © {currentYear} styra. ALL RIGHTS RESERVED.
            </p>
            <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full" />
            <p className="text-white/20 text-sm">
              طراحی و اجرا توسط تیم فنی استیرا
            </p>
          </div>
          
          <div className="flex gap-8">
            <Link to="/rules" className="text-white/20 hover:text-white text-xs transition-colors">قوانین</Link>
            <Link to="/privacy" className="text-white/20 hover:text-white text-xs transition-colors">حریم خصوصی</Link>
            <Link to="/faq" className="text-white/20 hover:text-white text-xs transition-colors">سوالات متداول</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
