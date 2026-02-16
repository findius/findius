"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
}

function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg bg-muted/50 dark:bg-muted/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-base font-semibold text-foreground pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export function FAQ({ items = [], title }: FAQProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className="my-8">
      <FAQJsonLd items={items} />
      {title && (
        <h3 className="mb-5 text-xl font-bold">{title}</h3>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <FAQAccordionItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
