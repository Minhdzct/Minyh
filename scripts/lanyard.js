const STATUS_INFO = {
    online: {
        color: "#23a55a",
        text: "Online",
        glow: "0 0 5px 2px #23a55a"
    },
    idle: {
        color: "#f0b232",
        text: "Idle / AFK",
        glow: "0 0 5px 2px #f0b232"
    },
    dnd: {
        color: "#f23f43",
        text: "Do Not Disturb",
        glow: "0 0 5px 2px #f23f43",
    },
    offline: {
        color: "#7e828c",
        text: "Offline",
        glow: "none"
    },
    streaming: {
        color: "#9147ff",
        text: "Streaming",
        glow: "0 0 5px 2px #9147ff",
    },
};
const ACTIVITY_TYPE = ["Playing", "Streaming to", "Listening to", "Watching", "Custom status", "Competing in", ];
let latestActivity = null;
function getDiscordElements() {
    return {
        avatar: document.querySelector(".discord .avatar"),
        displayName: document.querySelector(".discord .display-name"),
        colorDot: document.querySelector(".discord .color-dot"),
        status: document.querySelector(".discord .status"),
        activity: document.querySelector(".discord .activity"),
        details: document.querySelector(".discord .details"),
        state: document.querySelector(".discord .state"),
        largeImage: document.querySelector(".discord .large-image"),
        smallImage: document.querySelector(".discord .small-image"),
        timebarContainer: document.querySelector(".discord .timebar-container"),
        timestampElem: document.querySelector(".discord .timestamp"),
        currentTimeElem: document.querySelector(".discord .current-time"),
        totalTimeElem: document.querySelector(".discord .total-time"),
        timebarProgress: document.querySelector(".discord .timebar-progress"),
        freeText: document.querySelector(".free"),
        statusText: document.querySelector(".status-discord p"),
        ping: document.querySelector(".ping"),
        statusDot: document.querySelector(".dot"),
    }
}
function updateLanyard({discord_user, discord_status, activities}) {
    const el = getDiscordElements();
    if (!el.avatar || !el.displayName || !el.colorDot)
        return;
    el.avatar.style.backgroundImage = `url(https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=80)`;
    el.displayName.textContent = discord_user.display_name;
    el.colorDot.style.backgroundColor = STATUS_INFO[discord_status]?.color || STATUS_INFO.offline.color;
    activities = (activities || []).filter( (a) => a.type !== 4);
    updateStatusBox(discord_status, activities, el);
    if (!activities.length) {
        if (el.status)
            el.status.textContent = discord_status;
        if (el.activity)
            el.activity.textContent = "";
        if (el.details)
            el.details.textContent = "";
        if (el.state)
            el.state.textContent = "";
        if (el.largeImage)
            el.largeImage.style.backgroundImage = "";
        if (el.smallImage)
            el.smallImage.style.backgroundImage = "";
        if (el.timestampElem)
            el.timestampElem.textContent = "";
        if (el.timebarContainer)
            el.timebarContainer.style.display = "none";
        if (el.freeText)
            el.freeText.style.display = "block";
        latestActivity = null;
        return
    } else {
        if (el.freeText)
            el.freeText.style.display = "none"
    }
    const a = activities[0];
    if (el.status)
        el.status.textContent = ACTIVITY_TYPE[a.type] || "";
    if (el.activity)
        el.activity.textContent = a.name || "";
    if (el.details)
        el.details.textContent = a.details || "";
    if (el.state)
        el.state.textContent = a.state || "";
    ["large", "small"].forEach( (s) => {
        let imageUrl = a.assets?.[`${s}_image`];
        let elem = s === "large" ? el.largeImage : el.smallImage;
        if (!elem)
            return;
        if (!imageUrl) {
            elem.style.backgroundImage = "";
            if (s === "small") {
                const maskElem = document.querySelector(".discord .image-container foreignObject");
                if (maskElem)
                    maskElem.removeAttribute("mask");
            }
            return
        }
        if (imageUrl.startsWith("mp:"))
            imageUrl = `https://media.discordapp.net/${imageUrl.slice(3)}?width=160&height=160`;
        else if (imageUrl.startsWith("spotify:"))
            imageUrl = `https://i.scdn.co/image/${imageUrl.slice(8)}`;
        else
            imageUrl = `https://cdn.discordapp.com/app-assets/${a.application_id}/${imageUrl}.webp?size=160`;
        elem.style.backgroundImage = `url(${imageUrl})`;
        if (s === "small") {
            const maskElem = document.querySelector(".discord .image-container foreignObject");
            if (maskElem)
                maskElem.setAttribute("mask", "url(#mask-large-image)");
        }
    }
    );
    latestActivity = a;
    updateTimebarAndTimestamp(a, el)
}
function updateStatusBox(discord_status, activities=[], el=getDiscordElements()) {
    let statusInfo = STATUS_INFO[discord_status] || STATUS_INFO.offline;
    const isStreaming = activities.some( (a) => a.type === 1 && a.url && (a.url.includes("twitch.tv") || a.url.includes("youtube.com")));
    if (isStreaming)
        statusInfo = STATUS_INFO.streaming;
    if (el.statusText)
        el.statusText.textContent = statusInfo.text;
    if (el.ping) {
        el.ping.style.backgroundColor = statusInfo.color;
        el.ping.style.boxShadow = statusInfo.glow
    }
    if (el.statusDot) {
        el.statusDot.style.backgroundColor = statusInfo.color
    }
}
function updateTimebarAndTimestamp(a, el=getDiscordElements()) {
    if (a && a.timestamps && a.timestamps.start) {
        const start = a.timestamps.start;
        const end = a.timestamps.end;
        const now = Date.now();
        let total = end && end > start ? end - start : null;
        let current = now - start;
        if (el.timestampElem) {
            if (total) {
                el.timestampElem.textContent = ""
            } else {
                const elapsed = Math.floor(current / 1000);
                const hrs = Math.floor(elapsed / 3600);
                const min = Math.floor((elapsed % 3600) / 60);
                const sec = elapsed % 60;
                el.timestampElem.textContent = `${hrs}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
            }
        }
        if (total && el.timebarContainer && el.currentTimeElem && el.totalTimeElem && el.timebarProgress) {
            el.timebarContainer.style.display = "flex";
            const progress = Math.max(0, Math.min(100, (current / total) * 100));
            el.timebarProgress.style.width = `${progress}%`;
            const totalMin = Math.floor(total / 1000 / 60);
            const totalSec = Math.floor(total / 1000) % 60;
            const currentMin = Math.floor(current / 1000 / 60);
            const currentSec = Math.floor(current / 1000) % 60;
            el.currentTimeElem.textContent = `${currentMin}:${currentSec.toString().padStart(2, "0")}`;
            el.totalTimeElem.textContent = `${totalMin}:${totalSec.toString().padStart(2, "0")}`
        } else if (el.timebarContainer) {
            el.timebarContainer.style.display = "none";
            if (el.currentTimeElem)
                el.currentTimeElem.textContent = "";
            if (el.totalTimeElem)
                el.totalTimeElem.textContent = "";
            if (el.timebarProgress)
                el.timebarProgress.style.width = "0%"
        }
    } else if (el.timebarContainer) {
        el.timebarContainer.style.display = "none";
        if (el.timestampElem)
            el.timestampElem.textContent = "";
        if (el.currentTimeElem)
            el.currentTimeElem.textContent = "";
        if (el.totalTimeElem)
            el.totalTimeElem.textContent = "";
        if (el.timebarProgress)
            el.timebarProgress.style.width = "0%"
    }
}
setInterval( () => {
    if (latestActivity)
        updateTimebarAndTimestamp(latestActivity);
}
, 1000);
function connectLanyard() {
    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    ws.addEventListener("open", () => {
        ws.send(JSON.stringify({
            op: 2,
            d: {
                subscribe_to_id: "840199281998299206"
            }
        }))
    }
    );
    ws.addEventListener("message", ({data}) => {
        try {
            const {t, d} = JSON.parse(data);
            if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
                updateLanyard(d)
            }
        } catch (e) {}
    }
    );
    ws.addEventListener("close", () => setTimeout(connectLanyard, 1000));
    ws.addEventListener("error", () => ws.close())
}
window.addEventListener("DOMContentLoaded", connectLanyard)
