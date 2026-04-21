import nextConfig from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  // Ignore shadcn/ui auto-generated library files and generated hooks
  {
    ignores: [
      "components/ui/**",
      "hooks/use-mobile.ts",
      "hooks/use-toast.ts",
    ],
  },
  ...nextConfig,
  ...nextTs,
  {
    rules: {
      // react-hooks/immutability and react-hooks/purity are overly strict
      // experimental rules that produce false positives for:
      //   - window.location.href assignments in event handlers
      //   - Date.now() inside async upload helpers
      //   - Math.random() inside useMemo()
      // Disable until rules stabilize.
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      // Relax missing deps warning — these are intentional one-shot effects
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default config;
