import { AstroTime } from "astronomy-engine";

export interface Place {
  latitude: number;
  longitude: number;
  timezone: string; // can be a timezone string or numeric offset in hours
}

export interface PanchangaInput {
  date: string; // ISO or DD/MM/YYYY
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface PanchangaResponse {
  tithi: {
    index: number;
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  nakshatra: {
    index: number;
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  yoga: {
    index: number;
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  karana: {
    index: number;
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  vaara: {
    index: number;
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  masa: {
    index: number;
    value: string;
    description: string;
  };
  ritu: {
    index: number;
    value: string;
    description: string;
  };
  ahargana: {
    index: number;
    value: string;
    description: string;
  };
  elapsed_year: {
    kali: number;
    saka: number;
    description: string;
  };
  samvatsara: {
    index: number;
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
    duration: number;
    value: string;
    description: string;
  };
}

// Internal types for calculation results
export interface TithiResult {
  index: number;
  endTime: AstroTime | null;
  leapTithi?: {
    index: number;
    endTime: AstroTime | null;
  };
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
