const form = document.getElementById("addForm");
const list = document.getElementById("list");
const emptyMsg = document.getElementById("emptyMsg");

async function getCredentials() {
  const { credentials = [] } = await chrome.storage.sync.get("credentials");
  return credentials;
}

async function setCredentials(credentials) {
  await chrome.storage.sync.set({ credentials });
}

function normalizeDomain(d) {
  // Strip protocol/path if the user pastes a full URL by mistake.
  return d.replace(/^https?:\/\//, "").split("/")[0].trim();
}

async function render() {
  const credentials = await getCredentials();
  list.innerHTML = "";
  emptyMsg.style.display = credentials.length ? "none" : "block";

  credentials.forEach((cred, index) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "info";
    info.innerHTML = `<span class="domain">${cred.domain}</span> — ${cred.username}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", async () => {
      const updated = credentials.filter((_, i) => i !== index);
      await setCredentials(updated);
      render();
    });

    li.appendChild(info);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const domain = normalizeDomain(data.get("domain"));
  const username = data.get("username").trim();
  const password = data.get("password");

  const credentials = await getCredentials();
  const existingIndex = credentials.findIndex((c) => c.domain === domain);
  const entry = { domain, username, password, enabled: true };

  if (existingIndex >= 0) {
    credentials[existingIndex] = entry;
  } else {
    credentials.push(entry);
  }

  await setCredentials(credentials);
  form.reset();
  render();
});

render();
