import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import { ComparisonTable } from "./ComparisonTable";
import { AffiliateLink } from "./AffiliateLink";
import { ProsConsList } from "./ProsConsList";
import { InfoBox } from "./InfoBox";
import { FAQ } from "./FAQ";

const components = {
  ComparisonTable,
  AffiliateLink,
  ProsConsList,
  InfoBox,
  FAQ,
};

interface MDXRendererProps {
  source: string;
}

function fixMDXSyntax(source: string): string {
  let fixed = source;

  // Fix prop=[...] → prop={[...]}
  fixed = fixed.replace(/(\w+)=\[/g, "$1={[");
  // Fix ] before /> → ]} before />
  fixed = fixed.replace(/\]\s*(\/?>)/g, "]}$1");
  // Fix ] before next prop → ]} before next prop
  fixed = fixed.replace(/\]\s+(\w+=)/g, "]} $1");
  // Fix ] at end of line before /> on next line
  fixed = fixed.replace(/\]\s*\n(\s*\/?>)/g, "]}\n$1");

  return fixed;
}

export async function MDXRenderer({ source }: MDXRendererProps) {
  try {
    const fixedSource = fixMDXSyntax(source);
    const { default: Content } = await evaluate(fixedSource, {
      ...runtime,
      useMDXComponents: () => components,
      development: false,
    } as Parameters<typeof evaluate>[1]);

    return (
      <div className="mdx-content">
        <Content />
      </div>
    );
  } catch (error) {
    console.error("MDX compilation error:", error);
    return (
      <div className="mdx-content prose prose-invert max-w-none">
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 mb-6 text-sm text-yellow-200">
          ⚠️ Diese Seite wird gerade optimiert. Einige Elemente werden
          möglicherweise nicht korrekt dargestellt.
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: source
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
              .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
              .replace(/\n\n/g, "</p><p class=\"mb-4\">")
              .replace(/^/, '<p class="mb-4">')
              .replace(/$/, "</p>"),
          }}
        />
      </div>
    );
  }
}
