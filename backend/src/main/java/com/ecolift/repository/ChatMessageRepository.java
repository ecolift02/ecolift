package com.ecolift.repository;

import com.ecolift.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByBooking_IdOrderBySentAtAsc(Long bookingId);

    ChatMessage findTopByBooking_IdOrderBySentAtDesc(Long bookingId);

    long countByBooking_IdAndSender_IdNotAndIsReadFalse(Long bookingId, Long currentUserId);

    @Modifying
    @Query("update ChatMessage cm set cm.isRead = true where cm.booking.id = :bookingId and cm.sender.id <> :currentUserId")
    void markAsReadByBookingAndSenderNot(@Param("bookingId") Long bookingId, @Param("currentUserId") Long currentUserId);

    @Modifying
    @Query("update ChatMessage cm set cm.status = com.ecolift.entity.MessageStatus.SEEN, cm.isRead = true where cm.booking.id = :bookingId and cm.sender.id <> :currentUserId and cm.status <> com.ecolift.entity.MessageStatus.SEEN")
    int markAsSeenByBookingAndSenderNot(@Param("bookingId") Long bookingId, @Param("currentUserId") Long currentUserId);

    @Query("select cm.id from ChatMessage cm where cm.booking.id = :bookingId and cm.sender.id <> :currentUserId and cm.status <> com.ecolift.entity.MessageStatus.SEEN")
    List<Long> findUnseenIdsByBookingAndSenderNot(@Param("bookingId") Long bookingId, @Param("currentUserId") Long currentUserId);
}
