const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://hours-tracker.up.railway.app").replace(/\/+$/, "");

export type ApiResponse<T> = {
  success: boolean;
  object: T;
  message: string | null;
  number: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
};

export type HoursRecord = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  totalHours?: string | null;
  whereToPlace: string;
  dailyResume: string;
  userId: number;
  userName?: string;
  userEmail?: string;
};

export type HoursRecordPayload = {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: string;
  whereToPlace: string;
  dailyResume: string;
  userId: number;
  userName?: string;
  userEmail?: string;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const readJson = async <T>(response: Response): Promise<T | null> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = options.body
    ? {
        "Content-Type": "application/json",
        ...options.headers,
      }
    : options.headers;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await readJson<ApiResponse<T>>(response);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Erro na API (${response.status})`);
  }

  return data?.object as T;
};

export const api = {
  baseUrl: API_BASE_URL,

  async health() {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await readJson<{ success: boolean; message: string }>(response);

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "API indisponivel no momento");
    }

    return data?.message || "API online";
  },

  getUsers() {
    return request<User[]>("/User/GetAll");
  },

  createUser(payload: Pick<User, "name" | "email">) {
    return request<User>("/User/Create", {
      method: "POST",
      body: payload,
    });
  },

  login(email: string) {
    return request<User>("/User/Login", {
      method: "POST",
      body: { email },
    });
  },

  updateUser(payload: User) {
    return request<User>("/User/Update", {
      method: "POST",
      body: payload,
    });
  },

  prepareUser(id: number) {
    return request<User>(`/User/Prepare?id=${encodeURIComponent(id)}`);
  },

  getRecords() {
    return request<HoursRecord[]>("/HoursRecord/GetAll");
  },

  getRecordsByUserId(userId: number) {
    return request<HoursRecord[]>(`/HoursRecord/GetAllByUserId?userId=${encodeURIComponent(userId)}`);
  },

  prepareRecord(id: number) {
    return request<HoursRecord>(`/HoursRecord/Prepare?id=${encodeURIComponent(id)}`);
  },

  createRecord(payload: HoursRecordPayload) {
    return request<HoursRecord>("/HoursRecord/Create", {
      method: "POST",
      body: payload,
    });
  },

  updateRecord(payload: HoursRecordPayload & { id: number }) {
    return request<HoursRecord>("/HoursRecord/Update", {
      method: "POST",
      body: payload,
    });
  },

  deleteRecord(id: number) {
    return request<unknown>(`/HoursRecord/Delete?id=${encodeURIComponent(id)}`);
  },
};
