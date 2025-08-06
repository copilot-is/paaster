"use client";

import { GithubIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function Header() {
  const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Theme"
        onClick={() => {
          if (theme === "dark") setTheme("light");
          else if (theme === "light") setTheme("system");
          else setTheme("dark");
        }}
      >
        {theme === "dark" ? (
          <SunIcon />
        ) : theme === "light" ? (
          <MoonIcon />
        ) : (
          <MonitorIcon />
        )}
      </Button>
    );
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur sticky top-0 z-50 dark:border-b-0">
      <div className="w-full flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className="dark:invert"
          />
          <span className="font-medium text-2xl">Paaster</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold mr-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="GitHub"
            className="text-xl"
          >
            <a
              href="https://github.com/copilot-is/paaster"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
            </a>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
