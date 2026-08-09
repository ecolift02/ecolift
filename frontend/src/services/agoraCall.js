import AgoraRTC from "agora-rtc-sdk-ng";
import api from "../api/axiosConfig";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

function hashUserIdToInt(idString) {
  let hash = 5381;
  for (let i = 0; i < idString.length; i += 1) {
    hash = (hash * 33) ^ idString.charCodeAt(i);
  }
  return Math.abs(hash) % 2147483647;
}

function resolveAgoraUid(userId) {
  if (typeof userId === "number" && Number.isFinite(userId)) {
    return userId;
  }

  const parsed = Number(userId);
  if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
    return parsed;
  }

  return hashUserIdToInt(String(userId));
}

async function fetchAgoraToken(roomId, uid) {
  const response = await api.get("/agora/token", {
    params: {
      channelName: String(roomId),
      uid,
    },
  });

  return response.data?.token;
}

export async function initializeAgoraCall({ roomId, userId, userName }) {
  if (!APP_ID) {
    throw new Error("Missing VITE_AGORA_APP_ID. Add it to frontend/.env");
  }

  const agoraUid = resolveAgoraUid(userId);
  const token = await fetchAgoraToken(roomId, agoraUid);
  if (!token) {
    throw new Error("Failed to fetch Agora token.");
  }

  AgoraRTC.setLogLevel(4);
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  client.on("user-published", async (remoteUser, mediaType) => {
    try {
      await client.subscribe(remoteUser, mediaType);
      if (mediaType === "audio" && remoteUser.audioTrack) {
        remoteUser.audioTrack.play();
      }
    } catch (err) {
      console.error("Failed to subscribe to remote user:", err);
    }
  });

  client.on("token-privilege-will-expire", async () => {
    try {
      const newToken = await fetchAgoraToken(roomId, agoraUid);
      if (newToken) {
        await client.renewToken(newToken);
      }
    } catch (renewError) {
      console.error("Failed to renew Agora token:", renewError);
    }
  });

  try {
    await client.join(APP_ID, String(roomId), token, agoraUid);
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