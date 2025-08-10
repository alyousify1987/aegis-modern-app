// ETL Pipeline Service: IndexedDB -> Arrow -> DuckDB
import { getDexieAsync } from '../db/dexie';
import { initDuckDB, query as duckQuery, registerTable } from '../duckdb/db';

export interface ETLJobStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  recordsProcessed: number;
  totalRecords: number;
  errors: string[];
}

export interface ETLConfig {
  tables: Array<{
    source: string; // IndexedDB table name
    target: string; // DuckDB table name
    transform?: (data: any[]) => any[]; // Optional transformation function
    schedule?: 'realtime' | 'hourly' | 'daily';
  }>;
  batchSize: number;
  retryAttempts: number;
}

class ETLPipelineService {
  private jobs: Map<string, ETLJobStatus> = new Map();
  private config: ETLConfig;
  private isRunning = false;
  private worker?: Worker;

  constructor(config: ETLConfig) {
    this.config = config;
    this.initializeWorker();
  }

  private initializeWorker(): void {
    // Create a Web Worker for background ETL processing
    const workerCode = `
      let duckDBInitialized = false;
      
      self.onmessage = async function(e) {
        const { type, data } = e.data;
        
        try {
          switch (type) {
            case 'INIT_DUCKDB':
              if (!duckDBInitialized) {
                // Initialize DuckDB in worker context
                // This would require importing DuckDB-WASM in the worker
                duckDBInitialized = true;
                self.postMessage({ type: 'INIT_SUCCESS' });
              }
              break;
              
            case 'PROCESS_BATCH':
              const result = await processBatch(data);
              self.postMessage({ type: 'BATCH_PROCESSED', result });
              break;
              
            case 'EXECUTE_QUERY':
              const queryResult = await executeQuery(data.query);
              self.postMessage({ type: 'QUERY_RESULT', result: queryResult });
              break;
              
            default:
              self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
          }
        } catch (error) {
          self.postMessage({ type: 'ERROR', error: error.message });
        }
      };
      
      async function processBatch(batchData) {
        // Process data transformation and loading
        return { processed: batchData.length, success: true };
      }
      
      async function executeQuery(query) {
        // Execute DuckDB query
        return { rows: [], columns: [] };
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
    
    this.worker.onmessage = (e) => {
      this.handleWorkerMessage(e.data);
    };
    
    this.worker.onerror = (error) => {
      console.error('ETL Worker error:', error);
    };
  }

  private handleWorkerMessage(message: any): void {
    switch (message.type) {
      case 'INIT_SUCCESS':
        console.log('DuckDB initialized in ETL worker');
        break;
      case 'BATCH_PROCESSED':
        console.log('Batch processed:', message.result);
        break;
      case 'QUERY_RESULT':
        console.log('Query executed:', message.result);
        break;
      case 'ERROR':
        console.error('ETL Worker error:', message.error);
        break;
    }
  }

  async startPipeline(): Promise<void> {
    if (this.isRunning) {
      throw new Error('ETL pipeline is already running');
    }

    this.isRunning = true;
    console.log('Starting ETL pipeline...');

    try {
      // Initialize DuckDB
      await initDuckDB();
      
      // Process each configured table
      for (const tableConfig of this.config.tables) {
        await this.processTable(tableConfig);
      }
      
      console.log('ETL pipeline completed successfully');
    } catch (error) {
      console.error('ETL pipeline failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async processTable(tableConfig: any): Promise<void> {
    const jobId = `etl_${tableConfig.source}_${Date.now()}`;
    const job: ETLJobStatus = {
      id: jobId,
      name: `ETL ${tableConfig.source} -> ${tableConfig.target}`,
      status: 'pending',
      recordsProcessed: 0,
      totalRecords: 0,
      errors: []
    };

    this.jobs.set(jobId, job);

    try {
      job.status = 'running';
      job.startTime = new Date();

      // Extract data from IndexedDB
      const sourceData = await this.extractFromIndexedDB(tableConfig.source);
      job.totalRecords = sourceData.length;

      // Transform data if transformation function provided
      let transformedData = sourceData;
      if (tableConfig.transform) {
        transformedData = tableConfig.transform(sourceData);
      }

      // Load data into DuckDB in batches
      await this.loadToDuckDB(tableConfig.target, transformedData, job);

      job.status = 'completed';
      job.endTime = new Date();
      
    } catch (error) {
      job.status = 'failed';
      job.errors.push(error instanceof Error ? error.message : 'Unknown error');
      job.endTime = new Date();
      throw error;
    }
  }

  private async extractFromIndexedDB(tableName: string): Promise<any[]> {
    try {
      const db = await getDexieAsync();
      
      switch (tableName) {
        case 'audits':
          return await db.table('audits').toArray();
        case 'findings':
          return await db.table('findings').toArray() || [];
        case 'nonconformances':
          return await db.table('ncrs').toArray();
        case 'risks':
          return await db.table('risks').toArray() || [];
        case 'actions':
          return await db.table('capas').toArray();
        case 'documents':
          return await db.table('documents').toArray();
        default:
          throw new Error(`Unknown table: ${tableName}`);
      }
    } catch (error) {
      console.error(`Failed to extract data from ${tableName}:`, error);
      throw error;
    }
  }

  private async loadToDuckDB(tableName: string, data: any[], job: ETLJobStatus): Promise<void> {
    if (data.length === 0) {
      console.log(`No data to load for table ${tableName}`);
      return;
    }

    try {
      // Convert data to Arrow format for DuckDB
      const arrowData = this.convertToArrowFormat(data);
      
      // Register table in DuckDB
      const columns = arrowData.columns;
      const rows = this.convertToRowFormat(arrowData);
      await registerTable(tableName, columns, rows);
      
      // Process in batches
      const batchSize = this.config.batchSize;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // Process batch (this would involve actual DuckDB operations)
        await this.processBatch(tableName, batch);
        
        job.recordsProcessed += batch.length;
      }
      
      console.log(`Successfully loaded ${data.length} records into ${tableName}`);
      
    } catch (error) {
      console.error(`Failed to load data into ${tableName}:`, error);
      throw error;
    }
  }

  private convertToArrowFormat(data: any[]): any {
    // This is a simplified conversion - in reality, we'd use Apache Arrow
    // to properly format the data for DuckDB consumption
    
    if (data.length === 0) return null;
    
    // Extract column names from first record
    const columns = Object.keys(data[0]);
    
    // Create column arrays
    const columnData: Record<string, any[]> = {};
    columns.forEach(col => {
      columnData[col] = data.map(row => row[col]);
    });
    
    return {
      columns,
      data: columnData,
      rowCount: data.length
    };
  }

  private convertToRowFormat(arrowData: any): any[][] {
    if (!arrowData || !arrowData.data) return [];
    
    const { columns, data } = arrowData;
    const rows: any[][] = [];
    
    for (let i = 0; i < arrowData.rowCount; i++) {
      const row: any[] = [];
      columns.forEach((col: string) => {
        row.push(data[col][i]);
      });
      rows.push(row);
    }
    
    return rows;
  }

  private async processBatch(tableName: string, batch: any[]): Promise<void> {
    // Simulate batch processing
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Processed batch of ${batch.length} records for ${tableName}`);
        resolve();
      }, 10);
    });
  }

  async scheduleETL(schedule: 'realtime' | 'hourly' | 'daily'): Promise<void> {
    let interval: number;
    
    switch (schedule) {
      case 'realtime':
        interval = 5000; // 5 seconds for demo
        break;
      case 'hourly':
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case 'daily':
        interval = 24 * 60 * 60 * 1000; // 24 hours
        break;
      default:
        throw new Error(`Unknown schedule: ${schedule}`);
    }

    setInterval(async () => {
      if (!this.isRunning) {
        try {
          await this.startPipeline();
        } catch (error) {
          console.error('Scheduled ETL failed:', error);
        }
      }
    }, interval);
  }

  getJobStatus(jobId: string): ETLJobStatus | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ETLJobStatus[] {
    return Array.from(this.jobs.values());
  }

  async executeAnalyticalQuery(query: string): Promise<any[]> {
    try {
      return await duckQuery(query);
    } catch (error) {
      console.error('Analytical query failed:', error);
      throw error;
    }
  }

  async generateReport(reportType: string): Promise<any> {
    const queries = {
      audit_summary: `
        SELECT 
          status,
          COUNT(*) as count,
          AVG(CASE WHEN findings IS NOT NULL THEN array_length(findings) ELSE 0 END) as avg_findings
        FROM audits 
        GROUP BY status
      `,
      risk_matrix: `
        SELECT 
          likelihood,
          impact,
          COUNT(*) as count
        FROM risks 
        GROUP BY likelihood, impact
      `,
      compliance_trends: `
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as total_findings,
          SUM(CASE WHEN severity = 'major' THEN 1 ELSE 0 END) as major_findings
        FROM findings 
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `
    };

    const query = queries[reportType as keyof typeof queries];
    if (!query) {
      throw new Error(`Unknown report type: ${reportType}`);
    }

    return await this.executeAnalyticalQuery(query);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
    
    // DuckDB cleanup would be handled by the worker termination
    console.log('ETL Pipeline stopped');
  }
}

// Default ETL configuration
const defaultETLConfig: ETLConfig = {
  tables: [
    { source: 'audits', target: 'audit_analytics' },
    { source: 'findings', target: 'finding_analytics' },
    { source: 'nonconformances', target: 'ncr_analytics' },
    { source: 'risks', target: 'risk_analytics' },
    { source: 'actions', target: 'action_analytics' },
    { source: 'documents', target: 'document_analytics' }
  ],
  batchSize: 1000,
  retryAttempts: 3
};

// Singleton instance
export const etlPipeline = new ETLPipelineService(defaultETLConfig);

// Export service functions
export async function initializeETL(): Promise<void> {
  await etlPipeline.startPipeline();
}

export async function scheduleETL(schedule: 'realtime' | 'hourly' | 'daily'): Promise<void> {
  await etlPipeline.scheduleETL(schedule);
}

export async function generateAnalyticalReport(reportType: string): Promise<any> {
  return await etlPipeline.generateReport(reportType);
}

export function getETLStatus(): ETLJobStatus[] {
  return etlPipeline.getAllJobs();
}
