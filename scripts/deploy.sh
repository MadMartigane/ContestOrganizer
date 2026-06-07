#!/bin/bash
set -euo pipefail

# =====================================================================
# ContestOrganizer — Deploy Script (SvelteKit)
# Usage: ./scripts/deploy.sh {prod|pre-prod} [--dry-run]
#
# VITE_ env vars are baked at build time by Vite.
# BASE_PATH is set at build time for paths.base in svelte.config.js.
# =====================================================================

# Load .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^\s*$' | xargs)
fi

# Colors & emojis
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
ROCKET="🚀"
CHECK="✅"
CROSS="❌"

# Print helpers
print_step() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} ${ROCKET} $1"
    else
        echo -e "${ROCKET} $1"
    fi
}
print_success() { echo -e "${CHECK} $1"; }
print_error()   { echo -e "${CROSS} $1" >&2; }

should_skip() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY-RUN]${NC}   ⏭️  $1 (skipped)"
        return 0
    fi
    return 1
}

# Parse --dry-run
DRY_RUN=false
for arg in "$@"; do
    if [ "$arg" = "--dry-run" ]; then
        DRY_RUN=true
        break
    fi
done
set -- "${@//--dry-run/}"
set -- $(echo "$@" | xargs)

# Validate environment argument
if [[ "$1" != "prod" && "$1" != "pre-prod" ]]; then
    print_error "Usage: $0 {prod|pre-prod} [--dry-run]"
    exit 1
fi

ENV=$1

# Validate required env vars
REQUIRED_KEYS=("VITE_API_SPORTS_KEY")
for key in "${REQUIRED_KEYS[@]}"; do
    if [ -z "${!key:-}" ]; then
        print_error "Environment variable $key is not set."
        exit 1
    fi
done

# Environment configuration
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
BUILD_DIR="build"
STAGING_DIR="$HOME/staging/contest-deploy"

# Step 1: Build with BASE_PATH (Vite bakes in VITE_ vars + paths.base)
print_step "Building for $ENV (BASE_PATH=$BASE_PATH)..."
if should_skip "Would run: BASE_PATH=$BASE_PATH pnpm build"; then
    :
else
    if ! BASE_PATH="$BASE_PATH" pnpm build; then
        print_error "Build failed. Ensure VITE_API_SPORTS_KEY is set."
        exit 1
    fi
fi
print_success "Build completed."

# Step 1b: Verify build output exists
print_step "Verifying build output..."
if should_skip "Would verify $BUILD_DIR/index.html exists"; then
    :
else
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        print_error "$BUILD_DIR/index.html not found. Build may have failed."
        exit 1
    fi
fi
print_success "Build output verified."

# Step 2: Backup existing API data
print_step "Backing up existing API data..."
if should_skip "Would backup $TARGET_PATH/api/data"; then
    :
else
    if [ -d "$TARGET_PATH/api/data" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$TARGET_PATH/api/data"/* "$BACKUP_DIR/" 2>/dev/null || true
        print_success "API data backed up."
    else
        print_success "No API data to backup."
    fi
fi

# Step 3: Atomic deploy via staging directory
print_step "Deploying to staging..."
if should_skip "Would stage to $STAGING_DIR"; then
    :
else
    # Clean and populate staging
    rm -rf "$STAGING_DIR"
    mkdir -p "$STAGING_DIR"
    cp -r "$BUILD_DIR"/* "$STAGING_DIR/"

    # Restore API data into staging (before swap)
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        mkdir -p "$STAGING_DIR/api/data"
        cp -r "$BACKUP_DIR"/* "$STAGING_DIR/api/data/"
    fi

    # Set permissions in staging
    if [ -d "$STAGING_DIR/api/data" ]; then
        chown -R debian:www-data "$STAGING_DIR/api/data"
        chmod -R g+rw "$STAGING_DIR/api/data"
    fi
fi
print_success "Staging complete."

# Step 4: Atomic swap
print_step "Swapping $STAGING_DIR → $TARGET_PATH..."
if should_skip "Would swap $STAGING_DIR to $TARGET_PATH"; then
    :
else
    # Remove old target (keep parent dir)
    rm -rf "$TARGET_PATH"
    # Atomic rename (same filesystem)
    mv "$STAGING_DIR" "$TARGET_PATH"
fi
print_success "Deploy swapped."

# Summary
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  DRY-RUN COMPLETE${NC}"
    echo -e "${YELLOW}  No files were deployed${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    exit 0
fi

print_success "Deployment to $ENV completed successfully! 🎉"
