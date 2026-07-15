#!/usr/bin/env bash
# ==============================================================================
# deploy_to_github.sh - Automates deployment of the Engineering Portfolio
# Target account: https://github.com/uttammaurya7167-tech
# ==============================================================================

# ANSI Color Codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}             GitHub Portfolio Deployer: advanced-engineering-portfolio  ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}[Error] Git is not installed or not found on PATH.${NC}"
    exit 1
fi

# Ensure we are in the correct root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# 1. Initialize Git repository if needed
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}[1/5] Initializing local Git repository...${NC}"
    git init
    git branch -M main
else
    echo -e "${GREEN}[1/5] Local Git repository already initialized.${NC}"
fi

# 2. Configure Git remote URL
TARGET_REPO="https://github.com/uttammaurya7167-tech/advanced-engineering-portfolio.git"
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)

if [ -z "$CURRENT_REMOTE" ]; then
    echo -e "${YELLOW}[2/5] Setting Git remote origin to: $TARGET_REPO${NC}"
    git remote add origin "$TARGET_REPO"
else
    if [ "$CURRENT_REMOTE" != "$TARGET_REPO" ]; then
        echo -e "${YELLOW}[2/5] Updating Git remote origin from '$CURRENT_REMOTE' to '$TARGET_REPO'${NC}"
        git remote set-url origin "$TARGET_REPO"
    else
        echo -e "${GREEN}[2/5] Git remote origin already points to the correct target URL.${NC}"
    fi
fi

# 3. Add and commit all changes
echo -e "${YELLOW}[3/5] Staging files...${NC}"
git add .

# Check if there are changes to commit
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}Committing staged changes...${NC}"
    git commit -m "feat: initial commit structure of advanced-engineering-portfolio"
else
    echo -e "${GREEN}[3/5] No changes to commit (working tree clean).${NC}"
fi

# 4. Handle GitHub Repository Creation (using gh CLI if present)
REPO_EXISTS=true
if command -v gh &> /dev/null; then
    echo -e "${YELLOW}[4/5] GitHub CLI (gh) detected. Verifying authentication status...${NC}"
    if gh auth status &>/dev/null; then
        echo -e "${GREEN}   Authenticated with GitHub CLI.${NC}"
        
        # Check if the repository already exists on GitHub
        if ! gh repo view uttammaurya7167-tech/advanced-engineering-portfolio &>/dev/null; then
            echo -e "${YELLOW}   Repository 'advanced-engineering-portfolio' does not exist on GitHub.${NC}"
            echo -e "${YELLOW}   Attempting to create public repository on GitHub...${NC}"
            
            if gh repo create uttammaurya7167-tech/advanced-engineering-portfolio --public --source=. --description "Production-Grade Engineering and Software Portfolio" --confirm; then
                echo -e "${GREEN}   Repository created successfully on GitHub!${NC}"
                REPO_EXISTS=true
            else
                echo -e "${RED}   Failed to create repository via GitHub CLI. Continuing to manual push...${NC}"
                REPO_EXISTS=false
            fi
        else
            echo -e "${GREEN}   Repository already exists on GitHub.${NC}"
        fi
    else
        echo -e "${YELLOW}   GitHub CLI is installed but not authenticated.${NC}"
        echo -e "${YELLOW}   To authenticate, run: ${NC}gh auth login"
        REPO_EXISTS=false
    fi
else
    echo -e "${YELLOW}[4/5] GitHub CLI (gh) not detected.${NC}"
    echo -e "${YELLOW}      Please ensure you have manually created the repository at:${NC}"
    echo -e "      https://github.com/new (Name: advanced-engineering-portfolio)"
    REPO_EXISTS=false
fi

# 5. Push to GitHub
echo -e "${YELLOW}[5/5] Pushing main branch to GitHub...${NC}"
echo -e "${BLUE}Running: git push -u origin main${NC}"

if git push -u origin main; then
    echo -e "${GREEN}======================================================================${NC}"
    echo -e "${GREEN}✅ SUCCESS: Portfolio deployed successfully!${NC}"
    echo -e "${GREEN}🌐 Live URL: https://github.com/uttammaurya7167-tech/advanced-engineering-portfolio${NC}"
    echo -e "${GREEN}======================================================================${NC}"
else
    echo -e "${RED}======================================================================${NC}"
    echo -e "${RED}❌ Error pushing to GitHub.${NC}"
    echo -e "${YELLOW}Possibilities:${NC}"
    echo -e " 1. The repository does not exist on your account. Create it first: https://github.com/new"
    echo -e " 2. You are not authenticated. Run: ${NC}git config --global credential.helper manager${NC}"
    echo -e "    or enter your GitHub Personal Access Token (PAT) when prompted."
    echo -e "${RED}======================================================================${NC}"
    exit 1
fi
