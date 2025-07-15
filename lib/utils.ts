import { type ClassValue, clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const generateId = customAlphabet(alphabet, 6);

export function parseExpires(expires?: string) {
  if (!expires || expires === "b") {
    return;
  }

  const match = expires.match(/^(\d+)(m|h|d)$/);
  if (!match) {
    throw new Error("Invalid expiration format");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "m" && ![10, 30].includes(value)) {
    throw new Error("Invalid minutes value");
  }

  if (unit === "h" && ![1, 6, 12].includes(value)) {
    throw new Error("Invalid hours value");
  }

  if (unit === "d" && ![1, 3, 7].includes(value)) {
    throw new Error("Invalid days value");
  }

  if (unit === "m") {
    return value * 60;
  }

  if (unit === "h") {
    return value * 3600;
  }

  if (unit === "d") {
    return value * 86400;
  }

  throw new Error("Invalid expiration unit");
}

export const editorLanguages = [
  "abap",
  "apex",
  "azcli",
  "bat",
  "bicep",
  "cameligo",
  "clojure",
  "coffee",
  "cpp",
  "csharp",
  "csp",
  "css",
  "cypher",
  "dart",
  "dockerfile",
  "ecl",
  "elixir",
  "flow9",
  "fsharp",
  "go",
  "graphql",
  "handlebars",
  "hcl",
  "html",
  "ini",
  "java",
  "javascript",
  "julia",
  "kotlin",
  "less",
  "lexon",
  "liquid",
  "lua",
  "markdown",
  "mips",
  "msdax",
  "mysql",
  "objective-c",
  "pascal",
  "pascaligo",
  "perl",
  "pgsql",
  "php",
  "pla",
  "plaintext",
  "postiats",
  "powerquery",
  "powershell",
  "pug",
  "python",
  "qsharp",
  "r",
  "razor",
  "redis",
  "redshift",
  "restructuredtext",
  "ruby",
  "rust",
  "sb",
  "scala",
  "scheme",
  "scss",
  "shell",
  "sol",
  "sparql",
  "sql",
  "st",
  "swift",
  "systemverilog",
  "tcl",
  "twig",
  "typescript",
  "vb",
  "xml",
  "yaml",
];
