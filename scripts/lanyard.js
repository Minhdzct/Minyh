const USER_ID = "840199281998299206";

let latestActivity = null;

function getEl(){
  return {
    activity: document.querySelector(".discord .activity"),
    details: document.querySelector(".discord .details"),
    state: document.querySelector(".discord .state"),
    timestamp: document.querySelector(".discord .timestamp"),
    large: document.querySelector(".discord .large-image"),
    small: document.querySelector(".discord .small-image")
  };
}

function updateActivity(data){

  const el = getEl();

  if(!el.activity) return;

  let activities = (data.activities || []).filter(a => a.type !== 4);
  const a = activities[0];

if(!a){

  el.activity.textContent = "Currently doing nothing... ☕";
  el.details.textContent = "";
  el.state.textContent = "";

  if(el.timestamp){
    el.timestamp.textContent = "";
    el.timestamp.style.display = "";
  }

  el.large.style.backgroundImage =
  "url(https://cdn-icons-png.flaticon.com/512/1047/1047711.png)";

  latestActivity = null;

  return;
}

el.activity.textContent = a.name || "";
el.details.textContent = a.details || "";
el.state.textContent = a.state || "";
  /* LARGE IMAGE */

  if(a.assets?.large_image){

    let url = a.assets.large_image;

    if(url.startsWith("spotify:"))
      url = `https://i.scdn.co/image/${url.slice(8)}`;
    else if(url.startsWith("mp:"))
      url = `https://media.discordapp.net/${url.slice(3)}`;
    else
      url = `https://cdn.discordapp.com/app-assets/${a.application_id}/${url}.webp`;

    el.large.style.backgroundImage = `url(${url})`;
  }

  /* SMALL IMAGE */

  if(a.assets?.small_image){

    const url =
      `https://cdn.discordapp.com/app-assets/${a.application_id}/${a.assets.small_image}.webp`;

    el.small.style.backgroundImage = `url(${url})`;
  }

  latestActivity = a;
}

function updateTimestamp(){

  const el = getEl();

  if(!latestActivity?.timestamps?.start) return;

  const elapsed = Math.floor((Date.now()-latestActivity.timestamps.start)/1000);

  const h = Math.floor(elapsed/3600);
  const m = Math.floor((elapsed%3600)/60);
  const s = elapsed%60;

  el.timestamp.textContent =
    `${h}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

setInterval(updateTimestamp,1000);

function connectLanyard(){

  const ws = new WebSocket("wss://api.lanyard.rest/socket");

  ws.onopen = () => {
    ws.send(JSON.stringify({
      op:2,
      d:{ subscribe_to_id: USER_ID }
    }));
  };

  ws.onmessage = (event) => {

    const msg = JSON.parse(event.data);

    if(msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE"){
      updateActivity(msg.d);
    }

  };

  ws.onclose = () => setTimeout(connectLanyard,2000);
  ws.onerror = () => ws.close();
}

window.addEventListener("DOMContentLoaded", connectLanyard);
