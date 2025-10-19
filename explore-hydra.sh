#!/usr/bin/env bash
# ==========================================
# Hydra Explorer CLI
# Author: Sam + GPT-5 | MIT/Harvard standards :)
# ==========================================

HYDRA_ROOT="$(pwd)"

# Color setup
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RESET="\033[0m"

banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║                 HYDRA EXPLORER v1.0                ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo -e "${RESET}"
}

show_main_menu() {
    clear
    banner
    echo -e "${YELLOW}Choose a section to explore:${RESET}"
    echo "1) Core Orchestration (hydra-master, brain, spawner)"
    echo "2) API Catalog & Microservices"
    echo "3) Docker & Deployment"
    echo "4) Experiments / Research Modules"
    echo "5) Social Automation Kit"
    echo "6) Data & Templates"
    echo "7) GitHub Actions / CI Workflows"
    echo "8) Quick Search"
    echo "9) Stats Summary"
    echo "0) Exit"
    echo
    read -rp "Enter choice: " CHOICE
    handle_choice "$CHOICE"
}

open_in_nano() {
    local path="$1"
    if [ -f "$path" ]; then
        nano "$path"
    elif [ -d "$path" ]; then
        ls -l --color=always "$path" | less -R
    else
        echo "Path not found: $path"
    fi
}

handle_choice() {
    case "$1" in
        1)
            echo -e "${GREEN}Opening Core Orchestration Files...${RESET}"
            select f in $(ls hydra-*.js); do open_in_nano "$f"; break; done
            ;;
        2)
            echo -e "${GREEN}Exploring API Catalog...${RESET}"
            open_in_nano "api-catalog"
            ;;
        3)
            echo -e "${GREEN}Viewing Docker & Deployment Files...${RESET}"
            open_in_nano "docker-compose.yml"
            ;;
        4)
            echo -e "${GREEN}Exploring Experiments...${RESET}"
            open_in_nano "sam-experiment"
            ;;
        5)
            echo -e "${GREEN}Opening Social Automation Kit...${RESET}"
            open_in_nano "social-automation-kit"
            ;;
        6)
            echo -e "${GREEN}Exploring Data & Templates...${RESET}"
            open_in_nano "data"
            ;;
        7)
            echo -e "${GREEN}Opening GitHub Workflows...${RESET}"
            open_in_nano ".github/workflows"
            ;;
        8)
            quick_search
            ;;
        9)
            show_stats
            ;;
        0)
            echo "Goodbye, operator."
            exit 0
            ;;
        *)
            echo "Invalid option. Try again."
            ;;
    esac
    read -rp "Press Enter to return to menu..." _
    show_main_menu
}

quick_search() {
    echo -e "${YELLOW}Enter keyword to search:${RESET}"
    read -rp "> " KEY
    if command -v rg &> /dev/null; then
        rg "$KEY" -tjs --stats | less -R
    else
        grep -R "$KEY" . --color=always | less -R
    fi
}

show_stats() {
    echo -e "${CYAN}Collecting Hydra stats...${RESET}"
    echo
    echo "Total files:" $(find . -type f | wc -l)
    echo "Total directories:" $(find . -type d | wc -l)
    echo "JavaScript files:" $(find . -name '*.js' | wc -l)
    echo "Shell scripts:" $(find . -name '*.sh' | wc -l)
    echo "Dockerfiles:" $(find . -name 'Dockerfile*' | wc -l)
    echo
    du -sh * | sort -h | tail -n 15
    echo
}

# Run the menu
show_main_menu
