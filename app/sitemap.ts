export default function sitemap() {
  return [
    { url: "http://localhost:3000", lastModified: new Date() },
    { url: "http://localhost:3000/calendar", lastModified: new Date() },
    { url: "http://localhost:3000/interviews", lastModified: new Date() },
    { url: "http://localhost:3000/candidates", lastModified: new Date() },
    { url: "http://localhost:3000/roles", lastModified: new Date() },
    { url: "http://localhost:3000/reports", lastModified: new Date() },
  ];
}
