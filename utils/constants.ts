// src/constants.ts

export const VERSION: string = '1.0.0';

// Timezones interface and constants
export interface TimezoneConfig {
  readonly UTC: string;
  readonly IST: string;
}

export const TIMEZONES: TimezoneConfig = {
  UTC: 'UTC',
  IST: 'Asia/Kolkata'
} as const;

/* ----------------------------- MQTT HANDLER ------------------------------- */
export const MAX_CHUNK_SIZE: number = 1000;
export const SLEEP_TIME: number = 1;

/* ----------------------------- DATA ACCESS -------------------------------- */
export const GET_USER_INFO_URL: string = '{protocol}://{data_url}/api/metaData/user';
export const GET_DEVICE_DETAILS_URL: string = '{protocol}://{data_url}/api/metaData/allDevices';
export const GET_DEVICE_METADATA_URL: string = '{protocol}://{data_url}/api/metaData/device/{device_id}';
export const GET_DP_URL: string = '{protocol}://{data_url}/api/apiLayer/getLimitedDataMultipleSensors/';
export const GET_FIRST_DP: string = '{protocol}://{data_url}/api/apiLayer/getMultipleSensorsDPAfter';
export const GET_LOAD_ENTITIES: string = '{protocol}://{data_url}/api/metaData/getAllClusterData';
export const INFLUXDB_URL: string = '{protocol}://{data_url}/api/apiLayer/getAllData';
export const GET_CURSOR_BATCHES_URL: string = '{protocol}://{data_url}/api/apiLayer/getCursorOfBatches';
export const CONSUMPTION_URL: string = '{protocol}://{data_url}/api/apiLayer/getStartEndDPV2';
export const TRIGGER_URL: string = '{protocol}://{data_url}/api/expression-schedular/user-trigger-with-title';
export const CLUSTER_AGGREGATION: string = '{protocol}://{data_url}/api/widget/clusterData';
export const GET_FILTERED_OPERATION_DATA: string = '{protocol}://{data_url}/api/consumption/getOperationDataWithTime';

// API Configuration constants
export const MAX_RETRIES: number = 15;
export const RETRY_DELAY: readonly [number, number] = [2, 4] as const;
export const CURSOR_LIMIT: number = 25000;

// Type definitions for URL template parameters
export interface UrlTemplateParams {
  protocol: 'http' | 'https';
  data_url: string;
  device_id?: string;
}

// Helper type for API endpoints
export type ApiEndpoint = string;

// Enum for common protocols
export enum Protocol {
  HTTP = 'http',
  HTTPS = 'https'
}

// Enum for timezone identifiers
export enum TimezoneId {
  UTC = 'UTC',
  IST = 'Asia/Kolkata'
} 