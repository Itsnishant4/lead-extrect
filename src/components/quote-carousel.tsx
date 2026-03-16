"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

const quotes = [
  {
    text: "Honestly, I really love what @leadspotter is doing, you don't need to own a complete backend, just write your logic within your app and you'll get a powerful lead generation engine at your disposal.",
    author: "@NavicsteinR",
    avatar: "https://i.pravatar.cc/100?u=navic"
  },
  {
    text: "Me using @leadspotter for the first time right now 🤯",
    author: "@nasiscoe",
    avatar: "https://i.pravatar.cc/100?u=nas"
  },
  {
    text: "LeadSpotter has transformed our lead generation workflow. The speed and accuracy are unmatched.",
    author: "@alex_dev",
    avatar: "https://i.pravatar.cc/100?u=alex"
  },
  {
    text: "The most intuitive tool I've used this year. Highly recommend for anyone looking to scale their outbound.",
    author: "@sarah_leads",
    avatar: "https://i.pravatar.cc/100?u=sarah"
  }
]

export function QuoteCarousel({pagetype}: {pagetype: "login" | "signup"}) {
  const [index, setIndex] = useState(pagetype === "login" ? quotes.length - 1 : 0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        if (pagetype === "login") {
          return (prev - 1 + quotes.length) % quotes.length
        } else {
          return (prev + 1) % quotes.length
        }
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [pagetype])

  return (
    <div className="max-w-xl self-center relative z-10 w-full  flex flex-col justify-center">
      <div className="relative h-full">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8 w-full"
          >
            <div className="relative">
              <span className="absolute -top-12 -left-8 text-[120px] font-serif text-slate-200/60 leading-none select-none">“</span>
              <p className="text-3xl leading-tight text-slate-900 tracking-tight">
                {quotes[index].text}
              </p>
            </div>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                <img 
                    src={quotes[index].avatar} 
                    alt={quotes[index].author} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${quotes[index].author.replace('@', '')}&background=6366f1&color=fff`
                    }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 font-bold tracking-tight">{quotes[index].author}</span>
              </div>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
    </div>
  )
}
