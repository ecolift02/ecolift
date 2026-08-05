package com.ecolift.controller;

import com.ecolift.dto.request.SendMessageRequest;
import com.ecolift.dto.response.ChatMessageResponse;
import com.ecolift.entity.Booking;
import com.ecolift.entity.User;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.BookingRepository;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.util.Objects;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @MessageMapping("/chat.send/{bookingId}")
    public void send(@DestinationVariable Long bookingId,
                      SendMessageRequest request,
                      Principal principal) {
        ChatMessageResponse saved = chatService.sendMessage(bookingId, principal.getName(), request.getContent());

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
}
