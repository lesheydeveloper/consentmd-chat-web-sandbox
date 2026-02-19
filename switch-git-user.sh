#!/bin/bash

# Git User Switcher and Dual Push Script
# Usage: ./switch-git-user.sh [blessednur|leshey|status|push-both]

CURRENT_USER_NAME=$(git config user.name)
CURRENT_USER_EMAIL=$(git config user.email)

BLESSEDNUR_NAME="BlessedNur"
BLESSEDNUR_EMAIL="blessednur67@gmail.com"

LESHEY_NAME="lesheydeveloper"
LESHEY_NAME_FULL="lesheydeveloper"
LESHEY_EMAIL="lesheydeveloper@gmail.com"

REPO_URL="git@github.com:lesheydeveloper/consentmd-chat-web-sandbox.git"
CURRENT_BRANCH=$(git branch --show-current)

# Function to display current git user
show_status() {
    echo "Current Git Configuration:"
    echo "  Name:  $(git config user.name)"
    echo "  Email: $(git config user.email)"
    echo ""
    echo "Current Branch: $CURRENT_BRANCH"
    echo ""
    
    # Check if dual remotes are configured
    if git remote get-url origin-blessednur &>/dev/null; then
        echo "✓ Dual remotes configured"
        echo "  origin-blessednur: $(git remote get-url origin-blessednur 2>/dev/null || echo 'Not configured')"
        echo "  origin-leshey: $(git remote get-url origin-leshey 2>/dev/null || echo 'Not configured')"
    else
        echo "⚠ Dual remotes not configured. Run: $0 setup-dual"
    fi
    echo ""
}

# Function to set git user
set_git_user() {
    local name=$1
    local email=$2
    git config user.name "$name"
    git config user.email "$email"
    echo "✓ Git user switched to:"
    echo "  Name:  $name"
    echo "  Email: $email"
}

# Function to switch to blessednur
switch_to_blessednur() {
    set_git_user "$BLESSEDNUR_NAME" "$BLESSEDNUR_EMAIL"
}

# Function to switch to lesheydeveloper
switch_to_leshey() {
    set_git_user "$LESHEY_NAME_FULL" "$LESHEY_EMAIL"
}

# Function to setup dual remotes
setup_dual_remotes() {
    echo "Setting up dual remotes for both users..."
    
    # Add remotes if they don't exist
    if ! git remote get-url origin-blessednur &>/dev/null; then
        git remote add origin-blessednur "$REPO_URL"
        echo "✓ Added remote: origin-blessednur"
    else
        echo "✓ Remote origin-blessednur already exists"
    fi
    
    if ! git remote get-url origin-leshey &>/dev/null; then
        git remote add origin-leshey "$REPO_URL"
        echo "✓ Added remote: origin-leshey"
    else
        echo "✓ Remote origin-leshey already exists"
    fi
    
    echo ""
    echo "Note: You'll need to configure SSH keys or credentials for each user."
    echo "For SSH, ensure your ~/.ssh/config has entries for both users."
    echo ""
}

# Function to push as both users
push_both() {
    echo "Pushing with both users' credentials..."
    echo ""
    
    # Check if we have uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠ You have uncommitted changes."
        read -p "Do you want to commit them first? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Staging all changes..."
            git add -A
            read -p "Enter commit message: " COMMIT_MSG
            if [ -z "$COMMIT_MSG" ]; then
                COMMIT_MSG="Update"
            fi
            
            # Check if last commit has co-author, if not add it
            LAST_COMMIT=$(git log -1 --pretty=%B)
            if [[ ! "$LAST_COMMIT" =~ "Co-authored-by" ]]; then
                CURRENT_NAME=$(git config user.name)
                CURRENT_EMAIL=$(git config user.email)
                
                if [ "$CURRENT_EMAIL" = "$BLESSEDNUR_EMAIL" ]; then
                    CO_AUTHOR="Co-authored-by: $LESHEY_NAME_FULL <$LESHEY_EMAIL>"
                else
                    CO_AUTHOR="Co-authored-by: $BLESSEDNUR_NAME <$BLESSEDNUR_EMAIL>"
                fi
                
                FULL_MSG="$COMMIT_MSG

$CO_AUTHOR"
                git commit -m "$FULL_MSG"
            else
                git commit -m "$COMMIT_MSG"
            fi
        else
            echo "Please commit your changes first."
            exit 1
        fi
    fi
    
    # Check if last commit has co-author
    LAST_COMMIT=$(git log -1 --pretty=%B)
    if [[ ! "$LAST_COMMIT" =~ "Co-authored-by" ]]; then
        echo "⚠ Last commit doesn't have a co-author."
        echo "Amending commit to include both users..."
        
        CURRENT_NAME=$(git config user.name)
        CURRENT_EMAIL=$(git config user.email)
        COMMIT_MSG=$(git log -1 --pretty=%B)
        
        if [ "$CURRENT_EMAIL" = "$BLESSEDNUR_EMAIL" ]; then
            CO_AUTHOR="Co-authored-by: $LESHEY_NAME_FULL <$LESHEY_EMAIL>"
        else
            CO_AUTHOR="Co-authored-by: $BLESSEDNUR_NAME <$BLESSEDNUR_EMAIL>"
        fi
        
        FULL_MSG="$COMMIT_MSG

$CO_AUTHOR"
        git commit --amend -m "$FULL_MSG" --no-edit
        echo "✓ Added co-author to commit"
    fi
    
    # Push to origin (both users' contributions are in the commit)
    echo ""
    echo "Pushing to origin..."
    if git push origin "$CURRENT_BRANCH"; then
        echo "✓ Successfully pushed! Both users are credited in the commit."
    else
        echo "✗ Failed to push. Check your credentials and network connection."
        exit 1
    fi
}

# Function to commit with co-author (both users)
commit_with_coauthor() {
    if [ -z "$2" ]; then
        echo "Usage: $0 commit-coauthor \"Your commit message\""
        exit 1
    fi
    
    COMMIT_MSG="$2"
    
    # Determine current user and set co-author
    CURRENT_NAME=$(git config user.name)
    CURRENT_EMAIL=$(git config user.email)
    
    if [ "$CURRENT_EMAIL" = "$BLESSEDNUR_EMAIL" ]; then
        # Current user is BlessedNur, add leshey as co-author
        CO_AUTHOR="Co-authored-by: $LESHEY_NAME_FULL <$LESHEY_EMAIL>"
    else
        # Current user is leshey, add BlessedNur as co-author
        CO_AUTHOR="Co-authored-by: $BLESSEDNUR_NAME <$BLESSEDNUR_EMAIL>"
    fi
    
    FULL_MSG="$COMMIT_MSG

$CO_AUTHOR"
    
    git add -A
    git commit -m "$FULL_MSG"
    
    echo "✓ Committed with co-author:"
    echo "  Author: $CURRENT_NAME <$CURRENT_EMAIL>"
    echo "  Co-Author: $CO_AUTHOR"
}

# Function to push to both remotes (simpler approach)
push_both_simple() {
    echo "Pushing to both remotes simultaneously..."
    echo ""
    
    if ! git remote get-url origin-blessednur &>/dev/null || ! git remote get-url origin-leshey &>/dev/null; then
        echo "⚠ Dual remotes not configured. Setting up now..."
        setup_dual_remotes
    fi
    
    # Push to both remotes
    echo "Pushing to origin-blessednur..."
    if git push origin-blessednur "$CURRENT_BRANCH"; then
        echo "✓ Pushed to origin-blessednur"
    else
        echo "✗ Failed to push to origin-blessednur"
    fi
    
    echo ""
    echo "Pushing to origin-leshey..."
    if git push origin-leshey "$CURRENT_BRANCH"; then
        echo "✓ Pushed to origin-leshey"
    else
        echo "✗ Failed to push to origin-leshey"
    fi
    
    echo ""
    echo "✓ Push complete!"
}

# Main script logic
case "$1" in
    blessednur|blessed|bn)
        switch_to_blessednur
        ;;
    leshey|lesheydeveloper|current|original|back)
        switch_to_leshey
        ;;
    status|info)
        show_status
        ;;
    setup-dual|setup)
        setup_dual_remotes
        ;;
    push-both|pushboth|dual-push|push)
        push_both
        ;;
    push-simple|pushboth-simple)
        push_both_simple
        ;;
    commit-coauthor|coauthor)
        commit_with_coauthor "$@"
        ;;
    *)
        echo "Git User Switcher & Dual Push"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  blessednur, blessed, bn     - Switch to BlessedNur (blessednur67@gmail.com)"
        echo "  leshey, lesheydeveloper     - Switch to lesheydeveloper (lesheydeveloper@gmail.com)"
        echo "  status, info                 - Show current git user configuration"
        echo "  setup-dual, setup           - Set up dual remotes for both users"
        echo "  push-both, pushboth, push   - Push to both remotes as current user"
        echo "  push-simple                 - Push to both remotes (simpler, no author change)"
        echo "  commit-coauthor \"msg\"       - Commit with both users as co-authors"
        echo ""
        show_status
        ;;
esac
