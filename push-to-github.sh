#!/bin/bash
set -e

echo "Setting up GitHub remote..."
git config user.email "noorislam@problematlas.dev"
git config user.name "Noor islam"

# Remove old github remote if exists
git remote remove github 2>/dev/null || true

# Add GitHub remote with token
git remote add github "https://Noorislam-XD:${GITHUB_TOKEN}@github.com/Noorislam-XD/ProblemAtlas-app.git"

echo "Pushing to GitHub..."
git push github main

echo ""
echo "Done! Your code is live at:"
echo "https://github.com/Noorislam-XD/ProblemAtlas-app"
