// @ts-nocheck
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/apiClient';
import { useSellerAuth } from '@/hooks/useSellerAuth';
import { toast } from '@/hooks/use-toast';
import { Trash2, Check, CheckCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'NEW_ORDER' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'RETURN_REQUESTED';
  title: string;
  message: string;
  orderId?: string;
  returnId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
}

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_ORDER':
      return '🛒';
    case 'ORDER_SHIPPED':
      return '📦';
    case 'ORDER_DELIVERED':
      return '✅';
    case 'RETURN_REQUESTED':
      return '↩️';
    default:
      return '🔔';
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'NEW_ORDER':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'ORDER_SHIPPED':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'ORDER_DELIVERED':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'RETURN_REQUESTED':
      return 'bg-orange-100 border-orange-300 text-orange-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
}

export default function NotificationsPanel({ visible, onClose, onUnreadCountChange }: { 
  visible: boolean; 
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { seller, staff } = useSellerAuth();
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    if (!seller && !staff) return;
    
    setLoading(true);
    try {
      const response = await apiClient.request<{
        success: boolean;
        data: {
          notifications: Notification[];
          unreadCount: number;
          total: number;
          page: number;
          totalPages: number;
        };
      }>('/api/seller/notifications?limit=50');

      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
        if (onUnreadCountChange) {
          onUnreadCountChange(response.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [seller, staff, onUnreadCountChange]);

  const fetchUnreadCount = useCallback(async () => {
    if (!seller && !staff) return;
    
    try {
      const response = await apiClient.request<{
        success: boolean;
        data: { unreadCount: number };
      }>('/api/seller/notifications/unread-count');

      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount || 0);
        if (onUnreadCountChange) {
          onUnreadCountChange(response.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [seller, staff, onUnreadCountChange]);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const markAsRead = async (id: string) => {
    try {
      const response = await apiClient.patch(`/api/seller/notifications/${id}/read`);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.patch('/api/seller/notifications/read-all');
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        fetchUnreadCount();
        toast({
          title: 'Success',
          description: 'All notifications marked as read'
        });
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await apiClient.delete(`/api/seller/notifications/${id}`);
      
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  const deleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) {
      return;
    }

    try {
      const response = await apiClient.delete('/api/seller/notifications/all');
      
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
        toast({
          title: 'Success',
          description: 'All notifications deleted'
        });
      }
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete all notifications',
        variant: 'destructive'
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'RETURN_REQUESTED') {
      // Navigate to returns page for return notifications
      router.push('/returns');
      onClose();
    } else if (notification.orderId) {
      // Navigate to orders page for order-related notifications
      router.push('/orders');
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="absolute right-6 top-16 w-96 z-50">
      <div className="bg-card border rounded-lg shadow-lg p-4 max-h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-3 pb-2 border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="flex-1"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={deleteAll}
            disabled={notifications.length === 0 || loading}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  notification.isRead 
                    ? 'bg-muted/50 border-muted' 
                    : `bg-background border-l-4 ${getNotificationColor(notification.type)}`
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="text-sm font-semibold truncate">{notification.title}</div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </div>
                    {notification.order && (
                      <div className="text-xs text-muted-foreground">
                        Order: {notification.order.orderNumber} • ${notification.order.totalAmount.toFixed(2)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {timeAgo(notification.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
