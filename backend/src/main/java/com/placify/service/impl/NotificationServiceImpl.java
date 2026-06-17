package com.placify.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.placify.dto.notification.NotificationResponse;
import com.placify.entity.Notification;
import com.placify.entity.User;
import com.placify.enums.NotificationType;
import com.placify.enums.Role;
import com.placify.exception.ResourceNotFoundException;
import com.placify.repository.NotificationRepository;
import com.placify.repository.UserRepository;
import com.placify.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void notifyUser(Long userId, NotificationType type, String message, Long referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.save(Notification.builder()
                .user(user).type(type).message(message).read(false).referenceId(referenceId)
                .build());
    }

    @Override
    @Transactional
    public void notifyAllStudents(NotificationType type, String message, Long referenceId) {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<Notification> notifications = students.stream()
                .map(u -> Notification.builder()
                        .user(u).type(type).message(message).read(false).referenceId(referenceId)
                        .build())
                .toList();
        notificationRepository.saveAll(notifications);
    }

    @Override
    public List<NotificationResponse> getNotifications(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .limit(30)
                .map(this::mapNotification)
                .toList();
    }

    @Override
    public long getUnreadCount(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markAsRead(String email, Long notificationId) {
        User user = getUserByEmail(email);
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        User user = getUserByEmail(email);
        notificationRepository.markAllReadByUserId(user.getId());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private NotificationResponse mapNotification(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .read(n.isRead())
                .referenceId(n.getReferenceId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
