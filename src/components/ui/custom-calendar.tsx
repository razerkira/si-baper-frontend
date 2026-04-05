"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import { id as localeID } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function CustomCalendar({ selected, onSelect, className }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Menentukan range tanggal yang akan ditampilkan (mulai dari Senin)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); 
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      
      {/* --- HEADER (Navigasi Bulan) --- */}
      <div className="flex justify-between items-center mb-4 px-1 shrink-0">
        <button
          onClick={prevMonth}
          className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: localeID })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-900"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* --- NAMA HARI --- */}
      <div className="grid grid-cols-7 mb-2 shrink-0">
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-sm font-semibold pb-2",
              // Index 5 (Sabtu) dan 6 (Minggu) diberi warna khusus
              (i === 5 || i === 6) ? "text-[#6366f1]" : "text-slate-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* --- GRID TANGGAL (Auto Stretch ke Bawah) --- */}
      {/* Menggunakan `auto-rows-fr` agar baris membagi rata sisa tinggi kontainer */}
      <div className="grid grid-cols-7 flex-1 gap-1 auto-rows-fr pb-2">
        {days.map((day, i) => {
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isWeekend = (i % 7 === 5) || (i % 7 === 6); // Kolom 6 & 7 (Sab & Min)

          return (
            <button
              key={day.toString()}
              onClick={() => onSelect?.(day)}
              className={cn(
                "relative flex h-full w-full items-center justify-center rounded-lg transition-all hover:bg-slate-100",
                
                // Meredupkan tanggal dari bulan lain
                !isCurrentMonth && "text-slate-300 opacity-50 hover:bg-transparent",
                
                // Styling warna hari aktif biasa
                isCurrentMonth && !isSelected && !isWeekend && "text-slate-700",
                
                // Styling KHUSUS Sabtu & Minggu jika belum dipilih
                isCurrentMonth && !isSelected && isWeekend && "text-[#6366f1] font-medium",
                
                // Styling saat TANGGAL DIPILIH
                isSelected && "bg-[#6366f1] text-white hover:bg-[#4f52c9] font-bold shadow-sm"
              )}
            >
              <span className="text-base">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}