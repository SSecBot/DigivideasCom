import { describe, expect, it } from "vitest";
import { isPrivateAddress } from "@/lib/server/security/ip";

describe("isPrivateAddress", () => {
  it("allows public IPv4 and IPv6 addresses (Happy Path)", () => {
    // 1. Arrange
    const publicAddresses = ["8.8.8.8", "185.199.108.153", "2606:4700:4700::1111"];

    // 2. Act
    const results = publicAddresses.map(isPrivateAddress);

    // 3. Assert
    expect(results).toEqual([false, false, false]);
  });

  it("blocks loopback, private, link-local and cloud metadata ranges (Edge Case 1)", () => {
    // 1. Arrange
    const blocked = ["127.0.0.1", "10.0.0.5", "172.16.3.4", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1"];

    // 2. Act
    const results = blocked.map(isPrivateAddress);

    // 3. Assert
    expect(results.every(Boolean)).toBe(true);
  });

  it("blocks IPv6 internal forms, IPv4-mapped addresses and non-IPs (Edge Case 2)", () => {
    // 1. Arrange
    const blocked = ["::1", "::", "fe80::1", "fd12:3456::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1", "localhost", ""];

    // 2. Act
    const results = blocked.map(isPrivateAddress);

    // 3. Assert
    expect(results.every(Boolean)).toBe(true);
  });
});
