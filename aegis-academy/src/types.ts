export type AppTab = "landing" | "location-demo" | "phone-lookup" | "protection-guide" | "dashboard" | "topic-detail";

export interface BrowserData {
  ip: string;
  browser: string;
  language: string;
  timezone: string;
  screen: string;
  gps: string | null;
}

export interface PhoneResult {
  number_formatted: string;
  country: string;
  country_code: string;
  carrier: string;
  line_type: string;
  region?: string;
  valid: boolean;
}

export interface ProtectionTopic {
  id: string;
  title: string;
  icon: string;
  summary: string;
  steps: string[];
}
