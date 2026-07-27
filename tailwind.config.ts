import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#12211a", moss: "#194d38", lime: "#c9f36a", cream: "#f6f5ee" } } },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
