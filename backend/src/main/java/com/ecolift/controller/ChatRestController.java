package com.ecolift.controller;

import com.ecolift.dto.request.SendMessageRequest;
import com.ecolift.dto.request.UpdateChatMessageRequest;
import com.ecolift.dto.response.*;
import com.ecolift.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRestController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/conversations")
    public List<ConversationSummaryResponse> getConversations(Authentication auth) {
        return chatService.getConversations(auth.getName());
    }

    @GetMapping("/{bookingId}/messages")
    public List<ChatMessageResponse> getMessages(
            @PathVariable Long bookingId,
            Authentication auth) {

        List<ChatMessageResponse> messages =
                chatService.getMessages(bookingId, auth.getName());

        chatService.markAsRead(bookingId, auth.getName());

        return messages;
    }

    @PostMapping("/{bookingId}/messages")
    public ChatMessageResponse sendMessage(
            @PathVariable Long bookingId,
            @RequestBody SendMessageRequest request,
            Authentication auth) {

        ChatMessageResponse saved = chatService.sendMessage(
                bookingId,
                auth.getName(),
                request.getContent()
        );

        messagingTemplate.convertAndSend("/topic/chat/" + bookingId, saved);
        return saved;
    }

    @PatchMapping("/message/{messageId}")
    public ChatMessageResponse editMessage(
            @PathVariable Long messageId,
            @RequestBody UpdateChatMessageRequest request,
            Authentication auth) {
        ChatMessageResponse updated = chatService.editMessage(messageId, auth.getName(), request.getContent());
        messagingTemplate.convertAndSend(
                "/topic/chat/" + updated.getBookingId() + "/edited",
                Map.of("messageId", updated.getId(), "content", updated.getContent())
        );
        return updated;
    }

    @DeleteMapping("/message/{messageId}")
    public ChatMessageResponse deleteMessage(
            @PathVariable Long messageId,
            Authentication auth) {
        ChatMessageResponse deleted = chatService.deleteMessage(messageId, auth.getName());
        messagingTemplate.convertAndSend(
                "/topic/chat/" + deleted.getBookingId() + "/deleted",
                Map.of("messageId", deleted.getId())
        );
        return deleted;
    }
}
