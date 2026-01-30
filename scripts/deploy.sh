#!/bin/bash

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

# Check argument
if [ $# -ne 1 ]; then
    print_error "Usage: $0 {prod|pre-prod|backup}"
    exit 1
fi

ENV=$1

case $ENV in
    prod)
        TARGET_PATH="/var/www/marius.click/html/contest"
        BASE_PATH="/contest"
        ;;
    pre-prod)
        TARGET_PATH="/var/www/marius.click/html/contest-preprod"
        BASE_PATH="/contest-preprod"
        ;;
    backup)
        TARGET_PATH="/var/www/marius.click/html/contest2"
        BASE_PATH="/contest2"
        ;;
    *)
        print_error "Invalid environment: $ENV. Use prod, pre-prod, or backup."
        exit 1
        ;;
esac

BACKUP_DIR="$HOME/backup/contest-data"

# Step 1: Build the project
print_step "Building the project..."
if ! npm run build; then
    print_error "Build failed."
    exit 1
fi
print_success "Build completed."

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
rm -rf "$TARGET_PATH"/*
print_success "Target directory cleaned."

# Step 4: Create target directory
print_step "Creating target directory..."
mkdir -p "$TARGET_PATH"
print_success "Target directory created."

# Step 5: Copy www/* to target
print_step "Copying files to target..."
cp -r www/* "$TARGET_PATH/"
print_success "Files copied."

# Step 6: Update paths in index.html
print_step "Updating paths in index.html..."
INDEX_FILE="$TARGET_PATH/index.html"
if [ -f "$INDEX_FILE" ]; then
    sed -i "s|src=\"|src=\"$BASE_PATH|g" "$INDEX_FILE"
    sed -i "s|href=\"|href=\"$BASE_PATH|g" "$INDEX_FILE"
    print_success "Paths updated."
else
    print_error "index.html not found."
    exit 1
fi

# Step 7: Restore API data if backup exists
print_step "Restoring API data..."
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
    mkdir -p "$TARGET_PATH/api/data"
    cp -r "$BACKUP_DIR"/* "$TARGET_PATH/api/data/"
    print_success "API data restored."
else
    print_success "No backup to restore."
fi

# Step 8: Set permissions
print_step "Setting permissions..."
if [ -d "$TARGET_PATH/api/data" ]; then
    chown -R debian:www-data "$TARGET_PATH/api/data"
    chmod -R g+rw "$TARGET_PATH/api/data"
    print_success "Permissions set."
else
    print_success "No API data directory to set permissions."
fi

print_success "Deployment to $ENV completed successfully! 🎉"