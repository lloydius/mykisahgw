import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  NOTIF_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

/* ========================
      AUTHENTICATION
======================== */

// Register user
export async function registerUser(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
}

// Login user
export async function loginUser(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

/* ========================
      STORIES (CRUD)
======================== */

// Get all stories
export async function getAllStories(token, page = 1, size = 10, location = 0) {
  const response = await fetch(
    `${ENDPOINTS.STORIES}?page=${page}&size=${size}&location=${location}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
}

// Get story detail
export async function getStoryDetail(token, id) {
  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Add new story (user login)
export async function addStory(token, { description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const response = await fetch(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return response.json();
}

// Add new story (guest)
export async function addStoryGuest({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const response = await fetch(ENDPOINTS.STORY_GUEST, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

/* ========================
      PUSH NOTIFICATIONS
======================== */

// Subscribe to push notification
export async function subscribeNotification(token, { endpoint, keys }) {
  try {
    const response = await fetch(ENDPOINTS.NOTIF_SUBSCRIBE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint, keys }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('subscribeNotification: failed', result);
      throw new Error(result.message || 'Gagal subscribe notifikasi');
    }

    return result;
  } catch (error) {
    console.error('subscribeNotification: error', error);
    return { error: true, message: error.message };
  }
}

// Unsubscribe from push notification
export async function unsubscribeNotification(token, endpoint) {
  try {
    const response = await fetch(ENDPOINTS.NOTIF_SUBSCRIBE, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('unsubscribeNotification: failed', result);
      throw new Error(result.message || 'Gagal unsubscribe notifikasi');
    }

    return result;
  } catch (error) {
    console.error('unsubscribeNotification: error', error);
    return { error: true, message: error.message };
  }
}
