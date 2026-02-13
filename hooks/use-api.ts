"use client";
import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiResponse, ApiError } from '../lib/types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: () => Promise<ApiResponse<T> | ApiError>,
  immediate = false
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Track if we've executed on mount to prevent multiple calls
  const hasExecutedRef = useRef(false);
  const mountedRef = useRef(false);

  const execute = useCallback(
    async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiFunction();
        
        if (response.success) {
          setState(prev => ({ ...prev, data: response.data, loading: false }));
        } else {
          const errorResponse = response as ApiError;
          setState(prev => ({ 
            ...prev, 
            error: errorResponse.error?.message || 'API request failed', 
            loading: false 
          }));
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'An error occurred', 
          loading: false 
        }));
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    hasExecutedRef.current = false;
  }, []);

  // Use a simpler effect that only runs once on mount if immediate is true
  useEffect(() => {
    mountedRef.current = true;
    
    if (immediate && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      execute();
    }

    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty dependency array - only run on mount

  // Separate effect for when apiFunction changes
  useEffect(() => {
    if (mountedRef.current && immediate) {
      hasExecutedRef.current = true;
      execute();
    }
  }, [apiFunction, immediate, execute]);

  return { ...state, execute, reset };
}

// Specific hooks for common use cases
export function useProducts(params?: any) {
  // Create a stable API function
  const apiFunction = useCallback(async () => {
    const { productService } = await import('../lib/services/api');
    
    // Filter parameters inside the function to avoid dependency issues
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return productService.getProducts(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

export function useProduct(id: string | number) {
  const apiFunction = useCallback(async () => {
    const { productService } = await import('../lib/services/api');
    return productService.getProductById(String(id));
  }, [id]);
  
  return useApi(apiFunction, !!id);
}

export function useEnquiries(params?: any) {
  const apiFunction = useCallback(async () => {
    const { enquiryService } = await import('../lib/services/api');
    
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return enquiryService.getEnquiries(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

export function useEnquiry(id: string) {
  const apiFunction = useCallback(async () => {
    const { enquiryService } = await import('../lib/services/api');
    return enquiryService.getEnquiryById(id);
  }, [id]);
  
  return useApi(apiFunction, !!id);
}

export function useDashboardStats() {
  const apiFunction = useCallback(async () => {
    const { dashboardService } = await import('../lib/services/api');
    return dashboardService.getStats();
  }, []);

  return useApi(apiFunction, true);
}

export function useNotifications(params?: any) {
  const apiFunction = useCallback(async () => {
    const { notificationService } = await import('../lib/services/api');
    
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return notificationService.getNotifications(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

export function useSettings(category?: string) {
  const apiFunction = useCallback(async () => {
    const { settingsService } = await import('../lib/services/api');
    return category 
      ? settingsService.getSettingsByCategory(category)
      : settingsService.getAllSettings();
  }, [category]);
  
  return useApi(apiFunction, true);
}

export function useFiles(params?: any) {
  const apiFunction = useCallback(async () => {
    const { uploadService } = await import('../lib/services/api');
    
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return uploadService.getFiles(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

// Cart-related hooks
export function useCart() {
  const apiFunction = useCallback(async () => {
    const { cartService } = await import('../lib/services/api');
    return cartService.getCart();
  }, []);

  return useApi(apiFunction, true);
}

export function useCartCount() {
  const apiFunction = useCallback(async () => {
    const { cartService } = await import('../lib/services/api');
    return cartService.getCartCount();
  }, []);

  return useApi(apiFunction, true);
}

export function useCartCheck() {
  const apiFunction = useCallback(async () => {
    const { cartService } = await import('../lib/services/api');
    return cartService.checkProductInCart(0); // This method doesn't exist, using checkProductInCart instead
  }, []);

  return useApi(apiFunction, true);
}

export function useAllCarts(params?: any) {
  const apiFunction = useCallback(async () => {
    const { cartService } = await import('../lib/services/api');
    
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return cartService.getAllCarts(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

export function useUserCart(userId: string) {
  const apiFunction = useCallback(async () => {
    const { cartService } = await import('../lib/services/api');
    return cartService.getUserCart(userId);
  }, [userId]);
  
  return useApi(apiFunction, !!userId);
}

export function useCartStats() {
  const apiFunction = useCallback(async () => {
    const { cartService } = await import('../lib/services/api');
    return cartService.getCartStats();
  }, []);

  return useApi(apiFunction, true);
}

// Order-related hooks
export function useMyOrders(params?: any) {
  const apiFunction = useCallback(async () => {
    const { orderService } = await import('../lib/services/api');
    
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return orderService.getMyOrders(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

export function useOrder(id: string) {
  const apiFunction = useCallback(async () => {
    const { orderService } = await import('../lib/services/api');
    return orderService.getOrderById(id);
  }, [id]);
  
  return useApi(apiFunction, !!id);
}

export function useOrderByNumber(orderNumber: string) {
  const apiFunction = useCallback(async () => {
    const { orderService } = await import('../lib/services/api');
    return orderService.getOrderByNumber(orderNumber);
  }, [orderNumber]);
  
  return useApi(apiFunction, !!orderNumber);
}

export function useMyOrderStats() {
  const apiFunction = useCallback(async () => {
    const { orderService } = await import('../lib/services/api');
    return orderService.getMyOrderStats();
  }, []);

  return useApi(apiFunction, true);
}

export function useAllOrders(params?: any) {
  const apiFunction = useCallback(async () => {
    const { orderService } = await import('../lib/services/api');
    
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return orderService.getAllOrders(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

export function useOrderStats() {
  const apiFunction = useCallback(async () => {
    const { orderService } = await import('../lib/services/api');
    return orderService.getOrderStats();
  }, []);

  return useApi(apiFunction, true);
}

// Payment-related hooks
export function usePayment(id: string) {
  const apiFunction = useCallback(async () => {
    const { paymentService } = await import('../lib/services/api');
    return paymentService.getPaymentById(id);
  }, [id]);
  
  return useApi(apiFunction, !!id);
}

export function usePaymentsByOrder(orderId: string) {
  const apiFunction = useCallback(async () => {
    const { paymentService } = await import('../lib/services/api');
    return paymentService.getPaymentsByOrder(orderId);
  }, [orderId]);
  
  return useApi(apiFunction, !!orderId);
}

export function usePaymentByTransaction(transactionId: string) {
  const apiFunction = useCallback(async () => {
    const { paymentService } = await import('../lib/services/api');
    return paymentService.getPaymentByTransaction(transactionId);
  }, [transactionId]);
  
  return useApi(apiFunction, !!transactionId);
}

export function useAllPayments(params?: any) {
  const apiFunction = useCallback(async () => {
    const { paymentService } = await import('../lib/services/api');
    
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== "" && value !== null && value !== undefined
      )
    ) : undefined;
    
    return paymentService.getAllPayments(cleanParams);
  }, [JSON.stringify(params)]);

  return useApi(apiFunction, true);
}

export function usePaymentStats() {
  const apiFunction = useCallback(async () => {
    const { paymentService } = await import('../lib/services/api');
    return paymentService.getPaymentStats();
  }, []);

  return useApi(apiFunction, true);
}

// Order creation hook
export function useCreateOrderFromCart() {
  const [state, setState] = useState<{
    data: any;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const createOrderFromCart = useCallback(async (data: any) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { orderService } = await import('../lib/services/api');
      const response = await orderService.createOrderFromCart(data);
      
      if (response.success) {
        setState(prev => ({ ...prev, data: response.data, loading: false }));
        return response;
      } else {
        const errorResponse = response as any;
        const errorMessage = errorResponse.error?.message || 'Failed to create order';
        setState(prev => ({ 
          ...prev, 
          error: errorMessage, 
          loading: false 
        }));
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      throw error;
    }
  }, []);

  return { ...state, createOrderFromCart };
} 