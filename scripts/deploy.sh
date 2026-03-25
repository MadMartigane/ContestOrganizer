#!/bin/bash

# =====================================================================
# @LLM-WARNING: CONFIGURATION PARITY REQUIRED
# If you add, remove, or modify environment variables here, you MUST:
# 1. Make the exact same change in the Vite middleware (vite.config.ts)
# Read docs/CONFIG_MANAGEMENT.md before modifying this section.
# =====================================================================

# Load .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
CROSS="❌"

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

# Function to print step with dry-run indicator
print_step() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} ${ROCKET} $1"
    else
        echo -e "${ROCKET} $1"
    fi
}

# Function to check if we should skip destructive operations
should_skip() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN]${NC}   ⏭️  $1 (skipped)"
        return 0
    fi
    return 1
}

# Validate version increment argument
VALID_INCREMENTS=("patch" "minor" "major")
VERSION_INCREMENT="patch"  # Default
DRY_RUN=false

# Detect --dry-run flag (order-independent)
for arg in "$@"; do
    if [ "$arg" = "--dry-run" ]; then
        DRY_RUN=true
        break
    fi
done

# Remove --dry-run for clean argument parsing
set -- "${@//--dry-run/}"
# Clean up any resulting empty arguments
set -- $(echo "$@" | xargs)

if [ -n "$2" ]; then
    VERSION_INCREMENT="$2"
    # Check if the provided value is in the valid list
    if [[ ! " ${VALID_INCREMENTS[@]} " =~ " ${VERSION_INCREMENT} " ]]; then
        print_error "Error: Invalid version increment '${VERSION_INCREMENT}'. Expected: patch, minor, or major."
        exit 1
    fi
fi

# Check argument
if [[ "$1" != "prod" && "$1" != "pre-prod" ]]; then
    print_error "Usage: $0 {prod|pre-prod}"
    exit 1
fi

ENV=$1

# Define REQUIRED_KEYS
REQUIRED_KEYS=("VITE_API_SPORTS_KEY")

# Verify REQUIRED_KEYS
for key in "${REQUIRED_KEYS[@]}"; do
    if [ -z "${!key}" ]; then
        print_error "Environment variable $key is not set."
        exit 1
    fi
done

case $ENV in
    prod)
        TARGET_PATH="/var/www/marius.click/html/contest"
        BASE_PATH="/contest"
        ;;
    pre-prod)
        TARGET_PATH="/var/www/marius.click/html/contest-preprod"
        BASE_PATH="/contest-preprod"
        ;;
esac

BACKUP_DIR="$HOME/backup/contest-data"

# Step 0: Generate status data from TODO.md with version increment
print_step "Generating status data..."
if [ "$DRY_RUN" = true ]; then
    if ! pnpm exec tsx scripts/generate-status.ts "$VERSION_INCREMENT" --skip-version; then
        print_error "Status generation failed."
        exit 1
    fi
else
    if ! pnpm exec tsx scripts/generate-status.ts "$VERSION_INCREMENT"; then
        print_error "Status generation failed."
        exit 1
    fi
fi
print_success "Status data generated."

# Step 1: Build the project (requires VITE_API_SPORTS_KEY in environment)
print_step "Building the project..."
if ! pnpm run build; then
    print_error "Build failed. Ensure VITE_API_SPORTS_KEY is set in environment."
    exit 1
fi
print_success "Build completed."

# Step 1b: Generate config
print_step "Generating config..."
echo "window.APP_CONFIG = {" > www/config.js
for key in "${REQUIRED_KEYS[@]}"; do
    # Strip VITE_ prefix
    config_key=${key#VITE_}
    echo "  $config_key: '${!key}'," >> www/config.js
done
echo "};" >> www/config.js
print_success "Config generated."

# Step 2: Backup existing API data if exists
print_step "Backing up existing API data..."
if [ -d "$TARGET_PATH/api/data" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$TARGET_PATH/api/data"/* "$BACKUP_DIR/" 2>/dev/null || true
    print_success "API data backed up."
else
    print_success "No API data to backup."
fi

# Step 3: Clean target directory
print_step "Cleaning target directory..."
if should_skip "Would remove all files from $TARGET_PATH"; then
    :
else
    rm -rf "$TARGET_PATH"/*
fi
print_success "Target directory cleaned."

# Step 4: Create target directory
print_step "Creating target directory..."
mkdir -p "$TARGET_PATH"
print_success "Target directory created."

# Step 5: Copy www/* to target
print_step "Copying files to target..."
if should_skip "Would copy www/* to $TARGET_PATH"; then
    :
else
    cp -r www/* "$TARGET_PATH/"
fi
print_success "Files copied."

# Step 5b: Verify vanilla bundle was copied
print_step "Verifying vanilla bundle..."
if should_skip "Would verify $TARGET_PATH/vanilla exists"; then
    :
else
    if [ -d "$TARGET_PATH/vanilla" ]; then
        print_success "Vanilla directory copied."
    else
        print_error "Vanilla directory not found."
        exit 1
    fi
fi

# Step 6: Update paths in index.html
print_step "Updating paths in index.html..."
if should_skip "Would modify $TARGET_PATH/index.html"; then
    :
else
    INDEX_FILE="$TARGET_PATH/index.html"
    if [ -f "$INDEX_FILE" ]; then
        sed -i "s|src=\"|src=\"$BASE_PATH|g" "$INDEX_FILE"
        sed -i "s|href=\"|href=\"$BASE_PATH|g" "$INDEX_FILE"
        print_success "Paths updated."
    else
        print_error "index.html not found."
        exit 1
    fi
fi

# Step 7: Restore API data if backup exists
print_step "Restoring API data..."
if should_skip "Would restore API data to $TARGET_PATH/api/data"; then
    :
else
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        mkdir -p "$TARGET_PATH/api/data"
        cp -r "$BACKUP_DIR"/* "$TARGET_PATH/api/data/"
        print_success "API data restored."
    else
        print_success "No backup to restore."
    fi
fi

# Step 8: Set permissions
print_step "Setting permissions..."
if should_skip "Would set ownership/permissions on $TARGET_PATH"; then
    :
else
    if [ -d "$TARGET_PATH/api/data" ]; then
        chown -R debian:www-data "$TARGET_PATH/api/data"
        chmod -R g+rw "$TARGET_PATH/api/data"
        print_success "Permissions set."
    else
        print_success "No API data directory to set permissions."
    fi
fi

# Print dry-run summary
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  DRY-RUN COMPLETE${NC}"
    echo -e "${YELLOW}  No files were copied to target server${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    exit 0
fi

if [ "$DRY_RUN" = true ]; then
    print_success "Dry-run deployment to $ENV completed. 🎉"
else
    print_success "Deployment to $ENV completed successfully! 🎉"
fi
