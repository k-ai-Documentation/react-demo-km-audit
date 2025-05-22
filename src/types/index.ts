export interface DocRef {
  id: string;
  name: string;
  url: string;
}

export interface Document {
  docId: string;
  information_involved: string;
  name?: string;
  count_conflicts?: number;
  count_duplicates?: number;
  id?: string;
  url?: string;
}

export interface Anomaly {
  docsRef: DocRef[];
  documents: Document[];
  explanation: string;
  id: string;
  state: string;
  subject: string;
}

export interface Credentials {
  organizationId?: string;
  instanceId?: string;
  apiKey?: string;
  host?: string;
}