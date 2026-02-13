import apiClient from '../api-client';
import {
  ApiResponse,
  AuthResponse,
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  Enquiry,
  CreateEnquiryRequest,
  UpdateEnquiryStatusRequest,
  RespondToEnquiryRequest,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  RateProductRequest,
  DashboardStats,
  ChartData,
  ActivityItem,
  Settings,
  UpdateSettingRequest,
  FileInfo,
  UploadFileRequest,
  UploadMultipleFilesRequest,
  UploadFieldsRequest,
  FileStats,
  Notification,
  CreateNotificationRequest,
  NotificationStats,
  ProductQueryParams,
  EnquiryQueryParams,
  FileQueryParams,
  NotificationQueryParams,
  DashboardQueryParams,
  PaginationResponse,
  API_ENDPOINTS,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartItem,
  CartQueryParams,
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderQueryParams,
  Payment,
  CreatePaymentRequest,
  ProcessStripePaymentRequest,
  PaymentQueryParams,
  RefundPaymentRequest,
} from '../types/api';

// Authentication Services
export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.PROFILE);
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  async refresh(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    // Some backends expect the refreshToken in the body; adjust if needed
    return apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.LOGOUT);
  },
};

// Enquiry Services
export const enquiryService = {
  async createEnquiry(data: CreateEnquiryRequest): Promise<ApiResponse<Enquiry>> {
    return apiClient.post<ApiResponse<Enquiry>>(API_ENDPOINTS.ENQUIRIES.BASE, data);
  },

  async getEnquiries(params?: EnquiryQueryParams): Promise<ApiResponse<PaginationResponse<Enquiry>>> {
    // Fetch raw response
    const resp = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.ENQUIRIES.BASE, params as any);

    if (!resp.success) return resp as any;

    const rawData = resp.data || {};
    const rawList: any[] = rawData.enquiries || rawData.data || [];
    const rawPagination = rawData.pagination || {};

    const normalizeStatus = (value: string | undefined): Enquiry['status'] => {
      const v = (value || '').toLowerCase();
      if (v === 'new') return 'pending';
      if (v === 'in_progress' || v === 'in-progress') return 'in-progress';
      if (v === 'responded' || v === 'resolved') return 'resolved';
      if (v === 'closed') return 'closed';
      return 'pending';
    };

    const list: Enquiry[] = rawList.map((e: any) => ({
      id: e.id,
      name: e.customerName || e.name,
      email: e.email,
      subject: e.subject,
      message: e.message,
      status: normalizeStatus(e.status),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      responses: e.responses,
    }));

    const mapped: ApiResponse<PaginationResponse<Enquiry>> = {
      success: true,
      data: {
        data: list,
        pagination: {
          page: rawPagination.page ?? 1,
          limit: rawPagination.limit ?? list.length,
          total: rawPagination.total ?? list.length,
          pages: rawPagination.totalPages ?? (rawPagination.pages ?? 1),
        },
      },
    };

    return mapped;
  },

  async getEnquiryById(id: string): Promise<ApiResponse<Enquiry>> {
    const resp = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.ENQUIRIES.BY_ID(id));
    if (!resp.success) return resp as any;

    const e = resp.data;
    const normalizeStatus = (value: string | undefined): Enquiry['status'] => {
      const v = (value || '').toLowerCase();
      if (v === 'new') return 'pending';
      if (v === 'in_progress' || v === 'in-progress') return 'in-progress';
      if (v === 'responded' || v === 'resolved') return 'resolved';
      if (v === 'closed') return 'closed';
      return 'pending';
    };

    const mapped: ApiResponse<Enquiry> = {
      success: true,
      data: {
        id: e.id,
        name: e.customerName || e.name,
        email: e.email,
        subject: e.subject,
        message: e.message,
        status: normalizeStatus(e.status),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        responses: e.responses,
      },
    };
    return mapped;
  },

  async updateEnquiryStatus(id: string, data: UpdateEnquiryStatusRequest): Promise<ApiResponse<{ id: string; status: string; message: string }>> {
    return apiClient.patch<ApiResponse<{ id: string; status: string; message: string }>>(
      API_ENDPOINTS.ENQUIRIES.STATUS(id),
      data
    );
  },

  async respondToEnquiry(id: string, data: RespondToEnquiryRequest): Promise<ApiResponse<{ response: { id: string; message: string; createdAt: string } }>> {
    return apiClient.post<ApiResponse<{ response: { id: string; message: string; createdAt: string } }>>(
      API_ENDPOINTS.ENQUIRIES.RESPOND(id),
      data
    );
  },

  async deleteEnquiry(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.ENQUIRIES.BY_ID(id));
  },
};

// Product Services
export const productService = {
  async getProducts(params?: ProductQueryParams): Promise<ApiResponse<PaginationResponse<Product>>> {
    return apiClient.get<ApiResponse<PaginationResponse<Product>>>(API_ENDPOINTS.PRODUCTS.BASE, params);
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    if (data.status) formData.append('status', data.status);
    if (data.features) formData.append('features', JSON.stringify(data.features));
    if (data.specifications) formData.append('specifications', typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications));
    formData.append('image', data.image);
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Debug logging
    console.log('createProduct - FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log('createProduct - Endpoint:', API_ENDPOINTS.PRODUCTS.BASE);

    return apiClient.upload<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BASE, formData);
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.status) formData.append('status', data.status);
    if (data.features) formData.append('features', JSON.stringify(data.features));
    if (data.specifications) formData.append('specifications', typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications));
    if (data.image) formData.append('image', data.image);
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return apiClient.upload<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.BY_ID(id), formData);
  },

  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(API_ENDPOINTS.PRODUCTS.CATEGORIES);
  },

  async rateProduct(id: string, data: RateProductRequest): Promise<ApiResponse<{ message: string; newRating: number }>> {
    return apiClient.post<ApiResponse<{ message: string; newRating: number }>>(
      API_ENDPOINTS.PRODUCTS.RATE(id),
      data
    );
  },
};

// Dashboard Services
export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.DASHBOARD.STATS);
  },

  async getChartData(params?: DashboardQueryParams): Promise<ApiResponse<ChartData>> {
    return apiClient.get<ApiResponse<ChartData>>(API_ENDPOINTS.DASHBOARD.CHARTS, params);
  },

  async getRecentActivity(params?: DashboardQueryParams): Promise<ApiResponse<ActivityItem[]>> {
    return apiClient.get<ApiResponse<ActivityItem[]>>(API_ENDPOINTS.DASHBOARD.ACTIVITY, params);
  },
};

// Settings Services
export const settingsService = {
  async getAllSettings(): Promise<ApiResponse<Settings>> {
    return apiClient.get<ApiResponse<Settings>>(API_ENDPOINTS.SETTINGS.BASE);
  },

  async getSettingsByCategory(category: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(API_ENDPOINTS.SETTINGS.BY_CATEGORY(category));
  },

  async updateSettingsByCategory(category: string, data: any): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<ApiResponse<{ message: string }>>(API_ENDPOINTS.SETTINGS.BY_CATEGORY(category), data);
  },

  async updateSingleSetting(category: string, key: string, data: UpdateSettingRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<ApiResponse<{ message: string }>>(API_ENDPOINTS.SETTINGS.BY_KEY(category, key), data);
  },

  async deleteSingleSetting(category: string, key: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.SETTINGS.BY_KEY(category, key));
  },
};

// Upload/File Services
export const uploadService = {
  async uploadSingleFile(data: UploadFileRequest, onProgress?: (progress: number) => void): Promise<ApiResponse<FileInfo>> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.type) formData.append('type', data.type);
    if (data.folder) formData.append('folder', data.folder);

    return apiClient.upload<ApiResponse<FileInfo>>(API_ENDPOINTS.UPLOAD.SINGLE, formData, onProgress);
  },

  async uploadMultipleFiles(data: UploadMultipleFilesRequest, onProgress?: (progress: number) => void): Promise<ApiResponse<FileInfo[]>> {
    const formData = new FormData();
    data.files.forEach((file) => {
      formData.append('files', file);
    });
    if (data.type) formData.append('type', data.type);
    if (data.folder) formData.append('folder', data.folder);

    return apiClient.upload<ApiResponse<FileInfo[]>>(API_ENDPOINTS.UPLOAD.MULTIPLE, formData, onProgress);
  },

  async uploadFields(data: UploadFieldsRequest, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> {
    const formData = new FormData();
    
    if (data.logo) formData.append('logo', data.logo);
    if (data.favicon) formData.append('favicon', data.favicon);
    if (data.heroImage) formData.append('heroImage', data.heroImage);
    
    if (data.gallery) {
      data.gallery.forEach((file) => {
        formData.append('gallery', file);
      });
    }
    
    if (data.documents) {
      data.documents.forEach((file) => {
        formData.append('documents', file);
      });
    }

    return apiClient.upload<ApiResponse<any>>(API_ENDPOINTS.UPLOAD.FIELDS, formData, onProgress);
  },

  async getFileById(id: string): Promise<ApiResponse<FileInfo>> {
    return apiClient.get<ApiResponse<FileInfo>>(API_ENDPOINTS.UPLOAD.BY_ID(id));
  },

  async getFiles(params?: FileQueryParams): Promise<ApiResponse<PaginationResponse<FileInfo>>> {
    return apiClient.get<ApiResponse<PaginationResponse<FileInfo>>>('/upload', params);
  },

  async deleteFile(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.UPLOAD.BY_ID(id));
  },

  async updateFileMetadata(id: string, data: { type?: string; folder?: string }): Promise<ApiResponse<FileInfo>> {
    return apiClient.put<ApiResponse<FileInfo>>(API_ENDPOINTS.UPLOAD.BY_ID(id), data);
  },

  async getFileStats(): Promise<ApiResponse<FileStats>> {
    return apiClient.get<ApiResponse<FileStats>>(API_ENDPOINTS.UPLOAD.STATS);
  },
};

// Notification Services
export const notificationService = {
  async getNotifications(params?: NotificationQueryParams): Promise<ApiResponse<PaginationResponse<Notification>>> {
    return apiClient.get<ApiResponse<PaginationResponse<Notification>>>(API_ENDPOINTS.NOTIFICATIONS.BASE, params);
  },

  async markAsRead(id: string): Promise<ApiResponse<{ id: string; read: boolean; message: string }>> {
    return apiClient.patch<ApiResponse<{ id: string; read: boolean; message: string }>>(
      API_ENDPOINTS.NOTIFICATIONS.READ(id)
    );
  },

  async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.patch<ApiResponse<{ message: string }>>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
  },

  async deleteNotification(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  },

  async getNotificationStats(): Promise<ApiResponse<NotificationStats>> {
    return apiClient.get<ApiResponse<NotificationStats>>(API_ENDPOINTS.NOTIFICATIONS.STATS);
  },

  async createNotification(data: CreateNotificationRequest): Promise<ApiResponse<Notification>> {
    return apiClient.post<ApiResponse<Notification>>(API_ENDPOINTS.NOTIFICATIONS.BASE, data);
  },
};
// Cart Services
export const cartService = {
  async getCart(): Promise<ApiResponse<Cart>> {
    return apiClient.get<ApiResponse<Cart>>(API_ENDPOINTS.CART.BASE);
  },

  async addToCart(data: AddToCartRequest): Promise<ApiResponse<CartItem>> {
    return apiClient.post<ApiResponse<CartItem>>(API_ENDPOINTS.CART.ADD, data);
  },

  async updateCartItem(productId: number, data: UpdateCartItemRequest): Promise<ApiResponse<CartItem>> {
    return apiClient.put<ApiResponse<CartItem>>(API_ENDPOINTS.CART.UPDATE(productId), data);
  },

  async removeFromCart(productId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.CART.REMOVE(productId));
  },

  async clearCart(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.CART.CLEAR);
  },

  async getCartCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<ApiResponse<{ count: number }>>(API_ENDPOINTS.CART.COUNT);
  },

  async checkProductInCart(productId: number): Promise<ApiResponse<{ inCart: boolean; quantity?: number }>> {
    return apiClient.get<ApiResponse<{ inCart: boolean; quantity?: number }>>(API_ENDPOINTS.CART.CHECK(productId));
  },

  // Admin endpoints
  async getAllCarts(params?: CartQueryParams): Promise<ApiResponse<PaginationResponse<Cart>>> {
    return apiClient.get<ApiResponse<PaginationResponse<Cart>>>(API_ENDPOINTS.CART.ADMIN_ALL, params);
  },
  async getUserCart(userId: string): Promise<ApiResponse<Cart>> {
    return apiClient.get<ApiResponse<Cart>>(API_ENDPOINTS.CART.ADMIN_USER(userId));
  },

  async updateUserCartItem(userId: string, productId: number, data: UpdateCartItemRequest): Promise<ApiResponse<CartItem>> {
    return apiClient.put<ApiResponse<CartItem>>(API_ENDPOINTS.CART.ADMIN_UPDATE(userId, productId), data);
  },

  async removeUserCartItem(userId: string, productId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.CART.ADMIN_REMOVE(userId, productId));
  },

  async clearUserCart(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(API_ENDPOINTS.CART.ADMIN_CLEAR(userId));
  },

  async getCartStats(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(API_ENDPOINTS.CART.ADMIN_STATS);
  },
};

// Order Services
export const orderService = {
  async getMyOrders(params?: OrderQueryParams): Promise<ApiResponse<PaginationResponse<Order>>> {
    return apiClient.get<ApiResponse<PaginationResponse<Order>>>(API_ENDPOINTS.ORDERS.MY_ORDERS, params);
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.BY_ID(id));
  },

  async getOrderByNumber(orderNumber: string): Promise<ApiResponse<Order>> {
    return apiClient.get<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.BY_NUMBER(orderNumber));
  },
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiClient.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.CREATE, data);
  },

  async createOrderFromCart(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiClient.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.CREATE_FROM_CART, data);
  },

  async cancelOrder(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.ORDERS.CANCEL(id));
  },

  async getMyOrderStats(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(API_ENDPOINTS.ORDERS.STATS_MY);
  },

  // Admin endpoints
  async getAllOrders(params?: OrderQueryParams): Promise<ApiResponse<PaginationResponse<Order>>> {
    return apiClient.get<ApiResponse<PaginationResponse<Order>>>(API_ENDPOINTS.ORDERS.ADMIN_ALL, params);
  },

  async updateOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    return apiClient.put<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.ADMIN_STATUS(id), data);
  },

  async getOrderStats(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(API_ENDPOINTS.ORDERS.ADMIN_STATS);
  },
};

// Payment Services
export const paymentService = {
  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.BY_ID(id));
  },

  async getPaymentsByOrder(orderId: string): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<ApiResponse<Payment[]>>(API_ENDPOINTS.PAYMENTS.BY_ORDER(orderId));
  },
  async getPaymentByTransaction(transactionId: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.BY_TRANSACTION(transactionId));
  },

  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.CREATE, data);
  },

  async processStripePayment(data: ProcessStripePaymentRequest): Promise<ApiResponse<Payment>> {
    return apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.STRIPE_PROCESS, data);
  },

  // Admin endpoints
  async getAllPayments(params?: PaymentQueryParams): Promise<ApiResponse<PaginationResponse<Payment>>> {
    return apiClient.get<ApiResponse<PaginationResponse<Payment>>>(API_ENDPOINTS.PAYMENTS.ADMIN_ALL, params);
  },

  async updatePaymentStatus(id: string, data: { status: Payment['status']; transactionId?: string }): Promise<ApiResponse<Payment>> {
    return apiClient.put<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.ADMIN_STATUS(id), data);
  },

  async processRefund(id: string, data: RefundPaymentRequest): Promise<ApiResponse<Payment>> {
    return apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.ADMIN_REFUND(id), data);
  },

  async getPaymentStats(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(API_ENDPOINTS.PAYMENTS.ADMIN_STATS);
  },
};

// Export all services
export const apiService = {
  auth: authService,
  enquiry: enquiryService,
  product: productService,
  dashboard: dashboardService,
  settings: settingsService,
  upload: uploadService,
  notification: notificationService,
  cart: cartService,
  order: orderService,
  payment: paymentService,
}; 