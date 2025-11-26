import { redirect } from "@tanstack/react-router";
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  AxiosError,
} from "axios";

type ApiMethod = "get" | "post" | "put" | "patch" | "delete";

interface ApiRequestConfig<D = any> {
  params?: Record<string, any>;
  json?: D;
  pathParams?: Record<string, any>;
}

interface ApiEndpoint<Request = any, Response = any> {
  call: (
    config?: ApiRequestConfig<Request>
  ) => Promise<AxiosResponse<Response>>;
}

// Type-safe API builder
export class DataServices {
  private axiosInstance: AxiosInstance;

  public readonly api = {
    users: {
      post: this.createEndpoint<
        CreateUserDto,
        { data: CreateUserDto; success: boolean }
      >("post", "/users"),
      get: this.createEndpoint<
        void,
        { success: boolean; data: UserWithCounts[] }
      >("get", "/users"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, CreateUserDto>("get", `/users/{id}`, {
          id,
        }),
        patch: this.createEndpoint<
          UpdateUserDto,
          { success: boolean; data: CreateUserDto }
        >("patch", `/users/{id}`, { id }),
        delete: this.createEndpoint<void, void>("delete", `/users/{id}`, {
          id,
        }),
      }),
      "account-type": {
        patch: this.createEndpoint<UpdateAccountTypeDto, void>(
          "patch",
          "/users/account-type"
        ),
      },
      status: {
        patch: this.createEndpoint<UpdateUserStatusDto, void>(
          "patch",
          "/users/status"
        ),
      },
      "update-email": {
        _userId: (userId: string) => ({
          patch: this.createEndpoint<UpdateEmailDto, void>(
            "patch",
            "/users/update-email/{userId}",
            { userId }
          ),
        }),
      },
      "resend-otp": {
        post: this.createEndpoint<void, void>("post", "/users/resend-otp"),
      },
      "verify-with-otp": {
        post: this.createEndpoint<
          ActivateOtpDto,
          {
            success: boolean;
            data: CreateUserDto;
            accessToken: string;
            refreshToken: string;
          }
        >("post", "/users/verify-with-otp"),
      },
    },
    auth: {
      signin: {
        post: this.createEndpoint<CreateAuthDto, AuthResponse>(
          "post",
          "/auth/signin"
        ),
      },
      "request-reset-password": {
        post: this.createEndpoint<
          RequestResetPasswordDto,
          { success: boolean; message: string }
        >("post", "/auth/request-reset-password"),
      },
      "reset-password": {
        post: this.createEndpoint<
          ResetPasswordDto,
          { success: boolean; message: string }
        >("post", "/auth/reset-password"),
      },
      signout: {
        _id: (id: string) => ({
          delete: this.createEndpoint<void, void>(
            "delete",
            "/auth/signout/{id}",
            { id }
          ),
        }),
      },
      refresh: {
        post: this.createEndpoint<{ refreshToken: string }, AuthResponse>(
          "post",
          "/auth/refresh"
        ),
      },
    },
    profiles: {
      _userId: (userId: string) => ({
        post: this.createEndpoint<CreateProfileDto, Profile>(
          "post",
          "/profiles/{userId}",
          { userId }
        ),
      }),
      get: this.createEndpoint<
        void,
        { success: boolean; count: number; data: Profile[] }
      >("get", "/profiles"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, Profile>("get", "/profiles/{id}", {
          id,
        }),
        patch: this.createEndpoint<UpdateProfileDto, Profile>(
          "patch",
          "/profiles/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/profiles/{id}", {
          id,
        }),
      }),
      user: {
        _userId: (userId: string) => ({
          get: this.createEndpoint<void, Profile>(
            "get",
            "/profiles/user/{userId}",
            { userId }
          ),
          patch: this.createEndpoint<UpdateProfileDto, Profile>(
            "patch",
            "/profiles/user/{userId}",
            { userId }
          ),
        }),
      },
    },
    admins: {
      post: this.createEndpoint<CreateAdminDto, CreateAdminDto>(
        "post",
        "/admins"
      ),
      get: this.createEndpoint<void, CreateAdminDto[]>("get", "/admins"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, CreateAdminDto>("get", "/admins/{id}", {
          id,
        }),
        patch: this.createEndpoint<UpdateAdminDto, CreateAdminDto>(
          "patch",
          "/admins/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/admins/{id}", {
          id,
        }),
      }),
    },

    // Tickets Endpoints
    tickets: {
      _userId: (userId: string) => ({
        post: this.createEndpoint<CreateTicketDto, CreateTicketDto>(
          "post",
          "/tickets/{userId}",
          { userId }
        ),
      }),
      get: this.createEndpoint<
        void,
        { success: boolean; data: CreateTicketDto[] }
      >("get", "/tickets"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, CreateTicketDto>(
          "get",
          "/tickets/{id}",
          { id }
        ),
        put: this.createEndpoint<UpdateTicketDto, CreateTicketDto>(
          "put",
          "/tickets/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/tickets/{id}", {
          id,
        }),
        status: {
          patch: this.createEndpoint<TicketStatusDto, CreateTicketDto>(
            "patch",
            "/tickets/{id}/status",
            { id }
          ),
        },
        priority: {
          patch: this.createEndpoint<TicketPriorityDto, CreateTicketDto>(
            "patch",
            "/tickets/{id}/priority",
            { id }
          ),
        },
        assign: {
          patch: this.createEndpoint<AssignAdminDto, CreateTicketDto>(
            "patch",
            "/tickets/{id}/assign",
            { id }
          ),
        },
      }),
      user: {
        _userId: (userId: string) => ({
          get: this.createEndpoint<void, CreateTicketDto>(
            "get",
            "/tickets/user/{userId}",
            { userId }
          ),
        }),
      },
    },
    // Quotes Endpoints
    quotes: {
      _userId: (userId: string) => ({
        post: this.createEndpoint<CreateQuote, CreateQuote>(
          "post",
          "/quotes/{userId}",
          { userId }
        ),
      }),
      get: this.createEndpoint<
        void,
        { success: boolean; data: Quote[]; count: number }
      >("get", "/quotes"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, CreateQuote>("get", "/quotes/{id}", {
          id,
        }),
        put: this.createEndpoint<UpdateQuote, CreateQuote>(
          "put",
          "/quotes/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/quotes/{id}", {
          id,
        }),
        status: {
          patch: this.createEndpoint<UpdateQuoteStatusDto, CreateQuote>(
            "patch",
            "/quotes/{id}/status",
            { id }
          ),
        },
      }),
      user: {
        _userId: (userId: string) => ({
          get: this.createEndpoint<void, CreateQuote>(
            "get",
            "/quotes/user/{userId}",
            { userId }
          ),
        }),
      },
    },
  };
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "",
      timeout: 300_000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private getUserSession() {
    const session = localStorage.getItem("user-session");
    return session ? JSON.parse(session) : null;
  }

  private getAccessToken(): string | null {
    const session = this.getUserSession();
    return session?.accessToken || null;
  }

  private createEndpoint<Request, Response>(
    method: ApiMethod,
    path: string,
    fixedPathParams: Record<string, string> = {}
  ): ApiEndpoint<Request, Response> {
    return {
      call: (config: ApiRequestConfig<Request> = {}) => {
        let url = path;
        const allPathParams = {
          ...fixedPathParams,
          ...(config.pathParams || {}),
        };

        for (const [param, value] of Object.entries(allPathParams)) {
          url = url.replace(`{${param}}`, encodeURIComponent(value));
        }

        return this.axiosInstance.request<Response>({
          method,
          url,
          params: config?.params,
          data: config?.json,
        });
      },
    };
  }
  private isRefreshing = false;
  private refreshQueue: ((token: string) => void)[] = [];

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = this.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // Handle only 401 errors
        if (error.response?.status !== 401) {
          return Promise.reject(error);
        }

        // Do not redirect for login endpoint errors
        if (originalRequest.url?.includes("/auth/signin")) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise((resolve) => {
            this.refreshQueue.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(this.axiosInstance(originalRequest));
            });
          });
        }

        this.isRefreshing = true;

        try {
          const session = this.getUserSession();
          if (!session || !session.refreshToken || !session.userId) {
            throw new Error("No valid session found");
          }

          const refreshClient = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || "",
            timeout: 300_000,
            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${session.refreshToken}`,
            },
          });

          const response = await refreshClient.post<AuthResponse>(
            "/auth/refresh",
            { refreshToken: session.refreshToken }
          );

          if (!response.data?.success) {
            throw new Error("Refresh token failed");
          }

          // Update session with new tokens
          const updatedSession = {
            ...session,
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          };
          localStorage.setItem("user-session", JSON.stringify(updatedSession));
          originalRequest.headers.Authorization = `Bearer ${updatedSession.accessToken}`;

          // Process queued requests
          this.refreshQueue.forEach((cb) => cb(updatedSession.accessToken));
          this.refreshQueue = [];

          return this.axiosInstance(originalRequest);
        } catch (refreshError) {
          // Clear session and redirect to login
          localStorage.removeItem("user-session");
          redirect({ to: "/auth/signin" });
          return Promise.reject(
            new Error("Session expired. Please login again.")
          );
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }
}
