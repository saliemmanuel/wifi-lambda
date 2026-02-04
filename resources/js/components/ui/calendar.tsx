"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            hideWeekdays={true}
            className={cn("p-4 bg-white rounded-2xl", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-6",
                caption: "flex justify-between pt-1 relative items-center px-2 mb-4",
                caption_label: "text-sm font-black text-slate-900 tracking-tight",
                nav: "flex items-center gap-1",
                nav_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 bg-slate-50 p-0 opacity-70 hover:opacity-100 hover:bg-slate-100 rounded-lg transition-all"
                ),
                nav_button_previous: "relative",
                nav_button_next: "relative",
                table: "w-full border-collapse space-y-1",
                head_row: "hidden",
                head_cell:
                    "text-slate-400 rounded-md w-10 font-black text-[10px] uppercase tracking-widest",
                row: "flex w-full mt-1",
                cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-50/50 [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-10 p-0 font-bold text-slate-600 aria-selected:opacity-100 hover:bg-slate-100 rounded-xl transition-all"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary! text-primary-foreground! hover:bg-primary! hover:text-primary-foreground! focus:bg-primary! focus:text-primary-foreground! shadow-lg shadow-primary/30 scale-105 z-10",
                day_today: "bg-slate-100 text-primary font-black relative after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full",
                day_outside:
                    "day-outside text-slate-300 aria-selected:bg-slate-50/50 aria-selected:text-slate-300 aria-selected:opacity-30",
                day_disabled: "text-slate-200 opacity-50",
                day_range_middle:
                    "aria-selected:bg-primary/5 aria-selected:text-primary",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ ...props }) => props.orientation === 'left' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
