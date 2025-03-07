"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define theme types and color schemes
export type ThemeType = "dark" | "light" | "retro" | "neon" | "midnight"

interface ThemeColors {
  background: string
  gameBackground: string
  panelBackground: string
  text: string
  accent: string
  accentHover: string
  buttonText: string
  buttonBg: string
  buttonBorder: string
  buttonHover: string
  buttonOutlineBg: string
  buttonOutlineText: string
  buttonOutlineBorder: string
  buttonOutlineHover: string
  gameOver: string
}

export const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    background: "bg-gray-900",
    gameBackground: "bg-black",
    panelBackground: "bg-gray-900/90",
    text: "text-white",
    accent: "from-teal-500 to-blue-500",
    accentHover: "from-teal-600 to-blue-600",
    buttonText: "text-white",
    buttonBg: "bg-teal-500",
    buttonBorder: "border-teal-600",
    buttonHover: "hover:bg-teal-600",
    buttonOutlineBg: "bg-teal-500/10",
    buttonOutlineText: "text-teal-300",
    buttonOutlineBorder: "border-teal-500/50",
    buttonOutlineHover: "hover:bg-teal-500/20",
    gameOver: "text-rose-500",
  },
  light: {
    background: "bg-gray-100",
    gameBackground: "bg-white",
    panelBackground: "bg-white/90",
    text: "text-gray-900",
    accent: "from-blue-500 to-indigo-500",
    accentHover: "from-blue-600 to-indigo-600",
    buttonText: "text-white",
    buttonBg: "bg-blue-500",
    buttonBorder: "border-blue-600",
    buttonHover: "hover:bg-blue-600",
    buttonOutlineBg: "bg-blue-500/10",
    buttonOutlineText: "text-blue-700",
    buttonOutlineBorder: "border-blue-500/50",
    buttonOutlineHover: "hover:bg-blue-500/20",
    gameOver: "text-red-600",
  },
  retro: {
    background: "bg-amber-900",
    gameBackground: "bg-amber-950",
    panelBackground: "bg-amber-800/90",
    text: "text-amber-100",
    accent: "from-amber-500 to-orange-500",
    accentHover: "from-amber-600 to-orange-600",
    buttonText: "text-amber-950",
    buttonBg: "bg-amber-400",
    buttonBorder: "border-amber-500",
    buttonHover: "hover:bg-amber-500",
    buttonOutlineBg: "bg-amber-400/10",
    buttonOutlineText: "text-amber-200",
    buttonOutlineBorder: "border-amber-400/50",
    buttonOutlineHover: "hover:bg-amber-400/20",
    gameOver: "text-orange-500",
  },
  neon: {
    background: "bg-purple-950",
    gameBackground: "bg-black",
    panelBackground: "bg-purple-900/50",
    text: "text-white",
    accent: "from-fuchsia-500 to-pink-500",
    accentHover: "from-fuchsia-600 to-pink-600",
    buttonText: "text-white",
    buttonBg: "bg-fuchsia-500",
    buttonBorder: "border-fuchsia-600",
    buttonHover: "hover:bg-fuchsia-600",
    buttonOutlineBg: "bg-fuchsia-500/10",
    buttonOutlineText: "text-fuchsia-300",
    buttonOutlineBorder: "border-fuchsia-500/50",
    buttonOutlineHover: "hover:bg-fuchsia-500/20",
    gameOver: "text-pink-500",
  },
  midnight: {
    background: "bg-indigo-950",
    gameBackground: "bg-gray-950",
    panelBackground: "bg-indigo-900/30",
    text: "text-white",
    accent: "from-cyan-500 to-indigo-500",
    accentHover: "from-cyan-600 to-indigo-600",
    buttonText: "text-white",
    buttonBg: "bg-cyan-500",
    buttonBorder: "border-cyan-600",
    buttonHover: "hover:bg-cyan-600",
    buttonOutlineBg: "bg-cyan-500/10",
    buttonOutlineText: "text-cyan-300",
    buttonOutlineBorder: "border-cyan-500/50",
    buttonOutlineHover: "hover:bg-cyan-500/20",
    gameOver: "text-red-400",
  },
}

// Create the theme context
interface ThemeContextType {
  theme: ThemeType
  colors: ThemeColors
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Create the theme provider component
interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeType>("midnight")

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("tetrisTheme") as ThemeType
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme)
    }
  }, [])

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem("tetrisTheme", newTheme)
  }

  const value = {
    theme,
    colors: themes[theme],
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Create a hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

