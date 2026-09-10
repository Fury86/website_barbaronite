import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Старите адреси на статичния сайт водят към новите страници (важно за Google).
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/za-nas.html", destination: "/za-nas", permanent: true },
      { source: "/what-we-do.html", destination: "/deynosti", permanent: true },
      { source: "/program.html", destination: "/programa", permanent: true },
      { source: "/summer-academy.html", destination: "/sabitiya", permanent: true },
      { source: "/contacts.html", destination: "/kontakti", permanent: true },
    ];
  },
};

export default nextConfig;
