package com.ecolift.service;

import com.ecolift.dto.response.ChatMessageResponse;
import com.ecolift.dto.response.ConversationSummaryResponse;

import java.util.List;

public interface ChatService {
    ChatMessageResponse sendMessage(Long bookingId, String senderEmail, String content);
    List<ChatMessageResponse> getMessages(Long bookingId, String requesterEmail);
    List<ConversationSummaryResponse> getConversations(String userEmail);
    void markAsRead(Long bookingId, String userEmail);
}
 