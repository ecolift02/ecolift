package com.ecolift.service.impl;

import com.ecolift.entity.Booking;
import com.ecolift.entity.ChatMessage;
import com.ecolift.entity.MessageStatus;
import com.ecolift.entity.User;
import com.ecolift.exception.ChatAccessDeniedException;
import com.ecolift.repository.BookingRepository;
import com.ecolift.repository.ChatMessageRepository;
import com.ecolift.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatServiceImpl chatService;

    @Test
    void editMessage_shouldUpdateContentAndMarkEditedWhenWithinWindow() {
        User sender = new User();
        sender.setId(10L);
        sender.setName("Alice");
        Booking booking = new Booking();
        booking.setId(99L);
        ChatMessage message = ChatMessage.builder()
                .id(1L)
                .booking(booking)
                .sender(sender)
                .content("old")
                .sentAt(LocalDateTime.now())
                .isRead(false)
                .status(MessageStatus.SENT)
                .build();

        when(chatMessageRepository.findById(1L)).thenReturn(Optional.of(message));
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sender));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = chatService.editMessage(1L, "alice@example.com", "updated");

        assertEquals("updated", response.getContent());
        assertTrue(response.getEdited());
    }

    @Test
    void editMessage_shouldRejectWhenMessageIsOlderThanTwoMinutes() {
        User sender = new User();
        sender.setId(10L);
        sender.setName("Alice");
        Booking booking = new Booking();
        booking.setId(99L);
        ChatMessage message = ChatMessage.builder()
                .id(1L)
                .booking(booking)
                .sender(sender)
                .content("old")
                .sentAt(LocalDateTime.now().minusMinutes(3))
                .isRead(false)
                .status(MessageStatus.SENT)
                .build();

        when(chatMessageRepository.findById(1L)).thenReturn(Optional.of(message));
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sender));

        assertThrows(ChatAccessDeniedException.class, () -> chatService.editMessage(1L, "alice@example.com", "updated"));
    }
}
