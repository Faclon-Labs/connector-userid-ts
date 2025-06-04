// Main entry point for io_connect_ts module
export { default as DataAccess } from './connectors/DataAccess.js';
export { default as EventsHandler } from './connectors/EventsHandler.js';

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
  MongoDataOptions,
  MaintenanceModuleDataOptions,
  DeviceDataOptions,
  SensorRowsOptions,
  EventCategory
} from './connectors/EventsHandler.js';

// Export constants and utilities
export * from './utils/constants.js'; 