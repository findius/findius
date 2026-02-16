import { compileMDX } from "next-mdx-remote/rsc";
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

  // Step 1: Wrap array props: prop=[...] → prop={[...]}
  // Find all prop=[ and track bracket depth to find matching ]
  fixed = fixed.replace(/(\w+)=\[(?!\{)/g, '$1={[');
  
  // Step 2: For every {[ we added, find the matching ] and add }
  // Simple approach: replace ] followed by certain patterns
  fixed = fixed.replace(/\]\s*(\/?>)/g, ']}$1');   // ] /> or ] >
  fixed = fixed.replace(/\]\s+(\w+=)/g, ']} $1');   // ] nextProp=
  fixed = fixed.replace(/\]\s*\n(\s*\/?>)/g, ']}\n$1'); // ]\n />
  
  // Step 3: Handle trailing ] at end of self-closing component lines
  // Pattern: ] followed by newline then whitespace and /> on next line
  fixed = fixed.replace(/\]\s*\n(\s*)\//g, ']}\n$1/');

  return fixed;
}

export async function MDXRenderer({ source }: MDXRendererProps) {
  try {
    const fixedSource = fixMDXSyntax(source);
    const { content } = await compileMDX({
      source: fixedSource,
      components,
      options: {
        parseFrontmatter: false,
      },
    });

    return (
      <div className="mdx-content">
        {content}
      </div>
    );
  } catch (error) {
    console.error('MDX compilation error:', error);
    // Fallback: render as plain markdown-like text
    return (
      <div className="mdx-content prose prose-invert max-w-none">
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 mb-6 text-sm text-yellow-200">
          ⚠️ Diese Seite wird gerade optimiert. Einige Elemente werden möglicherweise nicht korrekt dargestellt.
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: source
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
              .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
              .replace(/\n\n/g, '</p><p class="mb-4">')
              .replace(/^/, '<p class="mb-4">')
              .replace(/$/, '</p>'),
          }}
        />
      </div>
    );
  }
}
