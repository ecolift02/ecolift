package com.ecolift.exception;

/** Thrown when a user tries to access chat for a booking they're not part
 * of, or a booking that isn't CONFIRMED yet (chat is locked until then). */
public class ChatAccessDeniedException extends RuntimeException {
    public ChatAccessDeniedException(String message) {
        super(message);
    }
}
