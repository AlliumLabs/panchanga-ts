export interface PanchangaInput {
  date: string; // ISO
  city?: string; // From list of cities
  latitude?: number;
  longitude?: number;
  timezone?: string;
}
