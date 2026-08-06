import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const TOKEN = import.meta.env.VITE_AGORA_TOKEN || null;

export async function initializeAgoraCall({ roomId, userId, userName }) {
  console.log("Agora APP_ID:", APP_ID);
  console.log("Agora TOKEN:", TOKEN);

  if (!APP_ID) {
    throw new Error("Missing VITE_AGORA_APP_ID. Add it to frontend/.env");
  }

  AgoraRTC.setLogLevel(4);
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  try {
    // UID forced to 0 for testing — must match the UID used when generating
    // the temp token in Agora Console (Channel Name = roomId, UID = 0)
    await client.join(APP_ID, String(roomId), TOKEN, 0);
  } catch (error) {
    console.error("Agora join error:", error);
    throw error;
  }
  const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish(audioTrack);

  return {
    client,
    audioTrack,
    roomId: String(roomId),
    userId: String(userId),
    userName,
  };
}

export async function cleanupAgoraCall({ client, audioTrack }) {
  if (audioTrack) {
    audioTrack.stop();
    audioTrack.close();
  }
  if (client) {
    await client.leave();
  }
}