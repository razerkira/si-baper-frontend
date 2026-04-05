export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12 min-h-[500px]">
      
      <div className="h-32 w-32 md:h-40 md:w-40 border-[8px] border-slate-100 border-t-[#6366f1] rounded-full animate-spin"></div>
      
      <div className="mt-8 flex flex-col items-center">
        <h3 className="text-xl md:text-2xl font-bold text-slate-700 animate-pulse">
          Memuat Data
        </h3>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Mohon tunggu sebentar...
        </p>
      </div>

    </div>
  );
}