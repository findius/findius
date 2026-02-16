"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AffiliateLink } from "./AffiliateLink";

export interface ComparisonItem {
  name: string;
  features: string[];
  price: string;
  rating: number;
  affiliateLink: string;
  image?: string;
}

interface ComparisonTableProps {
  items: ComparisonItem[];
  title?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function ComparisonTable({ items = [], title }: ComparisonTableProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className="my-8">
      {title && (
        <h3 className="mb-4 text-xl font-semibold">{title}</h3>
      )}
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 font-medium">Anbieter</th>
              <th className="px-4 py-3 font-medium">Features</th>
              <th className="px-4 py-3 font-medium">Kosten</th>
              <th className="px-4 py-3 font-medium">Bewertung</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.name}
                className={`border-b last:border-b-0 ${
                  index === 0 ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {index === 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Empfehlung
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <ul className="space-y-1">
                    {item.features.map((feature) => (
                      <li key={feature} className="text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-4 font-medium">{item.price}</td>
                <td className="px-4 py-4">
                  <StarRating rating={item.rating} />
                </td>
                <td className="px-4 py-4">
                  <AffiliateLink href={item.affiliateLink} className="text-sm">
                    Zum Anbieter
                  </AffiliateLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {items.map((item, index) => (
          <div
            key={item.name}
            className={`rounded-lg border p-4 ${
              index === 0 ? "border-primary/30 bg-primary/5" : ""
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                )}
                <span className="font-medium">{item.name}</span>
                {index === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Empfehlung
                  </Badge>
                )}
              </div>
              <span className="font-medium">{item.price}</span>
            </div>
            <StarRating rating={item.rating} />
            <ul className="mt-3 space-y-1">
              {item.features.map((feature) => (
                <li
                  key={feature}
                  className="text-sm text-muted-foreground"
                >
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <AffiliateLink href={item.affiliateLink} className="text-sm">
                Zum Anbieter
              </AffiliateLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
