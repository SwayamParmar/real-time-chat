import React from "react";

const TalkStreamLogo = ({
    variant = "text", // "text" | "icon"
    size = "h-8",
    textSize = "text-[20px]",
}) => {
    return (
        <a
            href="/"
            className={`flex items-center no-underline ${variant === "text" ? "gap-[10px]" : ""
                }`}
        >
            <img
                src="../../img/logo_icon.png"
                alt="TalkStream Logo"
                className={size}
            />

            {variant === "text" && (
                <span
                    className={`font-syne font-bold ${textSize} tracking-[-0.02em]`}
                    style={{ color: "var(--chat-primary)" }}
                >
                    Talk<span style={{ color: "var(--brand)" }}>Stream</span>
                </span>
            )}
        </a>
    );
};

export default TalkStreamLogo;