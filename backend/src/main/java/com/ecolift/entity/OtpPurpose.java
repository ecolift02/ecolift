package com.ecolift.entity;

/**
 * What a given OTP code is allowed to be used for.
 * REGISTER        -> verifying the email address right after sign-up.
 * RESET_PASSWORD  -> confirming identity before allowing a password change.
 * Kept separate (instead of one shared OTP pool) so an OTP issued for
 * registration can never accidentally be used to reset someone's password.
 */
public enum OtpPurpose {
    REGISTER,
    RESET_PASSWORD
}
