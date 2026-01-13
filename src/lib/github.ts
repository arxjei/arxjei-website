interface GitHubUser {
	login: string;
	name: string;
	avatar_url: string;
	bio: string;
	location: string;
	email: string | null;
	hireable: boolean | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
	twitter_username: string | null;
	html_url: string;
}

interface GitHubRepo {
	name: string;
	description: string;
	html_url: string;
	stargazers_count: number;
	forks_count: number;
	language: string;
	topics: string[];
	created_at: string;
	updated_at: string;
}

interface GitHubSocialAccount {
	provider: string;
	url: string;
}

class GitHubAPI {
	private baseURL = "https://api.github.com";
	private username = import.meta.env.SECRET_GITHUB_USERNAME;
	private token = import.meta.env.SECRET_GITHUB_TOKEN;

	private async fetch<T>(endpoint: string): Promise<T> {
		const headers: HeadersInit = {
			Accept: "application/vnd.github.v3+json",
		};

		// Add auth token if available
		if (this.token) {
			headers["Authorization"] = `Bearer ${this.token}`;
		}

		const response = await fetch(`${this.baseURL}${endpoint}`, { headers });

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.statusText}`);
		}

		return response.json();
	}

	// Get user profile
	async getUser(): Promise<GitHubUser> {
		return this.fetch<GitHubUser>(`/users/${this.username}`);
	}

	// Get user's repositories
	async getRepos(options?: {
		sort?: "created" | "updated" | "pushed" | "full_name";
		direction?: "asc" | "desc";
		per_page?: number;
	}): Promise<GitHubRepo[]> {
		const params = new URLSearchParams({
			sort: options?.sort || "updated",
			direction: options?.direction || "desc",
			per_page: String(options?.per_page || 10),
		});

		return this.fetch<GitHubRepo[]>(`/users/${this.username}/repos?${params}`);
	}

	// Get pinned repositories (using GraphQL would be better, but this is simpler)
	async getFeaturedRepos(repoNames: string[]): Promise<GitHubRepo[]> {
		const repos = await Promise.all(
			repoNames.map((name) =>
				this.fetch<GitHubRepo>(`/repos/${this.username}/${name}`)
			)
		);
		return repos;
	}

	// Get user's gists
	async getGists(per_page = 5): Promise<any[]> {
		return this.fetch<any[]>(
			`/users/${this.username}/gists?per_page=${per_page}`
		);
	}

	// Get contribution stats (simple version)
	async getStats() {
		const user = await this.getUser();
		const repos = await this.getRepos({ per_page: 100 });

		const totalStars = repos.reduce(
			(sum, repo) => sum + repo.stargazers_count,
			0
		);
		const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
		const languages = [
			...new Set(repos.map((r) => r.language).filter(Boolean)),
		];

		return {
			public_repos: user.public_repos,
			followers: user.followers,
			following: user.following,
			total_stars: totalStars,
			total_forks: totalForks,
			languages,
		};
	}

	// Simple avatar URL (no API call needed!)
	getAvatarURL(size = 400): string {
		return `https://github.com/${this.username}.png?size=${size}`;
	}

	// Get profile URL
	getProfileURL(): string {
		return `https://github.com/${this.username}`;
	}

	// Get Social Media Links
	async getUserSocialMedia() {
		return this.fetch<GitHubSocialAccount[]>(
			`/users/${this.username}/social_accounts`
		);
	}

	// Get starred repositories
	async getStarredRepos(options?: {
		per_page?: number;
		sort?: "created" | "updated";
		direction?: "asc" | "desc";
	}): Promise<GitHubRepo[]> {
		const params = new URLSearchParams({
			per_page: String(options?.per_page || 30),
			sort: options?.sort || "created",
			direction: options?.direction || "desc",
		});

		return this.fetch<GitHubRepo[]>(
			`/users/${this.username}/starred?${params}`
		);
	}
}

// Export a singleton instance
export const github = new GitHubAPI();

// Export types
export type { GitHubUser, GitHubRepo };
