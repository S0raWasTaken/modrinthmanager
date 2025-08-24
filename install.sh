#!/bin/bash

echo "Installing Modrinth Manager CLI..."

# Build the project
echo "Building project..."
npm run build

# Create installation directory
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

# Copy files
echo "Copying files..."
cp -r dist/* "$INSTALL_DIR/"
cp -r node_modules "$INSTALL_DIR/"

# Create executable script
cat > "$INSTALL_DIR/mr" << 'EOF'
#!/bin/bash
node "$(dirname "$0")/cli.js" "$@"
EOF

# Make executable
chmod +x "$INSTALL_DIR/mr"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "Adding to PATH..."
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$HOME/.bashrc"
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$HOME/.zshrc" 2>/dev/null || true
    echo "Please restart your terminal or run: source ~/.bashrc"
else
    echo "Already in PATH."
fi

echo ""
echo "Installation complete!"
echo "You can now use 'mr' command from anywhere."
echo ""
echo "Examples:"
echo "  mr init"
echo "  mr search 'fabric api'"
echo "  mr download fabric-api"
echo "  mr info fabric-api"
