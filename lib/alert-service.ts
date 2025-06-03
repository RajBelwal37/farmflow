export interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AlertService {
  async createAlert(data: Omit<Alert, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return await res.json();
  }

  async getActiveAlerts(): Promise<Alert[]> {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return await res.json();
  }

  async deleteAlert(id: string): Promise<void> {
    const res = await fetch('/api/alerts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to delete alert');
  }
} 