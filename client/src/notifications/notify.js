import { toast } from "react-toastify";
import { useSettingsStore } from "../store/settingsStore";

const CLAIM_KEY = "notifiedMessages";
const CLAIM_TTL = 15000;

let promptShown = false;

const supported = () => typeof window !== "undefined" && "Notification" in window;

// Every open tab receives the same socket event, so the first tab to claim a
// message id is the one that notifies.
const claim = (messageId) => {
    try {
        const now = Date.now();
        const seen = JSON.parse(localStorage.getItem(CLAIM_KEY) || "{}");

        if (seen[messageId] && now - seen[messageId] < CLAIM_TTL) return false;

        seen[messageId] = now;
        for (const [id, at] of Object.entries(seen)) {
            if (now - at > CLAIM_TTL) delete seen[id];
        }
        localStorage.setItem(CLAIM_KEY, JSON.stringify(seen));
        return true;
    } catch {
        return true;
    }
};

// Firefox and Safari require a user gesture for requestPermission, so the
// prompt is raised from a button rather than from the socket event.
export const requestNotificationPermission = async () => {
    if (!supported()) return "unsupported";
    if (Notification.permission !== "default") return Notification.permission;

    try {
        return await Notification.requestPermission();
    } catch {
        return Notification.permission;
    }
};

const askOnce = () => {
    if (promptShown) return;
    promptShown = true;

    toast.info(
        ({ closeToast }) => (
            <div className="flex items-center gap-3">
                <span>Get notified about new messages?</span>
                <button
                    type="button"
                    onClick={() => {
                        requestNotificationPermission().finally(closeToast);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/20 font-semibold whitespace-nowrap"
                >
                    Enable
                </button>
            </div>
        ),
        { position: "top-right", autoClose: 8000, theme: "colored" }
    );
};

export const notifyNewMessage = ({ messageId, senderName, body, onClick }) => {
    if (!supported()) return;

    // Checked before the permission prompt.
    if (useSettingsStore.getState().notificationsEnabled !== true) return;

    // Read every time: permission can be revoked at any point.
    const permission = Notification.permission;
    if (permission === "denied") return;
    if (permission !== "granted") {
        askOnce();
        return;
    }

    if (!claim(messageId)) return;

    const notification = new Notification(`New message from ${senderName}`, {
        body,
        tag: messageId,
        icon: "/logo192.png",
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
        onClick?.();
    };
};
