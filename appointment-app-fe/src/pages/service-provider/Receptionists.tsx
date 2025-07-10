import React, { useEffect, useState } from "react";
import { getReceptionists, createReceptionist, deleteReceptionist } from "../../services/receptionistService";

interface Receptionist {
  id: number;
  name: string;
  email: string;
}

const Receptionists: React.FC = () => {
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  if (user?.role_id === 4) {
    return <div className="p-8 text-center text-lg text-gray-600">Receptionists cannot manage receptionists.</div>;
  }

  const fetchReceptionists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReceptionists(token);
      // Some APIs return {receptionists: []}, some return []
      setReceptionists(Array.isArray(data) ? data : data.receptionists || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (!form.name || !form.email || !form.password) {
        setFormError("All fields are required");
        setFormLoading(false);
        return;
      }
      await createReceptionist(token, form);
      setShowForm(false);
      setForm({ name: "", email: "", password: "" });
      fetchReceptionists();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this receptionist?")) return;
    try {
      await deleteReceptionist(token, id);
      setReceptionists(receptionists.filter(r => r.id !== id));
    } catch (err: any) {
      alert("Failed to delete receptionist: " + err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Receptionists</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Receptionist"}
        </button>
      </div>
      {showForm && (
        <form className="mb-6 space-y-3" onSubmit={handleAddReceptionist}>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          {formError && <div className="text-red-600 text-sm">{formError}</div>}
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={formLoading}
          >
            {formLoading ? "Adding..." : "Add Receptionist"}
          </button>
        </form>
      )}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : receptionists.length === 0 ? (
        <div className="text-gray-500">No receptionists found.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receptionists.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-2 text-gray-700">{r.email}</td>
                <td className="px-4 py-2">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Receptionists; 