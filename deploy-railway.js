#!/usr/bin/env node

/**
 * Railway Deployment Helper Script
 * Smart Waste Management System
 *
 * This script helps automate Railway deployment and troubleshooting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
    console.log('\n' + '='.repeat(60));
    log(message, 'cyan');
    console.log('='.repeat(60));
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Check if Railway CLI is installed
function checkRailwayCLI() {
    try {
        execSync('railway --version', { stdio: 'ignore' });
        return true;
    } catch (err) {
        return false;
    }
}

// Install Railway CLI
function installRailwayCLI() {
    try {
        log('Installing Railway CLI...', 'yellow');
        execSync('npm install -g @railway/cli', { stdio: 'inherit' });
        success('Railway CLI installed successfully');
        return true;
    } catch (err) {
        error('Failed to install Railway CLI');
        return false;
    }
}

// Clean npm dependencies
function cleanDependencies() {
    header('Cleaning Dependencies');

    try {
        // Remove node_modules and package-lock.json
        if (fs.existsSync('node_modules')) {
            log('Removing node_modules...', 'yellow');
            fs.rmSync('node_modules', { recursive: true, force: true });
        }

        if (fs.existsSync('package-lock.json')) {
            log('Removing package-lock.json...', 'yellow');
            fs.unlinkSync('package-lock.json');
        }

        // Reinstall dependencies
        log('Reinstalling dependencies...', 'yellow');
        execSync('npm install', { stdio: 'inherit' });

        success('Dependencies cleaned and reinstalled');
        return true;
    } catch (err) {
        error(`Failed to clean dependencies: ${err.message}`);
        return false;
    }
}

// Check environment setup
function checkEnvironment() {
    header('Environment Check');

    const requiredFiles = [
        'package.json',
        'backend/server.js',
        'railway.json',
        'nixpacks.toml'
    ];

    let allGood = true;

    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            success(`${file} exists`);
        } else {
            error(`${file} is missing`);
            allGood = false;
        }
    });

    // Check package.json engines
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (packageJson.engines && packageJson.engines.node) {
            success(`Node.js version specified: ${packageJson.engines.node}`);
        } else {
            warning('Node.js version not specified in package.json engines');
        }
    } catch (err) {
        error('Could not read package.json');
        allGood = false;
    }

    return allGood;
}

// Validate Railway configuration
function validateRailwayConfig() {
    header('Railway Configuration Validation');

    try {
        // Check railway.json
        if (fs.existsSync('railway.json')) {
            const railwayConfig = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
            success('railway.json is valid');
            info(`Start command: ${railwayConfig.deploy?.startCommand || 'npm start'}`);
        }

        // Check nixpacks.toml
        if (fs.existsSync('nixpacks.toml')) {
            success('nixpacks.toml exists');
        }

        return true;
    } catch (err) {
        error(`Railway configuration validation failed: ${err.message}`);
        return false;
    }
}

// Check Git status
function checkGitStatus() {
    header('Git Status Check');

    try {
        // Check if there are uncommitted changes
        const status = execSync('git status --porcelain', { encoding: 'utf8' });

        if (status.trim()) {
            warning('You have uncommitted changes:');
            console.log(status);
            return false;
        } else {
            success('All changes are committed');
            return true;
        }
    } catch (err) {
        error('Not a git repository or git command failed');
        return false;
    }
}

// Deploy to Railway
function deployToRailway() {
    header('Deploying to Railway');

    try {
        // Login check
        try {
            execSync('railway whoami', { stdio: 'ignore' });
            success('Already logged into Railway');
        } catch (err) {
            log('Please login to Railway...', 'yellow');
            execSync('railway login', { stdio: 'inherit' });
        }

        // Deploy
        log('Starting deployment...', 'yellow');
        execSync('railway up', { stdio: 'inherit' });

        success('Deployment initiated successfully!');

        // Get service URL
        try {
            const url = execSync('railway url', { encoding: 'utf8' }).trim();
            success(`Your API will be available at: ${url}`);
            info(`Test your API: ${url}/health`);
        } catch (err) {
            info('Run "railway url" to get your deployment URL');
        }

        return true;
    } catch (err) {
        error(`Deployment failed: ${err.message}`);
        return false;
    }
}

// Show logs
function showLogs() {
    header('Railway Logs');

    try {
        execSync('railway logs', { stdio: 'inherit' });
    } catch (err) {
        error('Failed to fetch logs');
    }
}

// Create required environment variables template
function createEnvTemplate() {
    header('Environment Variables Setup');

    const envTemplate = `# Copy these to your Railway project's environment variables
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_waste_management

# Optional variables
ALLOWED_ORIGINS=https://your-frontend.netlify.app
JWT_SECRET=your-super-secret-key
DEFAULT_LATITUDE=40.7128
DEFAULT_LONGITUDE=-74.0060`;

    info('Required environment variables:');
    console.log('\n' + envTemplate + '\n');

    info('Set these in Railway dashboard: Settings → Variables');
}

// Main deployment function
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log(colors.cyan + `
🚂 Railway Deployment Helper
Smart Waste Management System
` + colors.reset);

    switch (command) {
        case 'clean':
            cleanDependencies();
            break;

        case 'check':
            checkEnvironment();
            validateRailwayConfig();
            checkGitStatus();
            break;

        case 'deploy':
            // Full deployment process
            if (!checkRailwayCLI()) {
                warning('Railway CLI not found');
                if (!installRailwayCLI()) {
                    process.exit(1);
                }
            }

            if (!checkEnvironment()) {
                error('Environment check failed');
                process.exit(1);
            }

            if (!checkGitStatus()) {
                error('Please commit your changes first');
                process.exit(1);
            }

            cleanDependencies();
            deployToRailway();
            break;

        case 'logs':
            showLogs();
            break;

        case 'env':
            createEnvTemplate();
            break;

        case 'install-cli':
            installRailwayCLI();
            break;

        default:
            info('Usage: node deploy-railway.js <command>');
            info('Commands:');
            info('  clean       - Clean and reinstall dependencies');
            info('  check       - Check environment and configuration');
            info('  deploy      - Full deployment process');
            info('  logs        - Show Railway deployment logs');
            info('  env         - Show required environment variables');
            info('  install-cli - Install Railway CLI');
            info('');
            info('Quick deployment: node deploy-railway.js deploy');
            break;
    }
}

// Handle errors gracefully
process.on('uncaughtException', (err) => {
    error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

// Run the script
main().catch(err => {
    error(`Script failed: ${err.message}`);
    process.exit(1);
});
