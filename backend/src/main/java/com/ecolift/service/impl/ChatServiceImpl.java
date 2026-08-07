package com.ecolift.service.impl;

import com.ecolift.dto.response.ChatMessageResponse;
import java.util.stream.Stream;
import com.ecolift.dto.response.ConversationSummaryResponse;
import com.ecolift.entity.Booking;
import com.ecolift.entity.ChatMessage;
import com.ecolift.entity.MessageStatus;
import com.ecolift.entity.User;
import com.ecolift.exception.ChatAccessDeniedException;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.BookingRepository;
import com.ecolift.repository.ChatMessageRepository;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final BookingRepository bookingRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(Long bookingId, String senderEmail, String content) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        ensureParticipantAndUnlocked(booking, sender);

        ChatMessage message = ChatMessage.builder()
                .booking(booking)
                .sender(sender)
                .content(content)
                .sentAt(LocalDateTime.now())
                .isRead(false)
                .status(MessageStatus.SENT)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ChatMessageResponse editMessage(Long messageId, String senderEmail, String content) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found."));
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        ensureMessageOwner(message, sender);
        ensureEditableWithinWindow(message);

        message.setContent(content);
        message.setEdited(true);
        return toResponse(chatMessageRepository.save(message));
    }

    @Override
    @Transactional
    public ChatMessageResponse deleteMessage(Long messageId, String senderEmail) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found."));
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        ensureMessageOwner(message, sender);
        message.setDeleted(true);
        return toResponse(chatMessageRepository.save(message));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long bookingId, String requesterEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        ensureParticipantAndUnlocked(booking, requester);

        return chatMessageRepository.findByBooking_IdOrderBySentAtAsc(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getConversations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        List<Booking> asPassenger = bookingRepository.findByPassengerId(user.getId());
        List<Booking> asDriver = bookingRepository.findByRideDriverId(user.getId());

        List<Booking> bookings = Stream.concat(asPassenger.stream(), asDriver.stream())
                .distinct()
                .collect(Collectors.toList());

        return bookings.stream()
                .filter(booking -> booking.getPassenger() != null && booking.getRide() != null && booking.getRide().getDriver() != null)
                .map(booking -> buildConversationSummary(booking, user))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(ConversationSummaryResponse::getLastMessageAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (!Objects.equals(booking.getPassenger().getId(), user.getId()) && !Objects.equals(booking.getRide().getDriver().getId(), user.getId())) {
            throw new ChatAccessDeniedException("You are not part of this conversation.");
        }

        chatMessageRepository.markAsReadByBookingAndSenderNot(bookingId, user.getId());
    }

    @Override
    @Transactional
    public List<Long> markAsSeen(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (!Objects.equals(booking.getPassenger().getId(), user.getId()) && !Objects.equals(booking.getRide().getDriver().getId(), user.getId())) {
            throw new ChatAccessDeniedException("You are not part of this conversation.");
        }

        List<Long> unseenIds = chatMessageRepository.findUnseenIdsByBookingAndSenderNot(bookingId, user.getId());
        if (!unseenIds.isEmpty()) {
            chatMessageRepository.markAsSeenByBookingAndSenderNot(bookingId, user.getId());
        }
        return unseenIds;
    }

    private void ensureParticipantAndUnlocked(Booking booking, User user) {
        boolean isParticipant = Objects.equals(booking.getPassenger().getId(), user.getId())
                || Objects.equals(booking.getRide().getDriver().getId(), user.getId());
        if (!isParticipant) {
            throw new ChatAccessDeniedException("You are not part of this conversation.");
        }

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new ChatAccessDeniedException("Chat unlocks once the booking is confirmed.");
        }
    }

    private void ensureMessageOwner(ChatMessage message, User requester) {
        if (!Objects.equals(message.getSender().getId(), requester.getId())) {
            throw new ChatAccessDeniedException("You can only edit or delete your own messages.");
        }
    }

    private void ensureEditableWithinWindow(ChatMessage message) {
        long ageMillis = Duration.between(message.getSentAt(), LocalDateTime.now()).toMillis();
        if (ageMillis > 2 * 60 * 1000L) {
            throw new ChatAccessDeniedException("This message can no longer be edited.");
        }
    }

    private ConversationSummaryResponse buildConversationSummary(Booking booking, User currentUser) {
        User otherParty = Objects.equals(booking.getPassenger().getId(), currentUser.getId())
                ? booking.getRide().getDriver()
                : booking.getPassenger();
        ChatMessage lastMessage = chatMessageRepository.findTopByBooking_IdOrderBySentAtDesc(booking.getId());

        return ConversationSummaryResponse.builder()
                .bookingId(booking.getId())
                .otherPartyId(otherParty != null ? otherParty.getId() : null)
                .otherPartyName(otherParty != null ? otherParty.getName() : "")
                .lastMessage(lastMessage != null ? lastMessage.getContent() : null)
                .lastMessageAt(lastMessage != null ? lastMessage.getSentAt() : null)
                .unreadCount(chatMessageRepository.countByBooking_IdAndSender_IdNotAndIsReadFalse(booking.getId(), currentUser.getId()))
                .locked(booking.getStatus() != Booking.BookingStatus.CONFIRMED)
                .build();
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .bookingId(message.getBooking().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .isRead(message.getIsRead())
                .edited(message.getEdited())
                .deleted(message.getDeleted())
                .status(message.getStatus() != null ? message.getStatus().name().toLowerCase() : MessageStatus.SENT.name().toLowerCase())
                .build();
    }

    @Override
    @Transactional
    public void updateMessageStatus(Long messageId, MessageStatus status) {
        ChatMessage chatMessage = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found."));
        chatMessage.setStatus(status);
        if (status == MessageStatus.SEEN) {
            chatMessage.setIsRead(true);
        }
        chatMessageRepository.save(chatMessage);
    }
}
