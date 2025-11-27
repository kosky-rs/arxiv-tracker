import { XMLParser } from 'fast-xml-parser';

export interface ArxivPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated: string;
  link: string;
  category: string[];
}

const BASE_URL = 'http://export.arxiv.org/api/query';

export async function fetchDailyRAGPapers(maxResults: number = 20): Promise<ArxivPaper[]> {
  // Query for RAG or Retrieval-Augmented Generation in Abstract, restricted to CS.CL (Computation and Language) or CS.AI
  // We sort by submittedDate descending to get the latest.
  const query = 'cat:cs.CL AND (abs:RAG OR abs:"Retrieval-Augmented Generation")';
  const sortBy = 'submittedDate';
  const sortOrder = 'descending';

  const url = `${BASE_URL}?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from arXiv: ${response.statusText}`);
    }

    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const result = parser.parse(xmlData);

    const entries = result.feed.entry;
    
    if (!entries) return [];

    // Handle case where there is only one entry (parser might return object instead of array)
    const entriesArray = Array.isArray(entries) ? entries : [entries];

    interface ArxivEntry {
      id: string;
      title: string;
      summary: string;
      author: { name: string } | { name: string }[];
      published: string;
      updated: string;
      category: { '@_term': string } | { '@_term': string }[];
    }

    return entriesArray.map((entry: ArxivEntry) => ({
      id: entry.id,
      title: entry.title.replace(/\n/g, ' ').trim(),
      summary: entry.summary.replace(/\n/g, ' ').trim(),
      authors: Array.isArray(entry.author)
        ? entry.author.map((a) => a.name)
        : [entry.author.name],
      published: entry.published,
      updated: entry.updated,
      link: entry.id, // arXiv ID is the URL usually
      category: Array.isArray(entry.category)
        ? entry.category.map((c) => c['@_term'])
        : [entry.category['@_term']]
    }));

  } catch (error) {
    console.error("Error fetching arXiv papers:", error);
    return [];
  }
}

export async function fetchDateRangeRAGPapers(startDate: string, endDate: string, maxResults: number = 100): Promise<ArxivPaper[]> {
  // Date format: YYYYMMDD (e.g., 20251125)
  // Query for RAG papers submitted in the specified date range
  const query = `cat:cs.CL AND (abs:RAG OR abs:"Retrieval-Augmented Generation") AND submittedDate:[${startDate} TO ${endDate}]`;
  const sortBy = 'submittedDate';
  const sortOrder = 'descending';

  const url = `${BASE_URL}?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from arXiv: ${response.statusText}`);
    }

    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const result = parser.parse(xmlData);

    const entries = result.feed.entry;

    if (!entries) return [];

    const entriesArray = Array.isArray(entries) ? entries : [entries];

    interface ArxivEntry {
      id: string;
      title: string;
      summary: string;
      author: { name: string } | { name: string }[];
      published: string;
      updated: string;
      category: { '@_term': string } | { '@_term': string }[];
    }

    return entriesArray.map((entry: ArxivEntry) => ({
      id: entry.id,
      title: entry.title.replace(/\n/g, ' ').trim(),
      summary: entry.summary.replace(/\n/g, ' ').trim(),
      authors: Array.isArray(entry.author)
        ? entry.author.map((a) => a.name)
        : [entry.author.name],
      published: entry.published,
      updated: entry.updated,
      link: entry.id,
      category: Array.isArray(entry.category)
        ? entry.category.map((c) => c['@_term'])
        : [entry.category['@_term']]
    }));

  } catch (error) {
    console.error("Error fetching date range arXiv papers:", error);
    return [];
  }
}
