// Main entry point for io_connect_ts module
export { default as DataAccess } from './connectors/DataAccess.js';
export { default as EventsHandler } from './connectors/EventsHandler.js';
export { default as MachineTimeline } from './connectors/MachineTimeline.js';
export { default as BruceHandler } from './connectors/bruceHandler.js';

// Export all types and interfaces
export type {
  DataAccessConfig,
  ApiResponse,
  DeviceDetail,
  SensorInfo,
  DeviceMetadata,
  UserInfo,
  SensorDataPoint,
  RawSensorData,
  CursorInfo,
  GetFirstDpOptions,
  GetDpOptions,
  CleanedTableOptions,
  DataQueryOptions,
  InfluxDbOptions,
  CursorData,
  GetLoadEntitiesOptions,
  LoadEntity,
  LoadEntitiesResponse
} from './connectors/DataAccess.js';

export type {
  EventsHandlerConfig,
  PublishEventOptions,
  EventsInTimeslotOptions,
  EventDataCountOptions,
  DetailedEventOptions,
  MaintenanceModuleDataOptions,
  DeviceDataOptions,
  SensorRowsOptions,
  EventCategory
} from './connectors/EventsHandler.js';

export type {
  MachineTimelineConfig,
  MongoDataOptions,
  CreateMongoRowsOptions
} from './connectors/MachineTimeline.js';

export type {
  BruceHandlerConfig,
  PopulateConfig,
  PaginationConfig,
  FetchUserInsightsOptions,
  GetSourceInsightOptions,
  FetchInsightResultsOptions,
  SourceInsightID,
  UserInsight,
  FetchUserInsightsResponse,
  VectorConfig,
  SelectedUser,
  SourceInsight,
  GetSourceInsightResponse,
  InsightResultFilter,
  S3Details,
  ChunkMetadata,
  InsightResultMetadata,
  ApplicationID,
  InsightResult,
  InsightResultsPagination,
  FetchInsightResultsResponse
} from './connectors/bruceHandler.js';

// Export constants and utilities
export * from './utils/constants.js'; 