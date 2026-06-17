package com.placify.service;

import java.util.List;

import com.placify.dto.notification.NotificationResponse;
import com.placify.enums.NotificationType;

public interface NotificationService {

    void notifyUser(Long userId, NotificationType type, String message, Long referenceId);

    void notifyAllStudents(NotificationType type, String message, Long referenceId);

    List<NotificationResponse> getNotifications(String email);

    long getUnreadCount(String email);

    void markAsRead(String email, Long notificationId);

    void markAllAsRead(String email);
}
