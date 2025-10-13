#!/usr/bin/env node
/**
 * Hydra Visualizer - Network Visualization System
 * 
 * Creates visual representations of the combined Hydra ecosystem:
 * - Original Hydra microservices
 * - Enhanced Hydra thought network
 * - Cross-system connections and intelligence flows
 */

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class HydraVisualizer {
    constructor() {
        this.app = express();
        this.port = process.env.VISUALIZER_PORT || 6666;
        
        this.networkData = {
            nodes: [],
            edges: [],
            clusters: [],
            lastUpdated: null
        };
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeVisualization();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'visualization')));
        
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            next();
        });
    }

    setupRoutes() {
        // Main visualization dashboard
        this.app.get('/', (req, res) => {
            res.send(this.generateVisualizationHTML());
        });

        // Network data API
        this.app.get('/api/network', (req, res) => {
            res.json(this.networkData);
        });

        // Force network refresh
        this.app.post('/api/refresh', async (req, res) => {
            console.log('🔄 Refreshing network visualization...');
            await this.updateNetworkData();
            res.json({ status: 'refreshed', nodes: this.networkData.nodes.length });
        });

        // Export network data
        this.app.get('/api/export/:format', (req, res) => {
            const { format } = req.params;
            
            try {
                const exportData = this.exportNetworkData(format);
                res.setHeader('Content-Type', this.getContentType(format));
                res.send(exportData);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Network statistics
        this.app.get('/api/stats', (req, res) => {
            res.json(this.calculateNetworkStats());
        });
    }

    async updateNetworkData() {
        console.log('📊 Gathering network data from all Hydra systems...');
        
        this.networkData.nodes = [];
        this.networkData.edges = [];
        this.networkData.clusters = [];
        
        // Collect data from all systems
        await Promise.all([
            this.collectMicroserviceNodes(),
            this.collectThoughtNetworkNodes(),
            this.collectBridgeNodes()
        ]);

        this.networkData.lastUpdated = new Date().toISOString();
        
        console.log(`✅ Network updated: ${this.networkData.nodes.length} nodes, ${this.networkData.edges.length} edges`);
    }

    async collectMicroserviceNodes() {
        try {
            // Get microservice data from brain
            const brainResponse = await axios.get('http://localhost:3333/brain/network', { timeout: 5000 });
            const brainData = brainResponse.data;

            // Add brain node
            this.networkData.nodes.push({
                id: 'hydra-brain',
                label: 'Hydra Brain',
                type: 'brain',
                cluster: 'original-hydra',
                size: 30,
                color: '#ff6b6b',
                data: {
                    port: 3333,
                    thoughts_queued: brainData.thoughts_pending || 0,
                    services_connected: brainData.services?.length || 0
                }
            });

            // Add orchestrator node
            try {
                const orchestratorResponse = await axios.get('http://localhost:4444/orchestrator/health', { timeout: 3000 });
                const orchestratorData = orchestratorResponse.data;

                this.networkData.nodes.push({
                    id: 'neural-orchestrator',
                    label: 'Neural Orchestrator',
                    type: 'orchestrator',
                    cluster: 'original-hydra',
                    size: 25,
                    color: '#4ecdc4',
                    data: {
                        port: 4444,
                        services_managed: orchestratorData.services_managed || 0,
                        decisions_made: orchestratorData.decisions_made || 0
                    }
                });

                // Connect brain to orchestrator
                this.networkData.edges.push({
                    from: 'hydra-brain',
                    to: 'neural-orchestrator',
                    type: 'intelligence-flow',
                    label: 'Decision Intelligence',
                    color: '#95a5a6'
                });
            } catch (error) {
                console.log('⚠️ Neural orchestrator not available');
            }

            // Add microservices
            if (brainData.services) {
                brainData.services.forEach(([serviceName, serviceData]) => {
                    this.networkData.nodes.push({
                        id: serviceName,
                        label: serviceName.toUpperCase(),
                        type: 'microservice',
                        cluster: 'microservices',
                        size: 15,
                        color: '#45b7d1',
                        data: {
                            port: serviceData.port,
                            thought_count: serviceData.thought_count || 0,
                            last_seen: serviceData.last_seen
                        }
                    });

                    // Connect service to brain
                    this.networkData.edges.push({
                        from: serviceName,
                        to: 'hydra-brain',
                        type: 'data-flow',
                        label: 'Events & Metrics',
                        color: '#bdc3c7'
                    });
                });
            }

        } catch (error) {
            console.log(`⚠️ Could not collect microservice data: ${error.message}`);
        }
    }

    async collectThoughtNetworkNodes() {
        try {
            // Add GistGhost node
            this.networkData.nodes.push({
                id: 'gistghost',
                label: 'GistGhost',
                type: 'gistghost',
                cluster: 'enhanced-hydra',
                size: 30,
                color: '#6c5ce7',
                data: {
                    system: 'distributed-cognition',
                    repository: 'hosting-tools-toolkit'
                }
            });

            // Get thought network data (simulated - would come from GistGhost in real implementation)
            const thoughtNodes = [
                { id: 'hosting-performance', label: 'Hosting Performance', priority: 9 },
                { id: 'user-insights', label: 'User Insights', priority: 8 },
                { id: 'marketing-analysis', label: 'Marketing Analysis', priority: 7 },
                { id: 'content-optimization', label: 'Content Optimization', priority: 6 }
            ];

            thoughtNodes.forEach(thought => {
                this.networkData.nodes.push({
                    id: thought.id,
                    label: thought.label,
                    type: 'thought',
                    cluster: 'thought-network',
                    size: 10 + thought.priority,
                    color: '#a29bfe',
                    data: {
                        priority: thought.priority,
                        type: 'distributed-thought'
                    }
                });

                // Connect thoughts to GistGhost
                this.networkData.edges.push({
                    from: thought.id,
                    to: 'gistghost',
                    type: 'thought-flow',
                    label: 'Neural Connection',
                    color: '#fd79a8'
                });
            });

            // Add evolution connections between thoughts
            this.networkData.edges.push({
                from: 'hosting-performance',
                to: 'user-insights',
                type: 'evolution',
                label: 'Evolves Into',
                color: '#00b894'
            });

        } catch (error) {
            console.log(`⚠️ Could not collect thought network data: ${error.message}`);
        }
    }

    async collectBridgeNodes() {
        try {
            // Add sync bridge node
            const syncResponse = await axios.get('http://localhost:5555/sync/health', { timeout: 3000 });
            const syncData = syncResponse.data;

            this.networkData.nodes.push({
                id: 'hydra-sync',
                label: 'Hydra Sync Bridge',
                type: 'bridge',
                cluster: 'bridge-layer',
                size: 25,
                color: '#00cec9',
                data: {
                    port: 5555,
                    last_sync: syncData.last_sync,
                    sync_operations: syncData.sync_operations || 0
                }
            });

            // Connect bridge to both systems
            this.networkData.edges.push({
                from: 'hydra-sync',
                to: 'hydra-brain',
                type: 'sync-flow',
                label: 'Intelligence Sync',
                color: '#fdcb6e'
            });

            this.networkData.edges.push({
                from: 'hydra-sync',
                to: 'gistghost',
                type: 'sync-flow',
                label: 'Cross-Network Bridge',
                color: '#fdcb6e'
            });

        } catch (error) {
            console.log('⚠️ Sync bridge not available');
            
            // Add placeholder bridge node
            this.networkData.nodes.push({
                id: 'hydra-sync',
                label: 'Hydra Sync (Offline)',
                type: 'bridge',
                cluster: 'bridge-layer',
                size: 20,
                color: '#636e72',
                data: { status: 'offline' }
            });
        }

        // Define clusters for better visualization
        this.networkData.clusters = [
            { id: 'original-hydra', label: 'Original Hydra', color: '#ff6b6b' },
            { id: 'microservices', label: 'Microservices', color: '#45b7d1' },
            { id: 'enhanced-hydra', label: 'Enhanced Hydra', color: '#6c5ce7' },
            { id: 'thought-network', label: 'Thought Network', color: '#a29bfe' },
            { id: 'bridge-layer', label: 'Intelligence Bridge', color: '#00cec9' }
        ];
    }

    generateVisualizationHTML() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧠 Hydra Network Visualization</title>
    <script src="https://unpkg.com/vis-network@latest/dist/vis-network.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 2.5em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .dashboard {
            display: flex;
            gap: 20px;
            height: 80vh;
        }
        .network-container {
            flex: 1;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }
        .sidebar {
            width: 300px;
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }
        .stats-box {
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .stats-box h3 {
            margin: 0 0 10px 0;
            color: #4ecdc4;
        }
        .legend {
            margin-top: 20px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .controls {
            margin-bottom: 20px;
        }
        .btn {
            background: #4ecdc4;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
        }
        .btn:hover {
            background: #45b7d1;
        }
        #network {
            width: 100%;
            height: calc(100% - 60px);
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 Hydra Network Visualization</h1>
        <p>Distributed Intelligence Ecosystem - Original + Enhanced Hydra</p>
    </div>
    
    <div class="dashboard">
        <div class="network-container">
            <div class="controls">
                <button class="btn" onclick="refreshNetwork()">🔄 Refresh Network</button>
                <button class="btn" onclick="exportNetwork()">📊 Export Data</button>
                <button class="btn" onclick="togglePhysics()">⚡ Toggle Physics</button>
            </div>
            <div id="network"></div>
        </div>
        
        <div class="sidebar">
            <div class="stats-box">
                <h3>📈 Network Statistics</h3>
                <div id="stats-content">Loading...</div>
            </div>
            
            <div class="legend">
                <h3>🎨 Node Types</h3>
                <div class="legend-item">
                    <div class="legend-color" style="background: #ff6b6b;"></div>
                    <span>Hydra Brain</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #4ecdc4;"></div>
                    <span>Neural Orchestrator</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #45b7d1;"></div>
                    <span>Microservices</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #6c5ce7;"></div>
                    <span>GistGhost</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #a29bfe;"></div>
                    <span>Thoughts</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #00cec9;"></div>
                    <span>Sync Bridge</span>
                </div>
            </div>
            
            <div class="stats-box">
                <h3>🔗 Connection Types</h3>
                <div style="margin: 5px 0;"><strong>Data Flow:</strong> Service → Brain</div>
                <div style="margin: 5px 0;"><strong>Intelligence:</strong> Brain → Orchestrator</div>
                <div style="margin: 5px 0;"><strong>Thought Flow:</strong> Thought → GistGhost</div>
                <div style="margin: 5px 0;"><strong>Sync Flow:</strong> Cross-network bridge</div>
                <div style="margin: 5px 0;"><strong>Evolution:</strong> Thought evolution</div>
            </div>
        </div>
    </div>

    <script>
        let network;
        let physicsEnabled = true;

        async function loadNetworkData() {
            try {
                const response = await fetch('/api/network');
                const data = await response.json();
                
                const nodes = new vis.DataSet(data.nodes);
                const edges = new vis.DataSet(data.edges);
                
                const container = document.getElementById('network');
                const networkData = { nodes, edges };
                
                const options = {
                    nodes: {
                        font: { color: 'white', size: 12 },
                        borderWidth: 2,
                        shadow: true
                    },
                    edges: {
                        font: { color: 'white', size: 10, align: 'middle' },
                        arrows: { to: { enabled: true } },
                        shadow: true,
                        smooth: { type: 'continuous' }
                    },
                    physics: {
                        enabled: physicsEnabled,
                        stabilization: { iterations: 100 }
                    },
                    groups: {
                        brain: { color: '#ff6b6b', shape: 'hexagon' },
                        orchestrator: { color: '#4ecdc4', shape: 'triangle' },
                        microservice: { color: '#45b7d1', shape: 'box' },
                        gistghost: { color: '#6c5ce7', shape: 'star' },
                        thought: { color: '#a29bfe', shape: 'circle' },
                        bridge: { color: '#00cec9', shape: 'diamond' }
                    }
                };
                
                if (network) {
                    network.destroy();
                }
                
                network = new vis.Network(container, networkData, options);
                
                network.on('click', function(event) {
                    if (event.nodes.length > 0) {
                        const nodeId = event.nodes[0];
                        const node = nodes.get(nodeId);
                        showNodeDetails(node);
                    }
                });
                
                updateStats(data);
                
            } catch (error) {
                console.error('Failed to load network data:', error);
                document.getElementById('stats-content').innerHTML = '<div style="color: #ff6b6b;">❌ Network data unavailable</div>';
            }
        }
        
        function showNodeDetails(node) {
            alert(\`Node Details:\\n\\nID: \${node.id}\\nLabel: \${node.label}\\nType: \${node.type}\\nCluster: \${node.cluster}\\nData: \${JSON.stringify(node.data, null, 2)}\`);
        }
        
        function updateStats(data) {
            const stats = \`
                <div><strong>Nodes:</strong> \${data.nodes.length}</div>
                <div><strong>Edges:</strong> \${data.edges.length}</div>
                <div><strong>Clusters:</strong> \${data.clusters.length}</div>
                <div><strong>Last Updated:</strong> \${new Date(data.lastUpdated).toLocaleTimeString()}</div>
            \`;
            document.getElementById('stats-content').innerHTML = stats;
        }
        
        async function refreshNetwork() {
            document.getElementById('stats-content').innerHTML = '🔄 Refreshing...';
            await fetch('/api/refresh', { method: 'POST' });
            await loadNetworkData();
        }
        
        function exportNetwork() {
            window.open('/api/export/json', '_blank');
        }
        
        function togglePhysics() {
            physicsEnabled = !physicsEnabled;
            if (network) {
                network.setOptions({ physics: { enabled: physicsEnabled } });
            }
        }
        
        // Load network data on page load
        loadNetworkData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadNetworkData, 30000);
    </script>
</body>
</html>`;
    }

    calculateNetworkStats() {
        const nodesByType = {};
        const edgesByType = {};

        this.networkData.nodes.forEach(node => {
            nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
        });

        this.networkData.edges.forEach(edge => {
            edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
        });

        return {
            total_nodes: this.networkData.nodes.length,
            total_edges: this.networkData.edges.length,
            nodes_by_type: nodesByType,
            edges_by_type: edgesByType,
            clusters: this.networkData.clusters.length,
            last_updated: this.networkData.lastUpdated
        };
    }

    exportNetworkData(format) {
        switch (format) {
            case 'json':
                return JSON.stringify(this.networkData, null, 2);
            case 'dot':
                return this.exportToDot();
            case 'csv':
                return this.exportToCSV();
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    exportToDot() {
        let dot = 'digraph HydraNetwork {\n';
        dot += '  rankdir=TB;\n';
        dot += '  node [shape=box, style=filled];\n\n';

        // Add nodes
        this.networkData.nodes.forEach(node => {
            const color = node.color.replace('#', '');
            dot += `  "${node.id}" [label="${node.label}" fillcolor="#${color}"];\n`;
        });

        dot += '\n';

        // Add edges
        this.networkData.edges.forEach(edge => {
            dot += `  "${edge.from}" -> "${edge.to}" [label="${edge.label}"];\n`;
        });

        dot += '}';
        return dot;
    }

    exportToCSV() {
        let csv = 'Type,ID,Label,Cluster,Size,Color\n';
        
        this.networkData.nodes.forEach(node => {
            csv += `node,${node.id},${node.label},${node.cluster},${node.size},${node.color}\n`;
        });

        this.networkData.edges.forEach(edge => {
            csv += `edge,${edge.from}->${edge.to},${edge.label},${edge.type},,\n`;
        });

        return csv;
    }

    getContentType(format) {
        const types = {
            'json': 'application/json',
            'dot': 'text/plain',
            'csv': 'text/csv'
        };
        return types[format] || 'text/plain';
    }

    initializeVisualization() {
        // Update network data every 30 seconds
        setInterval(async () => {
            await this.updateNetworkData();
        }, 30000);

        // Initial data collection
        setTimeout(async () => {
            await this.updateNetworkData();
        }, 2000);

        console.log('📊 Network visualization system initialized');
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`📊 HYDRA VISUALIZER - Network Intelligence Dashboard Active`);
            console.log(`   Port: ${this.port}`);
            console.log(`   Dashboard: http://localhost:${this.port}`);
            console.log(`   API: http://localhost:${this.port}/api/network`);
            console.log('');
            console.log('🎨 Visualization features:');
            console.log('   • Interactive network graph');
            console.log('   • Real-time data updates');
            console.log('   • Multi-format export');
            console.log('   • Cross-system intelligence mapping');
            console.log('');
        });
    }
}

// Start the Hydra Visualizer
const visualizer = new HydraVisualizer();
visualizer.start();