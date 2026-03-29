declare const statusData: {
  lastUpdated: string;
  projectName: string;
  technology: string;
  version: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    type: 'info' | 'bug' | 'task' | 'note' | 'warning';
    badgeVariant: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
    tables?: Array<{ headers: string[]; rows: string[][]; }>;
  }>;
};
export default statusData;
