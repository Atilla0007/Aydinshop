import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, UtensilsCrossed, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const serviceDetails = {
  basic: {
    title: "راه‌اندازی استاندارد (Basic)",
    icon: ChefHat,
    color: "blue",
    description: "پکیج Basic نقطه‌ی شروع ایده‌آل برای کسب‌وکارهایی است که به دنبال استقرار استانداردهای مهندسی با حداقل هزینه هستند. ما در این مسیر، الزامات فنی و بهداشتی را برای شما تضمین می‌کنیم.",
    fullContent: "در این پکیج، تمرکز اصلی بر روی چیدمان درست و اصولی تجهیزات در فضای موجود است. بسیاری از صاحبان رستوران در ابتدای راه با خرید تجهیزات نامناسب یا چیدمان غلط، باعث هدررفت فضا و کاهش بهره‌وری پرسنل می‌شوند. استیرا با طراحی پلن‌های دقیق، از این مشکلات جلوگیری می‌کند.",
    features: [
      "طراحی پلن چیدمان دوبعدی (AutoCAD)",
      "ارائه لیست پیشنهادی تجهیزات بر اساس بودجه",
      "تعیین نقاط استقرار تاسیسات (آب، برق، گاز و فاضلاب)",
      "نظارت بر فرآیند نصب تجهیزات",
      "آموزش اصول نگهداری و کار با دستگاه‌ها"
    ],
    benefits: [
      "کاهش هزینه‌های اضافی در خرید تجهیزات",
      "اطمینان از تاییدیه سازمان‌های نظارتی و بهداشتی",
      "بهینه‌سازی فضای آشپزخانه"
    ]
  },
  vip: {
    title: "مهندسی منو و فرآیند (VIP)",
    icon: UtensilsCrossed,
    color: "purple",
    description: "پکیج VIP مخصوص مجموعه‌هایی است که کیفیت خروجی و سرعت سرویس‌دهی برایشان اولویت اصلی است. در این پکیج، ما علم مهندسی را با هنر آشپزی پیوند می‌دهیم.",
    fullContent: "مهندسی منو به معنای آن است که هر آیتم در منوی شما باید با ظرفیت پخت و سرعت تجهیزات هماهنگ باشد. ما در پکیج VIP، فرآیند آماده‌سازی تا سرو را به گونه‌ای طراحی می‌کنیم که در زمان پیک کاری، کمترین فشار به پرسنل و بیشترین رضایت به مشتری منتقل شود.",
    features: [
      "تمام خدمات پکیج Basic",
      "آنالیز دقیق منو و بهینه‌سازی آیتم‌های پخت",
      "طراحی جریان کاری (Workflow) برای جلوگیری از تداخل پرسنل",
      "محاسبه ظرفیت تولید بر اساس تجهیزات انتخابی",
      "تست عملکردی منو (Menu Functional Test) قبل از افتتاحیه"
    ],
    benefits: [
      "افزایش سرعت سرویس‌دهی تا ۳۰٪",
      "کاهش ضایعات مواد غذایی",
      "استانداردسازی طعم و کیفیت در حجم بالا"
    ]
  },
  cip: {
    title: "راه‌اندازی جامع و کلید تحویل (CIP)",
    icon: Sparkles,
    color: "rose",
    description: "لوکس‌ترین و کامل‌ترین سطح خدمات استیرا. ما مسئولیت صفر تا صد پروژه را بر عهده می‌گیریم تا شما با خیالی آسوده، فقط بر روی مدیریت کلان بیزینس خود تمرکز کنید.",
    fullContent: "پکیج CIP یک راه‌اندازی بدون نقص است. از برندینگ و هویت بصری گرفته تا تامین بهترین تجهیزات جهانی و استخدام زبده‌ترین پرسنل. ما در این مسیر، استانداردهای بین‌المللی را در آشپزخانه شما پیاده‌سازی می‌کنیم و تا ماه‌ها پس از افتتاحیه در کنار شما می‌مانیم.",
    features: [
      "مدیریت پیمان و نظارت بر تمامی مراحل اجرایی",
      "استخدام و آموزش حرفه‌ای تیم آشپزخانه و سالن",
      "تامین مستقیم تجهیزات از برندهای تراز اول دنیا",
      "طراحی هویت بصری و کانسپت رستوران",
      "پشتیبانی عملیاتی و فنی ۲۴/۷ پس از افتتاح"
    ],
    benefits: [
      "بالاترین سطح کیفیت اجرایی در ایران",
      "بهره‌گیری از تکنولوژی‌های روز دنیا در پخت",
      "تضمین بازگشت سرمایه با بهره‌وری حداکثری"
    ]
  }
};

export function ServiceDetail() {
  const { serviceId } = useParams();
  const service = serviceDetails[serviceId as keyof typeof serviceDetails];

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-iran">
        <div className="text-center">
          <h2 className="text-2xl mb-4">سرویس مورد نظر یافت نشد.</h2>
          <Button asChild>
            <Link to="/services">بازگشت به خدمات</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 font-iran">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className={cn(
          "absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-20",
          service.color === "blue" ? "bg-blue-500" : 
          service.color === "purple" ? "bg-purple-500" : "bg-rose-500"
        )} />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 bg-white/5 border border-white/10",
              service.color === "blue" ? "text-blue-500" : 
              service.color === "purple" ? "text-purple-500" : "text-rose-500"
            )}>
              <Icon size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-divan mb-6 leading-tight">
              {service.title}
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
              {service.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold font-divan mb-6 text-rose-500">جزئیات پکیج</h2>
              <p className="text-lg text-white/70 leading-[2.4] text-justify">
                {service.fullContent}
              </p>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold font-divan mb-6">مزایای این پکیج</h3>
              <div className="grid gap-4">
                {service.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                    <span className="text-white/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 h-full">
              <h2 className="text-2xl font-bold font-divan mb-8 border-b border-white/10 pb-4">
                لیست خدمات اجرایی
              </h2>
              <ul className="space-y-6">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-bold text-xs group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-white/80 leading-relaxed text-lg">{feature}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-12">
                <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-rose-600 hover:bg-rose-700" asChild>
                  <Link to={`/contact?package=${serviceId}`}>
                    درخواست مشاوره و رزرو پکیج
                    <ArrowLeft className="mr-2" size={20} />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation between packages */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/services" className="text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight size={20} />
            مشاهده همه پکیج‌ها
          </Link>
          
          <div className="flex gap-4">
            {Object.keys(serviceDetails).map((id) => (
              <Link 
                key={id} 
                to={`/services/${id}`}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm transition-all",
                  id === serviceId 
                    ? "bg-white text-black border-white" 
                    : "border-white/10 text-white/60 hover:border-white/30"
                )}
              >
                {id.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
