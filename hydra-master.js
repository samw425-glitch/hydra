#!/usr/bin/env node
/**
 * Hydra Master Control - Unified Network Commander
 * 
 * Orchestrates the entire connected Hydra ecosystem:
 * - Original Hydra microservices + Neural components
 * - Enhanced Hydra GistGhost thought network
 * - Cross-system intelligence bridges
 * - Network visualization dashboard
 */

const { spawn } = require('child_process');
const axios = require('axios');

class HydraMaster {
    constructor() {
        this.services = new Map();
        this.startupSequence = [
            { name: 'hydra-brain', script: 'hydra-brain.js', port: 3333, delay: 2000 },
            { name: 'neural-orchestrator', script: 'neural-orchestrator.js', port: 4444, delay: 3000 },
            { name: 'hydra-sync', script: 'hydra-sync.js', port: 5555, delay: 4000 },
            { name: 'hydra-visualizer', script: 'hydra-visualizer.js', port: 6666, delay: 1000 }
        ];
        
        this.setupGracefulShutdown();
    }

    async startNetwork() {
        console.log('🧠 HYDRA MASTER CONTROL - Initializing Connected Network');
        console.log('=' * 80);
        console.log('');
        
        console.log('🌊 Starting Hydra Network components in sequence...');
        
        for (const service of this.startupSequence) {
            await this.startService(service);
            await this.delay(service.delay);
        }
        
        console.log('');
        console.log('🎉 HYDRA NETWORK FULLY OPERATIONAL!');
        console.log('');
        
        await this.displayNetworkStatus();
        this.startHealthMonitoring();
    }

    async startService(serviceConfig) {
        console.log(`🚀 Starting ${serviceConfig.name}...`);
        
        const process = spawn('node', [serviceConfig.script], {
            stdio: 'pipe',
            cwd: __dirname
        });
        
        this.services.set(serviceConfig.name, {
            process,
            config: serviceConfig,
            status: 'starting',
            startTime: new Date()
        });
        
        // Handle output
        process.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                console.log(`[${serviceConfig.name}] ${line}`);
            });
        });
        
        process.stderr.on('data', (data) => {
            console.error(`[${serviceConfig.name}] ERROR: ${data}`);
        });
        
        process.on('close', (code) => {
            const service = this.services.get(serviceConfig.name);
            if (service) {
                service.status = code === 0 ? 'stopped' : 'crashed';
                console.log(`[${serviceConfig.name}] Process exited with code ${code}`);
            }
        });
        
        // Mark as running after a short delay
        setTimeout(() => {
            const service = this.services.get(serviceConfig.name);
            if (service) {
                service.status = 'running';
            }
        }, 1000);
    }

    async displayNetworkStatus() {
        console.log('🌐 NETWORK STATUS:');
        console.log('-' * 40);
        
        for (const [name, service] of this.services.entries()) {
            const statusEmoji = this.getStatusEmoji(service.status);
            const uptime = this.getUptime(service.startTime);
            
            console.log(`${statusEmoji} ${name.padEnd(20)} | Port: ${service.config.port} | ${uptime}`);
            
            // Test connectivity
            try {
                const healthUrl = `http://localhost:${service.config.port}`;
                const response = await axios.get(healthUrl, { timeout: 2000 });
                console.log(`   ✅ Health check passed (${response.status})`);
            } catch (error) {
                console.log(`   ⚠️ Health check failed: ${error.message}`);
            }
        }
        
        console.log('');
        console.log('🔗 ACCESS POINTS:');
        console.log(`   🧠 Hydra Brain:        http://localhost:3333/brain/health`);
        console.log(`   🎛️ Neural Orchestrator: http://localhost:4444/orchestrator/health`);
        console.log(`   🔄 Hydra Sync:         http://localhost:5555/sync/health`);
        console.log(`   📊 Network Visualizer:  http://localhost:6666`);
        console.log('');
        console.log('🎯 KEY OPERATIONS:');
        console.log('   • Open http://localhost:6666 for network visualization');
        console.log('   • POST to /brain/ingest to send thoughts from services');
        console.log('   • POST to /sync/force to trigger cross-network sync');
        console.log('   • GET /orchestrator/decisions to view AI decisions');
        console.log('');
    }

    startHealthMonitoring() {
        console.log('❤️ Starting network health monitoring...');
        
        setInterval(async () => {
            await this.performHealthChecks();
        }, 30000); // Check every 30 seconds
        
        console.log('✅ Health monitoring active');
    }

    async performHealthChecks() {
        let healthyServices = 0;
        let totalServices = this.services.size;
        
        for (const [name, service] of this.services.entries()) {
            if (service.status === 'running') {
                try {
                    const response = await axios.get(`http://localhost:${service.config.port}`, { 
                        timeout: 5000 
                    });
                    
                    if (response.status === 200) {
                        healthyServices++;
                    }
                } catch (error) {
                    console.log(`⚠️ Health check failed for ${name}: ${error.message}`);
                    service.status = 'unhealthy';
                }
            }
        }
        
        const healthPercentage = Math.round((healthyServices / totalServices) * 100);
        const timestamp = new Date().toLocaleTimeString();
        
        console.log(`❤️ [${timestamp}] Network Health: ${healthyServices}/${totalServices} services (${healthPercentage}%)`);
        
        if (healthPercentage < 75) {
            console.log('🚨 Network health degraded - consider service restart');
        }
    }

    getStatusEmoji(status) {
        const emojis = {
            'starting': '🟡',
            'running': '🟢',
            'stopped': '⚫',
            'crashed': '🔴',
            'unhealthy': '🟠'
        };
        return emojis[status] || '❓';
    }

    getUptime(startTime) {
        const uptime = Date.now() - startTime.getTime();
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setupGracefulShutdown() {
        const shutdown = () => {
            console.log('');
            console.log('🛑 Shutting down Hydra Network...');
            
            for (const [name, service] of this.services.entries()) {
                if (service.process && service.status === 'running') {
                    console.log(`   Stopping ${name}...`);
                    service.process.kill('SIGTERM');
                }
            }
            
            console.log('✅ Hydra Network shutdown complete');
            process.exit(0);
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }

    async demonstrateNetwork() {
        console.log('🎭 NETWORK DEMONSTRATION');
        console.log('-' * 30);
        
        try {
            // 1. Send a test thought to the brain
            console.log('1️⃣ Sending test thought to Hydra Brain...');
            const thoughtResponse = await axios.post('http://localhost:3333/brain/ingest', {
                service: 'demo-service',
                event_type: 'network_demo',
                data: {
                    message: 'Testing connected Hydra network',
                    timestamp: new Date().toISOString(),
                    demo: true
                },
                priority: 8
            });
            
            console.log(`   ✅ Thought ingested: ${thoughtResponse.data.thought_id}`);
            
            await this.delay(2000);
            
            // 2. Trigger cross-network sync
            console.log('2️⃣ Triggering cross-network synchronization...');
            const syncResponse = await axios.post('http://localhost:5555/sync/force');
            console.log(`   ✅ Sync initiated: ${syncResponse.data.status}`);
            
            await this.delay(3000);
            
            // 3. Check network visualization
            console.log('3️⃣ Checking network visualization data...');
            const networkResponse = await axios.get('http://localhost:6666/api/network');
            const networkData = networkResponse.data;
            
            console.log(`   ✅ Network mapped: ${networkData.nodes.length} nodes, ${networkData.edges.length} connections`);
            
            console.log('');
            console.log('🎉 Network demonstration complete!');
            console.log('   Visit http://localhost:6666 to see the live visualization');
            
        } catch (error) {
            console.error(`❌ Demo failed: ${error.message}`);
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'start';

async function main() {
    const master = new HydraMaster();
    
    switch (command) {
        case 'start':
            await master.startNetwork();
            
            // Run demo after network is stable
            setTimeout(async () => {
                await master.demonstrateNetwork();
            }, 10000);
            
            break;
            
        case 'demo':
            await master.demonstrateNetwork();
            break;
            
        case 'status':
            await master.displayNetworkStatus();
            process.exit(0);
            break;
            
        default:
            console.log('🧠 Hydra Master Control');
            console.log('');
            console.log('Commands:');
            console.log('  start  - Start the entire Hydra network');
            console.log('  demo   - Run network demonstration');
            console.log('  status - Check network status');
            console.log('');
            console.log('Example: node hydra-master.js start');
            process.exit(0);
    }
}

main().catch(console.error);