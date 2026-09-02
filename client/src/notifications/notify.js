import { toast } from "react-toastify";

const CLAIM_KEY = "notifiedMessages";
const CLAIM_TTL = 15000;

let promptShown = false;

const supported = () => typeof window !== "undefined" && "Notification" in window;

/*
 * Every open tab receives the same socket event, so all of them would notify.
 * The first to claim a message id wins. The notification tag would collapse
 * duplicates visually on its own, but claiming also keeps the alert sound from
 * firing once per tab.
 */
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

/*
 * requestPermission needs a user gesture in Firefox and Safari, and we get here
 * from a socket event. So the native prompt is raised from a button the user
 * presses, not from the message that triggered this.
 */
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
                        Notification.requestPermission().finally(closeToast);
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

    // Read every time — permission can be revoked in browser settings at any
    // point after it was granted.
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
