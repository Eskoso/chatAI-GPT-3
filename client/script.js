import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 10);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  console.log(timestamp);
  console.log(hexadecimalString);
  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
  <div class="wrapper ${isAi && "ai"}">
    <div class="chat">
      <div class="profile">
        <img 
          src="${isAi ? bot : user}"
          alt="${isAi ? "bot" : "user"}"
        />
      </div>
      <div class="message" id=${
        uniqueId ? uniqueId : "userchat"
      } >${value}</div>
    </div>
  </div>
  
    `;
}

const prompt = document.getElementById("prompt");
const errorIco = document.getElementById("erroricon");

prompt.addEventListener("keypress", () => {
  prompt.classList.remove("error");
  errorIco.classList.remove("error");
});

 document.addEventListener("keypress", function (e) {
   if (e.keyCode === 13 || e.which === 13) {
     e.preventDefault();
     return false;
   }
 });

// chatContainer.addEventListener("click", () => {
//   prompt.focus()
// })

const handleSumbit = async (e) => {
  e.preventDefault();

  const promptInput = prompt.value;
  if (promptInput.trim() == "") {
    prompt.classList.add("error");
    errorIco.classList.add("error");
    return true;
  } else {
    prompt.classList.remove("error");
    errorIco.classList.remove("error");
  }

  const data = new FormData(form);

  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "something went wrong!";

    console.error(err);

    // alert(err);
  }
};

const reset = document.getElementById("reset");

reset.addEventListener("click", () => {
  chatContainer.innerHTML = "";
});

form.addEventListener("submit", handleSumbit);

form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSumbit(e);
  }
});

const tx = document.getElementsByClassName("textarea");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute(
    "style",
    "height:" + tx[i].scrollHeight + "px;overflow-y:hidden;"
  );
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = 0;
  this.style.height = this.scrollHeight + "px";
}

let lightMode = localStorage.getItem("lightMode");
const lightModeToggle = document.querySelector("#themeSwitcher");
const icon = document.querySelector("#icon");

const enablelightMode = () => {
  // 1. Add the class to the body
  document.body.classList.add("lightmode");
  // 2. Update lightMode in localStorage
  localStorage.setItem("lightMode", "enabled");
};

const disablelightMode = () => {
  // 1. Remove the class from the body
  document.body.classList.remove("lightmode");
  // 2. Update lightMode in localStorage
  localStorage.setItem("lightMode", null);
};

// If the user already visited and enabled lightMode
// start things off with it on
if (lightMode === "enabled") {
  enablelightMode();
  icon.classList.remove("fa-sun");
  icon.classList.add("fa-moon");
  document.querySelector("#themeText").textContent =
    icon.classList.contains("fa-moon") && "Dark mode";
}

// When someone clicks the button
lightModeToggle.addEventListener("click", () => {
  // get their lightMode setting
  lightMode = localStorage.getItem("lightMode");

  // if it not current enabled, enable it
  if (lightMode !== "enabled") {
    enablelightMode();
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
    // if it has been enabled, turn it off
  } else {
    disablelightMode();
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }

  document.querySelector("#themeText").textContent = icon.classList.contains(
    "fa-sun"
  )
    ? "Light mode"
    : "Dark mode";
});
