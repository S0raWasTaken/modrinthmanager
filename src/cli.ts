#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';

import { ConfigManager } from './config';
import { ModrinthAPI } from './api';
import { ModrinthConfig } from './types';
const keypress = require('keypress'); // GUESS WHAT? THIS SHIT ISN'T TYPEDDD


async function interactivePagination(
  query: string,
  limit: number,
  totalPages: number,
  index: 'relevance' | 'downloads' | 'follows' | 'newest' | 'updated',
  api: ModrinthAPI
) {
  let currentPage = 1;
  
  
  keypress(process.stdin);
  
  
  process.on('SIGINT', () => {
    console.log('\n\nExiting...');
    process.exit(0);
  });
  
  return new Promise<void>((resolve) => {
    const showPage = async () => {
      
      console.clear();
      
      const offset = (currentPage - 1) * limit;
      const results = await api.searchProjects(query, {
        limit: limit,
        offset: offset,
        index: index
      });
      
      console.log(chalk.blue(`\nSearch results for "${query}" (${results.total_hits} total):\n`));
      
      results.hits.forEach((project, index) => {
        const resultNumber = offset + index + 1;
        console.log(chalk.yellow(`${resultNumber}. ${project.title}`));
        console.log(chalk.gray(`   Slug: ${project.slug}`));
        console.log(chalk.gray(`   Downloads: ${project.downloads?.toLocaleString() || 0}`));
        console.log(chalk.gray(`   Follows: ${project.follows?.toLocaleString() || 0}`));
        console.log(chalk.gray(`   Type: ${project.project_type}`));
        console.log(chalk.gray(`   Categories: ${project.categories?.join(', ') || 'None'}`));
        console.log('');
      });
      
      console.log(chalk.cyan(`Page ${currentPage} of ${totalPages}`));
      console.log(chalk.gray('Navigation:'));
      console.log(chalk.gray('  ←, →, [0-9] to navigate'));      
      console.log(chalk.gray('\nPress a key to navigate...'));
    };
    
    
    process.stdin.on('keypress', (ch, key) => {
      if (key && key.ctrl && key.name === 'c') {
        console.log('\n\nExiting...');
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
        return;
      }
      
      if (key && key.name === 'left' && currentPage > 1) {
        currentPage--;
        showPage();
      } else if (key && key.name === 'right' && currentPage < totalPages) {
        currentPage++;
        showPage();
      } else if (ch && ch.toLowerCase() === 'q') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
      } else if (ch && ch >= '0' && ch <= '9') {
        const pageNum = parseInt(ch);
        if (pageNum >= 1 && pageNum <= totalPages) {
          currentPage = pageNum;
          showPage();
        }
      }
    });
    
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    
    showPage();
  });
}

const program = new Command();

program
  .name('mr')
  .description('Modrinth Manager - CLI tool for managing Modrinth mods and plugins')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new Modrinth project')
  .action(async () => {
    try {
      const projectPath = process.cwd();
      const configManager = new ConfigManager(projectPath);

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'What type of project is this?',
          choices: ['mod', 'plugin']
        },
        {
          type: 'list',
          name: 'loader',
          message: 'What loader are you using?',
          choices: (answers: any) => {
            if (answers.type === 'mod') {
              return ['fabric', 'forge', 'neoforge', 'quilt'];
            } else {
              return ['paper', 'spigot', 'bukkit'];
            }
          }
        },
        {
          type: 'input',
          name: 'minecraftVersion',
          message: 'What Minecraft version are you targeting?',
          default: '1.20.1'
        },
        {
          type: 'input',
          name: 'modsFolder',
          message: 'What is your mods folder name?',
          default: 'mods',
          when: (answers: any) => answers.type === 'mod'
        },
        {
          type: 'input',
          name: 'pluginsFolder',
          message: 'What is your plugins folder name?',
          default: 'plugins',
          when: (answers: any) => answers.type === 'plugin'
        }
      ]);

      const config: ModrinthConfig = {
        version: '',
        type: answers.type,
        loader: answers.loader,
        minecraftVersion: answers.minecraftVersion,
        modsFolder: answers.modsFolder,
        pluginsFolder: answers.pluginsFolder
      };

      await configManager.saveConfig(config);
      await configManager.ensureFolders(projectPath);

      console.log(chalk.green('✓ Project initialized successfully!'));
      console.log(chalk.blue(`Type: ${answers.type}`));
      console.log(chalk.blue(`Loader: ${answers.loader}`));
      console.log(chalk.blue(`Minecraft Version: ${answers.minecraftVersion}`));
    } catch (error) {
      console.error(chalk.red('Error initializing project:'), error);
      process.exit(1);
    }
  });

program
  .command('search <query>')
  .description('Search for mods/plugins on Modrinth')
  .option('-l, --limit <number>', 'Number of results to show per page', '10')
  .option('-i, --index <type>', 'Sort by: relevance, downloads, follows, newest, updated', 'relevance')
  .option('-p, --page <number>', 'Page number to show', '1')
  .option('--no-pagination', 'Disable pagination and show all results')
  .action(async (query: string, options: any) => {
    try {
      const api = new ModrinthAPI();
      const limit = parseInt(options.limit);
      const page = parseInt(options.page);
      const offset = (page - 1) * limit;

      const results = await api.searchProjects(query, {
        limit: limit,
        offset: offset,
        index: options.index
      });

      const totalPages = Math.ceil(results.total_hits / limit);
      
      
      if (options.page !== '1' || process.argv.includes('--page')) {
        console.log(chalk.blue(`\nSearch results for "${query}" (${results.total_hits} total):\n`));

        results.hits.forEach((project, index) => {
          const resultNumber = offset + index + 1;
          console.log(chalk.yellow(`${resultNumber}. ${project.title}`));
          console.log(chalk.gray(`   Slug: ${project.slug}`));
          console.log(chalk.gray(`   Downloads: ${project.downloads?.toLocaleString() || 0}`));
          console.log(chalk.gray(`   Follows: ${project.follows?.toLocaleString() || 0}`));
          console.log(chalk.gray(`   Type: ${project.project_type}`));
          console.log(chalk.gray(`   Categories: ${project.categories?.join(', ') || 'None'}`));
          console.log('');
        });

        
        if (options.pagination && totalPages > 1) {
          console.log(chalk.cyan(`Page ${page} of ${totalPages}`));
          
          
          const paginationInfo = [];
          if (page > 1) {
            paginationInfo.push(`Previous: mr search "${query}" --page ${page - 1} --limit ${limit}`);
          }
          if (page < totalPages) {
            paginationInfo.push(`Next: mr search "${query}" --page ${page + 1} --limit ${limit}`);
          }
          
          if (paginationInfo.length > 0) {
            console.log(chalk.gray('\nNavigation:'));
            paginationInfo.forEach(info => console.log(chalk.gray(`  ${info}`)));
          }
          
          
          console.log(chalk.gray('\nQuick navigation:'));
          const startPage = Math.max(1, page - 2);
          const endPage = Math.min(totalPages, page + 2);
          
          for (let i = startPage; i <= endPage; i++) {
            if (i === page) {
              process.stdout.write(chalk.cyan(` [${i}] `));
            } else {
              process.stdout.write(chalk.gray(` ${i} `));
            }
          }
          console.log('');
        }
      } else {
        
        if (totalPages > 1 && options.pagination) {
          await interactivePagination(query, limit, totalPages, options.index, api);
        } else {
          
          console.log(chalk.blue(`\nSearch results for "${query}" (${results.total_hits} total):\n`));

          results.hits.forEach((project, index) => {
            const resultNumber = offset + index + 1;
            console.log(chalk.yellow(`${resultNumber}. ${project.title}`));
            console.log(chalk.gray(`   Slug: ${project.slug}`));
            console.log(chalk.gray(`   Downloads: ${project.downloads?.toLocaleString() || 0}`));
            console.log(chalk.gray(`   Follows: ${project.follows?.toLocaleString() || 0}`));
            console.log(chalk.gray(`   Type: ${project.project_type}`));
            console.log(chalk.gray(`   Categories: ${project.categories?.join(', ') || 'None'}`));
            console.log('');
          });
        }
      }
    } catch (error: any) {
      if (error.response?.status === 408) {
        console.error(chalk.red('Request timed out. Please try again.'));
      } else {
        console.error(chalk.red('Error searching:'), error.message);
      }
      process.exit(1);
    }
  });

program
  .command('download <slug>')
  .description('Download a mod/plugin by slug')
  .option('-v, --version <version>', 'Specific version to download')
  .option('-m, --minecraft <version>', 'Minecraft version filter')
  .option('-l, --loader <loader>', 'Loader filter')
  .option('-t, --type <type>', 'Version type: release, beta, alpha', 'release')
  .option('-f, --force', 'Force download even if folders don\'t exist')
  .action(async (slug: string, options: any) => {
    try {
      const projectPath = process.cwd();
      const configManager = new ConfigManager(projectPath);
      const api = new ModrinthAPI();

      let config: ModrinthConfig;
      try {
        config = await configManager.getConfig();
      } catch (error) {
        console.error(chalk.red('No config found. Run "mr init" first.'));
        process.exit(1);
      }

      const folders = await configManager.validateFolders(projectPath);
      
      if (!options.force) {
        if (config.type === 'mod' && !folders.mods) {
          console.error(chalk.red('Mods folder not found. Run "mr init" or use --force.'));
          process.exit(1);
        }
        if (config.type === 'plugin' && !folders.plugins) {
          console.error(chalk.red('Plugins folder not found. Run "mr init" or use --force.'));
          process.exit(1);
        }
      }

      console.log(chalk.blue(`Fetching project: ${slug}`));
      const project = await api.getProject(slug);

      let version: any;
      if (options.version) {
        const versions = await api.getProjectVersions(slug);
        version = versions.find(v => v.version_number === options.version);
        if (!version) {
          console.error(chalk.red(`Version ${options.version} not found.`));
          process.exit(1);
        }
      } else {
        const minecraftVersion = options.minecraft || config.minecraftVersion;
        const loader = options.loader || config.loader;
        const versionType = options.type as 'release' | 'beta' | 'alpha';
        
        version = await api.getLatestVersion(slug, minecraftVersion, loader, versionType);
        if (!version) {
          console.error(chalk.red('No compatible version found.'));
          process.exit(1);
        }
      }

      console.log(chalk.blue(`Downloading ${project.title} v${version.version_number}`));

      const downloadFolder = config.type === 'mod' ? config.modsFolder! : config.pluginsFolder!;
      const downloadPath = path.join(projectPath, downloadFolder);

      for (const file of version.files) {
        if (file.primary) {
          const filePath = path.join(downloadPath, file.filename);
          console.log(chalk.gray(`Downloading ${file.filename}...`));
          
          const fileData = await api.downloadFile(file.hashes.sha1);
          await fs.writeFile(filePath, fileData);
          
          console.log(chalk.green(`✓ Downloaded ${file.filename}`));
        }
      }

      console.log(chalk.green('✓ Download completed successfully!'));
    } catch (error) {
      console.error(chalk.red('Error downloading:'), error);
      process.exit(1);
    }
  });

program
  .command('info <slug>')
  .description('Get detailed information about a mod/plugin')
  .action(async (slug: string) => {
    try {
      const api = new ModrinthAPI();
      
      console.log(chalk.blue(`Fetching information for: ${slug}`));
      const project = await api.getProject(slug);
      const versions = await api.getProjectVersions(slug);

      console.log(chalk.yellow(`\n${project.title}`));
      console.log(chalk.gray(`Slug: ${project.slug}`));
      console.log(chalk.gray(`Type: ${project.project_type}`));
      console.log(chalk.gray(`Downloads: ${(project.downloads || 0).toLocaleString()}`));
      console.log(chalk.gray(`Follows: ${(project.follows || 0).toLocaleString()}`));
      console.log(chalk.gray(`Categories: ${project.categories?.join(', ') || 'None'}`));
      console.log(chalk.gray(`Loaders: ${project.loaders?.join(', ') || 'None'}`));
      console.log(chalk.gray(`Game Versions: ${project.game_versions?.join(', ') || 'None'}`));
      console.log(chalk.gray(`Author: ${project.author || 'Unknown'}`));
      
      if (project.description) {
        console.log(chalk.gray(`\nDescription: ${project.description.substring(0, 200)}...`));
      }

      console.log(chalk.yellow('\nRecent Versions:'));
      versions.slice(0, 5).forEach(v => {
        console.log(chalk.gray(`  ${v.version_number} (${v.version_type}) - ${v.name}`));
      });
    } catch (error: any) {
      if (error.response?.status === 408) {
        console.error(chalk.red('Request timed out. Please try again.'));
      } else if (error.response?.status === 404) {
        console.error(chalk.red('Project not found.'));
      } else {
        console.error(chalk.red('Error fetching info:'), error.message);
      }
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(async () => {
    try {
      const projectPath = process.cwd();
      const configManager = new ConfigManager(projectPath);
      const config = await configManager.getConfig();

      console.log(chalk.blue('Current Configuration:'));
      console.log(chalk.gray(`Type: ${config.type}`));
      console.log(chalk.gray(`Loader: ${config.loader}`));
      console.log(chalk.gray(`Minecraft Version: ${config.minecraftVersion}`));
      console.log(chalk.gray(`Mods Folder: ${config.modsFolder}`));
      console.log(chalk.gray(`Plugins Folder: ${config.pluginsFolder}`));
    } catch (error) {
      console.error(chalk.red('No config found. Run "mr init" first.'));
      process.exit(1);
    }
  });

program.parse();
