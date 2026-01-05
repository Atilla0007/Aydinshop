import { motion } from "framer-motion";
import { Shield, Target, Zap, Users, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "تعهد به کیفیت",
    description: "استفاده از بهترین متریال و استانداردهای روز دنیا در تمامی پروژه‌ها."
  },
  {
    icon: Target,
    title: "طراحی دقیق",
    description: "بهینه‌سازی حداکثری فضا و مهندسی دقیق جریان کار در آشپزخانه."
  },
  {
    icon: Zap,
    title: "نوآوری",
    description: "استفاده از مدرن‌ترین تجهیزات و تکنولوژی‌های روز صنعت غذا."
  },
  {
    icon: Users,
    title: "تیم متخصص",
    description: "بهره‌گیری از مهندسین و مشاورین با تجربه در طراحی صنعتی."
  },
  {
    icon: Award,
    title: "استاندارد جهانی",
    description: "رعایت تمامی پروتکل‌های بهداشتی و ایمنی بین‌المللی."
  },
  {
    icon: Clock,
    title: "پشتیبانی مستمر",
    description: "همراهی شما از اولین ایده تا سال‌ها پس از بهره‌برداری."
  }
];

export function About() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.05)_0,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
                <h1 className="text-5xl md:text-8xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-[1.6] md:leading-[1.4] font-divan">
                  داستان استیرا
                </h1>
                <p className="text-xl md:text-2xl text-white/60 leading-[2.6] font-iran">
                  ما در استیرا فقط تجهیزات نمی‌فروشیم؛ ما آینده کسب‌وکار شما را طراحی می‌کنیم. 
                  با ترکیبی از هنر طراحی و مهندسی دقیق، قلب تپنده رستوران شما را می‌سازیم.
                </p>

            </motion.div>
        </div>
      </section>

      {/* Stats/Intro Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold text-rose-500">پیشرو در صنعت آشپزخانه‌های صنعتی</h2>
              <p className="text-lg text-white/60 leading-relaxed">
                استیرا با بیش از یک دهه تجربه درخشان، به عنوان یکی از پیشگامان طراحی و تولید تجهیزات آشپزخانه صنعتی در ایران شناخته می‌شود. تخصص ما در تبدیل فضاهای خام به محیط‌های حرفه‌ای و کارآمد است که در آن هر جزئی با دقت مهندسی شده است.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">+۵۰۰</div>
                  <div className="text-sm text-white/40">پروژه موفق</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">+۱۵</div>
                  <div className="text-sm text-white/40">سال تجربه</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent mix-blend-overlay" />
              <img 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=2000" 
                alt="Professional Kitchen"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">چرا استیرا؟</h2>
            <p className="text-white/40">ارزش‌هایی که ما را متمایز می‌کند</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-rose-600 to-rose-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-8">همین امروز آشپزخانه رویایی‌تان را طراحی کنید</h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl">
                مشاورین ما آماده‌اند تا شما را در تمامی مراحل از ایده تا اجرا همراهی کنند.
              </p>
              <button className="px-12 py-5 bg-white text-rose-600 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                دریافت مشاوره رایگان
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
