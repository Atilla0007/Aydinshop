import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, MessageSquare, Send, CheckCircle2, Headphones, Users, Lightbulb } from "lucide-react";
import axios from "axios";

export function Consultation() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    message: "",
    inquiry_type: "consultation",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await axios.post("/api/contact/", formData);
      setStatus("success");
      setFormData({
        name: "",
        phone: "",
        email: "",
        company: "",
        message: "",
        inquiry_type: "consultation",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    }
  };

  const benefits = [
    {
      title: "مشاوره تخصصی رایگان",
      description: "بررسی دقیق نیازهای پروژه شما توسط متخصصین با تجربه استیرا.",
      icon: <Users className="text-rose-500" size={24} />,
    },
    {
      title: "بهینه‌سازی هزینه‌ها",
      description: "ارائه راهکارهای هوشمندانه برای کاهش هزینه‌های خرید و نگهداری تجهیزات.",
      icon: <Lightbulb className="text-rose-500" size={24} />,
    },
    {
      title: "پشتیبانی ۲۴/۷",
      description: "تیم ما همیشه در کنار شماست تا بهترین تجربه را داشته باشید.",
      icon: <Headphones className="text-rose-500" size={24} />,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-white pt-32 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Column: Info & Benefits */}
          <div className="space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-iran mb-6"
              >
                <MessageSquare size={16} />
                <span>مشاوره تخصصی و رایگان</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold mb-8 font-divan leading-[1.6]"
              >
                راهکارهای هوشمند برای <br />
                <span className="text-rose-500">کسب‌و‌کار شما</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/50 leading-[2.6] font-iran max-w-xl"
              >
                با دریافت مشاوره رایگان از کارشناسان استیرا، بهترین تجهیزات را با توجه به بودجه و فضای خود انتخاب کنید. ما در تمام مراحل همراه شما هستیم.
              </motion.p>
            </div>

            <div className="grid gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {benefit.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-iran">{benefit.title}</h3>
                    <p className="text-white/40 leading-relaxed font-iran text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Request Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent blur-3xl opacity-30" />
            <div className="relative p-8 md:p-12 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              
              {status === "success" ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 font-divan">درخواست شما ثبت شد</h2>
                  <p className="text-white/40 mb-10 font-iran leading-loose">کارشناسان ما به زودی برای هماهنگی زمان مشاوره با شما تماس خواهند گرفت.</p>
                  <Button onClick={() => setStatus("idle")} variant="outline" className="rounded-full px-10 h-14 font-iran">ثبت درخواست جدید</Button>
                </div>
              ) : (
                <>
                  <div className="mb-10 text-center lg:text-right">
                    <h2 className="text-3xl font-bold mb-3 font-divan">رزرو نوبت مشاوره</h2>
                    <p className="text-white/40 font-iran leading-loose">فرم زیر را تکمیل کنید، در کمتر از ۲۴ ساعت با شما تماس می‌گیریم.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 font-iran">
                    <div className="space-y-2">
                      <label className="text-sm text-white/40 mr-2">نام و نام خانوادگی</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 text-lg"
                        placeholder="مثال: محمد حسینی"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-white/40 mr-2">شماره تماس (الزامی)</label>
                      <Input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 text-lg text-right"
                        placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-white/40 mr-2">نام مجموعه یا رستوران</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 text-lg"
                        placeholder="مثال: هتل اسپیناس"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-white/40 mr-2">توضیحات کوتاه (اختیاری)</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-lg font-iran"
                        placeholder="چه کمکی می‌توانیم به شما بکنیم؟"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full h-16 bg-rose-600 hover:bg-rose-700 rounded-2xl text-xl font-bold transition-all hover:shadow-[0_0_30px_rgba(225,29,72,0.3)] group"
                    >
                      {status === "submitting" ? (
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>در حال ثبت...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Send size={24} className="group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform" />
                          <span>تایید و ارسال درخواست</span>
                        </div>
                      )}
                    </Button>

                    {status === "error" && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm text-center">
                        خطایی رخ داد. لطفا دوباره تلاش کنید یا با ما تماس بگیرید.
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-white/40 font-iran"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-rose-500" />
              <span className="dir-ltr">۰۹۱۴ ۹۹۱ ۱۳۸۳</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden md:block" />
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-rose-500" />
              <span>پشتیبانی آنلاین در واتس‌اپ</span>
            </div>
          </div>
          <p className="text-sm italic">"بهترین انتخاب، با مشاوره‌ای درست آغاز می‌شود"</p>
        </motion.div>
      </div>
    </div>
  );
}
