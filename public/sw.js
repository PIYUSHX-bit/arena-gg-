// ARENA.GG — push notification service worker
// Deliberately minimal: this only exists to receive push events and show
// a notification, and to focus/open the app on click. No caching, no
// offline support — that's a separate concern this doesn't take on.

self.addEventListener("push", (event) => {
  let data = { title: "ARENA.GG", body: "" };
  try {
    if (event.data) data = event.data.json();
  } catch {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "ARENA.GG", {
      body: data.body || "",
      data: { url: data.url || "/notifications" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
