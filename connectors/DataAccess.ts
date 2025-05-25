import axios, { AxiosResponse } from 'axios';
import {
  GET_DEVICE_DETAILS_URL,
  GET_DEVICE_METADATA_URL,
  GET_USER_INFO_URL,
  GET_DP_URL,
  GET_FIRST_DP,
  INFLUXDB_URL,
  GET_LOAD_ENTITIES,
  MAX_RETRIES,
  RETRY_DELAY,
  Protocol
} from '../utils/constants.js';

// Type definitions for the DataAccess class
export interface DataAccessConfig {
  userId: string;
  dataUrl: string;
  dsUrl: string;
  onPrem?: boolean;
  tz?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  errors?: string[];
}

export interface DeviceDetail {
  devID: string;
  devTypeID: string;
}

export interface SensorInfo {
  sensorId: string;
  sensorName: string;
}

export interface DeviceMetadata {
  _id: string;
  devID: string;
  devName: string;
  devTypeID: string;
  devTypeName: string;
  sensors: SensorInfo[];
  location?: {
    latitude: number;
    longitude: number;
  };
  tags?: string[];
  addedOn: string;
  widgets: any[];
  params: Record<string, any>;
  topic: string;
  canUserEdit: boolean;
  star: boolean;
  unit: Record<string, string[]>;
  unitSelected: Record<string, string>;
  properties: Array<{
    propertyName: string;
    propertyValue: any;
  }>;
  added_by: string;
  config: any[];
  geoFences: any[];
  custom: Record<string, any>;
  __v: number;
  isHidden: boolean;
}

export interface UserInfo {
  _id: string;
  email: string;
  organisation: {
    _id: string;
    orgID: string;
    orgName: string;
    hostname: string;
    phone: number;
  };
  timeCreated: string;
  userDetail: {
    personalDetails: {
      name: {
        first: string;
        last: string;
      };
      phone: {
        number: string;
        internationalNumber: string;
        dialCode: string;
        countryCode: string;
        e164Number: string;
        name: string;
      };
      profilePicUrl: string;
      gender: string;
    };
    _id: string;
  };
}

// Type definitions for sensor data
export interface SensorDataPoint {
  time: string | number;
  sensor: string;
  value: string | number | null;
}

export interface RawSensorData {
  time?: string | number;
  sensor?: string;
  value?: string | number | null;
}

export interface CursorInfo {
  end?: number;
  limit?: number;
}

export interface GetFirstDpOptions {
  deviceId: string;
  sensorList?: string[] | null;
  cal?: boolean;
  startTime?: string | number | Date | null;
  n?: number;
  alias?: boolean;
  unix?: boolean;
  onPrem?: boolean | null;
}

export interface GetDpOptions {
  deviceId: string;
  sensorList?: string[] | null;
  n?: number;
  cal?: boolean;
  endTime?: string | number | Date | null;
  alias?: boolean;
  unix?: boolean;
  onPrem?: boolean | null;
}

export interface CleanedTableOptions {
  data: any[];
  alias?: boolean;
  cal?: boolean;
  deviceId?: string | false;
  sensorList?: string[];
  onPrem?: boolean;
  unix?: boolean;
  metadata?: DeviceMetadata | null;
  pivotTable?: boolean;
}

export interface DataQueryOptions {
  deviceId: string;
  sensorList?: string[] | null;
  startTime?: string | number | Date | null;
  endTime?: string | number | Date | null;
  cal?: boolean;
  alias?: boolean;
  unix?: boolean;
  onPrem?: boolean | null;
}

export interface InfluxDbOptions {
  deviceId: string;
  startTime: number;
  endTime: number;
  alias?: boolean;
  cal?: boolean;
  unix?: boolean;
  sensorList?: string[];
  metadata?: DeviceMetadata | null;
  onPrem?: boolean | null;
}

export interface CursorData {
  start?: number;
  end?: number;
}

export interface GetLoadEntitiesOptions {
  onPrem?: boolean | null;
  clusters?: string[] | null;
}

export interface LoadEntity {
  id: string;
  name: string;
  type?: string;
  description?: string;
  [key: string]: any;
}

export interface LoadEntitiesResponse {
  data: LoadEntity[];
  totalCount: number;
  error?: boolean;
}

export default class DataAccess {
  private userId: string;
  private dataUrl: string;
  private dsUrl: string;
  private onPrem: boolean;
  private tz: string;

  /**
   * Class constructor for DataAccess.
   * @param options - Configuration options for DataAccess.
   * @param options.userId - The user ID to use for API requests.
   * @param options.dataUrl - The data URL for the API.
   * @param options.dsUrl - The DS URL for the API.
   * @param options.onPrem - Whether the API is on-premises or Live. Defaults to false.
   * @param options.tz - Timezone to use. Defaults to "UTC".
   */
  constructor({
    userId,
    dataUrl,
    dsUrl,
    onPrem = false,
    tz = "UTC"
  }: DataAccessConfig) {
    this.userId = userId;
    this.dataUrl = dataUrl;
    this.dsUrl = dsUrl;
    this.onPrem = onPrem;
    this.tz = tz;
  }

  /**
   * Helper function to format error messages
   * @param response - The axios response object
   * @param url - The URL that was requested
   * @returns Formatted error message
   */
  private errorMessage(response: AxiosResponse | undefined, url: string): string {
    if (!response) return `URL: ${url}`;
    return `Status: ${response?.status || 'unknown'}, URL: ${url}`;
  }

  /**
   * Convert a given time to Unix timestamp in milliseconds.
   * @param time - The time to be converted. It can be a string in ISO 8601 format, a Unix timestamp in milliseconds, or a Date object. If null or undefined, the current time is used.
   * @param timezone - The timezone to use (e.g., 'America/New_York', 'UTC'). This is used when time is not provided or doesn't have timezone info.
   * @returns The Unix timestamp in milliseconds.
   * @throws Error if the provided Unix timestamp is not in milliseconds or if there are mismatched offset times.
   */
  private timeToUnix(time: string | number | Date | null = null, timezone: string = "UTC"): number {
    // If time is not provided, use the current time in the specified timezone
    if (time === null || time === undefined) {
      // Create a date in the current timezone
      const now = new Date();
      return now.getTime();
    }

    // If time is already in Unix timestamp format (number)
    if (typeof time === "number") {
      // Validate that it's in milliseconds (>10 digits)
      if (time <= 0 || String(time).length <= 10) {
        throw new Error(
          "Unix timestamp must be a positive integer in milliseconds, not seconds."
        );
      }
      return time;
    }

    // If time is in string format, convert it to a Date object
    let dateObj: Date;
    if (typeof time === "string") {
      // Parse the string into a Date object
      dateObj = new Date(time);

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date string: ${time}`);
      }
    } else if (time instanceof Date) {
      dateObj = time;
    } else {
      throw new Error("Time must be a string, number, Date object, or null");
    }

    // Return the Unix timestamp in milliseconds
    return dateObj.getTime();
  }

  /**
   * Sleep for a specified number of milliseconds
   * @param ms - Number of milliseconds to sleep
   * @returns Promise that resolves after the specified time
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format sensor data from API response
   * @param data - Raw sensor data from API
   * @returns Formatted sensor data array
   */
  private formatSensorData(data: any): SensorDataPoint[] {
    const result: SensorDataPoint[] = [];
    for (const sensorData of Object.values(data || {})) {
      if (Array.isArray(sensorData)) {
        sensorData.forEach(({ time, sensor, value }: RawSensorData) =>
          result.push({ time: time || '', sensor: sensor || '', value: value || null })
        );
      } else if ((sensorData as RawSensorData)?.time && (sensorData as RawSensorData)?.sensor) {
        const sd = sensorData as RawSensorData;
        result.push({
          time: sd.time || '',
          sensor: sd.sensor || '',
          value: sd.value || null,
        });
      }
    }
    return result;
  }

  /**
   * Gets a cleaned table from sensor data
   * @param options - Configuration options for cleaning the data
   * @returns The cleaned data array
   */
  private getCleanedTable(options: CleanedTableOptions): any[] {
    const {
      data,
      alias = false,
      cal = false,
      deviceId,
      sensorList,
      onPrem = false,
      unix = false,
      metadata = null,
      pivotTable = true,
    } = options;

    // Create a deep copy of the input data to avoid modifying the original
    let cleanedData: any[] = JSON.parse(JSON.stringify(data));

    // 1. Filter the data based on sensorList
    if (sensorList && sensorList.length > 0) {
      // Assuming we have sensor field in each data row
      cleanedData = cleanedData.filter(
        (row) =>
          sensorList.includes(row.sensor) || sensorList.includes(row.sensorId)
      );
    }

    // 2. Apply device-specific processing
    if (deviceId && typeof deviceId === 'string') {
      // Filter or process by device ID if needed
      cleanedData = cleanedData.filter((row: any) => row.deviceId === deviceId);
    }

    // 3. Apply calibration if requested
    if (cal && metadata) {
      cleanedData = cleanedData.map((row) => {
        // Apply calibration formula using metadata parameters
        if (row.sensor && metadata.params && metadata.params[row.sensor]) {
          const sensorParams = metadata.params[row.sensor];
          
          // Extract calibration parameters
          let m = 1; // slope (default to 1)
          let c = 0; // intercept (default to 0)
          let min: number | null = null;
          let max: number | null = null;

          // Find the calibration parameters
          for (const param of sensorParams) {
            if (param.paramName === 'm') {
              m = parseFloat(param.paramValue) || 1;
            } else if (param.paramName === 'c') {
              c = parseFloat(param.paramValue) || 0;
            } else if (param.paramName === 'min') {
              min = parseFloat(param.paramValue);
            } else if (param.paramName === 'max') {
              max = parseFloat(param.paramValue);
            }
          }

          // Apply calibration formula: calibrated_value = m * raw_value + c
          if (row.value !== null && row.value !== undefined) {
            const rawValue = parseFloat(row.value);
            if (!isNaN(rawValue)) {
              let calibratedValue = m * rawValue + c;
              
              // Apply min/max constraints if specified
              if (min !== null && !isNaN(min)) {
                calibratedValue = Math.max(calibratedValue, min);
              }
              if (max !== null && !isNaN(max)) {
                calibratedValue = Math.min(calibratedValue, max);
              }
              
              row.value = calibratedValue;
            }
          }
        }
        return row;
      });
    }

    // 4. Process timestamps if unix format is requested
    if (unix) {
      cleanedData = cleanedData.map((row) => {
        // Convert timestamp to Unix format (assuming row.timestamp or row.time exists)
        if (row.timestamp) {
          row.timestamp = this.timeToUnix(row.timestamp);
        } else if (row.time) {
          row.time = this.timeToUnix(row.time);
        }
        return row;
      });
    }

    // 5. Apply aliases if requested
    if (alias && metadata) {
      // Create alias mapping from sensor metadata (sensorId -> sensorName)
      const aliasMap: Record<string, string> = {};
      if (metadata.sensors) {
        metadata.sensors.forEach(sensor => {
          aliasMap[sensor.sensorId] = sensor.sensorName;
        });
      }

      // Replace sensor IDs with their human-readable names
      cleanedData = cleanedData.map((row) => {
        const newRow: any = { ...row };
        
        // Replace sensor field with alias if available
        if (row.sensor && aliasMap[row.sensor]) {
          newRow.sensor = aliasMap[row.sensor];
        }
        
        // For pivot table format, replace column names with aliases
        Object.keys(row).forEach((key) => {
          if (key !== 'sensor' && key !== 'time' && key !== 'timestamp' && aliasMap[key]) {
            newRow[aliasMap[key]] = row[key];
            delete newRow[key]; // Remove the original key
          }
        });
        
        return newRow;
      });
    }

    // 6. Create pivot table if requested
    if (pivotTable) {
      // This is a simplified version of pivoting
      // In a real implementation, you'd need a more complex logic depending on your data structure
      const pivotedData: any[] = [];
      const timestamps = [...new Set(cleanedData.map((row) => row.timestamp || row.time))];

      timestamps.forEach((timestamp) => {
        const rowsAtTimestamp = cleanedData.filter(
          (row) => (row.timestamp || row.time) === timestamp
        );
        const pivotedRow: any = { timestamp };

        rowsAtTimestamp.forEach((row) => {
          // Assuming each row has a 'sensor' and 'value' field
          // This is highly dependent on the actual data structure
          if (row.sensor && row.value !== undefined) {
            pivotedRow[row.sensor] = row.value;
          }
        });

        pivotedData.push(pivotedRow);
      });

      return pivotedData;
    }

    return cleanedData;
  }

  /**
   * Fetches user info from the API using axios.
   * @param onPremOverride - Whether to override the onPrem flag.
   * @returns User info object or empty object on error.
   * 
   * @throws Error if an error occurs during the HTTP request, such as a network issue or timeout.
   * @throws Error if an unexpected error occurs during metadata retrieval, such as parsing JSON data or other unexpected issues.
   * gives a JSON {{
    "_id": "645a159222722a319ca5f5ad",
    "email": "datascience@faclon.com",
    "organisation": {
        "_id": "5b0d386f82d7525268dfbe06",
        "orgID": "Faclon_Labs",
        "orgName": "Faclon Labs",
        "hostname": "iosense.io",
        "phone": 1234567890
    },
    "timeCreated": "2023-05-09T09:42:42.189Z",
    "userDetail....
    }
   */

  async getUserInfo(onPremOverride: boolean | null = null): Promise<UserInfo | {}> {
    // Based on On Prem We will use either http or https protocol
    const onPrem = onPremOverride !== null ? onPremOverride : this.onPrem;
    const protocol = onPrem ? Protocol.HTTP : Protocol.HTTPS;
    
    // Construct the URL for the API request
    const url = GET_USER_INFO_URL.replace("{protocol}", protocol).replace(
      "{data_url}",
      this.dataUrl
    );

    try {
      const response: AxiosResponse<ApiResponse<UserInfo>> = await axios.get(url, {
        headers: {
          userID: this.userId,
        },
      });

      // Check if the response contains the expected data
      if (!response.data || !response.data.data) {
        throw new Error('Missing "data" in response');
      }

      // Return the user info from the response
      return response.data.data;
    } catch (error: any) {
      // Handle errors that occur during the API request
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const server = error.response?.headers?.server || "Unknown Server";
      const body = error.response?.data || error.message;

      // Log the error details
      console.error(
        `[EXCEPTION] ${error.name}: 
        [STATUS CODE] ${status}
        [URL] ${url}
        [SERVER INFO] ${server}
        [RESPONSE] ${JSON.stringify(body)}
      `.trim()
      );
      return {};
    }
  }

  /**
   * Fetches device details from the API using axios.
   * @param onPremOverride - Whether to override the onPrem flag.
   * @returns Device details array or empty array on error. [{"devID": "L3_VECTOR_21", "devTypeID": "CUSTOM_SECTIONS_01"...}]
   * 
   * @throws Error if an error occurs during the HTTP request, such as a network issue or timeout.
   * @throws Error if an unexpected error occurs during metadata retrieval, such as parsing JSON data or other unexpected issues.
   */
  async getDeviceDetails(onPremOverride: boolean | null = null): Promise<DeviceDetail[] | {}> {
    // Based on On Prem We will use either http or https protocol
    const onPrem = onPremOverride !== null ? onPremOverride : this.onPrem;
    const protocol = onPrem ? Protocol.HTTP : Protocol.HTTPS;
    
    // Construct the URL for the API request
    const url = GET_DEVICE_DETAILS_URL.replace("{protocol}", protocol).replace(
      "{data_url}",
      this.dataUrl
    );

    try {
      const response: AxiosResponse<ApiResponse<DeviceDetail[]>> = await axios.get(url, {
        headers: {
          userID: this.userId,
        },
      });

      // Check if the response contains the expected data
      if (!response.data || !response.data.data) {
        throw new Error('Missing "data" in response');
      }

      // Return the device details from the response
      return response.data.data;
    } catch (error: any) {
      // Handle errors that occur during the API request
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const server = error.response?.headers?.server || "Unknown Server";
      const body = error.response?.data || error.message;

      // Log the error details
      console.error(
        `[EXCEPTION] ${error.name}:
        [STATUS CODE] ${status}
        [URL] ${url}
        [SERVER INFO] ${server}
        [RESPONSE] ${JSON.stringify(body)}
      `.trim()
      );
      return {};
    }
  }

  /**
   * Fetches device metadata from the API using axios.
   * @param deviceID - The ID of the device to fetch metadata for.
   * @param onPremOverride - Whether to override the onPrem flag.
   * @returns Device metadata object or empty object on error.
   * 
   * @throws Error if an error occurs during the HTTP request, such as a network issue or timeout.
   * @throws Error if an unexpected error occurs during metadata retrieval, such as parsing JSON data or other unexpected issues.
   */
  async getDeviceMetaData(deviceID: string, onPremOverride: boolean | null = null): Promise<DeviceMetadata | {}> {
    // Based on On Prem We will use either http or https protocol
    const onPrem = onPremOverride !== null ? onPremOverride : this.onPrem;
    const protocol = onPrem ? Protocol.HTTP : Protocol.HTTPS;
    
    // Construct the URL for the API request
    const url = GET_DEVICE_METADATA_URL.replace("{protocol}", protocol)
      .replace("{data_url}", this.dataUrl)
      .replace("{device_id}", deviceID);

    try {
      const response: AxiosResponse<ApiResponse<DeviceMetadata>> = await axios.get(url, {
        headers: {
          userID: this.userId,
        },
      });

      // Check if the response contains the expected data
      if (!response.data || !response.data.data) {
        throw new Error('Missing "data" in response');
      }

      // Return the device metadata from the response
      return response.data.data;
    } catch (error: any) {
      // Handle errors that occur during the API request
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const server = error.response?.headers?.server || "Unknown Server";
      const body = error.response?.data || error.message;

      // Log the error details
      console.error(
        `[EXCEPTION] ${error.name}:
[STATUS CODE] ${status}
[URL] ${url}
[SERVER INFO] ${server}
[RESPONSE] ${JSON.stringify(body)}
      `.trim()
      );
      return {};
    }
  }

  /**
   * Retrieves the first datapoint(s) for specified sensors on a device starting from a given time.
   * @param options - Configuration options
   * @param options.deviceId - The ID of the device to fetch data from
   * @param options.sensorList - List of sensor IDs. If null, fetches data for all sensors
   * @param options.cal - Whether to apply calibration to sensor values
   * @param options.startTime - The time from which to start fetching data
   * @param options.n - Number of datapoints to fetch (must be ≥ 1)
   * @param options.alias - Whether to use sensor aliases instead of IDs
   * @param options.unix - Whether to return timestamps in Unix format
   * @param options.onPrem - Whether to use on-premise API endpoints
   * @returns Array of datapoints with time and sensor values
   * 
   * @throws Error if parameter 'n' is less than 1
   * @throws Error if the specified device is not found in the account
   * @throws Error if no sensor data is available for the device
   * @throws Error if the API request fails or returns an error response
   */
  async getFirstDp(options: GetFirstDpOptions): Promise<any[]> {
    const {
      deviceId,
      sensorList = null,
      cal = true,
      startTime = null,
      n = 1,
      alias = false,
      unix = false,
      onPrem = null,
    } = options;

    try {
      if (n < 1) throw new Error("Parameter 'n' must be ≥ 1");

      const useOnPrem = onPrem ?? this.onPrem;
      const protocol = useOnPrem ? Protocol.HTTP : Protocol.HTTPS;
      const url = GET_FIRST_DP.replace("{protocol}", protocol).replace("{data_url}", this.dataUrl);

      // Verify device
      const devices = await this.getDeviceDetails(useOnPrem);
      if (Array.isArray(devices)) {
        const deviceIds = devices.map(d => d.devID);
        if (!deviceIds.includes(deviceId)) {
          throw new Error(`Device ${deviceId} not added in account`);
        }
      } else {
        throw new Error("Failed to fetch device details");
      }

      // Get sensor list
      let metadata: DeviceMetadata | null = null;
      let finalSensorList = sensorList;
      if (!finalSensorList) {
        const metadataResult = await this.getDeviceMetaData(deviceId, useOnPrem);
        if (metadataResult && typeof metadataResult === 'object' && 'sensors' in metadataResult) {
          metadata = metadataResult as DeviceMetadata;
          finalSensorList = metadata.sensors?.map(s => s.sensorId) || [];
          if (finalSensorList.length === 0) throw new Error("No sensor data available.");
        } else {
          throw new Error("Failed to fetch device metadata");
        }
      }

      const unixStart = Math.floor(this.timeToUnix(startTime) / 1000);
      const params = {
        device: deviceId,
        sensor: finalSensorList!.join(','),
        time: unixStart,
      };

      const response: AxiosResponse = await axios.get(url, { params });

      const responseData = response.data;
      if (responseData.success) {
        throw new Error(this.errorMessage(response, url));
      }

      const formattedData = this.formatSensorData(responseData[0]);
      return formattedData.length
        ? this.getCleanedTable({
          data: formattedData,
          alias,
          cal,
          deviceId: false,
          sensorList: finalSensorList!,
          onPrem: useOnPrem,
          unix,
          metadata,
          pivotTable: false
        })
        : [];

    } catch (err: any) {
      console.error(`[EXCEPTION] ${err.name || 'Error'}: ${err.message}`);
      return [];
    }
  }

  /**
   * Retrieves datapoint(s) for specified sensors on a device up until a given end time.
   * @param options - Configuration options
   * @param options.deviceId - The ID of the device to fetch data from
   * @param options.sensorList - List of sensor IDs. If null, fetches data for all sensors
   * @param options.n - Number of datapoints to fetch
   * @param options.cal - Whether to apply calibration to sensor values
   * @param options.endTime - The time up until which to fetch data
   * @param options.alias - Whether to use sensor aliases instead of IDs
   * @param options.unix - Whether to return timestamps in Unix format
   * @param options.onPrem - Whether to use on-premise API endpoints
   * @returns Array of datapoints with time and sensor values
   * 
   * @throws Error if parameter 'n' is less than 1
   * @throws Error if the specified device is not found in the account
   * @throws Error if no sensor data is available for the device
   * @throws Error if the API request fails or returns an error response
   */
  async getDp(options: GetDpOptions): Promise<any[]> {
    const {
      deviceId,
      sensorList = null,
      n = 1,
      cal = true,
      endTime = null,
      alias = false,
      unix = false,
      onPrem = null,
    } = options;

    try {
      if (n < 1) throw new Error("Parameter 'n' must be ≥ 1");

      const useOnPrem = onPrem ?? this.onPrem;
      const protocol = useOnPrem ? Protocol.HTTP : Protocol.HTTPS;
      const url = GET_DP_URL.replace("{protocol}", protocol).replace("{data_url}", this.dataUrl);

      // Validate device
      const devices = await this.getDeviceDetails(useOnPrem);
      if (Array.isArray(devices)) {
        if (!devices.some(d => d.devID === deviceId)) {
          throw new Error(`Device ${deviceId} not added in account`);
        }
      } else {
        throw new Error("Failed to fetch device details");
      }

      // Get sensor list and metadata
      let metadata: DeviceMetadata | null = null;
      let finalSensorList = sensorList;
      if (!finalSensorList) {
        const metadataResult = await this.getDeviceMetaData(deviceId, useOnPrem);
        console.log('metadataResult', metadataResult);
        if (metadataResult && typeof metadataResult === 'object' && 'sensors' in metadataResult) {
          metadata = metadataResult as DeviceMetadata;
          finalSensorList = metadata.sensors?.map(s => s.sensorId) || [];
          if (finalSensorList.length === 0) throw new Error("No sensor data available.");
        } else {
          throw new Error("Failed to fetch device metadata");
        }
      }

      const unixEnd = Math.floor(this.timeToUnix(endTime) / 1000);
      let allData: any[] = [];

      // Process each sensor individually with cursor-based pagination
      for (const sensor of finalSensorList!) {
        let cursor: CursorInfo = { end: unixEnd, limit: n };
        let retry = 0;

        while (cursor.end) {
          try {
            const params = {
              device: deviceId,
              sensor: sensor,
              eTime: cursor.end,
              lim: cursor.limit,
              cursor: 'true'
            };

            const response: AxiosResponse = await axios.get(url, { params });

            const responseData = response.data;
            if (responseData.success) {
              throw new Error(this.errorMessage(response, url));
            }

            // Add data to collection
            if (responseData.data) {
              allData.push(...responseData.data);
            }

            // Update cursor for next iteration
            cursor = responseData.cursor;

          } catch (error: any) {
            retry++;
            console.error(`[${error.name}] Retry ${retry}: ${error.message}`);

            if (retry >= MAX_RETRIES) {
              throw new Error(`Max retries reached while calling ${url}`);
            }

            const waitTime = retry > 5 ? RETRY_DELAY[1] : RETRY_DELAY[0];
            await this._sleep(waitTime);
          }
        }
      }

      // Process collected data if not empty
      if (allData.length > 0) {
        const formattedData = this.formatSensorData(allData);
        return this.getCleanedTable({
          data: formattedData,
          alias,
          cal,
          deviceId: false,
          sensorList: finalSensorList!,
          onPrem: useOnPrem,
          unix,
          metadata,
          pivotTable: false
        });
      }

      return [];

    } catch (err: any) {
      console.error(`[EXCEPTION] ${err.name || 'Error'}: ${err.message}`);
      return [];
    }
  }

  /**
   * Queries sensor data for a device within a specified time range.
   * @param options - Configuration options
   * @param options.deviceId - The ID of the device to fetch data from
   * @param options.sensorList - List of sensor IDs. If null, fetches data for all sensors
   * @param options.startTime - Start time for the query range
   * @param options.endTime - End time for the query range
   * @param options.cal - Whether to apply calibration to sensor values
   * @param options.alias - Whether to use sensor aliases instead of IDs
   * @param options.unix - Whether to return timestamps in Unix format
   * @param options.onPrem - Whether to use on-premise API endpoints
   * @returns Array of sensor data points
   * 
   * @throws Error if the time range is invalid (start > end)
   * @throws Error if the specified device is not found in the account
   * @throws Error if no sensor data is available for the device
   */
  async dataQuery(options: DataQueryOptions): Promise<any[]> {
    const {
      deviceId,
      sensorList = null,
      startTime = null,
      endTime = null,
      cal = true,
      alias = false,
      unix = false,
      onPrem = null,
    } = options;

    try {
      const useOnPrem = onPrem ?? this.onPrem;
      const startUnix = this.timeToUnix(startTime);
      const endUnix = this.timeToUnix(endTime);

      if (endUnix < startUnix) {
        throw new Error(`Invalid time range: start (${startTime}) > end (${endTime})`);
      }

      const devices = await this.getDeviceDetails(useOnPrem);
      if (Array.isArray(devices)) {
        if (!devices.some(d => d.devID === deviceId)) {
          throw new Error(`Device ${deviceId} not found in account`);
        }
      } else {
        throw new Error("Failed to fetch device details");
      }

      let metadata: DeviceMetadata | null = null;
      let finalSensorList = sensorList;
      if (!finalSensorList) {
        const metadataResult = await this.getDeviceMetaData(deviceId, useOnPrem);
        if (metadataResult && typeof metadataResult === 'object' && 'sensors' in metadataResult) {
          metadata = metadataResult as DeviceMetadata;
          finalSensorList = metadata.sensors?.map(s => s.sensorId) || [];
          if (finalSensorList.length === 0) throw new Error("No sensors available.");
        } else {
          throw new Error("Failed to fetch device metadata");
        }
      }

      return await this._influxdb({
        deviceId,
        startTime: startUnix,
        endTime: endUnix,
        alias,
        cal,
        unix,
        sensorList: finalSensorList!,
        metadata,
        onPrem: useOnPrem,
      });

    } catch (err: any) {
      console.error(`[DATA_QUERY ERROR] ${err.name}: ${err.message}`);
      return [];
    }
  }

  /**
   * Internal method to fetch data from InfluxDB with cursor-based pagination
   * @param options - Configuration options for InfluxDB query
   * @returns Array of sensor data points
   */
  private async _influxdb(options: InfluxDbOptions): Promise<any[]> {
    const {
      deviceId,
      startTime,
      endTime,
      alias = false,
      cal = true,
      unix = false,
      sensorList = [],
      metadata = null,
      onPrem = null,
    } = options;

    const MAX_RETRIES_INFLUX = 8;
    const RETRY_DELAY_INFLUX = [2000, 10000]; // ms
    const CURSOR_LIMIT = 1000;

    try {
      const useOnPrem = onPrem ?? this.onPrem;
      const protocol = useOnPrem ? Protocol.HTTP : Protocol.HTTPS;
      const url = INFLUXDB_URL.replace("{protocol}", protocol).replace("{data_url}", this.dataUrl);

      let finalSensorList = sensorList;
      let finalMetadata = metadata;

      if (!finalSensorList || finalSensorList.length === 0) {
        if (!finalMetadata) {
          const metadataResult = await this.getDeviceMetaData(deviceId, useOnPrem);
          if (metadataResult && typeof metadataResult === 'object' && 'sensors' in metadataResult) {
            finalMetadata = metadataResult as DeviceMetadata;
          } else {
            throw new Error("Failed to fetch device metadata");
          }
        }
        finalSensorList = finalMetadata?.sensors?.map(s => s.sensorId) || [];
        if (!finalSensorList || finalSensorList.length === 0) {
          throw new Error("No sensor data available.");
        }
      }

      const sensorValues = finalSensorList.join(',');
      let cursor: CursorData = { start: startTime, end: endTime };
      let allData: any[] = [];
      let retry = 0;

      console.log(`🔍 Polling data for ${deviceId} from Influx...`);

      while (cursor?.start && cursor?.end) {
        try {
          const params = {
            device: deviceId,
            sensor: sensorValues,
            sTime: cursor.start,
            eTime: cursor.end,
            cursor: true,
            limit: CURSOR_LIMIT,
          };

          const startReq = Date.now();
          const response: AxiosResponse = await axios.get(url, { params });
          console.log(`✅ API ${url} responded in ${Date.now() - startReq}ms`);

          const { data, cursor: newCursor, success } = response.data;
          if (success) throw new Error("Influx error: " + JSON.stringify(response.data));

          if (Array.isArray(data)) allData.push(...data);
          cursor = newCursor;

          console.log(`📦 Fetched ${allData.length} data points so far.`);

        } catch (err: any) {
          retry++;
          console.log(`[${err.name}] Retry ${retry}: ${err.message}`);
          if (retry < MAX_RETRIES_INFLUX) {
            const delay = retry > 5 ? RETRY_DELAY_INFLUX[1] : RETRY_DELAY_INFLUX[0];
            await this._sleep(delay);
          } else {
            throw new Error("Max retries reached fetching data.");
          }
        }
      }

      if (allData.length > 0) {
        console.log({ allData });
        return this.getCleanedTable({
          data: allData,
          alias,
          cal,
          deviceId: false,
          sensorList: finalSensorList,
          onPrem: useOnPrem,
          unix,
          metadata: finalMetadata,
        });
      } else {
        return [];
      }

    } catch (err: any) {
      console.error(`[INFLUXDB ERROR] ${err.name}: ${err.message}`);
      return [];
    }
  }

  /**
   * Retrieves load entities (clusters) from the API with pagination support.
   * @param options - Configuration options
   * @param options.onPrem - Whether to use on-premise API endpoints
   * @param options.clusters - List of cluster names/IDs to filter by. If null, returns all clusters
   * @returns Array of load entities/clusters
   * 
   * @throws Error if no clusters are provided when clusters parameter is an empty array
   * @throws Error if the API request fails after maximum retries
   * @throws Error if the API returns an error response
   */
  async getLoadEntities(options: GetLoadEntitiesOptions = {}): Promise<LoadEntity[]> {
    const { onPrem = null, clusters = null } = options;

    try {
      // Validate clusters input
      if (clusters !== null && clusters.length === 0) {
        throw new Error("No clusters provided.");
      }

      // Use provided onPrem value or fall back to instance default
      const useOnPrem = onPrem !== null ? onPrem : this.onPrem;
      const protocol = useOnPrem ? Protocol.HTTP : Protocol.HTTPS;

      let pageCount = 1;
      let hasMore = true;
      const pageSize = 5;
      let retry = 0;

      let result: LoadEntity[] = [];
      let response: AxiosResponse | undefined = undefined;

      // Construct API URL for data retrieval
      const baseUrl = GET_LOAD_ENTITIES.replace("{protocol}", protocol)
                                       .replace("{data_url}", this.dataUrl);

      const headers = { userID: this.userId };

      // Configure axios request options
      const axiosConfig = {
        headers: headers,
      };

      while (hasMore) {
        try {
          const requestUrl = `${baseUrl}/${this.userId}/${pageCount}/${pageSize}`;
          console.log(`Fetching load entities: ${requestUrl}`);

          response = await axios.get(requestUrl, axiosConfig);

          // Parse the JSON response - Axios automatically parses JSON and puts it in response.data
          if (!response) {
            throw new Error("No response received from API");
          }
          const responseData: LoadEntitiesResponse = response.data;
          
          if (responseData.error) {
            throw new Error(this.errorMessage(response, baseUrl));
          }

          // Extend result with retrieved responseData
          result = [...result, ...responseData.data];

          // Update pagination state
          const totalCount = responseData.totalCount;
          hasMore = result.length < totalCount;
          pageCount += 1;

          console.log(`Fetched ${result.length}/${totalCount} load entities`);

        } catch (error: any) {
          retry += 1;
          const errorResponse = error.response || (response ? response : undefined);
          console.error(
            `[${error.name}] Retry Count: ${retry}, ${error.message} ${this.errorMessage(errorResponse, baseUrl)}`
          );

          if (retry < MAX_RETRIES) {
            const sleepTime = retry > 5 ? RETRY_DELAY[1] : RETRY_DELAY[0];
            await this._sleep(sleepTime);
          } else {
            throw new Error(
              `Max retries for data fetching from api-layer exceeded. ${this.errorMessage(errorResponse, baseUrl)}`
            );
          }
        }
      }

      // Filter results by cluster names if provided
      if (clusters !== null) {
        return result.filter(item => 
          clusters.includes(item.name) || clusters.includes(item.id)
        );
      }

      return result;

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error(`[AXIOS ERROR] ${error.name}: ${error.message}`);
      } else if (error instanceof Error) {
        console.error(`[EXCEPTION] ${error.name}: ${error.message}`);
      } else {
        console.error(`[EXCEPTION] ${error}`);
      }
      return [];
    }
  }
} 