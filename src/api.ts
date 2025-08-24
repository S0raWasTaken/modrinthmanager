import axios, { AxiosInstance } from 'axios';
import { ModrinthProject, ModrinthVersion, SearchResult } from './types';

export class ModrinthAPI {
  private client: AxiosInstance;
  private baseURL = 'https://api.modrinth.com/v2';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'User-Agent': 'ModrinthManager/1.0.0 (SSnowly)'
      }
    });
  }

  async searchProjects(query: string, options: {
    limit?: number;
    offset?: number;
    facets?: string[][];
    index?: 'relevance' | 'downloads' | 'follows' | 'newest' | 'updated';
  } = {}): Promise<SearchResult> {
    const params = new URLSearchParams({
      query,
      limit: (options.limit || 20).toString(),
      offset: (options.offset || 0).toString(),
      index: options.index || 'relevance'
    });

    if (options.facets) {
      options.facets.forEach(facet => {
        params.append('facets', JSON.stringify(facet));
      });
    }

    const response = await this.client.get(`/search?${params.toString()}`);
    return response.data;
  }

  async getProject(slug: string): Promise<ModrinthProject> {
    const response = await this.client.get(`/project/${slug}`);
    return response.data;
  }

  async getProjectVersions(slug: string): Promise<ModrinthVersion[]> {
    const response = await this.client.get(`/project/${slug}/version`);
    return response.data;
  }

  async getVersion(versionId: string): Promise<ModrinthVersion> {
    const response = await this.client.get(`/version/${versionId}`);
    return response.data;
  }

  async downloadFile(fileHash: string): Promise<Buffer> {
    const response = await this.client.get(`/version_file/${fileHash}/download`, {
      responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
  }

  async getLatestVersion(slug: string, minecraftVersion?: string, loader?: string, versionType: 'release' | 'beta' | 'alpha' = 'release'): Promise<ModrinthVersion | null> {
    const versions = await this.getProjectVersions(slug);
    
    let filteredVersions = versions.filter(v => v.version_type === versionType);
    
    if (minecraftVersion) {
      filteredVersions = filteredVersions.filter(v => 
        v.game_versions.includes(minecraftVersion)
      );
    }
    
    if (loader) {
      filteredVersions = filteredVersions.filter(v => 
        v.loaders.includes(loader)
      );
    }
    
    if (filteredVersions.length === 0) {
      return null;
    }
    
    return filteredVersions[0];
  }
}
