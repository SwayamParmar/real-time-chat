import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { useThemeStore } from "../../store/themeStore";
import { Avatar } from "../chatUtils";

/* ─────────────────────────────────────────────────────────────
   Signed-in user chip + account menu.

   One component, two homes: the desktop nav rail (menu opens to
   the right, anchored to the bottom) and the mobile list header
   (menu drops down from the right edge). Before this the avatar
   was decorative and there was no way to sign out at all.
───────────────────────────────────────────────────────────── */

const PLACEMENTS = {
    // Bottom of the 64px rail — the menu flies out to the right.
    rail: "left-full bottom-0 ml-2 origin-bottom-left",
    // Top-right of the mobile list header — the menu drops down.
    header: "right-0 top-full mt-2 origin-top-right",
};

const ProfileMenu = ({ placement = "rail" }) => {
    const { user, logout } = useAuthStore();
    const resetChat = useChatStore((state) => state.reset);
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onPointerDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const handleLogout = async () => {
        if (signingOut) return;
        setSigningOut(true);

        // Clear the chat session before the auth session, so no listener or
        // pending fetch is left holding a token that is about to be discarded.
        resetChat();
        await logout();

        // Straight to the sign-in screen rather than the marketing landing
        // page — someone who just signed out is far more likely to want back in
        // than to want the product pitch. replace:true keeps the chat out of
        // the back-button history.
        navigate("/login", { replace: true });
    };

    return (
        <div ref={wrapRef} className="relative flex-shrink-0">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                aria-label={user?.name ? `Account menu for ${user.name}` : "Account menu"}
                aria-expanded={open}
                aria-haspopup="menu"
                // 44px of hit area on touch around a 32px avatar; trimmed back
                // to the avatar's own size from md up, where a mouse points.
                className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center
                           rounded-full group/pf"
            >
                <span
                    className={`inline-flex rounded-full transition-shadow duration-200
                                ${open ? "ring-2 ring-brand" : "group-hover/pf:ring-2 group-hover/pf:ring-brand-subtle"}`}
                >
                    <Avatar name={user?.name} id={user?.id} size="xs" />
                </span>
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label="Account"
                    className={`absolute z-50 w-56 py-1 animate-pop-in
                                bg-surface-panel border border-surface-border
                                rounded-xl shadow-panel
                                ${PLACEMENTS[placement] ?? PLACEMENTS.rail}`}
                >
                    {/* Identity, so it is unambiguous which account is about to
                        be signed out on a shared device. */}
                    <div className="px-3 py-2.5 border-b border-surface-border">
                        <p className="text-chat-primary text-[13px] sm:text-sm font-semibold truncate m-0">
                            {user?.name || "Signed in"}
                        </p>
                        {user?.email && (
                            <p className="text-chat-faint text-[11.5px] sm:text-[12px] truncate m-0 mt-0.5">
                                {user.email}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={toggleTheme}
                        className="flex items-center gap-2.5 w-full px-3 py-3 text-left text-[12.5px] sm:text-[13px]
                                   text-chat-secondary hover:bg-surface-raised
                                   transition-colors duration-150"
                    >
                        {theme === "dark" ? (
                            <FiSun size={14} aria-hidden="true" />
                        ) : (
                            <FiMoon size={14} aria-hidden="true" />
                        )}
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={signingOut}
                        className="flex items-center gap-2.5 w-full px-3 py-3 text-left text-[12.5px] sm:text-[13px]
                                   text-danger hover:bg-danger-soft disabled:opacity-60
                                   transition-colors duration-150"
                    >
                        {signingOut ? (
                            <>
                                <span
                                    aria-hidden="true"
                                    className="w-3.5 h-3.5 rounded-full animate-spin border-2 border-danger border-t-transparent"
                                />
                                Signing out…
                            </>
                        ) : (
                            <>
                                <FiLogOut size={14} aria-hidden="true" />
                                Log out
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;
