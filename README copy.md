# Faclon Connector TypeScript

A TypeScript connector for accessing Faclon IoT platform data with full type safety and modern ES module support.

## 🚀 Installation

```bash
npm install connector-userid-ts
# or
yarn add connector-userid-ts
# or
pnpm add connector-userid-ts
```

## 📋 Requirements

- Node.js 16+ 
- TypeScript 4.5+
- Modern bundler with ES module support

## 🔧 Usage

### Basic Setup

```typescript
import DataAccess from 'connector-userid-ts';

const dataAccess = new DataAccess({
  userId: "your-user-id",
  dataUrl: "your-data-url",
  dsUrl: "your-ds-url", 
  onPrem: false, // true for on-premise installations
  tz: "UTC" // timezone
});
```

### Next.js Integration

#### Server-Side Usage (Recommended)

```typescript
// pages/api/device-data.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import DataAccess from 'connector-userid-ts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dataAccess = new DataAccess({
    userId: process.env.FACLON_USER_ID!,
    dataUrl: process.env.FACLON_DATA_URL!,
    dsUrl: process.env.FACLON_DS_URL!,
    onPrem: false,
    tz: "UTC"
  });

  try {
    const devices = await dataAccess.getDeviceDetails();
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
}
```

#### Environment Variables (.env.local)

```env
FACLON_USER_ID=your-user-id
FACLON_DATA_URL=your-data-url  
FACLON_DS_URL=your-ds-url
```

#### Client-Side Usage (Use with Caution)

```typescript
// components/DeviceData.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DeviceData() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Call your API route instead of direct connector usage
    fetch('/api/device-data')
      .then(res => res.json())
      .then(setDevices);
  }, []);

  return (
    <div>
      {devices.map(device => (
        <div key={device.devID}>{device.devID}</div>
      ))}
    </div>
  );
}
```

## 📚 API Reference

### Core Methods

#### `getUserInfo(onPremOverride?: boolean)`
Fetches user information from the API.

```typescript
const userInfo = await dataAccess.getUserInfo();
console.log(userInfo.email);
```

#### `getDeviceDetails(onPremOverride?: boolean)`
Retrieves all devices associated with the user account.

```typescript
const devices = await dataAccess.getDeviceDetails();
devices.forEach(device => {
  console.log(`Device: ${device.devID}, Type: ${device.devTypeID}`);
});
```

#### `getDeviceMetaData(deviceId: string, onPremOverride?: boolean)`
Gets detailed metadata for a specific device.

```typescript
const metadata = await dataAccess.getDeviceMetaData("DEVICE_001");
console.log(`Device Name: ${metadata.devName}`);
console.log(`Sensors: ${metadata.sensors.map(s => s.sensorName).join(', ')}`);
```

#### `getFirstDp(options: GetFirstDpOptions)`
Retrieves the first datapoint(s) for specified sensors.

```typescript
const firstData = await dataAccess.getFirstDp({
  deviceId: "DEVICE_001",
  sensorList: ["TEMP_01", "HUMIDITY_01"],
  cal: true, // Apply calibration
  alias: true, // Use sensor names instead of IDs
  n: 5 // Number of datapoints
});
```

#### `getDp(options: GetDpOptions)`
Retrieves datapoints up to a specified end time.

```typescript
const recentData = await dataAccess.getDp({
  deviceId: "DEVICE_001", 
  endTime: new Date(),
  n: 100,
  cal: true,
  alias: true
});
```

#### `dataQuery(options: DataQueryOptions)`
Queries sensor data within a time range.

```typescript
const rangeData = await dataAccess.dataQuery({
  deviceId: "DEVICE_001",
  startTime: "2024-01-01T00:00:00Z",
  endTime: "2024-01-02T00:00:00Z",
  cal: true,
  alias: true
});
```

#### `getLoadEntities(options?: GetLoadEntitiesOptions)`
Retrieves load entities (clusters) with pagination support.

```typescript
// Get all clusters
const allClusters = await dataAccess.getLoadEntities();

// Filter by specific cluster names
const specificClusters = await dataAccess.getLoadEntities({
  clusters: ["Cluster_A", "Cluster_B"]
});
```

## 🔒 Security Best Practices

### For Next.js Applications

1. **Never expose credentials in client-side code**
2. **Use environment variables for sensitive data**
3. **Create API routes as proxies to the connector**
4. **Validate and sanitize all inputs**

```typescript
// ❌ DON'T - Client-side exposure
const dataAccess = new DataAccess({
  userId: "exposed-user-id", // Visible in browser!
  // ...
});

// ✅ DO - Server-side only
// pages/api/secure-data.ts
const dataAccess = new DataAccess({
  userId: process.env.FACLON_USER_ID!, // Server-side only
  // ...
});
```

## 🛠️ Framework Compatibility

| Framework | Compatibility | Notes |
|-----------|---------------|-------|
| Next.js | ✅ Full | Server-side recommended |
| React | ✅ Full | Use with API proxy |
| Vue.js | ✅ Full | Use with API proxy |
| Nuxt.js | ✅ Full | Server-side recommended |
| SvelteKit | ✅ Full | Server-side recommended |
| Express.js | ✅ Full | Perfect fit |
| Fastify | ✅ Full | Perfect fit |

## 📦 Package Structure

```
connector-userid-ts/
├── connectors/
│   └── DataAccess.ts     # Main connector class
├── utils/
│   └── constants.ts      # API endpoints and constants
├── testcases/            # Test files and examples
│   ├── index.ts          # Basic functionality tests
│   └── test-load-entities.ts # Load entities test
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run example tests
npx tsx testcases/index.ts
npx tsx testcases/test-load-entities.ts
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact Faclon Labs support
- Check the documentation at [docs.faclon.com](https://docs.faclon.com)
