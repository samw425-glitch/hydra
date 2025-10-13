#!/usr/bin/env node
/**
 * Neural Orchestrator - Thought-Driven Hydra Management
 * 
 * Enhanced orchestrator that makes decisions based on the thought network
 * Combines microservice orchestration with distributed intelligence
 */

const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');

class NeuralOrchestrator {
    constructor() {
        this.app = express();
        this.port = process.env.ORCHESTRATOR_PORT || 4444;
        this.brainUrl = process.env.BRAIN_URL || 'http://localhost:3333';
        this.services = new Map();
        this.decisions = [];
        this.thresholds = {
            error_rate: 0.05,       // 5% error rate threshold
            response_time: 2000,    // 2 second response time threshold
            cpu_usage: 0.8,         // 80% CPU usage threshold
            memory_usage: 0.85      // 85% memory usage threshold
        };
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeIntelligentDecisionMaking();
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
        this.app.get('/orchestrator/health', (req, res) => {
            res.json({
                status: 'orchestrating',
                services_managed: this.services.size,
                decisions_made: this.decisions.length,
                intelligence_active: true
            });
        });

        // Register service with orchestrator
        this.app.post('/orchestrator/register', async (req, res) => {
            const { service_name, port, health_endpoint } = req.body;
            
            this.services.set(service_name, {
                port,
                health_endpoint: health_endpoint || `/health`,
                last_health_check: null,
                status: 'unknown',
                metrics: {},
                restart_count: 0
            });

            // Register with brain too
            await this.registerWithBrain(service_name, port);
            
            console.log(`🎛️ Service registered for orchestration: ${service_name}`);
            res.json({ status: 'registered', orchestrated: true });
        });

        // Get orchestration decisions
        this.app.get('/orchestrator/decisions', (req, res) => {
            const recentDecisions = this.decisions.slice(-20);
            res.json({ decisions: recentDecisions });
        });

        // Manual service action
        this.app.post('/orchestrator/action/:service/:action', async (req, res) => {
            const { service, action } = req.params;
            const { reason } = req.body;
            
            try {
                const result = await this.executeServiceAction(service, action, reason);
                res.json({ status: 'executed', result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Query thought network for decisions
        this.app.get('/orchestrator/intelligence/:service', async (req, res) => {
            const { service } = req.params;
            
            try {
                const thoughts = await this.queryThoughtsAboutService(service);
                const insights = this.extractInsights(thoughts);
                res.json({ service, thoughts, insights });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Force intelligent analysis
        this.app.post('/orchestrator/analyze', async (req, res) => {
            console.log('🧠 Performing full network intelligence analysis...');
            await this.performIntelligentAnalysis();
            res.json({ status: 'analysis_complete' });
        });
    }

    async registerWithBrain(serviceName, port) {
        try {
            await axios.post(`${this.brainUrl}/brain/register`, {
                service_name: serviceName,
                port,
                capabilities: ['orchestrated', 'monitored', 'scalable']
            });
        } catch (error) {
            console.log(`⚠️ Could not register with brain: ${error.message}`);
        }
    }

    async performHealthCheck(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) return null;

        try {
            const startTime = Date.now();
            const response = await axios.get(`http://localhost:${service.port}${service.health_endpoint}`, { 
                timeout: 5000 
            });
            const responseTime = Date.now() - startTime;

            const healthData = {
                status: response.status === 200 ? 'healthy' : 'unhealthy',
                response_time: responseTime,
                timestamp: new Date().toISOString(),
                data: response.data || {}
            };

            service.last_health_check = healthData;
            service.status = healthData.status;

            // Extract metrics if available
            if (response.data) {
                service.metrics = {
                    ...service.metrics,
                    cpu_usage: response.data.cpu_usage,
                    memory_usage: response.data.memory_usage,
                    error_rate: response.data.error_rate,
                    request_count: response.data.request_count
                };
            }

            // Send health data to brain for analysis
            await this.sendToBrain(serviceName, 'health_check', healthData);

            return healthData;

        } catch (error) {
            const errorData = {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            service.last_health_check = errorData;
            service.status = 'unhealthy';

            // Send error to brain
            await this.sendToBrain(serviceName, 'health_error', errorData, 8);

            return errorData;
        }
    }

    async sendToBrain(service, eventType, data, priority = 5) {
        try {
            await axios.post(`${this.brainUrl}/brain/ingest`, {
                service,
                event_type: eventType,
                data,
                priority
            });
        } catch (error) {
            console.log(`⚠️ Could not send to brain: ${error.message}`);
        }
    }

    async queryThoughtsAboutService(serviceName) {
        try {
            const response = await axios.get(`${this.brainUrl}/brain/thoughts`, {
                params: { service: serviceName, limit: 10 }
            });
            return response.data.thoughts || [];
        } catch (error) {
            console.log(`⚠️ Could not query thoughts: ${error.message}`);
            return [];
        }
    }

    extractInsights(thoughts) {
        const insights = {
            patterns: [],
            recommendations: [],
            alerts: []
        };

        for (const thought of thoughts) {
            // Analyze thought content for patterns
            if (thought.content && thought.content.includes('error')) {
                insights.alerts.push(`Error pattern detected in ${thought.service}`);
            }

            if (thought.content && thought.content.includes('performance')) {
                insights.recommendations.push(`Performance optimization needed for ${thought.service}`);
            }

            // Extract patterns from thought evolution
            if (thought.parent_gist) {
                insights.patterns.push(`Evolution detected: ${thought.intent}`);
            }
        }

        return insights;
    }

    async makeIntelligentDecision(serviceName, metrics) {
        const service = this.services.get(serviceName);
        if (!service) return null;

        let decision = null;
        const timestamp = new Date().toISOString();

        // Query thoughts about this service
        const thoughts = await this.queryThoughtsAboutService(serviceName);
        const insights = this.extractInsights(thoughts);

        // Decision logic based on metrics and insights
        if (service.status === 'unhealthy') {
            if (service.restart_count < 3) {
                decision = {
                    service: serviceName,
                    action: 'restart',
                    reason: 'Service unhealthy, attempting restart',
                    intelligence_input: insights.alerts,
                    timestamp,
                    executed: false
                };
            } else {
                decision = {
                    service: serviceName,
                    action: 'scale_down',
                    reason: 'Multiple restart failures, scaling down for investigation',
                    intelligence_input: insights.alerts,
                    timestamp,
                    executed: false
                };
            }
        } else if (metrics.response_time > this.thresholds.response_time) {
            decision = {
                service: serviceName,
                action: 'scale_up',
                reason: `Response time ${metrics.response_time}ms exceeds threshold`,
                intelligence_input: insights.recommendations,
                timestamp,
                executed: false
            };
        } else if (metrics.cpu_usage > this.thresholds.cpu_usage) {
            decision = {
                service: serviceName,
                action: 'scale_up',
                reason: `CPU usage ${Math.round(metrics.cpu_usage * 100)}% exceeds threshold`,
                intelligence_input: insights.recommendations,
                timestamp,
                executed: false
            };
        }

        if (decision) {
            this.decisions.push(decision);
            
            // Send decision to brain as a thought
            await this.sendToBrain('orchestrator', 'intelligent_decision', decision, 7);
            
            // Auto-execute if confidence is high
            if (insights.recommendations.length > 0 || service.restart_count === 0) {
                await this.executeDecision(decision);
            }
        }

        return decision;
    }

    async executeDecision(decision) {
        console.log(`🎛️ Executing intelligent decision: ${decision.action} for ${decision.service}`);
        
        try {
            const result = await this.executeServiceAction(
                decision.service, 
                decision.action, 
                decision.reason
            );
            
            decision.executed = true;
            decision.result = result;
            
            // Update service restart count
            if (decision.action === 'restart') {
                const service = this.services.get(decision.service);
                if (service) service.restart_count++;
            }

            // Send success to brain
            await this.sendToBrain('orchestrator', 'action_executed', {
                decision,
                result
            }, 6);

            console.log(`✅ Decision executed successfully: ${decision.action}`);
            
        } catch (error) {
            decision.executed = false;
            decision.error = error.message;
            
            // Send failure to brain
            await this.sendToBrain('orchestrator', 'action_failed', {
                decision,
                error: error.message
            }, 9);

            console.error(`❌ Decision execution failed: ${error.message}`);
        }
    }

    async executeServiceAction(serviceName, action, reason) {
        // Simulate service actions (in real implementation, these would interact with Docker/K8s)
        const actions = {
            restart: () => this.simulateRestart(serviceName),
            scale_up: () => this.simulateScaleUp(serviceName),
            scale_down: () => this.simulateScaleDown(serviceName),
            stop: () => this.simulateStop(serviceName)
        };

        const actionFunction = actions[action];
        if (!actionFunction) {
            throw new Error(`Unknown action: ${action}`);
        }

        return await actionFunction();
    }

    async simulateRestart(serviceName) {
        console.log(`🔄 Restarting service: ${serviceName}`);
        // Reset health status
        const service = this.services.get(serviceName);
        if (service) {
            service.status = 'restarting';
            setTimeout(() => {
                service.status = 'healthy';
                console.log(`✅ Service restarted: ${serviceName}`);
            }, 3000);
        }
        return { action: 'restart', status: 'initiated' };
    }

    async simulateScaleUp(serviceName) {
        console.log(`📈 Scaling up service: ${serviceName}`);
        return { action: 'scale_up', instances: '+1', status: 'scaling' };
    }

    async simulateScaleDown(serviceName) {
        console.log(`📉 Scaling down service: ${serviceName}`);
        return { action: 'scale_down', instances: '-1', status: 'scaling' };
    }

    async simulateStop(serviceName) {
        console.log(`🛑 Stopping service: ${serviceName}`);
        const service = this.services.get(serviceName);
        if (service) service.status = 'stopped';
        return { action: 'stop', status: 'stopped' };
    }

    async performIntelligentAnalysis() {
        console.log('🧠 Analyzing entire network with thought intelligence...');
        
        for (const [serviceName, service] of this.services.entries()) {
            // Perform health check
            const healthData = await this.performHealthCheck(serviceName);
            
            if (healthData) {
                // Make intelligent decision based on health and thoughts
                await this.makeIntelligentDecision(serviceName, {
                    response_time: healthData.response_time || 0,
                    cpu_usage: service.metrics.cpu_usage || 0,
                    memory_usage: service.metrics.memory_usage || 0,
                    error_rate: service.metrics.error_rate || 0
                });
            }
        }

        // Send network analysis summary to brain
        await this.sendToBrain('orchestrator', 'network_analysis', {
            services_analyzed: this.services.size,
            decisions_made: this.decisions.filter(d => d.timestamp > new Date(Date.now() - 300000)).length,
            network_health: this.calculateNetworkHealth()
        }, 6);
    }

    calculateNetworkHealth() {
        const healthyServices = Array.from(this.services.values())
            .filter(s => s.status === 'healthy').length;
        
        const totalServices = this.services.size;
        const healthPercentage = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;

        return {
            healthy_services: healthyServices,
            total_services: totalServices,
            health_percentage: Math.round(healthPercentage),
            status: healthPercentage > 80 ? 'excellent' : 
                   healthPercentage > 60 ? 'good' : 
                   healthPercentage > 40 ? 'degraded' : 'critical'
        };
    }

    initializeIntelligentDecisionMaking() {
        // Perform intelligent analysis every 30 seconds
        setInterval(async () => {
            await this.performIntelligentAnalysis();
        }, 30000);

        console.log('🧠 Intelligent decision making system initialized');
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🎛️ NEURAL ORCHESTRATOR - Thought-Driven Management Active`);
            console.log(`   Port: ${this.port}`);
            console.log(`   Brain URL: ${this.brainUrl}`);
            console.log(`   Intelligence: Enabled`);
            console.log('');
            console.log('🎛️ Orchestration endpoints:');
            console.log(`   POST /orchestrator/register - Register service`);
            console.log(`   GET  /orchestrator/decisions - View decisions`);
            console.log(`   POST /orchestrator/analyze - Force analysis`);
            console.log(`   GET  /orchestrator/intelligence/:service - Query insights`);
            console.log('');
        });
    }
}

// Start the Neural Orchestrator
const orchestrator = new NeuralOrchestrator();
orchestrator.start();