#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
BROOM="🧹"
PACKAGE="📦"
FOLDER="📁"

# Function to print step
print_step() {
    echo -e "${ROCKET} $1"
}

# Function to print success
print_success() {
    echo -e "${CHECK} $1"
}

# Function to print error
print_error() {
    echo -e "${CROSS} $1"
}

# Function to print info
print_info() {
    echo -e "${FOLDER} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW} $1 ${NC}"
}

# Exit on any error
set -e

# Step 1: Clean and create www directory
print_step "Cleaning build directories..."
rm -rf www
mkdir -p www
print_success "Build directories cleaned."

# Step 3: Build Vite
print_step "Building Vite..."
if ! pnpm run vite:build; then
    print_error "Vite build failed."
    exit 1
fi
print_success "Vite build completed."

# Step 4: Clean extra files from vanilla build
print_step "Cleaning extra files from vanilla build..."
rm -f www/vanilla/index.html
rm -f www/vanilla/host.config.json
rm -f www/vanilla/manifest.json
rm -f www/vanilla/vanilla.umd.cjs
rm -f www/vanilla/vanilla.umd.cjs.map
rm -rf www/vanilla/build
print_success "Extra files removed."

# Step 4.5: Update index.html to use production vanilla bundle
print_step "Updating index.html for production vanilla bundle..."
if [ -f "www/index.html" ]; then
    sed -i 's|/vanilla-entry.ts|/vanilla/vanilla.js|g' www/index.html
    print_success "index.html updated for production"
else
    print_warning "www/index.html not found"
fi

# Step 5: Output summary
echo ""
echo "========================================"
print_success "Build completed successfully!"
echo "========================================"
echo ""

# Count and list files in www/vanilla/
if [ -d "www/vanilla" ]; then
    VANILLA_COUNT=$(find www/vanilla -type f | wc -l)
    print_info "Vanilla output (www/vanilla/): $VANILLA_COUNT files"
    echo ""
    ls -la www/vanilla/ 2>/dev/null || true
    
    # Show size of vanilla.js
    if [ -f "www/vanilla/vanilla.js" ]; then
        VANILLA_SIZE=$(du -h www/vanilla/vanilla.js | cut -f1)
        echo ""
        print_info "vanilla.js size: $VANILLA_SIZE"
    fi
else
    print_info "Vanilla output (www/vanilla/): not found"
fi

echo ""
print_success "All builds finished!"
