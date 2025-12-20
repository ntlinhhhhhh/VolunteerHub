import React, { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, Calendar, CheckCircle, XCircle, Star, User, ThumbsUp } from 'lucide-react';
import {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  type Notification,
  NotificationType,
  NotificationStatus
} from '../../../services/notification.service';

interface NotificationDropdownProps {
  userId: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications(userId, 20);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: NotificationStatus.READ, readAt: new Date() }
            : n
        )
      );
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.POST_LIKE:
      case NotificationType.LIKE:
        return <Heart size={16} className="text-red-500" />;
      case NotificationType.NEW_COMMENT_ON_POST:
        return <MessageCircle size={16} className="text-blue-500" />;
      case NotificationType.REGISTRATION_ACCEPTED:
        return <CheckCircle size={16} className="text-green-500" />;
      case NotificationType.REGISTRATION_REJECTED:
        return <XCircle size={16} className="text-red-500" />;
      case NotificationType.REGISTRATION_COMPLETED:
        return <Star size={16} className="text-yellow-500" />;
      case NotificationType.EVENT_CREATED:
      case NotificationType.EVENT_APPROVED:
        return <Calendar size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const formatNotificationMessage = (notification: Notification) => {
    const { type, data } = notification;

    switch (type) {
      case NotificationType.POST_LIKE:
        return `Ai đó đã thích bài viết của bạn: "${data.postTitle || 'Bài viết'}"`;
      case NotificationType.NEW_COMMENT_ON_POST:
        return `Ai đó đã bình luận bài viết của bạn: "${data.postTitle || 'Bài viết'}"`;
      case NotificationType.REGISTRATION_ACCEPTED:
        return `Đăng ký tham gia sự kiện "${data.eventTitle || 'Sự kiện'}" đã được chấp nhận`;
      case NotificationType.REGISTRATION_REJECTED:
        return `Đăng ký tham gia sự kiện "${data.eventTitle || 'Sự kiện'}" đã bị từ chối`;
      case NotificationType.REGISTRATION_COMPLETED:
        return `Bạn đã hoàn thành sự kiện "${data.eventTitle || 'Sự kiện'}". Nhận feedback từ ban tổ chức!`;
      case NotificationType.EVENT_CREATED:
        return `Sự kiện mới: "${data.eventTitle || 'Sự kiện'}" đã được tạo`;
      case NotificationType.EVENT_APPROVED:
        return `Sự kiện "${data.eventTitle || 'Sự kiện'}" đã được phê duyệt`;
      default:
        return notification.content || notification.subject;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-[#2C3E50]">Thông báo</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-[#34729C] border-t-transparent rounded-full mx-auto mb-2"></div>
                Đang tải...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                    notification.status !== NotificationStatus.READ ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => notification.status !== NotificationStatus.READ && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2C3E50] leading-relaxed">
                        {formatNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(new Date(notification.createdAt))}
                      </p>
                    </div>
                    {notification.status !== NotificationStatus.READ && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button className="text-sm text-[#34729C] hover:underline font-medium">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};