// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Authentication Health Check Logger - PWA iOS Safari Debugging

interface AuthHealthCheck {
  timestamp: string;
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  userAgent?: string;
  pathname?: string;
}

class AuthHealthCheckLogger {
  private logs: AuthHealthCheck[] = [];
  private maxLogs = 50;

  log(step: string, success: boolean, data?: any, error?: string) {
    const logEntry: AuthHealthCheck = {
      timestamp: new Date().toISOString(),
      step,
      success,
      data,
      error,
      userAgent: navigator.userAgent,
      pathname: window.location.pathname
    };

    this.logs.unshift(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage for persistence
    localStorage.setItem('authHealthLogs', JSON.stringify(this.logs));

    // Console log for debugging
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} AUTH HEALTH [${step}]:`, { success, data, error });
  }

  getLogs(): AuthHealthCheck[] {
    return this.logs;
  }

  getRecentFailures(): AuthHealthCheck[] {
    return this.logs.filter(log => !log.success);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('authHealthLogs');
    console.log('🧹 Auth health logs cleared');
  }

  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalLogs: this.logs.length,
      failureCount: this.getRecentFailures().length,
      successRate: this.logs.length > 0 ? ((this.logs.filter(l => l.success).length / this.logs.length) * 100).toFixed(2) + '%' : 'N/A',
      logs: this.logs
    };

    return JSON.stringify(report, null, 2);
  }

  // Restore logs from localStorage on init
  private restoreLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem('authHealthLogs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.warn('⚠️ Failed to restore auth health logs:', error);
    }
  }

  constructor() {
    this.restoreLogsFromStorage();
  }
}

// Export singleton instance
export const authHealthLogger = new AuthHealthCheckLogger();

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
