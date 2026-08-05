package com.ecolift.controller;

import com.ecolift.dto.request.SendMessageRequest;
import com.ecolift.dto.response.*;
import com.ecolift.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRestController {

    private final ChatService chatService;

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

        return chatService.sendMessage(
                bookingId,
                auth.getName(),
                request.getContent()
        );
    }
}
