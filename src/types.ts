export interface ModrinthConfig {
  version: string;
  type: 'mod' | 'plugin';
  loader?: 'fabric' | 'forge' | 'neoforge' | 'quilt' | 'paper' | 'spigot' | 'bukkit';
  minecraftVersion?: string;
  modsFolder?: string;
  pluginsFolder?: string;
}

export interface ModrinthProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  project_type: 'mod' | 'modpack' | 'resourcepack' | 'shader';
  downloads: number;
  follows: number;
  date_created: string;
  date_modified: string;
  latest_version: string;
  license: {
    id: string;
    name: string;
    url: string;
  };
  gallery: Array<{
    url: string;
    featured: boolean;
    title?: string;
    description?: string;
    created: string;
    ordering: number;
  }>;
  featured_gallery?: string;
  color?: number;
  thread_id?: string;
  monetization_status: 'monetized' | 'demonetized' | 'force_demonetized';
  categories: string[];
  versions: string[];
  icon_url?: string;
  issues_url?: string;
  source_url?: string;
  wiki_url?: string;
  discord_url?: string;
  donation_urls: Array<{
    id: string;
    platform: string;
    url: string;
  }>;
  status: 'approved' | 'rejected' | 'draft' | 'unlisted' | 'processing' | 'withheld';
  requested_status?: 'approved' | 'rejected' | 'draft' | 'unlisted';
  moderator_message?: string;
  published: string;
  updated: string;
  approved?: string;
  queued?: string;
  followers: number;
  additional_categories: string[];
  loaders: string[];
  game_versions: string[];
  author: string;
  display_categories: string[];
}

export interface ModrinthVersion {
  id: string;
  project_id: string;
  author_id: string;
  featured: boolean;
  name: string;
  version_number: string;
  changelog?: string;
  changelog_url?: string;
  date_published: string;
  downloads: number;
  version_type: 'release' | 'beta' | 'alpha';
  files: Array<{
    hashes: {
      sha1: string;
      sha512: string;
    };
    url: string;
    filename: string;
    primary: boolean;
    size: number;
  }>;
  dependencies: Array<{
    version_id?: string;
    project_id?: string;
    file_name?: string;
    dependency_type: 'required' | 'optional' | 'incompatible' | 'embedded';
  }>;
  game_versions: string[];
  loaders: string[];
}

export interface SearchResult {
  hits: ModrinthProject[];
  offset: number;
  limit: number;
  total_hits: number;
}
