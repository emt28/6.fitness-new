import { TestProtocol } from './protocol';

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  protocols: TestProtocol[];
  createdBy: string;
  created: string;
  updated: string;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  protocols: string[];
}