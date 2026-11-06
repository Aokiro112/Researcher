import { QueryAnalysis, ResearchDimension, ResearchPlan } from './types';

export function createResearchPlan(analysis: QueryAnalysis): ResearchPlan {
  const { cleanQuery, intent, depth, targetDomain, targetUrl, entities, isFreshnessRequired } = analysis;
  const dimensions: ResearchDimension[] = [];
  const yearSuffix = isFreshnessRequired ? ' 2025 2026' : '';

  // 1. Direct URL / Domain Extraction Plan
  if (intent === 'URL_EXTRACTION' && targetDomain) {
    dimensions.push({
      id: 'site_primary',
      name: `Direct Content from ${targetDomain}`,
      description: `Official pages and primary content published on ${targetDomain}`,
      searchQueries: [
        `"${targetDomain}"`,
        `site:${targetDomain}`,
        `${targetDomain} about home features`,
      ],
      priority: 1,
    });

    if (depth !== 'NORMAL') {
      dimensions.push({
        id: 'site_context',
        name: `Context and Documentation for ${targetDomain}`,
        description: `External references, official resources, and background regarding ${targetDomain}`,
        searchQueries: [
          `${targetDomain} overview documentation`,
          `${cleanQuery.replace(targetDomain, '').trim()} ${targetDomain}`,
        ].filter((q) => q.trim().length > 3),
        priority: 2,
      });
    }
  }
  // 2. Comparative Research Plan
  else if (intent === 'COMPARISON' && entities.length >= 2) {
    const [eA, eB] = entities;
    dimensions.push({
      id: 'entity_a_specs',
      name: `${eA} Architecture & Technical Specifications`,
      description: `Primary technical specifications, compute units, memory, and baseline metrics for ${eA}`,
      searchQueries: [
        `${eA} specifications architecture compute memory${yearSuffix}`,
        `${eA} official specs overview`,
      ],
      priority: 1,
    });

    dimensions.push({
      id: 'entity_b_specs',
      name: `${eB} Architecture & Technical Specifications`,
      description: `Primary technical specifications, compute units, memory, and baseline metrics for ${eB}`,
      searchQueries: [
        `${eB} specifications architecture compute memory${yearSuffix}`,
        `${eB} official specs overview`,
      ],
      priority: 1,
    });

    dimensions.push({
      id: 'head_to_head_benchmarks',
      name: 'Direct Benchmarks & Workload Performance',
      description: `Comparative benchmarks, performance measurements, and real-world throughput`,
      searchQueries: [
        `${eA} vs ${eB} benchmark performance comparison${yearSuffix}`,
        `${cleanQuery} test results review`,
      ],
      priority: 2,
    });

    if (depth === 'DEEP_RESEARCH') {
      dimensions.push({
        id: 'software_ecosystem',
        name: 'Software Ecosystem & Production Usability',
        description: `Driver stability, library/framework support, community adoption, and pricing/availability`,
        searchQueries: [
          `${eA} vs ${eB} framework driver support ecosystem`,
          `${eA} vs ${eB} price power consumption thermals${yearSuffix}`,
        ],
        priority: 3,
      });
    }
  }
  // 3. Technical Research Plan
  else if (intent === 'TECHNICAL') {
    dimensions.push({
      id: 'core_mechanics',
      name: 'Core Mechanics & Specifications',
      description: `Underlying architecture, foundational concepts, and official specifications`,
      searchQueries: [
        `${cleanQuery} architecture technical specifications`,
        `${cleanQuery} how it works mechanism`,
      ],
      priority: 1,
    });

    dimensions.push({
      id: 'production_eval',
      name: 'Production Performance & Practical Benchmarks',
      description: `Real-world evaluations, throughput measurements, and state-of-the-art benchmarks`,
      searchQueries: [
        `${cleanQuery} benchmark performance real world${yearSuffix}`,
        `${cleanQuery} implementation guide best practices`,
      ],
      priority: 2,
    });

    if (depth === 'DEEP_RESEARCH') {
      dimensions.push({
        id: 'tradeoffs_limitations',
        name: 'Bottlenecks, Caveats & Comparative Alternatives',
        description: `Identified limitations, failure modes, trade-offs, and alternative approaches`,
        searchQueries: [
          `${cleanQuery} challenges limitations disadvantages`,
          `${cleanQuery} alternatives comparison`,
        ],
        priority: 3,
      });
    }
  }
  // 4. Default / Exploratory Research Plan
  else {
    dimensions.push({
      id: 'foundational_insights',
      name: 'Verified Facts & Primary Findings',
      description: `Authoritative answers and primary sources addressing the core query`,
      searchQueries: [
        cleanQuery,
        `${cleanQuery} overview facts explanation`,
      ],
      priority: 1,
    });

    if (depth !== 'NORMAL') {
      dimensions.push({
        id: 'detailed_analysis',
        name: 'Context, Analysis & Developments',
        description: `Comprehensive context, background, and reported developments`,
        searchQueries: [
          `${cleanQuery} detailed analysis${yearSuffix}`,
          `${cleanQuery} practical implications`,
        ],
        priority: 2,
      });
    }

    if (depth === 'DEEP_RESEARCH') {
      dimensions.push({
        id: 'perspectives_outlook',
        name: 'Comparative Perspectives & Current Landscape',
        description: `Diverse industry viewpoints, criticisms, and forward-looking status`,
        searchQueries: [
          `${cleanQuery} challenges industry perspective${yearSuffix}`,
        ],
        priority: 3,
      });
    }
  }

  // Determine source and passage limits
  let maxSourcesToFetch = 6;
  let maxPassagesToExtract = 10;

  if (depth === 'RESEARCH') {
    maxSourcesToFetch = 10;
    maxPassagesToExtract = 16;
  } else if (depth === 'DEEP_RESEARCH') {
    maxSourcesToFetch = 16;
    maxPassagesToExtract = 24;
  }

  return {
    queryAnalysis: analysis,
    dimensions,
    maxSourcesToFetch,
    maxPassagesToExtract,
  };
}
