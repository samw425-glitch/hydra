#!/usr/bin/env node
/**
 * Hydra Brain - Neural Bridge Service
 * 
 * Connects Hydra microservices ecosystem to GistGhost thought network
 * Transforms service metrics, events, and insights into distributed intelligence
 */

const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class HydraBrain {
    constructor() {
        this.app = express();
        this.port = process.env.BRAIN_PORT || 3333;
        this.services = new Map();
        this.thoughtQueue = [];
        this.gistghostPath = path.join(__dirname, 'gistghost');
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeThoughtCapture();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        // CORS for cross-service communication
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/brain/health', (req, res) => {
            res.json({
                status: 'thinking',
                thoughts_queued: this.thoughtQueue.length,
                services_connected: this.services.size,
                neural_activity: 'active'
            });
        });

        // Service registration
        this.app.post('/brain/register', (req, res) => {
            const { service_name, port, capabilities } = req.body;
            this.services.set(service_name, {
                port,
                capabilities,
                last_seen: new Date(),
                thought_count: 0
            });
            
            console.log(`🧠 Neural connection established: ${service_name}:${port}`);
            res.json({ status: 'connected', neural_id: service_name });
        });

        // Thought ingestion from services
        this.app.post('/brain/ingest', async (req, res) => {
            const { service, event_type, data, priority = 5 } = req.body;
            
            const thought = {
                service,
                event_type,
                data,
                priority,
                timestamp: new Date().toISOString(),
                processed: false
            };
            
            this.thoughtQueue.push(thought);
            console.log(`🧠 Thought captured from ${service}: ${event_type}`);
            
            // Process immediately if high priority
            if (priority >= 8) {
                await this.processThought(thought);
            }
            
            res.json({ status: 'ingested', thought_id: thought.timestamp });
        });

        // Network visualization
        this.app.get('/brain/network', (req, res) => {
            res.json({
                services: Array.from(this.services.entries()),
                thoughts_pending: this.thoughtQueue.length,
                network_topology: this.getNetworkTopology()
            });
        });

        // Trigger thought evolution
        this.app.post('/brain/evolve/:gist_id', async (req, res) => {
            const { gist_id } = req.params;
            const { new_data } = req.body;
            
            try {
                const result = await this.evolveThought(gist_id, new_data);
                res.json({ status: 'evolved', new_thought_id: result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Query the thought network
        this.app.get('/brain/thoughts', async (req, res) => {
            const { service, status, limit = 10 } = req.query;
            
            try {
                const thoughts = await this.queryThoughts(service, status, limit);
                res.json({ thoughts });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    async processThought(thought) {
        if (thought.processed) return;

        const intent = this.generateIntent(thought);
        const content = this.formatThoughtContent(thought);
        
        try {
            // Create thought using GistGhost
            const result = await this.executeGistGhost('create', {
                intent,
                content,
                priority: thought.priority,
                format: 'md'
            });
            
            thought.processed = true;
            thought.gist_id = result.gist_id;
            
            // Update service stats
            if (this.services.has(thought.service)) {
                this.services.get(thought.service).thought_count++;
            }
            
            console.log(`🧠 Thought crystallized: ${intent} → ${result.gist_id}`);
            
        } catch (error) {
            console.error(`🧠 Neural processing error:`, error);
        }
    }

    generateIntent(thought) {
        const { service, event_type, data } = thought;
        
        // Generate intelligent intents based on service and event
        const intentMappings = {
            'api-catalog': {
                'api_call': 'api-usage: API endpoint analysis',
                'error': 'api-error: Service error investigation',
                'performance': 'api-performance: Response time optimization'
            },
            'click-tracker': {
                'click': 'user-behavior: Click pattern analysis',
                'conversion': 'marketing-insight: Conversion optimization',
                'funnel': 'user-journey: Funnel performance'
            },
            'landing': {
                'pageview': 'content-performance: Landing page analysis',
                'bounce': 'ux-insight: Bounce rate investigation',
                'engagement': 'user-engagement: Content effectiveness'
            },
            'orchestrator': {
                'deployment': 'infrastructure: Deployment analysis',
                'scaling': 'performance: Auto-scaling insights',
                'health': 'system-health: Service monitoring'
            }
        };
        
        const serviceMapping = intentMappings[service] || {};
        const defaultIntent = serviceMapping[event_type] || `${service}: ${event_type} analysis`;
        
        return defaultIntent;
    }

    formatThoughtContent(thought) {
        const { service, event_type, data, timestamp } = thought;
        
        return `# Hydra Network Intelligence Report

## Service: ${service.toUpperCase()}
**Event Type:** ${event_type}  
**Timestamp:** ${timestamp}  
**Neural Priority:** ${thought.priority}/10

## Data Analysis
${JSON.stringify(data, null, 2)}

## Insights Generated
- Event captured from ${service} microservice
- Pattern recognition active for ${event_type} events
- Data pipeline: Service → Neural Bridge → Thought Network
- Ready for evolution and correlation analysis

## Network Context
Connected to Hydra ecosystem with ${this.services.size} active services.
Part of distributed intelligence network spanning:
- Microservices architecture
- Thought evolution system  
- Cross-service pattern recognition
- Automated insight generation

*This thought was generated automatically by Hydra Brain v1.0*`;
    }

    async executeGistGhost(command, options = {}) {
        return new Promise((resolve, reject) => {
            const args = [
                path.join(this.gistghostPath, 'gistghost.py'),
                command
            ];
            
            // Add command-specific arguments
            if (command === 'create') {
                args.push('--intent', options.intent);
                args.push('--priority', options.priority.toString());
                if (options.format) args.push('--format', options.format);
            }
            
            const gistProcess = spawn('python', args, {
                cwd: this.gistghostPath
            });
            
            let output = '';
            let error = '';
            
            gistProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            gistProcess.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            gistProcess.on('close', (code) => {
                if (code === 0) {
                    // Parse GistGhost output to extract gist ID
                    const gistIdMatch = output.match(/Created thought: ([a-f0-9]+)/);
                    const gistId = gistIdMatch ? gistIdMatch[1] : null;
                    
                    resolve({ 
                        success: true, 
                        output, 
                        gist_id: gistId 
                    });
                } else {
                    reject(new Error(`GistGhost error: ${error}`));
                }
            });
            
            // Send content via stdin for create command
            if (command === 'create' && options.content) {
                gistProcess.stdin.write(options.content);
                gistProcess.stdin.end();
            }
        });
    }

    async evolveThought(gistId, newData) {
        const args = [
            path.join(this.gistghostPath, 'gistghost.py'),
            'evolve',
            gistId,
            '--content', JSON.stringify(newData, null, 2)
        ];
        
        return new Promise((resolve, reject) => {
            const gistProcess = spawn('python', args, {
                cwd: this.gistghostPath
            });
            
            let output = '';
            
            gistProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            gistProcess.on('close', (code) => {
                if (code === 0) {
                    const gistIdMatch = output.match(/Evolved thought: ([a-f0-9]+)/);
                    const newGistId = gistIdMatch ? gistIdMatch[1] : null;
                    resolve(newGistId);
                } else {
                    reject(new Error(`Evolution failed: ${output}`));
                }
            });
        });
    }

    async queryThoughts(service, status, limit) {
        // Query GistGhost for thoughts
        return this.executeGistGhost('list', { 
            status, 
            limit: parseInt(limit) 
        });
    }

    getNetworkTopology() {
        return {
            neural_bridge: {
                port: this.port,
                status: 'active',
                connections: this.services.size
            },
            microservices: Array.from(this.services.keys()),
            thought_network: {
                pending_thoughts: this.thoughtQueue.length,
                processing_active: true
            }
        };
    }

    initializeThoughtCapture() {
        // Process thought queue every 5 seconds
        setInterval(async () => {
            const unprocessedThoughts = this.thoughtQueue.filter(t => !t.processed);
            
            for (const thought of unprocessedThoughts.slice(0, 3)) { // Process 3 at a time
                await this.processThought(thought);
            }
            
            // Clean processed thoughts older than 1 hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            this.thoughtQueue = this.thoughtQueue.filter(
                t => !t.processed || new Date(t.timestamp) > oneHourAgo
            );
            
        }, 5000);

        console.log('🧠 Neural capture system initialized');
    }

    async discoverServices() {
        // Auto-discover running Hydra services
        const commonPorts = [3000, 3001, 3002, 8080, 8081, 8082, 5000, 5001];
        
        for (const port of commonPorts) {
            try {
                const response = await axios.get(`http://localhost:${port}/health`, { timeout: 1000 });
                
                if (response.status === 200) {
                    const serviceName = response.data.service || `service-${port}`;
                    
                    if (!this.services.has(serviceName)) {
                        this.services.set(serviceName, {
                            port,
                            capabilities: response.data.capabilities || [],
                            last_seen: new Date(),
                            thought_count: 0,
                            discovered: true
                        });
                        
                        console.log(`🧠 Auto-discovered service: ${serviceName}:${port}`);
                    }
                }
            } catch (error) {
                // Service not available on this port
            }
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🧠 HYDRA BRAIN - Neural Bridge Active`);
            console.log(`   Port: ${this.port}`);
            console.log(`   GistGhost: ${this.gistghostPath}`);
            console.log(`   Status: Connecting microservices to thought network...`);
            console.log('');
            console.log('🔗 Neural endpoints:');
            console.log(`   POST /brain/register - Connect service to brain`);
            console.log(`   POST /brain/ingest - Send thoughts to network`);
            console.log(`   GET  /brain/network - View neural topology`);
            console.log(`   GET  /brain/thoughts - Query thought network`);
            console.log('');
            
            // Auto-discover existing services
            this.discoverServices();
        });
    }
}

// Start the Hydra Brain
const brain = new HydraBrain();
brain.start();