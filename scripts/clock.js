const days = [
"Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

const months = [
"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
];

const timeElement = document.getElementById("time");
const dayElement = document.getElementById("day");
const dateElement = document.getElementById("date");
const statusContent = document.querySelector(".status-content");

function updateTime(){

const now = new Date();
const utcNow = new Date(now.getTime() + now.getTimezoneOffset()*60000);
const localTime = new Date(utcNow.getTime() + 7*3600000);

const hours = String(localTime.getHours()).padStart(2,"0");
const minutes = String(localTime.getMinutes()).padStart(2,"0");

if(timeElement)
timeElement.textContent = `${hours}:${minutes}`;

if(dayElement)
dayElement.textContent = days[localTime.getDay()];

if(dateElement)
dateElement.textContent =
`${localTime.getDate()}, ${months[localTime.getMonth()]}`;

// birthday check (Aug 11)
const today =
(localTime.getMonth()+1).toString().padStart(2,"0") +
"-" +
localTime.getDate().toString().padStart(2,"0");

if(statusContent){

if(today === "03-14"){
statusContent.textContent = "Happy Birthday To Me!";
}else{
statusContent.textContent = "";
}

}

}

setInterval(updateTime,1000);
updateTime();