"use client";

import {
  GithubIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function Header() {
  // Theme toggle component
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
        className="rounded-full text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => {
          if (theme === "dark") setTheme("light");
          else if (theme === "light") setTheme("system");
          else setTheme("dark");
        }}
      >
        {theme === "dark" ? (
          <SunIcon className="size-5" />
        ) : theme === "light" ? (
          <MoonIcon className="size-5" />
        ) : (
          <MonitorIcon className="size-5" />
        )}
      </Button>
    );
  };

  return (
    <header className="w-full shadow-sm bg-gradient-to-b from-background/95 to-background/75 backdrop-blur-md sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto w-full flex h-14 items-center justify-between px-4 lg:px-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
        >
          <div className="relative">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={24}
              height={24}
              className="dark:invert transition-transform group-hover:scale-105"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#555555]">
            Paaster
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="flex gap-2 text-muted-foreground hover:text-foreground rounded-full px-2 sm:px-4"
          >
            <Link href="/">
              <PlusIcon className="size-4" />
              <span className="font-medium hidden sm:inline">New Paste</span>
            </Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
