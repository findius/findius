import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content");

export interface Frontmatter {
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt?: string;
  seoKeywords: string[];
  affiliateDisclosure: boolean;
  featured: boolean;
}

export interface MDXContent {
  frontmatter: Frontmatter;
  content: string;
  slug: string;
}

export function getMDXBySlug(
  category: string,
  slug: string
): MDXContent | null {
  const filePath = path.join(contentDirectory, category, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    frontmatter: data as Frontmatter,
    content,
    slug,
  };
}

export function getAllSlugs(category: string): string[] {
  const dir = path.join(contentDirectory, category);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getAllContent(category: string): MDXContent[] {
  const slugs = getAllSlugs(category);
  return slugs
    .map((slug) => getMDXBySlug(category, slug))
    .filter((content): content is MDXContent => content !== null);
}

export function getAllContentAcrossCategories(): MDXContent[] {
  const categories = ["vergleiche", "ratgeber", "tools"];
  return categories.flatMap((category) => getAllContent(category));
}
