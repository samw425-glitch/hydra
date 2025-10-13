#!/usr/bin/env node
/**
 * Hydra Sync - Cross-Repository Intelligence Bridge
 * 
 * Synchronizes insights between Original Hydra and Enhanced Hydra systems
 * Creates a unified distributed intelligence network
 */

const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');

class HydraSync {
    constructor() {
        this.app = express();
        this.port = process.env.SYNC_PORT || 5555;
        
        // Configuration for both Hydra systems
        this.originalHydra = {
            brain_url: 'http://localhost:3333',
            orchestrator_url: 'http://localhost:4444',
            repo_path: __dirname
        };
        
        this.enhancedHydra = {
            gistghost_url: 'C:\\Users\\samwi\\Projects\\hosting-tools-toolkit\\gistghost',
            repo_path: 'C:\\Users\\samwi\\Projects\\hosting-tools-toolkit'
        };
        
        this.syncLog = [];
        this.lastSync = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeSync();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/sync/health', (req, res) => {
            res.json({
                status: 'syncing',
                last_sync: this.lastSync,
                sync_operations: this.syncLog.length,
                networks_connected: 2
            });
        });

        // Sync status
        this.app.get('/sync/status', (req, res) => {
            res.json({
                original_hydra: this.originalHydra,
                enhanced_hydra: this.enhancedHydra,
                recent_sync_log: this.syncLog.slice(-10)
            });
        });

        // Force sync
        this.app.post('/sync/force', async (req, res) => {
            console.log('🔄 Forcing cross-repository sync...');
            await this.performFullSync();
            res.json({ status: 'sync_initiated' });
        });

        // Sync specific insight
        this.app.post('/sync/insight', async (req, res) => {
            const { source, target, gist_id, insight_type } = req.body;
            
            try {
                const result = await this.syncSpecificInsight(source, target, gist_id, insight_type);
                res.json({ status: 'synced', result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Bridge thoughts between systems
        this.app.post('/sync/bridge-thought', async (req, res) => {
            const { thought, direction } = req.body;
            
            try {
                const result = await this.bridgeThought(thought, direction);
                res.json({ status: 'bridged', result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    async performFullSync() {
        const syncStart = new Date();
        this.lastSync = syncStart.toISOString();
        
        console.log('🌐 Starting full Hydra network synchronization...');
        
        try {
            // 1. Sync microservice insights to hosting toolkit
            await this.syncMicroservicesToHosting();
            
            // 2. Sync hosting insights to microservices
            await this.syncHostingToMicroservices();
            
            // 3. Cross-pollinate thought networks
            await this.crossPollinateThoughts();
            
            // 4. Sync orchestration decisions
            await this.syncOrchestrationDecisions();
            
            const syncEnd = new Date();
            const syncDuration = syncEnd - syncStart;
            
            this.syncLog.push({
                timestamp: syncEnd.toISOString(),
                duration_ms: syncDuration,
                status: 'success',
                operations: 4
            });
            
            console.log(`✅ Full sync completed in ${syncDuration}ms`);
            
        } catch (error) {
            this.syncLog.push({
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error.message
            });
            
            console.error('❌ Sync failed:', error);
        }
    }

    async syncMicroservicesToHosting() {
        console.log('📡 Syncing microservice insights to hosting toolkit...');
        
        try {
            // Get recent thoughts from Original Hydra brain
            const brainResponse = await axios.get(`${this.originalHydra.brain_url}/brain/thoughts?limit=20`);
            const microserviceThoughts = brainResponse.data.thoughts || [];
            
            for (const thought of microserviceThoughts) {
                if (this.isRelevantToHosting(thought)) {
                    await this.createHostingThought(thought);
                }
            }
            
            console.log(`✅ Synced ${microserviceThoughts.length} microservice thoughts to hosting`);
            
        } catch (error) {
            console.log(`⚠️ Could not sync to hosting: ${error.message}`);
        }
    }

    async syncHostingToMicroservices() {
        console.log('📡 Syncing hosting insights to microservices...');
        
        try {
            // Get hosting thoughts from Enhanced Hydra
            const hostingThoughts = await this.getHostingThoughts();
            
            for (const thought of hostingThoughts) {
                if (this.isRelevantToMicroservices(thought)) {
                    await this.sendToOriginalBrain(thought);
                }
            }
            
            console.log(`✅ Synced ${hostingThoughts.length} hosting thoughts to microservices`);
            
        } catch (error) {
            console.log(`⚠️ Could not sync to microservices: ${error.message}`);
        }
    }

    async crossPollinateThoughts() {
        console.log('🌸 Cross-pollinating thought networks...');
        
        try {
            // Find thoughts that could benefit from cross-network insights
            const originalThoughts = await this.getOriginalHydraThoughts();
            const hostingThoughts = await this.getHostingThoughts();
            
            // Find related concepts
            const correlations = this.findThoughtCorrelations(originalThoughts, hostingThoughts);
            
            for (const correlation of correlations) {
                await this.linkThoughtsAcrossNetworks(correlation.original, correlation.hosting);
            }
            
            console.log(`✅ Created ${correlations.length} cross-network correlations`);
            
        } catch (error) {
            console.log(`⚠️ Cross-pollination failed: ${error.message}`);
        }
    }

    async syncOrchestrationDecisions() {
        console.log('⚙️ Syncing orchestration decisions...');
        
        try {
            // Get recent decisions from orchestrator
            const decisionsResponse = await axios.get(`${this.originalHydra.orchestrator_url}/orchestrator/decisions`);
            const decisions = decisionsResponse.data.decisions || [];
            
            // Transform decisions into hosting insights
            for (const decision of decisions.slice(-5)) { // Last 5 decisions
                const insight = this.transformDecisionToInsight(decision);
                await this.createHostingThought(insight);
            }
            
            console.log(`✅ Synced ${decisions.length} orchestration decisions`);
            
        } catch (error) {
            console.log(`⚠️ Could not sync decisions: ${error.message}`);
        }
    }

    isRelevantToHosting(thought) {
        const hostingKeywords = [
            'performance', 'scaling', 'response_time', 'error_rate',
            'deployment', 'health', 'optimization', 'user', 'api'
        ];
        
        const content = (thought.content || '').toLowerCase();
        const intent = (thought.intent || '').toLowerCase();
        
        return hostingKeywords.some(keyword => 
            content.includes(keyword) || intent.includes(keyword)
        );
    }

    isRelevantToMicroservices(thought) {
        const microserviceKeywords = [
            'infrastructure', 'scaling', 'performance', 'automation',
            'deployment', 'service', 'api', 'orchestration'
        ];
        
        const content = (thought.content || '').toLowerCase();
        const intent = (thought.intent || '').toLowerCase();
        
        return microserviceKeywords.some(keyword => 
            content.includes(keyword) || intent.includes(keyword)
        );
    }

    async createHostingThought(sourceThought) {
        const hostingIntent = this.translateToHostingIntent(sourceThought);
        const hostingContent = this.transformToHostingContent(sourceThought);
        
        return this.executeGistGhost('create', {
            intent: hostingIntent,
            content: hostingContent,
            priority: sourceThought.priority || 5
        });
    }

    translateToHostingIntent(sourceThought) {
        const intentMappings = {
            'api-performance': 'hosting-optimization: API performance insights',
            'system-health': 'infrastructure-monitoring: System health analysis',
            'user-behavior': 'user-experience: Behavior pattern analysis',
            'scaling': 'hosting-scalability: Auto-scaling insights',
            'deployment': 'hosting-deployment: Deployment optimization'
        };
        
        const originalIntent = sourceThought.intent || '';
        
        for (const [key, value] of Object.entries(intentMappings)) {
            if (originalIntent.includes(key)) {
                return value;
            }
        }
        
        return `cross-network-insight: ${originalIntent}`;
    }

    transformToHostingContent(sourceThought) {
        return `# Cross-Network Intelligence Sync

## Source System: Original Hydra Microservices
**Original Intent:** ${sourceThought.intent}  
**Service:** ${sourceThought.service || 'Unknown'}  
**Timestamp:** ${sourceThought.timestamp}

## Hosting-Relevant Insights
${sourceThought.content || 'No content available'}

## Cross-Network Context
This insight was automatically synchronized from the Original Hydra microservices network to enhance hosting intelligence. The thought has been adapted for hosting toolkit context while preserving the core intelligence value.

## Potential Applications
- Performance optimization strategies
- Scaling decision automation  
- User experience improvements
- Infrastructure cost optimization
- Deployment pipeline enhancement

*Synchronized by Hydra Sync v1.0*`;
    }

    async sendToOriginalBrain(hostingThought) {
        const microserviceData = {
            service: 'hosting-sync',
            event_type: 'cross_network_insight',
            data: {
                original_intent: hostingThought.intent,
                hosting_content: hostingThought.content,
                sync_timestamp: new Date().toISOString()
            },
            priority: hostingThought.priority || 5
        };
        
        return axios.post(`${this.originalHydra.brain_url}/brain/ingest`, microserviceData);
    }

    async getOriginalHydraThoughts() {
        try {
            const response = await axios.get(`${this.originalHydra.brain_url}/brain/thoughts?limit=50`);
            return response.data.thoughts || [];
        } catch (error) {
            return [];
        }
    }

    async getHostingThoughts() {
        // Execute GistGhost to get hosting thoughts
        return this.executeGistGhost('list', { limit: 50 });
    }

    findThoughtCorrelations(originalThoughts, hostingThoughts) {
        const correlations = [];
        const correlationKeywords = [
            'performance', 'scaling', 'user', 'api', 'error', 
            'optimization', 'deployment', 'monitoring'
        ];
        
        for (const original of originalThoughts) {
            for (const hosting of hostingThoughts) {
                const similarity = this.calculateThoughtSimilarity(original, hosting, correlationKeywords);
                
                if (similarity > 0.3) { // 30% similarity threshold
                    correlations.push({
                        original,
                        hosting,
                        similarity,
                        correlation_keywords: this.getCommonKeywords(original, hosting, correlationKeywords)
                    });
                }
            }
        }
        
        return correlations.slice(0, 10); // Top 10 correlations
    }

    calculateThoughtSimilarity(thought1, thought2, keywords) {
        const content1 = (thought1.content || '').toLowerCase();
        const content2 = (thought2.content || '').toLowerCase();
        
        let commonKeywords = 0;
        let totalKeywords = 0;
        
        for (const keyword of keywords) {
            const inThought1 = content1.includes(keyword);
            const inThought2 = content2.includes(keyword);
            
            if (inThought1 || inThought2) {
                totalKeywords++;
                if (inThought1 && inThought2) {
                    commonKeywords++;
                }
            }
        }
        
        return totalKeywords > 0 ? commonKeywords / totalKeywords : 0;
    }

    getCommonKeywords(thought1, thought2, keywords) {
        const content1 = (thought1.content || '').toLowerCase();
        const content2 = (thought2.content || '').toLowerCase();
        
        return keywords.filter(keyword => 
            content1.includes(keyword) && content2.includes(keyword)
        );
    }

    async linkThoughtsAcrossNetworks(originalThought, hostingThought) {
        // Create evolution link in hosting network
        if (hostingThought.gist_id && originalThought.gist_id) {
            return this.executeGistGhost('link', {
                gist_id_1: hostingThought.gist_id,
                gist_id_2: originalThought.gist_id,
                relationship: 'cross-network-correlation'
            });
        }
    }

    transformDecisionToInsight(decision) {
        return {
            intent: `orchestration-insight: ${decision.action} decision analysis`,
            content: `# Orchestration Decision Intelligence

## Decision Details
**Service:** ${decision.service}  
**Action:** ${decision.action}  
**Reason:** ${decision.reason}  
**Executed:** ${decision.executed}  
**Timestamp:** ${decision.timestamp}

## Intelligence Analysis
This orchestration decision provides insights for hosting optimization:

### Performance Implications
- Service scaling patterns observed
- Resource utilization thresholds identified
- Automated response capabilities validated

### Hosting Strategy Insights
- Infrastructure scaling triggers: ${decision.reason}
- Decision confidence based on thought network analysis
- Cross-service impact patterns

## Actionable Recommendations
1. Apply similar decision logic to hosting toolkit
2. Monitor for similar patterns in user behavior
3. Implement automated scaling thresholds
4. Enhance monitoring for early detection

*Generated from Hydra Orchestration Decision*`,
            priority: 6,
            service: 'orchestrator',
            timestamp: decision.timestamp
        };
    }

    async executeGistGhost(command, options = {}) {
        return new Promise((resolve, reject) => {
            const gistghostPath = this.enhancedHydra.gistghost_url;
            const args = [`${gistghostPath}/gistghost.py`, command];
            
            // Add command-specific arguments
            if (command === 'create') {
                args.push('--intent', options.intent);
                args.push('--priority', options.priority.toString());
            } else if (command === 'list') {
                if (options.limit) args.push('--limit', options.limit.toString());
            }
            
            const process = spawn('python', args, {
                cwd: gistghostPath
            });
            
            let output = '';
            let error = '';
            
            process.stdout.on('data', (data) => output += data.toString());
            process.stderr.on('data', (data) => error += data.toString());
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output });
                } else {
                    reject(new Error(`GistGhost error: ${error}`));
                }
            });
            
            if (command === 'create' && options.content) {
                process.stdin.write(options.content);
                process.stdin.end();
            }
        });
    }

    initializeSync() {
        // Perform sync every 5 minutes
        setInterval(async () => {
            await this.performFullSync();
        }, 5 * 60 * 1000);

        console.log('🔄 Cross-repository sync initialized');
        
        // Perform initial sync after 10 seconds
        setTimeout(async () => {
            await this.performFullSync();
        }, 10000);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 HYDRA SYNC - Cross-Repository Intelligence Bridge Active`);
            console.log(`   Port: ${this.port}`);
            console.log(`   Original Hydra: ${this.originalHydra.brain_url}`);
            console.log(`   Enhanced Hydra: ${this.enhancedHydra.gistghost_url}`);
            console.log('');
            console.log('🔗 Sync endpoints:');
            console.log(`   GET  /sync/status - View sync status`);
            console.log(`   POST /sync/force - Force synchronization`);
            console.log(`   POST /sync/bridge-thought - Bridge specific thought`);
            console.log('');
        });
    }
}

// Start Hydra Sync
const sync = new HydraSync();
sync.start();