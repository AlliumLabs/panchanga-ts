import { AstroTime } from "astronomy-engine";

export interface Place {
  latitude: number;
  longitude: number;
  timezone: string | number; // can be a timezone string or numeric offset in hours
}

export interface PanchangaInput {
  date: string; // ISO or DD/MM/YYYY
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string | number;
}

export interface PanchangaResponse {
  tithi: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  nakshatra: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  yoga: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  karana: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  vaara: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  masa: {
    value: string;
    description: string;
  };
  ritu: {
    value: string;
    description: string;
  };
  ahargana: {
    value: string;
    description: string;
  };
  elapsed_year: {
    kali: number;
    saka: number;
    description: string;
  };
  samvatsara: {
    value: string;
    description: string;
  };
  sunrise: {
    value: string;
    description: string;
  };
  sunset: {
    value: string;
    description: string;
  };
  day_duration: {
    value: string;
    description: string;
  };
}

// Internal types for calculation results
export interface TithiResult {
  index: number;
  endTime: AstroTime | null;
  description: string;
}

export interface NakshatraResult {
  index: number;
  endTime: AstroTime | null;
  description: string;
}

export interface YogaResult {
  index: number;
  endTime: AstroTime | null;
  description: string;
}

export interface KaranaResult {
  index: number;
  description: string;
}

export interface VaaraResult {
  index: number;
  time: string;
  description: string;
}

export interface MasaResult {
  masa: number;
  isLeap: boolean;
}

export interface DayDurationResult {
  duration: number;
  formatted: string;
}
