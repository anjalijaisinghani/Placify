package com.placify.dto.notification;

import java.time.LocalDateTime;

import com.placify.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private boolean read;
    private Long referenceId;
    private LocalDateTime createdAt;
}
