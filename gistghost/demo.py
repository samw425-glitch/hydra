#!/usr/bin/env python3
"""
GistGhost Demo for Hosting Tools Toolkit Integration

This script demonstrates how GistGhost can be used to create
an intelligent content network for hosting-related insights.
"""

import os
import sys
import time
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from gistghost import GistGhost


def main():
    """Demo GistGhost integration with hosting toolkit."""
    print("🧠 GistGhost x Hosting Tools Toolkit Integration Demo")
    print("=" * 60)
    
    # Initialize GistGhost
    try:
        ghost = GistGhost()
        print("✅ GistGhost initialized")
    except Exception as e:
        print(f"❌ Failed to initialize GistGhost: {e}")
        print("\n💡 Make sure you've run:")
        print("   python gistghost.py setup --token YOUR_GITHUB_TOKEN --origin hosting-toolkit")
        return
    
    # Demo 1: Create hosting insights
    print("\n📊 Demo 1: Creating hosting performance insights...")
    
    hosting_insights = [
        {
            "intent": "hosting-guide: Performance optimization",
            "content": """
# Hosting Performance Best Practices

## Key Metrics to Monitor
- Page load time: Target < 3 seconds
- Server response time: Target < 200ms
- Uptime: Target > 99.9%
- Core Web Vitals compliance

## Optimization Strategies
1. CDN implementation (Cloudflare recommended)
2. Image compression and lazy loading
3. Database query optimization
4. Caching layers (Redis/Memcached)
5. Server-side compression (gzip/brotli)

## Tools Integration
- Google PageSpeed Insights for analysis
- GTmetrix for detailed performance reports
- New Relic for server monitoring
- Cloudflare Analytics for CDN metrics
            """.strip(),
            "priority": 9
        },
        {
            "intent": "user-insight: Common hosting pain points",
            "content": """
# User Research: Hosting Pain Points Analysis

## Top Issues Identified
1. **Slow Loading Times** (78% of complaints)
   - Users abandon sites after 3+ seconds
   - Mobile users especially sensitive
   
2. **Downtime Events** (65% of complaints)
   - Even short outages impact trust
   - Need better monitoring/alerting
   
3. **Complex Setup** (52% of complaints)
   - DNS configuration confusion
   - SSL certificate installation issues
   
4. **Cost Transparency** (41% of complaints)
   - Hidden fees for bandwidth overages
   - Unclear renewal pricing

## Opportunities
- Create simplified setup guides
- Develop cost calculator tools
- Build automated monitoring alerts
- Offer performance optimization services
            """.strip(),
            "priority": 8
        },
        {
            "intent": "marketing-analysis: Affiliate opportunity assessment",
            "content": """
# Hosting Tools Affiliate Market Analysis

## High-Converting Tools
1. **Cloudflare** - 15% conversion rate
   - Pro plan: $20/month → $36/year commission
   - Business plan: $200/month → $360/year commission
   
2. **SiteGround Hosting** - 12% conversion rate
   - Shared hosting: $4-15/month → $50-200/year commission
   - Strong brand recognition
   
3. **WP Engine** - 8% conversion rate
   - Managed WordPress: $25-290/month
   - Higher-value customers

## Content Strategy
- Create comparison guides for each tier
- Develop "tool stack" recommendations
- Build cost-benefit calculators
- Offer exclusive deals/bonuses

## Traffic Sources
- Organic search: 60% of conversions
- Email marketing: 25% of conversions  
- Social media: 15% of conversions
            """.strip(),
            "priority": 7
        }
    ]
    
    thought_ids = []
    for insight in hosting_insights:
        try:
            thought_id = ghost.create_thought(
                intent=insight["intent"],
                content=insight["content"],
                priority=insight["priority"]
            )
            thought_ids.append(thought_id)
            print(f"  ✅ Created: {insight['intent']}")
            time.sleep(1)  # Be nice to GitHub API
        except Exception as e:
            print(f"  ❌ Failed to create {insight['intent']}: {e}")
    
    # Demo 2: Link related thoughts
    if len(thought_ids) >= 2:
        print("\n🔗 Demo 2: Linking related thoughts...")
        try:
            ghost.link_thoughts(
                thought_ids[0], 
                thought_ids[1], 
                relationship="builds-on"
            )
            print("  ✅ Linked performance guide with user insights")
            
            ghost.link_thoughts(
                thought_ids[1], 
                thought_ids[2], 
                relationship="informs"
            )
            print("  ✅ Linked user insights with marketing analysis")
        except Exception as e:
            print(f"  ❌ Failed to link thoughts: {e}")
    
    # Demo 3: Evolution simulation
    if thought_ids:
        print("\n🔄 Demo 3: Evolving insights based on new data...")
        try:
            evolved_content = """
# Updated Hosting Performance Best Practices

## New Findings (Latest Update)
- HTTP/3 adoption improving load times by 15%
- Edge computing reducing latency by 30%
- WebP images showing 25% size reduction vs JPEG

## Updated Optimization Strategies
1. **HTTP/3 Implementation** (NEW)
2. CDN with edge computing capabilities
3. Next-gen image formats (WebP, AVIF)
4. Service worker caching strategies
5. Database connection pooling

## Updated Tools Integration
- Cloudflare now supports HTTP/3 by default
- Chrome DevTools added Core Web Vitals panel
- New Relic Browser monitoring enhanced
- Google Analytics 4 performance insights
            """
            
            evolved_id = ghost.evolve_thought(
                thought_ids[0],
                new_content=evolved_content.strip(),
                new_intent="hosting-guide: Performance optimization v2.0"
            )
            print(f"  ✅ Evolved performance guide: {evolved_id}")
            
        except Exception as e:
            print(f"  ❌ Failed to evolve thought: {e}")
    
    # Demo 4: Network analysis
    print("\n📈 Demo 4: Analyzing thought network...")
    try:
        ghost.show_network()
    except Exception as e:
        print(f"  ❌ Failed to analyze network: {e}")
    
    # Demo 5: List recent thoughts
    print("\n📋 Demo 5: Recent thoughts in the network...")
    try:
        thoughts = ghost.list_thoughts(limit=5)
    except Exception as e:
        print(f"  ❌ Failed to list thoughts: {e}")
    
    print("\n🎉 Demo completed!")
    print("\n💡 Next steps:")
    print("   1. Explore the created gists on GitHub")
    print("   2. Try evolving thoughts with new insights")
    print("   3. Build automation to sync hosting metrics → thoughts")
    print("   4. Create content pipelines using the thought network")
    print("\n🔗 Learn more: gistghost/INTEGRATION.md")


if __name__ == "__main__":
    main()