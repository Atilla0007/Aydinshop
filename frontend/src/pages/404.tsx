import { NotFound, Illustration } from "@/components/ui/not-found";

export function Error404() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#030303] overflow-hidden">
      <Illustration className="absolute inset-0 w-full h-[50vh] opacity-[0.04]" />
      <div className="relative z-10">
        <NotFound 
          title="صفحه پیدا نشد" 
          description="متاسفیم، صفحه‌ای که به دنبال آن بودید وجود ندارد یا جابجا شده است." 
        />
      </div>
    </div>
  );
}
