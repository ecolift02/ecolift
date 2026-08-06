package com.ecolift.service;

import com.ecolift.dto.response.ChatMessageResponse;
import com.ecolift.dto.response.ConversationSummaryResponse;

import java.util.List;

public interface ChatService {
    ChatMessageResponse sendMessage(Long bookingId, String senderEmail, String content);
    ChatMessageResponse editMessage(Long messageId, String senderEmail, String content);
    ChatMessageResponse deleteMessage(Long messageId, String senderEmail);
    void updateMessageStatus(Long messageId, com.ecolift.entity.MessageStatus status);
    List<ChatMessageResponse> getMessages(Long bookingId, String requesterEmail);
    List<ConversationSummaryResponse> getConversations(String userEmail);
    void markAsRead(Long bookingId, String userEmail);
    List<Long> markAsSeen(Long bookingId, String userEmail);
}
 