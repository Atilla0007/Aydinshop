import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { Phone, Mail, MapPin, MessageSquare, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export function Contact() {
  const [searchParams] = useSearchParams();
  const selectedPackage = searchParams.get("package") || "";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    message: "",
    inquiry_type: selectedPackage ? "service" : "consultation",
    service_package: selectedPackage,
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    
    try {
      const response = await axios.post("/api/contact/", formData);
      if (response.data.status === "success") {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          city: "",
          message: "",
          inquiry_type: "consultation",
          service_package: "",
        });
      } else {
        setStatus("error");
        setErrorMessage(response.data.message || "خطایی در ارسال پیام رخ داد");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setStatus("error");
      
      if (error.response?.data?.errors) {
        // Show first error from backend
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string;
        setErrorMessage(firstError || "خطایی در ارسال پیام رخ داد");
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("خطایی در ارسال پیام رخ داد. لطفا دوباره تلاش کنید یا با شماره تماس شرکت در ارتباط باشید.");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white pt-32 pb-20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-bold mb-6 font-divan leading-[1.6]"
              >
                با ما در تماس باشید
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/40 max-w-2xl mx-auto font-iran leading-[2.8]"
              >
                تیم متخصص ما آماده شنیدن ایده‌های شما و تبدیل آن‌ها به واقعیت است.
              </motion.p>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details Column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 space-y-6"
            >
              <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-all" />
                
                <div className="relative space-y-10">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1 font-iran">شماره تماس مستقیم</p>
                      <p className="text-2xl font-bold dir-ltr">۰۹۱۴ ۹۹۱ ۱۳۸۳</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1 font-iran">ایمیل سازمانی</p>
                      <p className="text-xl font-bold">styra.steel@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1 font-iran">آدرس دفتر مرکزی</p>
                      <p className="text-lg font-bold leading-loose font-iran">تبریز، آبرسان، فلکه دانشگاه، برج بلور، طبقه سوم اداری، واحد D</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1 font-iran">آدرس کارخانه</p>
                      <p className="text-lg font-bold leading-loose font-iran">تهران، فردوسیه، خیابان شهریار</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1 font-iran">ساعات کاری</p>
                      <p className="text-lg font-bold font-iran">شنبه تا چهارشنبه ۹:۰۰ - ۱۸:۰۰</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5">
                  <p className="text-white/40 mb-6 text-sm font-iran">ما را در شبکه‌های اجتماعی دنبال کنید</p>
                  <div className="flex gap-4">
                    {['Instagram', 'Linkedin', 'Twitter'].map((social) => (
                      <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 transition-all">
                        <div className="text-xs font-iran">{social[0]}</div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 to-transparent border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="text-rose-500" size={20} />
                  <h3 className="font-bold font-iran">پاسخگویی سریع</h3>
                </div>
                <p className="text-sm text-white/50 leading-loose font-iran">
                  تیم پشتیبانی فنی ما آماده پاسخگویی به سوالات تخصصی شما در زمینه تجهیزات آشپزخانه صنعتی است.
                </p>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8"
            >
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/[0.01] border border-white/5 relative overflow-hidden">
                {status === "success" ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Send size={40} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-green-500 font-divan">پیام شما با موفقیت ارسال شد</h2>
                    <p className="text-white/40 mb-10 max-w-md mx-auto font-iran">ممنون از اعتماد شما. مشاورین ما در اولین فرصت با شما تماس خواهند گرفت.</p>
                    <Button onClick={() => setStatus("idle")} variant="outline" className="rounded-full px-8 font-iran">ارسال پیام جدید</Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold mb-2 font-divan">ارسال پیام</h2>
                      <p className="text-white/40 font-iran">مشخصات خود را وارد کنید تا با شما تماس بگیریم.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-8 font-iran">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white/50 px-1">نام و نام خانوادگی</label>
                          <Input 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 focus:border-rose-500" 
                            placeholder="مثال: علی احمدی"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white/50 px-1">شماره تماس</label>
                          <Input 
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 focus:border-rose-500 text-right" 
                            placeholder="۰۹۱۸۰۰۰۰۰۰۰"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white/50 px-1">ایمیل</label>
                          <Input 
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 focus:border-rose-500" 
                            placeholder="info@example.com"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white/50 px-1">نام مجموعه</label>
                          <Input 
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 focus:border-rose-500" 
                            placeholder="مثال: رستوران استیرا"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-white/50 px-1">شهر (اختیاری)</label>
                        <Input 
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-rose-500 focus:border-rose-500" 
                          placeholder="مثال: تهران"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-white/50 px-1">توضیحات پروژه</label>
                        <textarea 
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={6}
                          placeholder="لطفا در مورد پروژه و نیازهای خود توضیح دهید..."
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-iran"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full md:w-auto px-12 h-14 bg-rose-600 hover:bg-rose-700 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] font-iran"
                        disabled={status === "submitting"}
                      >
                        {status === "submitting" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>در حال ارسال...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send size={20} />
                            <span>ارسال درخواست</span>
                          </div>
                        )}
                      </Button>
                      
                      {status === "error" && errorMessage && (
                        <p className="text-rose-500 text-sm text-center bg-rose-500/10 py-3 rounded-xl border border-rose-500/20 font-iran">
                          {errorMessage}
                        </p>
                      )}
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
      </div>
    </div>
  );
}
