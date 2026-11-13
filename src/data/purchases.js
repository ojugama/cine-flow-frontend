const STORAGE_KEY = "cineflow_purchases";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(purchases) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
  } catch {
    return false;
  }
  return true;
}

export function generatePurchaseCode() {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 900 + 100);
  return `CF-${time}${random}`;
}

export function savePurchase(purchase) {
  const purchases = readAll();
  purchases.unshift(purchase);
  return writeAll(purchases);
}

export function getPurchasesByUser(email) {
  return readAll()
    .filter((purchase) => purchase.email === email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getReservedSeats(funcionId) {
  const seats = new Set();

  for (const purchase of readAll()) {
    if (Number(purchase.funcion?.id) !== Number(funcionId)) continue;
    for (const seat of purchase.seats ?? []) {
      seats.add(seat);
    }
  }

  return [...seats];
}
