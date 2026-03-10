import fs from 'fs';
import path from 'path';

interface PleperCategory {
  id: string;
  name: string;
  href: string;
}

let pleperCategories: PleperCategory[] | null = null;

export function loadPleperCategories(): PleperCategory[] {
  if (pleperCategories) return pleperCategories;
  
  try {
    // Try multiple possible paths for the CSV file
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'pleper.csv'),
      path.join(process.cwd(), 'public', 'data', 'pleper.csv'),
      path.join(__dirname, '..', 'data', 'pleper.csv'),
      path.join(__dirname, '..', '..', 'data', 'pleper.csv'),
    ];
    
    let csvPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }
    
    if (!csvPath) {
      console.warn('[CATEGORY FILTER] pleper.csv not found in any expected location');
      return [];
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').slice(1); // Skip header
    
    pleperCategories = lines
      .filter(line => line.trim())
      .map(line => {
        // Handle CSV with quotes
        const matches = line.match(/^"([^"]+)","([^"]+)"/);
        if (matches) {
          return {
            id: matches[1].trim(),
            name: matches[2].trim(),
            href: ''
          };
        }
        const parts = line.split(',');
        if (parts.length >= 2) {
          return {
            id: parts[0].replace(/"/g, '').trim(),
            name: parts[1].replace(/"/g, '').trim(),
            href: ''
          };
        }
        return null;
      })
      .filter(Boolean) as PleperCategory[];
    
    console.log(`[CATEGORY FILTER] Loaded ${pleperCategories.length} categories from pleper.csv`);
    return pleperCategories;
  } catch (error) {
    console.error('[CATEGORY FILTER] Failed to load pleper.csv:', error);
    return [];
  }
}

export class CategoryFilter {
  private static queryKeywords: string[] = [];
  private static pleperCategories: PleperCategory[] = [];

  static initialize(query: string) {
    this.queryKeywords = this.extractKeywords(query);
    this.pleperCategories = loadPleperCategories();
    console.log(`[CATEGORY FILTER] Initialized with keywords:`, this.queryKeywords);
  }

  private static extractKeywords(query: string): string[] {
    const words = query.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 2);
    
    return [...new Set(words)];
  }

  private static scoreCategory(categoryName: string): number {
    if (!categoryName) return 0;
    
    const lowerCategory = categoryName.toLowerCase();
    let score = 0;

    // 1. Direct keyword match in category name (+20 per match)
    this.queryKeywords.forEach(keyword => {
      if (lowerCategory.includes(keyword)) {
        score += 20;
      }
    });

    // 2. Find in pleper and check path (+30 if education related)
    const pleperMatch = this.pleperCategories.find(
      p => p.name.toLowerCase() === lowerCategory
    );
    
    if (pleperMatch) {
      const educationTerms = ['education', 'college', 'university', 'school', 'institute', 'training', 'center'];
      if (educationTerms.some(term => lowerCategory.includes(term))) {
        score += 30;
      }
    }

    // 3. If no query keywords match at all, give low score
    const hasAnyMatch = this.queryKeywords.some(keyword => 
      lowerCategory.includes(keyword)
    );
    if (!hasAnyMatch) {
      score = Math.min(score, 10);
    }

    return score;
  }

  static filter(leads: any[]): any[] {
    if (!leads || leads.length === 0) return [];
    if (this.queryKeywords.length === 0) return leads;

    // Get unique categories from leads
    const categories = [...new Set(leads.map(l => l.category).filter(Boolean))];
    
    // Score each category
    const categoryScores = categories.map(cat => ({
      category: cat,
      score: this.scoreCategory(cat)
    }));

    console.log(`[CATEGORY FILTER] Scoring ${categories.length} categories:`, 
      categoryScores.slice(0, 5).map(c => `${c.category}: ${c.score}`).join(', ')
    );

    // Keep categories with score >= 20
    const includedCategories = new Set(
      categoryScores
        .filter(c => c.score >= 20)
        .map(c => c.category)
    );

    const filtered = leads.filter(lead => 
      includedCategories.has(lead.category)
    );

    console.log(`[CATEGORY FILTER] Kept ${filtered.length}/${leads.length} leads after category filtering`);

    return filtered;
  }

  static validateLeadQuality(lead: any): boolean {
    if (!lead) return false;

    // Check for valid phone OR website
    const hasPhone = lead.phone && 
      lead.phone.length > 5 && 
      lead.phone.length < 50 &&
      /\d/.test(lead.phone);
    
    const hasWebsite = lead.website && 
      lead.website.length > 5 &&
      lead.website.includes('.');

    if (!hasPhone && !hasWebsite) {
      return false;
    }

    // Check for valid address
    if (!lead.address || lead.address.length < 10) {
      return false;
    }

    // Check for generic/placeholder names
    const genericNames = ['website', 'untitled', 'unknown', 'n/a', 'null', 'undefined'];
    if (genericNames.some(g => lead.name?.toLowerCase().includes(g))) {
      return false;
    }

    return true;
  }
}
