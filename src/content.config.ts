import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projectCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/projects" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			author: z.string(),
			tags: z.array(z.string()),
			description: z.string(),
			pubDate: z.string().transform((str) => new Date(str)),
			imgUrl: image(),
			draft: z.boolean().optional().default(false),
			viewLiveDemoLink: z.string().optional().default(""),
			developerNotes: z.string().optional().default(""),
		}),
});

export const collections = {
	projects: projectCollection,
};
