# Modrinth Manager (mr)

A powerful CLI tool for managing Modrinth mods and plugins with automatic folder detection and configuration management.

## Features

- 🔍 **Search mods/plugins** on Modrinth with advanced filtering
- 📥 **Download mods/plugins** by slug with automatic version selection
- ⚙️ **Project configuration** with per-folder settings
- 🎯 **Smart version selection** based on Minecraft version and loader
- 📁 **Automatic folder detection** and creation
- 🏷️ **Support for all loaders** (Fabric, Forge, NeoForge, Quilt, Paper, Spigot, Bukkit)

## Installation

### Option 1: Global npm installation (Recommended)
```bash
npm install -g modrinth-manager
```

### Option 2: Local installation
```bash
npm install modrinth-manager
```

### Option 3: Manual installation

#### Windows
```bash
# Using PowerShell (as Administrator)
.\install.ps1

# Or using batch file
install.bat
```

#### Linux/macOS
```bash
# Make script executable and run
chmod +x install.sh
./install.sh
```

### Option 4: From source
```bash
git clone <repository-url>
cd modrinth-manager
npm install
npm run build
# Then use one of the manual installation methods above
```

## Quick Start

1. **Initialize a project:**
   ```bash
   mr init
   ```
   This will create a `.modrinth.json` configuration file and set up your project.

2. **Search for mods:**
   ```bash
   mr search "fabric api"
   ```

3. **Download a mod:**
   ```bash
   mr download fabric-api
   ```

## Commands

### `mr init`
Initialize a new Modrinth project in the current directory.

```bash
mr init
```

This will prompt you for:
- Project type (mod/plugin)
- Loader (Fabric, Forge, NeoForge, Quilt, Paper, Spigot, Bukkit)
- Minecraft version
- Folder names for mods/plugins

### `mr search <query>`
Search for mods and plugins on Modrinth.

```bash
# Basic search
mr search "fabric api"

# Search with options
mr search "fabric api" --limit 20 --index downloads
```

Options:
- `-l, --limit <number>`: Number of results (default: 10)
- `-i, --index <type>`: Sort by relevance, downloads, follows, newest, updated

### `mr download <slug>`
Download a mod or plugin by its slug.

```bash
# Download latest compatible version
mr download fabric-api

# Download specific version
mr download fabric-api --version 0.91.0+1.20.1

# Download with custom filters
mr download fabric-api --minecraft 1.20.1 --loader fabric --type release
```

Options:
- `-v, --version <version>`: Specific version to download
- `-m, --minecraft <version>`: Minecraft version filter
- `-l, --loader <loader>`: Loader filter
- `-t, --type <type>`: Version type (release, beta, alpha)
- `-f, --force`: Force download even if folders don't exist

### `mr info <slug>`
Get detailed information about a mod or plugin.

```bash
mr info fabric-api
```

### `mr config`
Show current project configuration.

```bash
mr config
```

## Configuration

The tool creates a `.modrinth.json` file in your project directory:

```json
{
  "version": "",
  "type": "mod",
  "loader": "fabric",
  "minecraftVersion": "1.20.1",
  "modsFolder": "mods",
  "pluginsFolder": "plugins"
}
```

## Examples

### Setting up a Fabric modpack:
```bash
# Initialize project
mr init
# Choose: mod, fabric, 1.20.1

# Search for popular mods
mr search "inventory"

# Download essential mods
mr download fabric-api
mr download sodium
mr download lithium
mr download starlight
```

### Setting up a Paper server:
```bash
# Initialize project
mr init
# Choose: plugin, paper, 1.20.1

# Search for plugins
mr search "economy"

# Download plugins
mr download vault
mr download essentialsx
```

## Version Selection Logic

When downloading without specifying a version, the tool will:

1. Filter versions by your configured Minecraft version
2. Filter by your configured loader
3. Filter by version type (release by default)
4. Select the latest version that matches all criteria

## Folder Structure

The tool expects and creates the following structure:
```
your-project/
├── .modrinth.json          # Configuration file
├── mods/                   # For mod projects
│   ├── fabric-api.jar
│   └── sodium.jar
└── plugins/                # For plugin projects
    ├── vault.jar
    └── essentialsx.jar
```

## Error Handling

- **No config found**: Run `mr init` first
- **Folder not found**: Run `mr init` or use `--force`
- **No compatible version**: Check your Minecraft version and loader settings
- **Download failed**: Check your internet connection and try again

## Contributing

This project is open source. Feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.
