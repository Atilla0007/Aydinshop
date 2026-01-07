import { motion } from "framer-motion";

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-iran">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold font-divan mb-4 text-rose-500">سیاست حریم خصوصی</h1>
          <p className="text-white/60 mb-12 text-lg">تعهد ما به حفاظت از اطلاعات کاربران و مشتریان استیرا.</p>
          <div className="space-y-8 text-white/70 leading-loose text-justify">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">جمع‌آوری اطلاعات</h2>
              <p>اطلاعاتی مانند نام، شماره تماس، ایمیل و پیام شما صرفاً برای پاسخگویی، مشاوره و پیگیری درخواست‌ها جمع‌آوری می‌شود.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">نحوه استفاده از اطلاعات</h2>
              <p>اطلاعات شما برای ارائه خدمات، بهبود تجربه کاربری و ارتباطات ضروری استفاده می‌شود و بدون رضایت شما در اختیار شخص ثالث قرار نمی‌گیرد.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">نگهداری و امنیت</h2>
              <p>از اقدامات امنیتی مناسب برای محافظت از داده‌ها استفاده می‌کنیم. با این حال، هیچ روشی در اینترنت صد درصد ایمن نیست.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">حقوق شما</h2>
              <p>در صورت نیاز می‌توانید برای اصلاح یا حذف اطلاعات ثبت‌شده با پشتیبانی استیرا در ارتباط باشید.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">تماس</h2>
              <p>برای پرسش‌های مرتبط با حریم خصوصی از طریق ایمیل <strong className="text-rose-500">info@styra.ir</strong> با ما در تماس باشید.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
