import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Illustration({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative w-64 h-64 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-3xl" />
        <div className="absolute inset-8 bg-black rounded-full border-4 border-white/10" />
      </div>
    </div>
  );
}

export function NotFound({
  title = "Page Not Found",
  description = "Lost, this page is. In another system, it may be.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-white mb-4">{title}</h1>
      <p className="text-xl text-white/60 mb-8 max-w-md">{description}</p>
      
      <div className="relative w-full max-w-sm mb-8">
        <Input
          type="text"
          placeholder="Search for something else..."
          className="pl-10 h-12 bg-white/5 border-white/10 text-white"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
      </div>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
