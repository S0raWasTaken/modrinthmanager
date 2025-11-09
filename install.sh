#!/usr/bin/env bash

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

fatal() {
	echo '[fatal]' "$@" >&2
	exit 1
}

echo "Installing Modrinth Manager CLI..."

# Check if npm is installed first
if ! command -v npm &> /dev/null; then
	fatal "npm is not installed. Please install Node.js and npm first."
fi

echo "Resolving npm dependencies..."
npm ci 2>/dev/null || npm i || fatal "Failed to install npm dependencies"

# Build the project
echo "Building project..."
npm run build || fatal "'npm run build' failed"

# Verify build output exists
[[ -d "dist" ]] || fatal "Build directory 'dist' not found"
[[ -f "dist/cli.js" ]] || fatal "Build output 'dist/cli.js' not found"

# Create installation directories
INSTALL_DIR="$HOME/.local/share/modrinth-manager"
BIN_DIR="$HOME/.local/bin"

echo "Creating installation directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR" || fatal "Failed to create directory $INSTALL_DIR"
mkdir -p "$BIN_DIR" || fatal "Failed to create directory $BIN_DIR"

# Copy files
echo "Copying files..."
cp -r dist/* "$INSTALL_DIR/" || fatal "Failed to copy dist files"
cp -r node_modules "$INSTALL_DIR/" || fatal "Failed to copy node_modules"

# Create executable script in bin directory that points to the installation directory
cat > "$BIN_DIR/mr" << EOF
#!/usr/bin/env bash
NODE_PATH="$INSTALL_DIR/node_modules" node "$INSTALL_DIR/cli.js" "\$@"
EOF

# Make executable
chmod +x "$BIN_DIR/mr" || fatal "Permission denied while executing 'chmod +x $BIN_DIR/mr'"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo "Adding to PATH..."
    
    # Only update shell configs that exist
    if [[ -f "$HOME/.bashrc" ]]; then
        echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$HOME/.bashrc"
    fi
    
    if [[ -f "$HOME/.zshrc" ]]; then
        echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$HOME/.zshrc"
    fi
    
    echo ""
    echo "Please restart your terminal or run:"
    [[ -f "$HOME/.bashrc" ]] && echo "  source ~/.bashrc"
    [[ -f "$HOME/.zshrc" ]] && echo "  source ~/.zshrc"
else
    echo "Already in PATH."
fi

echo ""
echo "Installation complete!"
echo "Installed to: $INSTALL_DIR"
echo ""
echo "You can now use 'mr' command from anywhere."
echo ""
echo "Examples:"
echo "  mr init"
echo "  mr search 'fabric api'"
echo "  mr download fabric-api"
echo "  mr info fabric-api"
