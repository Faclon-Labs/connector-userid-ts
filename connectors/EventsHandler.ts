import axios, { AxiosResponse } from 'axios';
import {
  PUBLISH_EVENT_URL,
  GET_EVENTS_IN_TIMESLOT_URL,
  GET_EVENT_DATA_COUNT_URL,
  GET_EVENT_CATEGORIES_URL,
  GET_DETAILED_EVENT_URL,
  GET_MAINTENANCE_MODULE_DATA,
  GET_DEVICE_DATA,
  GET_SENSOR_ROWS,
  GET_DEVICE_METADATA_MONGO_URL,
  Protocol,
  VERSION
} from '../utils/constants.js';
import DataAccess from './DataAccess.js';

// Type definitions for EventsHandler
export interface EventsHandlerConfig {
  userId: string;
  dataUrl: string;
  onPrem?: boolean;
  tz?: string;
  logTime?: boolean;
}

export interface PublishEventOptions {
  message: string;
  metaData: string;
  hoverData: string;
  createdOn?: string;
  eventTagsList?: string[];
  eventNamesList?: string[];
  title?: string;
  onPrem?: boolean;
}

export interface EventsInTimeslotOptions {
  startTime: string | Date;
  endTime?: string | Date;
  onPrem?: boolean;
}

export interface EventDataCountOptions {
  endTime?: string | Date;
  count?: number;
  onPrem?: boolean;
}

export interface DetailedEventOptions {
  eventTagsList?: string[];
  startTime?: string | Date;
  endTime?: string | Date;
  onPrem?: boolean;
}

export interface MaintenanceModuleDataOptions {
  startTime: number | string | Date;
  endTime?: number | string | Date;
  remarkGroup?: string[];
  eventId?: string[];
  maintenanceModuleId?: string;
  operator?: 'count' | 'activeDuration' | 'inactiveDuration';
  dataPrecision?: number;
  periodicity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  cycleTime?: string;
  weekStart?: number;
  monthStart?: number;
  yearStart?: number;
  shifts?: any[];
  shiftOperator?: 'sum' | 'mean' | 'median' | 'mode' | 'min' | 'max';
  filter?: Record<string, any>;
  onPrem?: boolean;
}

export interface DeviceDataOptions {
  devices?: string[];
  n?: number;
  endTime?: string;
  startTime?: string;
  onPrem?: boolean;
}

export interface SensorRowsOptions {
  deviceId?: string;
  sensor?: string;
  value?: string;
  endTime?: string;
  startTime?: string;
  alias?: boolean;
  onPrem?: boolean;
}

export interface EventCategory {
  _id: string;
  name: string;
}

export interface ApiResponse<T = any> {
  data: T;
  errors?: string[];
  success?: boolean;
}

export default class EventsHandler {
  private userId: string;
  private dataUrl: string;
  private onPrem: boolean;
  private tz: string;
  private logTime: boolean;
  public readonly version: string = VERSION;

  constructor({
    userId,
    dataUrl,
    onPrem = false,
    tz = 'UTC',
    logTime = false
  }: EventsHandlerConfig) {
    /**
     * A class to handle event-related operations.
     * 
     * @param userId - The user ID used for authentication and identification in requests
     * @param dataUrl - The URL or IP address of the third-party server from which event data is retrieved
     * @param onPrem - A flag indicating whether to use the on-premises server. If true, the on-premises server is used; otherwise, the cloud server is used
     * @param tz - The timezone to use for time-related operations. If not provided, defaults to UTC
     * @param logTime - Whether to log API response times
     */
    this.userId = userId;
    this.dataUrl = dataUrl;
    this.onPrem = onPrem;
    this.tz = tz;
    this.logTime = logTime;
  }

  private errorMessage(response: AxiosResponse | undefined, url: string): string {
    if (!response) {
      return `\n[URL] ${url}\n[EXCEPTION] No response received`;
    }
    return `\n[STATUS CODE] ${response.status}\n[URL] ${url}\n[SERVER INFO] ${response.headers.server || 'Unknown Server'}\n[RESPONSE] ${response.data}`;
  }

  private isoUtcTime(time?: string | Date): string {
    /**
     * Converts a given time to an ISO 8601 formatted string in UTC.
     * If no time is provided, the current time in UTC is used.
     */
    if (time === undefined || time === null) {
      return new Date().toISOString();
    }

    let dateTime: Date;
    if (typeof time === 'string') {
      dateTime = new Date(time);
    } else {
      dateTime = time;
    }

    // If the date is invalid, throw an error
    if (isNaN(dateTime.getTime())) {
      throw new Error(`Invalid date format: ${time}`);
    }

    return dateTime.toISOString();
  }

  private formatUrl(template: string, onPrem?: boolean): string {
    const protocol = (onPrem ?? this.onPrem) ? Protocol.HTTP : Protocol.HTTPS;
    return template.replace('{protocol}', protocol).replace('{data_url}', this.dataUrl);
  }

  async publishEvent(options: PublishEventOptions): Promise<any> {
    /**
     * Publish an event with the given details to the server.
     * 
     * @param options - Configuration options for publishing the event
     * @returns The response data from the server
     */
    try {
      const {
        message,
        metaData,
        hoverData,
        createdOn,
        eventTagsList,
        eventNamesList,
        title,
        onPrem
      } = options;

      let finalEventTagsList = eventTagsList;

      if (eventNamesList && eventNamesList.length > 0) {
        // Initialize event_tags_list as an empty list, as event_names_list will be used to populate it
        finalEventTagsList = [];

        // Fetch the available event categories from the server
        const categories = await this.getEventCategories({ onPrem });

        // Iterate through each name in event_names_list to find its corresponding tag ID
        for (const tagName of eventNamesList) {
          const matched = categories.find((item: EventCategory) => item.name === tagName);
          if (!matched) {
            throw new Error(`Tag '${tagName}' not found in data.`);
          }
          finalEventTagsList.push(matched._id);
        }
      }

      // Ensure that at least one tag is present in event_tags_list after processing
      if (!finalEventTagsList || finalEventTagsList.length === 0) {
        throw new Error('No event tags found.');
      }

      const url = this.formatUrl(PUBLISH_EVENT_URL, onPrem);
      const headers = { userID: this.userId };
      const payload = {
        title: title || null,
        message,
        metaData,
        eventTags: finalEventTagsList,
        hoverData,
        createdOn
      };

      const startTime = Date.now();
      const response = await axios.post(url, payload, { headers });

      if (this.logTime) {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
      }

      if (!response.data.data) {
        throw new Error('Invalid response format');
      }

      return response.data.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      throw error;
    }
  }

  async getEventsInTimeslot(options: EventsInTimeslotOptions): Promise<any[]> {
    /**
     * Retrieves events within a specified time slot.
     * 
     * @param options - Configuration options for retrieving events
     * @returns A list of events found within the specified time slot
     */
    try {
      const { startTime, endTime, onPrem } = options;

      // Convert start_time and end_time to iso utc timestamps
      const startTimeIso = this.isoUtcTime(startTime);
      const endTimeIso = this.isoUtcTime(endTime);

      // Raise an error if end_time is before start_time
      if (new Date(endTimeIso) < new Date(startTimeIso)) {
        throw new Error(
          `Invalid time range: start_time(${startTimeIso}) should be before end_time(${endTimeIso}).`
        );
      }

      const url = this.formatUrl(GET_EVENTS_IN_TIMESLOT_URL, onPrem);
      const headers = { userID: this.userId };
      const payload = { startTime: startTimeIso, endTime: endTimeIso };

      const startTimeReq = Date.now();
      const response = await axios.put(url, payload, { headers });

      if (this.logTime) {
        const duration = (Date.now() - startTimeReq) / 1000;
        console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
      }

      if (!response.data.data) {
        throw new Error('Invalid response format');
      }

      return response.data.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      return [];
    }
  }

  async getEventDataCount(options: EventDataCountOptions = {}): Promise<any[]> {
    /**
     * Retrieve a specified number of event data records up to a given end time.
     * 
     * @param options - Configuration options for retrieving event data count
     * @returns A list of event data records
     */
    try {
      const { endTime, count = 10, onPrem } = options;

      if (count > 10000) {
        throw new Error('Count should be less than or equal to 10000.');
      }

      // Convert end_time to iso utc timestamp
      const endTimeIso = this.isoUtcTime(endTime);

      const url = this.formatUrl(GET_EVENT_DATA_COUNT_URL, onPrem);
      const headers = { userID: this.userId };
      const payload = { endTime: endTimeIso, count };

      const startTime = Date.now();
      const response = await axios.put(url, payload, { headers });

      if (this.logTime) {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
      }

      if (!response.data.data) {
        throw new Error('Invalid response format');
      }

      return response.data.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      return [];
    }
  }

  async getEventCategories(options: { onPrem?: boolean } = {}): Promise<EventCategory[]> {
    /**
     * Retrieve a list of event categories from the server.
     * 
     * @param options - Configuration options
     * @returns A list of event categories
     */
    try {
      const { onPrem } = options;

      const url = this.formatUrl(GET_EVENT_CATEGORIES_URL, onPrem);
      const headers = { userID: this.userId };

      const startTime = Date.now();
      const response = await axios.get(url, { headers });

      if (this.logTime) {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
      }

      if (!response.data.data) {
        throw new Error('Invalid response format');
      }

      return response.data.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      return [];
    }
  }

  async getDetailedEvent(options: DetailedEventOptions = {}): Promise<any[]> {
    /**
     * Retrieve detailed event data for a specified time range and event tags.
     * 
     * @param options - Configuration options for retrieving detailed events
     * @returns A list of detailed event data records
     */
    try {
      const { eventTagsList, startTime, endTime, onPrem } = options;

      // Convert start_time and end_time to iso utc timestamps
      const startTimeIso = this.isoUtcTime(startTime);
      const endTimeIso = this.isoUtcTime(endTime);

      // If event_tags_list is not provided, fetch all event categories
      let finalEventTagsList = eventTagsList;
      if (!finalEventTagsList) {
        const categories = await this.getEventCategories({ onPrem });
        finalEventTagsList = categories.map((category: EventCategory) => category._id);
      }

      const url = this.formatUrl(GET_DETAILED_EVENT_URL, onPrem);
      const headers = { userID: this.userId };
      const payload = {
        startTime: startTimeIso,
        endTime: endTimeIso,
        eventTags: finalEventTagsList
      };

      let page = 1;
      const rawData: any[] = [];

      // Loop to fetch data until there is no more data to fetch
      while (true) {
        console.log(`[INFO] Fetching Data from page ${page}`);

        const startTimeReq = Date.now();
        const response = await axios.put(`${url}/${page}/1000`, payload, { headers });

        if (this.logTime) {
          const duration = (Date.now() - startTimeReq) / 1000;
          console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
        }

        const responseData = response.data as ApiResponse;

        // Check for errors in the API response
        if (responseData.success === false) {
          throw new Error('API response indicates failure');
        }

        const pageData = responseData.data?.data || [];
        rawData.push(...pageData);

        page += 1;

        if (rawData.length >= (responseData.data?.totalCount || 0)) {
          break;
        }
      }

      return rawData;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      return [];
    }
  }

  private async getPaginatedData(url: string, payload: any, parallel: boolean): Promise<any> {
    /**
     * Sends a PUT request to the specified API endpoint and processes the response.
     */
    try {
      const startTime = Date.now();
      const response = await axios.put(url, payload, { 
        headers: { userID: this.userId } 
      });

      if (this.logTime) {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
      }

      const data = response.data.data;

      if (data) {
        return parallel ? (data.rows || {}) : data;
      }

      throw new Error('Invalid response format');

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      throw error;
    }
  }

  async getMaintenanceModuleData(options: MaintenanceModuleDataOptions): Promise<Record<string, any>> {
    /**
     * Fetch maintenance module data based on the provided parameters.
     */
    try {
      const {
        startTime,
        endTime,
        remarkGroup,
        eventId,
        maintenanceModuleId,
        operator,
        dataPrecision,
        periodicity,
        cycleTime,
        weekStart,
        monthStart,
        yearStart,
        shifts,
        shiftOperator,
        filter,
        onPrem
      } = options;

      // Create a DataAccess instance to convert times to Unix timestamps
      const dataAccess = new DataAccess({
        userId: this.userId,
        dataUrl: this.dataUrl,
        dsUrl: '', // Empty for this use case
        tz: this.tz
      });

      // Convert start_time and end_time to Unix timestamps
      const startTimeUnix = this.timeToUnix(startTime);
      const endTimeUnix = this.timeToUnix(endTime);

      // Validate that the start time is before the end time
      if (endTimeUnix < startTimeUnix) {
        throw new Error(
          `Invalid time range: start_time(${startTime}) should be before end_time(${endTime}).`
        );
      }

      // Build the API payload with the required parameters
      const payload: any = {
        userID: this.userId,
        startTime: startTimeUnix,
        endTime: endTimeUnix,
        remarkGroup,
        eventID: eventId,
        maintenanceModuleID: maintenanceModuleId,
        operator,
        timezone: this.tz,
        dataPrecision
      };

      // Add periodicity and related parameters if specified
      if (periodicity) {
        Object.assign(payload, {
          periodicity,
          weekStart,
          monthStart,
          yearStart,
          eventID: eventId
        });
      }

      // Add cycle time to the payload if provided
      if (cycleTime) {
        payload.cycleTime = cycleTime;
      }

      // Add shift-related parameters if provided
      if (shifts) {
        Object.assign(payload, { shifts, shiftOperator });
      }

      if (filter) {
        payload.filter = filter;
      }

      const url = this.formatUrl(GET_MAINTENANCE_MODULE_DATA, onPrem);

      const startTimeReq = Date.now();
      const response = await axios.put(url, payload);

      if (this.logTime) {
        const duration = (Date.now() - startTimeReq) / 1000;
        console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
      }

      if (response.data.errors) {
        throw new Error('API response contains errors');
      }

      return response.data.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      return {};
    }
  }

  private timeToUnix(time: string | number | Date | null = null): number {
    /**
     * Convert time to Unix timestamp in milliseconds
     */
    if (time === null || time === undefined) {
      return Date.now();
    }

    if (typeof time === 'number') {
      return time;
    }

    if (typeof time === 'string') {
      return new Date(time).getTime();
    }

    if (time instanceof Date) {
      return time.getTime();
    }

    throw new Error(`Invalid time format: ${time}`);
  }

  async getDeviceData(options: DeviceDataOptions = {}): Promise<any[]> {
    /**
     * Fetch device data from the API with optional filters for time range and device list.
     */
    try {
      const { devices, n = 5000, endTime, startTime, onPrem } = options;

      const url = this.formatUrl(GET_DEVICE_DATA, onPrem);
      const payload = {
        devices,
        n,
        endTime,
        startTime
      };

      const data = await this.getPaginatedData(url, payload, false);
      return data;

    } catch (error: any) {
      console.error(`[EXCEPTION] ${error.message || error}`);
      return [];
    }
  }

  async getSensorRows(options: SensorRowsOptions): Promise<any[]> {
    /**
     * Retrieve device data rows from the server based on sensor parameters and optional time range filters.
     */
    try {
      const { deviceId, sensor, value, endTime, startTime, alias = false, onPrem } = options;

      const url = this.formatUrl(GET_SENSOR_ROWS, onPrem);
      const payload = {
        deviceId,
        sensor,
        value,
        endTime,
        startTime,
        alias
      };

      const data = await this.getPaginatedData(url, payload, false);
      return data;

    } catch (error: any) {
      console.error(`[EXCEPTION] ${error.message || error}`);
      return [];
    }
  }

  async getDeviceMetadata(deviceId: string, onPrem?: boolean): Promise<Record<string, any>> {
    /**
     * Fetches metadata for a specific device.
     */
    try {
      const url = this.formatUrl(GET_DEVICE_METADATA_MONGO_URL, onPrem);

      const startTime = Date.now();
      const response = await axios.get(`${url}/${this.userId}`, {
        params: { devID: deviceId }
      });

      if (this.logTime) {
        const duration = (Date.now() - startTime) / 1000;
        console.log(`[NETWORK] API ${url} response time: ${duration.toFixed(4)} seconds`);
      }

      if (!response.data.data) {
        throw new Error('Invalid response format');
      }

      return response.data.data;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = this.errorMessage(error.response, error.config?.url || 'unknown');
        console.error(`[EXCEPTION] ${error.name}: ${errorMessage}`);
      } else {
        console.error(`[EXCEPTION] ${error.message || error}`);
      }
      return {};
    }
  }
}
