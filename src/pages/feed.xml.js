export const prerender = true;

import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { github } from "@lib/github";

const userData = await github.getUser();

export async function GET(context) {
	const projects = await getCollection("projects");
	return rss({
		title: `${userData.name} - Projects`,
		description: userData.bio,
		stylesheet: false,
		site: context.site,
		items: projects.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/projects/${post.id}/`,
			author: userData.name,
			viewLiveDemoLink: post.data.viewLiveDemoLink,
		})),
		customData: "<language>en-us</language>",
		canonicalUrl: "https://brutal.elian.codes",
	});
}
