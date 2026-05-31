# NISO Frontend-Backend Integration Guide

## API Client Setup

### Environment Configuration

```typescript
// src/config/api.ts
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiClient = {
  async request(method: string, endpoint: string, data?: any) {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  get: (endpoint: string) => apiClient.request('GET', endpoint),
  post: (endpoint: string, data: any) => apiClient.request('POST', endpoint, data),
  put: (endpoint: string, data: any) => apiClient.request('PUT', endpoint, data),
  delete: (endpoint: string) => apiClient.request('DELETE', endpoint)
};
```

## Data Synchronization

### React Hooks for API Integration

```typescript
// src/hooks/useReadings.ts
import { useQuery, useMutation } from 'react-query';

export const useReadings = (stationId: string, date: string) => {
  return useQuery(
    ['readings', stationId, date],
    () => apiClient.get(`/stations/${stationId}/readings?date=${date}`),
    { staleTime: 5 * 60 * 1000 } // 5 min cache
  );
};

export const useCreateReading = () => {
  return useMutation((data: CreateReadingInput) =>
    apiClient.post('/readings', data)
  );
};

// Usage in component:
function ReadingsPage() {
  const { data: readings, isLoading } = useReadings(stationId, '2024-01-15');
  const createReading = useCreateReading();

  const handleSubmit = async (input: CreateReadingInput) => {
    await createReading.mutateAsync(input);
    // Re-fetch automatically via react-query
  };
}
```

## Authentication Flow

### Login → Token → Auto-Refresh

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(localStorage.getItem('authToken'));

  const login = async (email: string, password: string) => {
    const { token, user } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Auto-refresh token 5 min before expiry
  React.useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const expiresIn = (decoded.exp * 1000) - Date.now() - (5 * 60 * 1000);
      
      const timeout = setTimeout(async () => {
        const newToken = await apiClient.post('/auth/refresh', {});
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
      }, expiresIn);

      return () => clearTimeout(timeout);
    }
  }, [token]);

  return { user, token, login, logout };
};
```

## Real-Time Updates (Optional)

### WebSocket Integration for Live Feeds

```typescript
// src/hooks/useLiveInterruptions.ts
export const useLiveInterruptions = (equipmentId: string) => {
  const [interruptions, setInterruptions] = React.useState([]);

  React.useEffect(() => {
    const socket = io(process.env.REACT_APP_WS_URL, {
      auth: { token: localStorage.getItem('authToken') }
    });

    socket.on('interruption:active', (data) => {
      setInterruptions(prev => [...prev, data]);
    });

    socket.on('interruption:resolved', (id) => {
      setInterruptions(prev => prev.filter(i => i.id !== id));
    });

    socket.emit('subscribe:equipment', equipmentId);

    return () => socket.disconnect();
  }, [equipmentId]);

  return interruptions;
};
```

## Offline Support

### Local Storage → Server Sync

```typescript
// src/hooks/useOfflineSync.ts
export const useOfflineSync = () => {
  const syncQueue = React.useRef<Array<{action: string, data: any}>>([]);

  const queueAction = (action: string, data: any) => {
    syncQueue.current.push({ action, data });
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue.current));
  };

  const syncWithServer = async () => {
    if (syncQueue.current.length === 0) return;

    for (const item of syncQueue.current) {
      try {
        if (item.action === 'createReading') {
          await apiClient.post('/readings', item.data);
        } else if (item.action === 'updateReading') {
          await apiClient.put(`/readings/${item.data.id}`, item.data);
        }
        
        // Remove from queue
        syncQueue.current = syncQueue.current.filter(i => i !== item);
        localStorage.setItem('syncQueue', JSON.stringify(syncQueue.current));
      } catch (error) {
        logger.error('Sync failed:', error);
        // Keep in queue for next retry
      }
    }
  };

  // Sync when connection restored
  React.useEffect(() => {
    window.addEventListener('online', syncWithServer);
    return () => window.removeEventListener('online', syncWithServer);
  }, []);

  return { queueAction, syncWithServer };
};
```

## State Management

### Using Zustand for Global State

```typescript
// src/store/readingStore.ts
import create from 'zustand';

interface ReadingStore {
  readings: Reading[];
  loading: boolean;
  fetchReadings: (stationId: string, date: string) => Promise<void>;
  addReading: (reading: Reading) => void;
  updateReading: (id: string, updates: Partial<Reading>) => void;
  sealReading: (id: string) => Promise<void>;
}

export const useReadingStore = create<ReadingStore>((set) => ({
  readings: [],
  loading: false,

  fetchReadings: async (stationId, date) => {
    set({ loading: true });
    const data = await apiClient.get(`/stations/${stationId}/readings?date=${date}`);
    set({ readings: data, loading: false });
  },

  addReading: (reading) => {
    set(state => ({ readings: [...state.readings, reading] }));
  },

  updateReading: (id, updates) => {
    set(state => ({
      readings: state.readings.map(r => r.id === id ? {...r, ...updates} : r)
    }));
  },

  sealReading: async (id) => {
    await apiClient.post(`/readings/${id}/seal`, {});
    set(state => ({
      readings: state.readings.map(r => 
        r.id === id ? {...r, sealedAt: new Date()} : r
      )
    }));
  }
}));
```

## Form Validation

### Zod Schemas (Frontend Mirror)

```typescript
// src/schemas/reading.ts
import { z } from 'zod';

export const CreateReadingSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment required'),
  date: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'Invalid date format'),
  hour: z.number().min(0).max(23),
  rawInput: z.string().min(1, 'Value required'),
  valueType: z.enum(['number', 'code', 'text']),
  remarks: z.string().optional()
});

// Usage:
const form = useForm<z.infer<typeof CreateReadingSchema>>({
  resolver: zodResolver(CreateReadingSchema)
});
```

## Error Handling & Retries

```typescript
// src/utils/apiRetry.ts
export async function apiWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage:
const data = await apiWithRetry(() => 
  apiClient.get('/readings')
);
```

## Component Integration Examples

### Reading Input Form

```typescript
// src/components/ReadingForm.tsx
export function ReadingForm({ equipmentId, onSuccess }: Props) {
  const form = useForm<CreateReadingInput>();
  const createReading = useCreateReading();
  const { queueAction } = useOfflineSync();

  const onSubmit = async (data: CreateReadingInput) => {
    try {
      if (navigator.onLine) {
        await createReading.mutateAsync({...data, equipmentId});
      } else {
        // Queue for later sync
        queueAction('createReading', {...data, equipmentId});
        toast.info('Saved offline. Will sync when connection restored.');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('rawInput')} placeholder="Enter value" />
      <select {...form.register('valueType')}>
        <option value="number">Number</option>
        <option value="code">Code</option>
      </select>
      <button type="submit" disabled={createReading.isLoading}>
        {createReading.isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### SLA Entry Form

```typescript
// src/components/SLAForm.tsx
export function SLAForm({ stationId, date, hour }: Props) {
  const [forecast, setForecast] = React.useState('');
  const [actual, setActual] = React.useState('');
  const [difference, setDifference] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (forecast && actual) {
      const diff = parseFloat(actual) - parseFloat(forecast);
      setDifference(diff);
    }
  }, [forecast, actual]);

  const createSLA = useMutation((data) =>
    apiClient.post(`/stations/${stationId}/sla`, data)
  );

  const handleSubmit = async () => {
    await createSLA.mutateAsync({
      forecastMw: parseFloat(forecast),
      actualMw: parseFloat(actual),
      meterReadingKwh: document.querySelector('input[name="meterReading"]')?.value,
      remarks: document.querySelector('textarea[name="remarks"]')?.value
    });
  };

  return (
    <div>
      <input value={forecast} onChange={(e) => setForecast(e.target.value)} placeholder="Forecast (MW)" />
      <input value={actual} onChange={(e) => setActual(e.target.value)} placeholder="Actual (MW)" />
      {difference !== null && (
        <div style={{color: Math.abs(difference) > 50 ? 'red' : 'green'}}>
          Difference: {difference.toFixed(2)} MW
        </div>
      )}
      <button onClick={handleSubmit}>Save SLA Entry</button>
    </div>
  );
}
```

### Interruption Live Feed

```typescript
// src/components/InterruptionFeed.tsx
export function InterruptionFeed({ equipmentId }: Props) {
  const [active, setActive] = React.useState<Interruption[]>([]);
  
  const liveInterruptions = useLiveInterruptions(equipmentId);

  React.useEffect(() => {
    setActive(liveInterruptions);
  }, [liveInterruptions]);

  return (
    <div>
      {active.length === 0 ? (
        <p style={{color: '#0a7f0a'}}>✓ No active interruptions</p>
      ) : (
        <ul>
          {active.map(intr => (
            <li key={intr.id} style={{color: '#d32f2f'}}>
              <strong>{intr.causeCode}</strong> at {intr.tripTime}
              <span> Duration: {intr.durationSeconds}s</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Type Definitions

Ensure TypeScript interfaces match backend schema:

```typescript
// src/types/index.ts
export interface Reading {
  id: string;
  equipmentId: string;
  date: string;
  hour: number;
  rawInput: string;
  numericValue?: number;
  valueType: 'number' | 'code' | 'text';
  createdBy: User;
  createdAt: string;
  sealedAt?: string;
}

export interface SLAEntry {
  id: string;
  stationId: string;
  date: string;
  hour: number;
  forecastMw: number;
  actualMw?: number;
  differenceMw?: number;
  approvedAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: { name: string; };
}
```

## Performance Optimization

### Code Splitting

```typescript
// src/routes.tsx
const ReadingsPage = React.lazy(() => import('./pages/ReadingsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));

function Routes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/readings" component={ReadingsPage} />
        <Route path="/reports" component={ReportsPage} />
      </Switch>
    </Suspense>
  );
}
```

### Memoization

```typescript
// Use React.memo for expensive components
const ReadingCard = React.memo(({ reading, onUpdate }: Props) => {
  return (
    <div>
      <p>{reading.rawInput}</p>
      <button onClick={() => onUpdate(reading.id)}>Edit</button>
    </div>
  );
});
```

## Testing

```typescript
// src/__tests__/api.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from 'react-query';

test('loads readings from API', async () => {
  const mockReadings = [
    { id: '1', rawInput: '100', valueType: 'number' }
  ];

  jest.spyOn(window, 'fetch')
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReadings)
    } as any);

  render(
    <QueryClientProvider client={queryClient}>
      <ReadingsPage stationId="s1" />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
```

---

**Next**: Deploy frontend + backend to staging environment and run end-to-end tests.
