const API_BASE_URL =
  (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "/api" : "https://hours-tracker.up.railway.app")
  ).replace(/\/+$/, "");

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

export type AuthSession = {
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: string;
};

export type CreateUserPayload = Pick<User, "name" | "email"> & {
  password: string;
};

export type LoginPayload = Pick<User, "email"> & {
  password: string;
};

export type UpdateUserPayload = User & {
  password?: string;
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
  authToken?: string;
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
  const { authToken, ...fetchOptions } = options;
  const headers = options.body
    ? {
        "Content-Type": "application/json",
        ...options.headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      }
    : {
        ...options.headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(
      `Nao foi possivel conectar a API em ${API_BASE_URL}. Se o servidor estiver online, verifique a configuracao de CORS para a origem deste front.`,
    );
  }

  const data = await readJson<ApiResponse<T>>(response);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Erro na API (${response.status})`);
  }

  return data?.object as T;
};

export const api = {
  baseUrl: API_BASE_URL,

  async health() {
    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/health`);
    } catch {
      throw new Error(
        `Nao foi possivel conectar a API em ${API_BASE_URL}. Se o servidor estiver online, verifique a configuracao de CORS para a origem deste front.`,
      );
    }

    const data = await readJson<{ success: boolean; message: string }>(response);

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "API indisponivel no momento");
    }

    return data?.message || "API online";
  },

  getUsers(authToken: string) {
    return request<User[]>("/User/GetAll", { authToken });
  },

  createUser(payload: CreateUserPayload) {
    return request<User>("/User/Create", {
      method: "POST",
      body: payload,
    });
  },

  login(payload: LoginPayload) {
    return request<AuthSession>("/User/Login", {
      method: "POST",
      body: payload,
    });
  },

  updateUser(payload: UpdateUserPayload, authToken: string) {
    return request<User>("/User/Update", {
      method: "POST",
      authToken,
      body: payload,
    });
  },

  prepareUser(id: number, authToken: string) {
    return request<User>(`/User/Prepare?id=${encodeURIComponent(id)}`, { authToken });
  },

  getRecords(authToken: string) {
    return request<HoursRecord[]>("/HoursRecord/GetAll", { authToken });
  },

  getRecordsByUserId(userId: number, authToken: string) {
    return request<HoursRecord[]>(`/HoursRecord/GetAllByUserId?userId=${encodeURIComponent(userId)}`, { authToken });
  },

  prepareRecord(id: number, authToken: string) {
    return request<HoursRecord>(`/HoursRecord/Prepare?id=${encodeURIComponent(id)}`, { authToken });
  },

  createRecord(payload: HoursRecordPayload, authToken: string) {
    return request<HoursRecord>("/HoursRecord/Create", {
      method: "POST",
      authToken,
      body: payload,
    });
  },

  updateRecord(payload: HoursRecordPayload & { id: number }, authToken: string) {
    return request<HoursRecord>("/HoursRecord/Update", {
      method: "POST",
      authToken,
      body: payload,
    });
  },

  deleteRecord(id: number, authToken: string) {
    return request<unknown>(`/HoursRecord/Delete?id=${encodeURIComponent(id)}`, { authToken });
  },
};
