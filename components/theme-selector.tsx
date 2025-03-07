"use client"

import { useState } from "react"
import { useTheme, type ThemeType, themes } from "@/context/theme-context"
import { Button } from "@/components/ui/button"
import { Palette, ChevronDown, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme)
    closeDropdown()
  }

  const themeNames: Record<ThemeType, string> = {
    dark: "Dark",
    light: "Light",
    retro: "Retro",
    neon: "Neon",
    midnight: "Midnight",
  }

  // Theme color previews
  const themePreview: Record<ThemeType, string> = {
    dark: "bg-gradient-to-r from-teal-500 to-blue-500",
    light: "bg-gradient-to-r from-blue-500 to-indigo-500",
    retro: "bg-gradient-to-r from-amber-500 to-orange-500",
    neon: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
    midnight: "bg-gradient-to-r from-cyan-500 to-indigo-500",
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={toggleDropdown} className="flex items-center gap-2 relative">
        <div className={`w-4 h-4 rounded-full ${themePreview[theme]}`} />
        <Palette className="w-4 h-4" />
        <span className="hidden md:inline">Theme</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 overflow-hidden"
          >
            <div className="rounded-md ring-1 ring-black ring-opacity-5 bg-gray-900 text-white">
              <div className="py-1">
                {Object.keys(themes).map((themeKey) => (
                  <button
                    key={themeKey}
                    onClick={() => handleThemeChange(themeKey as ThemeType)}
                    className={`
                      w-full text-left px-4 py-2 text-sm flex items-center justify-between
                      ${theme === themeKey ? "bg-gray-800" : "hover:bg-gray-800"}
                      transition-colors duration-150
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${themePreview[themeKey as ThemeType]}`} />
                      <span>{themeNames[themeKey as ThemeType]}</span>
                    </div>
                    {theme === themeKey && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

