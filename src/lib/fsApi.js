// src/lib/fsApi.js
// Connects VOS React frontend to the local Node.js filesystem backend.

const json = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed (${response.status})`
    );
  }

  return data;
};

const get = (url, params = {}) => {
  const query = new URLSearchParams(params).toString();

  return fetch(
    query ? `${url}?${query}` : url
  ).then(json);
};

const post = (url, body) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(json);
};

  export const fsApi = {
    system: () => get("/api/system"),
    drives: () => get("/api/drives"),
    quick: () => get("/api/fs/quick"),
    list: (path = "") =>
      get("/api/fs/list", { path }),
    read: (path) =>
      get("/api/fs/read", { path }),
  
    mkdir: (path) =>
      post("/api/fs/mkdir", { path }),  

      createFile: (path, content = "") =>
    post("/api/fs/create-file", {
      path,
      content,
    }),
   rename: (from, to) =>
      post("/api/fs/rename", {
        from,
        to,
      }),
  
    remove: (path) =>
      post("/api/fs/delete", { path }),
  
    compress: (path, format) =>
      post("/api/fs/compress", {
        path,
        format,
      }),
  };

// -----------------------------------------
// HELPERS
// -----------------------------------------

// Bytes -> GB
export const gb = (bytes = 0) => {
  const value = Number(bytes) / 1024 ** 3;

  if (!Number.isFinite(value)) {
    return "0.0";
  }

  return value.toFixed(
    value >= 10 ? 0 : 1
  );
};

// Bytes -> readable size
export const fmtSize = (bytes = 0) => {
  const b = Number(bytes) || 0;

  if (b < 1024) {
    return `${b} B`;
  }

  if (b < 1024 ** 2) {
    return `${(b / 1024).toFixed(1)} KB`;
  }

  if (b < 1024 ** 3) {
    return `${(b / 1024 ** 2).toFixed(1)} MB`;
  }

  return `${(b / 1024 ** 3).toFixed(2)} GB`;
};