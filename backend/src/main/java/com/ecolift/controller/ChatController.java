package com.ecolift.controller;

import com.ecolift.dto.request.SendMessageRequest;
import com.ecolift.dto.response.ChatMessageResponse;
import com.ecolift.entity.Booking;
import com.ecolift.entity.User;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.BookingRepository;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.ActiveCallRegistry;
import com.ecolift.service.ChatService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Objects;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ActiveCallRegistry activeCallRegistry;

    @MessageMapping("/chat.send/{bookingId}")
    public void send(@DestinationVariable Long bookingId,
                      SendMessageRequest request,
                      Principal principal) {
        ChatMessageResponse saved = chatService.sendMessage(bookingId, principal.getName(), request.getContent());

        messagingTemplate.convertAndSend("/topic/chat/" + bookingId, saved);
        messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/messages", saved);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        User otherParticipant = Objects.equals(booking.getPassenger().getId(), userRepository.findByEmail(principal.getName()).orElseThrow().getId())
                ? booking.getRide().getDriver()
                : booking.getPassenger();
        if (otherParticipant != null) {
            messagingTemplate.convertAndSendToUser(otherParticipant.getEmail(), "/queue/messages", saved);
            messagingTemplate.convertAndSendToUser(otherParticipant.getEmail(), "/queue/inbox-update", saved);
        }
        messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/inbox-update", saved);
    }

    @MessageMapping("/chat.message-delivered/{bookingId}")
    @Transactional
    public void messageDelivered(@DestinationVariable Long bookingId,
                                 Principal principal,
                                 @Payload Long messageId) {
        chatService.updateMessageStatus(messageId, com.ecolift.entity.MessageStatus.DELIVERED);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        User otherParticipant = Objects.equals(booking.getPassenger().getId(), sender.getId())
                ? booking.getRide().getDriver()
                : booking.getPassenger();

        Map<String, Object> payload = Map.of("messageId", messageId, "status", "delivered", "bookingId", bookingId);
        messagingTemplate.convertAndSend("/topic/chat/" + bookingId + "/status", payload);

        if (otherParticipant != null) {
            messagingTemplate.convertAndSendToUser(otherParticipant.getEmail(), "/queue/message-status-update", payload);
        }
    }

    @MessageMapping("/chat.mark-as-seen/{bookingId}")
    @Transactional
    public void markAsSeen(@DestinationVariable Long bookingId,
                           Principal principal) {
        List<Long> seenIds = chatService.markAsSeen(bookingId, principal.getName());

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        User otherParticipant = Objects.equals(booking.getPassenger().getId(), sender.getId())
                ? booking.getRide().getDriver()
                : booking.getPassenger();

                List<Map<String, Object>> payloads = seenIds.stream()
                                .map(messageId -> {
                                        Map<String, Object> m = new HashMap<>();
                                        m.put("messageId", messageId);
                                        m.put("status", "seen");
                                        m.put("bookingId", bookingId);
                                        return m;
                                })
                                .collect(Collectors.toList());

                payloads.forEach(payload -> messagingTemplate.convertAndSend("/topic/chat/" + bookingId + "/status", payload));

                if (otherParticipant != null) {
                        payloads.forEach(payload -> messagingTemplate.convertAndSendToUser(otherParticipant.getEmail(), "/queue/message-status-update", payload));
                }
    }

    @MessageMapping("/chat.call/{bookingId}")
    @Transactional
    public void handleCallInvite(@DestinationVariable Long bookingId,
                                 @Payload Map<String, Object> payload,
                                 Principal principal) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        User sender = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        User otherParticipant = Objects.equals(booking.getPassenger().getId(), sender.getId())
                ? booking.getRide().getDriver()
                : booking.getPassenger();

        String callerId = principal != null ? principal.getName() : extractCallerId(payload, principal);
        if (callerId != null && activeCallRegistry.isUserInCall(callerId)) {
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/call-error",
                    Map.of("bookingId", bookingId, "message", "You are already in an active call."));
            return;
        }

        if (otherParticipant != null) {
            Map<String, Object> invite = new HashMap<>();
            invite.put("bookingId", bookingId);
            invite.put("caller", payload.get("caller"));
            invite.put("roomId", String.valueOf(bookingId));
            messagingTemplate.convertAndSend("/topic/chat/" + bookingId + "/call", invite);
            messagingTemplate.convertAndSendToUser(otherParticipant.getEmail(), "/queue/call-invite", invite);
        }
    }

    @MessageMapping("/chat.call.accept/{bookingId}")
    public void handleCallAccept(@DestinationVariable Long bookingId,
                                 @Payload Map<String, Object> payload,
                                 Principal principal) {
        String userId = principal != null ? principal.getName() : extractCallerId(payload, principal);
        if (userId == null) {
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/call-error",
                    Map.of("bookingId", bookingId, "message", "Unable to accept call: missing caller identifier."));
            return;
        }

        if (!activeCallRegistry.tryStartCall(userId, bookingId)) {
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/call-error",
                    Map.of("bookingId", bookingId, "message", "Unable to accept call: you are already in another active call."));
            return;
        }

        Map<String, Object> started = new HashMap<>();
        started.put("bookingId", bookingId);
        started.put("userId", userId);
        started.put("status", "started");
        messagingTemplate.convertAndSend("/topic/chat/" + bookingId + "/call-started", started);
    }

    @MessageMapping("/chat.call.end/{bookingId}")
    public void handleCallEnd(@DestinationVariable Long bookingId,
                              @Payload Map<String, Object> payload,
                              Principal principal) {
        String userId = extractCallerId(payload, principal);
        if (userId == null && principal != null) {
            userId = principal.getName();
        }

        if (userId != null) {
            activeCallRegistry.endCall(userId);
        }

        Map<String, Object> ended = payload != null ? new HashMap<>(payload) : new HashMap<>();
        ended.put("bookingId", bookingId);
        ended.put("endedBy", userId != null ? userId : "unknown");
        messagingTemplate.convertAndSend("/topic/chat/" + bookingId + "/call-ended", ended);
    }

    private String extractCallerId(Map<String, Object> payload, Principal principal) {
        if (payload != null) {
            Object caller = payload.get("caller");
            if (caller instanceof Map<?, ?> callerMap) {
                Object userId = callerMap.get("userId");
                if (userId != null) {
                    return String.valueOf(userId);
                }
            }
            Object userId = payload.get("userId");
            if (userId != null) {
                return String.valueOf(userId);
            }
        }
        return principal == null ? null : principal.getName();
    }
}
