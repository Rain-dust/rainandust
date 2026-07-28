import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    order: z.number().int().positive(),
    description: z.string(),
    image: z.string(),
    alt: z.string(),
    url: z.url(),
    placement: z.enum(["earth", "fushenglu", "zhiwei"]),
  }),
});

export const collections = { projects };
