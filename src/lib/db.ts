import { openDB } from 'idb';

const DB_NAME = 'due-date-emi-manager';
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('customers')) {
      db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('emis')) {
      db.createObjectStore('emis', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('notifications')) {
      db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
    }
  },
});

// Customers
export async function getCustomers() {
  return (await dbPromise).getAll('customers');
}
export async function addCustomer(customer) {
  return (await dbPromise).add('customers', customer);
}
export async function updateCustomer(customer) {
  return (await dbPromise).put('customers', customer);
}
export async function deleteCustomer(id) {
  return (await dbPromise).delete('customers', id);
}

// EMIs
export async function getEmis() {
  return (await dbPromise).getAll('emis');
}
export async function addEmi(emi) {
  return (await dbPromise).add('emis', emi);
}
export async function updateEmi(emi) {
  return (await dbPromise).put('emis', emi);
}
export async function deleteEmi(id) {
  return (await dbPromise).delete('emis', id);
}

// Notifications
export async function getNotifications() {
  return (await dbPromise).getAll('notifications');
}
export async function addNotification(notification) {
  return (await dbPromise).add('notifications', notification);
}
export async function updateNotification(notification) {
  return (await dbPromise).put('notifications', notification);
}
export async function deleteNotification(id) {
  return (await dbPromise).delete('notifications', id);
} 