import { BaseURL } from "../configs/api";

export async function getReceptionists(token: string) {
  const res = await fetch(`${BaseURL}/provider/receptionist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch receptionists");
  return res.json();
}

export async function createReceptionist(token: string, data: { name: string; email: string; password: string }) {
  const res = await fetch(`${BaseURL}/provider/receptionist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create receptionist");
  return res.json();
}

export async function deleteReceptionist(token: string, id: number) {
  const res = await fetch(`${BaseURL}/provider/receptionist/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete receptionist");
  return res.json();
} 