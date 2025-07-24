
"use client";

import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Model } from "@/lib/db/types";

const getCategoryEmoji = (category: Model['category']) => {
  switch (category) {
    case 'Phone': return '📱';
    case 'Mac': return '💻';
    case 'iPad': return '📲';
    case 'Watch': return '⌚';
    default: return '📱';
  }
};

const ModelResultItem = memo(({ model }: { model: Model }) => (
  <li>
    <Link href={`/model/${model.id}`} className="block hover:bg-muted">
      <div className="flex items-center gap-4 p-4">
        <span className="text-xl">{getCategoryEmoji(model.category)}</span>
        <div>
          <p className="font-semibold">{`${model.brand} ${model.name}`}</p>
        </div>
      </div>
    </Link>
  </li>
));
ModelResultItem.displayName = 'ModelResultItem';


interface SearchComponentProps {
  allModels: Model[];
}

export function SearchComponent({ allModels }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return [];
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term);
    
    return allModels.filter((model) => {
        const fullModelName = `${model.brand} ${model.name}`.toLowerCase();
        return searchTerms.every(term => fullModelName.includes(term));
    });
  }, [searchQuery, allModels]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Input
              type="text"
              placeholder="Busca tu modelo..."
              className="h-12 text-lg w-full rounded-full border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/40"
              style={{
                boxShadow: "0 0 20px 2px hsla(var(--primary) / 0.15)",
                borderColor: "hsl(var(--primary))"
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
            />
        </motion.div>

        <AnimatePresence>
        {isInputFocused && searchQuery && filteredModels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="text-left max-h-96 overflow-y-auto">
              <ul>
                {filteredModels.map((model) => (
                   <ModelResultItem key={model.id} model={model} />
                ))}
              </ul>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}
