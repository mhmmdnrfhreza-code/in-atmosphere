export function $(id) {
  return document.getElementById(id);
}

export function setText(id, value) {
  const element = $(id);

  if (!element) {
    console.warn(`Element with id "${id}" not found.`);
    return;
  }

  element.textContent = value ?? "-";
}

export function renderPills(id, items, className, fallback) {
  const container = $(id);
  if (!container) return;

  container.innerHTML = "";

  const safeItems = Array.isArray(items) && items.length > 0 ? items : [fallback];

  safeItems.forEach((item) => {
    const pill = document.createElement("span");
    pill.className = className;
    pill.textContent = item;
    container.appendChild(pill);
  });
}
