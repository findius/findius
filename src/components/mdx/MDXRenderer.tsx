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

export async function MDXRenderer({ source }: MDXRendererProps) {
  const { content } = await compileMDX({
    source,
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
}
